import {
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { IconComponent } from '../icon.component';
import { type Media, mediaImage, mediaVideo, mediaSrcset } from './campaigns.data';

/**
 * Full-screen viewer for a campaign's photos and videos.
 * Arrow keys and swipes move between items, Escape closes, focus stays inside.
 */
@Component({
  selector: 'app-lightbox',
  imports: [IconComponent],
  template: `
    <div
      class="lb"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="title()"
      (touchstart)="onTouchStart($event)"
      (touchend)="onTouchEnd($event)"
      #root
    >
      <button
        class="lb-scrim"
        type="button"
        tabindex="-1"
        aria-hidden="true"
        (click)="close.emit()"
      ></button>

      <header class="lb-bar">
        <div class="lb-title">
          <strong>{{ title() }}</strong>
          <span class="lb-count">{{ index() + 1 }} / {{ items().length }}</span>
        </div>
        <button
          class="lb-btn"
          type="button"
          (click)="close.emit()"
          [attr.aria-label]="labels().close"
          #closeBtn
        >
          <app-icon name="x" aria-hidden="true"></app-icon>
        </button>
      </header>

      <div class="lb-stage">
        @if (items().length > 1) {
          <button
            class="lb-btn lb-nav lb-prev"
            type="button"
            (click)="step(-1)"
            [attr.aria-label]="labels().prev"
          >
            <app-icon name="arrow-right" aria-hidden="true"></app-icon>
          </button>
        }

        @for (item of [current()]; track index()) {
          <figure
            class="lb-frame"
            [class.is-video]="item.type === 'video'"
            [attr.data-dir]="direction()"
          >
            @if (item.type === 'image') {
              <img
                [attr.src]="image(item) || null"
                [attr.srcset]="srcset(item)"
                sizes="(max-width: 60rem) 100vw, 80vw"
                [width]="item.w"
                [height]="item.h"
                [alt]="item.alt || title() + ', ' + (index() + 1)"
                decoding="async"
              />
            } @else {
              <video
                [src]="video(item)"
                [attr.aria-label]="item.alt || title()"
                [poster]="image(item)"
                [width]="item.w"
                [height]="item.h"
                controls
                autoplay
                playsinline
                preload="metadata"
              ></video>
            }
          </figure>
        }

        @if (items().length > 1) {
          <button
            class="lb-btn lb-nav lb-next"
            type="button"
            (click)="step(1)"
            [attr.aria-label]="labels().next"
          >
            <app-icon name="arrow-right" aria-hidden="true"></app-icon>
          </button>
        }
      </div>

      @if (items().length > 1) {
        <div class="lb-thumbs" role="tablist" [attr.aria-label]="title()">
          @for (item of items(); track item.src; let i = $index) {
            <button
              type="button"
              class="lb-thumb"
              role="tab"
              [attr.aria-selected]="i === index()"
              [attr.aria-label]="i + 1 + ' / ' + items().length"
              (click)="go(i)"
            >
              <img [attr.src]="image(item, true) || null" alt="" loading="lazy" decoding="async" />
              @if (item.type === 'video') {
                <span class="lb-play" aria-hidden="true"
                  ><app-icon name="play" aria-hidden="true"></app-icon
                ></span>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class LightboxComponent {
  protected readonly image = mediaImage;
  protected readonly video = mediaVideo;
  protected readonly srcset = mediaSrcset;
  readonly items = input.required<Media[]>();
  readonly start = input(0);
  readonly title = input('');
  readonly labels = input({ close: 'Close', prev: 'Previous', next: 'Next' });
  readonly close = output<void>();

  protected readonly index = signal(0);
  protected readonly direction = signal<'next' | 'prev'>('next');
  protected readonly current = computed(() => this.items()[this.index()]);

  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');
  private readonly closeBtn = viewChild.required<ElementRef<HTMLButtonElement>>('closeBtn');
  private touchX = 0;
  private readonly returnFocus =
    typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;

  constructor() {
    let first = true;
    effect(() => {
      const start = this.start();
      if (first) {
        this.index.set(start);
        first = false;
        queueMicrotask(() => this.closeBtn().nativeElement.focus());
      }
    });
    // Keep the active thumbnail in view.
    effect(() => {
      const i = this.index();
      queueMicrotask(() => {
        const thumb = this.root().nativeElement.querySelectorAll<HTMLElement>('.lb-thumb')[i];
        thumb?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      });
    });
    if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') document.body.style.overflow = '';
    this.returnFocus?.focus?.();
  }

  protected step(delta: number): void {
    const n = this.items().length;
    this.direction.set(delta > 0 ? 'next' : 'prev');
    this.index.update((i) => (i + delta + n) % n);
  }

  protected go(i: number): void {
    this.direction.set(i >= this.index() ? 'next' : 'prev');
    this.index.set(i);
  }

  @HostListener('document:keydown', ['$event'])
  protected onKey(event: KeyboardEvent): void {
    const rtl = document.documentElement.dir === 'rtl';
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close.emit();
    } else if (event.key === 'ArrowRight') {
      this.step(rtl ? -1 : 1);
    } else if (event.key === 'ArrowLeft') {
      this.step(rtl ? 1 : -1);
    } else if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  protected onTouchStart(event: TouchEvent): void {
    this.touchX = event.changedTouches[0].clientX;
  }

  protected onTouchEnd(event: TouchEvent): void {
    const dx = event.changedTouches[0].clientX - this.touchX;
    if (Math.abs(dx) < 48) return;
    const rtl = document.documentElement.dir === 'rtl';
    this.step(dx < 0 !== rtl ? 1 : -1);
  }

  private trapFocus(event: KeyboardEvent): void {
    const focusable = Array.from(
      this.root().nativeElement.querySelectorAll<HTMLElement>(
        'button:not([tabindex="-1"]), video, [href]',
      ),
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
