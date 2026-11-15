import { Component, HostListener, NgZone, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { IconComponent } from './icon.component';
import { Site } from './site.service';
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
      }
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
