import {
  Directive,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Adds `.is-visible` the first time the host scrolls into view, driving the
 * CSS reveal transitions defined in styles.css. Falls back to instantly
 * visible when IntersectionObserver is unavailable or motion is reduced.
 */
@Directive({
  selector: '[data-reveal]',
})
export class RevealOnScroll implements OnInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    const el = this.host.nativeElement;

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    this.observer.observe(el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}

/**
 * Animates a numeric value embedded in a label (e.g. "140+", "2025") from
 * zero up to its target the first time it scrolls into view, preserving any
 * non-numeric prefix/suffix. Non-numeric labels render as-is.
 */
@Directive({
  selector: '[countUp]',
})
export class CountUp implements OnInit, OnChanges, OnDestroy {
  @Input('countUp') value = '';

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private observer?: IntersectionObserver;
  private frame = 0;
  private hasRun = false;

  ngOnInit(): void {
    const el = this.host.nativeElement;
    const parsed = this.parse(this.value);

    if (!parsed || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      el.textContent = this.value;
      this.hasRun = true;
      return;
    }

    el.textContent = `${parsed.prefix}0${parsed.suffix}`;
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.observer?.disconnect();
            this.animate(parsed);
          }
        }
      },
      { threshold: 0.4 },
    );
    this.observer.observe(el);
  }

  ngOnChanges(): void {
    // Re-render immediately on later input changes (e.g. language switch).
    if (this.hasRun) {
      this.host.nativeElement.textContent = this.value;
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    cancelAnimationFrame(this.frame);
  }

  private parse(raw: string): { prefix: string; target: number; suffix: string } | null {
    const match = /^(\D*)(\d[\d,]*)(.*)$/.exec(raw.trim());
    if (!match) return null;
    return {
      prefix: match[1],
      target: Number(match[2].replace(/,/g, '')),
      suffix: match[3],
    };
  }

  private animate(parsed: { prefix: string; target: number; suffix: string }): void {
    const el = this.host.nativeElement;
    const duration = 1500;
    const grouped = parsed.target >= 1000 && !/^\d{4}$/.test(String(parsed.target));

    this.zone.runOutsideAngular(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(parsed.target * eased);
        const shown = grouped ? current.toLocaleString('en-US') : String(current);
        el.textContent = `${parsed.prefix}${shown}${parsed.suffix}`;
        if (progress < 1) {
          this.frame = requestAnimationFrame(tick);
        } else {
          this.hasRun = true;
        }
      };
      this.frame = requestAnimationFrame(tick);
    });
  }
}
