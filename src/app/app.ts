import { Component, HostListener, NgZone, effect, inject, signal } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';

import { IconComponent } from './icon.component';
import { Seo } from './seo.service';
import { Site } from './site.service';
import type { SeoKey } from '../i18n/types';
import type { LanguageCode } from '../i18n';

/** The shell every page shares: header, routed page, footer. */
@Component({
  selector: 'app-root',
  imports: [IconComponent, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  protected readonly site = inject(Site);
  protected readonly t = this.site.data;
  protected readonly mobileNavOpen = signal(false);
  /** The page has scrolled past the top: the header takes its shadow. */
  protected readonly scrolled = signal(false);
  /** Scrolling down past the fold tucks the header away; scrolling up brings it back. */
  protected readonly headerHidden = signal(false);

  private lastY = 0;
  private frame = 0;
  private readonly zone = inject(NgZone);
  private readonly seo = inject(Seo);
  private readonly route = inject(ActivatedRoute);
  private readonly seoKey = signal<SeoKey | null>('home');

  constructor() {
    effect(() => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = this.mobileNavOpen() ? 'hidden' : '';
      }
    });
    // A new page always starts with the menu closed and the header showing.
    inject(Router).events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.mobileNavOpen.set(false);
        this.headerHidden.set(false);
        let r = this.route.snapshot;
        while (r.firstChild) r = r.firstChild;
        this.seoKey.set(r.data['contentKind'] ? null : ((r.data['seo'] as SeoKey) ?? 'home'));
        this.trackPageView(event.urlAfterRedirects);
      }
    });

    // Re-apply search and social tags whenever the page or the language changes.
    effect(() => {
      const key = this.seoKey();
      if (key) this.seo.apply(key);
    });

    if (typeof window !== 'undefined') {
      this.zone.runOutsideAngular(() =>
        window.addEventListener('scroll', () => this.onScroll(), { passive: true }),
      );
    }
  }

  private onScroll(): void {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      const y = window.scrollY;
      const scrolled = y > 8;
      const hidden = y > 480 && y > this.lastY && !this.mobileNavOpen();
      if (scrolled !== this.scrolled() || hidden !== this.headerHidden()) {
        this.zone.run(() => {
          this.scrolled.set(scrolled);
          this.headerHidden.set(hidden);
        });
      }
      if (Math.abs(y - this.lastY) > 4) this.lastY = y;
    });
  }

  /**
   * Google Tag Manager sees the first page load on its own. Later page changes
   * happen inside the app, so each one is pushed as a `virtual_page_view` event
   * (after the new title is set) for a GTM trigger to pick up.
   */
  private firstView = true;
  private trackPageView(path: string): void {
    if (typeof window === 'undefined') return;
    if (this.firstView) {
      this.firstView = false;
      return;
    }
    setTimeout(() => {
      const w = window as unknown as { dataLayer?: unknown[] };
      (w.dataLayer ??= []).push({
        event: 'virtual_page_view',
        page_path: path,
        page_location: location.href,
        page_title: document.title,
        language: this.site.language(),
      });
    });
  }

  protected setLanguage(lang: LanguageCode): void {
    this.site.setLanguage(lang);
    this.mobileNavOpen.set(false);
  }

  protected toggleMobileNav(): void {
    this.mobileNavOpen.update((open) => !open);
  }

  protected closeMobileNav(): void {
    this.mobileNavOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.mobileNavOpen.set(false);
  }
}
