import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlmaContent } from './alma-content';
import { ContentStatus } from './content-status';
import { ContentKind } from './public-content';
import { Site } from '../site.service';
import { Seo } from '../seo.service';
@Component({
  standalone: true,
  imports: [RouterLink, ContentStatus],
  styles: [
    `
      .published-body {
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }
      .published-gallery img,
      .published-gallery video {
        max-width: 100%;
        height: auto;
      }
    `,
  ],
  template: `
    <app-content-status />
    <section class="section container">
      @if (record(); as row) {
        <a class="link" [routerLink]="back()">{{ ar ? 'العودة' : 'Back' }}</a>
        <h1 class="display-s" dir="auto">{{ row.title }}</h1>
        <p class="lead" dir="auto">{{ row.summary }}</p>
        @if (row.imageUrl) {
          <img [src]="row.imageUrl" [alt]="row.imageAlt" style="max-width:100%;height:auto" />
        }
        <div class="published-body" dir="auto">{{ row.body }}</div>
        @if (row.disclaimer) {
          <aside role="note">{{ row.disclaimer }}</aside>
        }
        <div class="published-gallery">
          @for (media of row.media; track media.url) {
            @if (media.type === 'image') {
              <figure>
                <img [src]="media.url" [alt]="media.alt" loading="lazy" />
                <figcaption>{{ media.alt }}</figcaption>
              </figure>
            } @else {
              <figure>
                <video
                  [src]="media.url"
                  [poster]="media.thumbnailUrl"
                  controls
                  preload="metadata"
                  [attr.aria-label]="media.alt"
                ></video>
                <figcaption>{{ media.alt }}</figcaption>
              </figure>
            }
          }
        </div>
        @if (row.sources.length) {
          <h2>{{ ar ? 'المصادر' : 'References' }}</h2>
          <ul>
            @for (source of row.sources; track source.url) {
              <li>
                <a [href]="source.url" target="_blank" rel="noopener noreferrer">{{
                  source.title
                }}</a>
              </li>
            }
          </ul>
        }
        @if (row.linkUrl) {
          <a class="btn" [href]="row.linkUrl" target="_blank" rel="noopener noreferrer">{{
            ar ? 'المزيد' : 'Learn more'
          }}</a>
        }
      } @else if (content.api.status() === 'ready') {
        <h1>{{ ar ? 'المحتوى غير متاح' : 'Content unavailable' }}</h1>
        <p>
          {{
            ar
              ? 'لم يعد هذا المحتوى منشورًا، أو أن العنوان غير موجود.'
              : 'This content is no longer published, or the address does not exist.'
          }}
        </p>
        <a routerLink="/">{{ ar ? 'الرئيسية' : 'Home' }}</a>
      }
    </section>
  `,
})
export class ContentDetail {
  readonly content = inject(AlmaContent);
  private readonly route = inject(ActivatedRoute);
  private readonly site = inject(Site);
  private readonly seo = inject(Seo);
  private readonly slug = signal('');
  private readonly kind = signal<ContentKind>('campaign');
  readonly record = computed(() => this.content.getPublishedContent(this.kind(), this.slug()));
  readonly back = computed(() =>
    this.kind() === 'program'
      ? '/programs'
      : this.kind() === 'campaign' || this.kind() === 'event'
        ? '/campaigns'
        : '/',
  );
  get ar() {
    return this.site.language() === 'ar';
  }
  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe((p) => this.slug.set(p.get('slug') || ''));
    this.route.data.pipe(takeUntilDestroyed()).subscribe((d) => this.kind.set(d['contentKind']));
    effect(() => this.seo.applyPublished(this.record(), this.kind(), this.slug()));
  }
}
