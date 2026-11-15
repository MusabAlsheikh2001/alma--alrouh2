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
 * Drifts the host slowly against the scroll (`--parallax` in px), for a sense
 * of depth on large photographs. Off under reduced motion.
 */
@Directive({
  selector: '[parallax]',
})
export class Parallax implements OnInit, OnDestroy {
  @Input() parallax: number | '' = 0.08;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private frame = 0;
  private readonly onScroll = () => {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.update();
    });
  };

  ngOnInit(): void {
    if (prefersReducedMotion() || typeof window === 'undefined') return;
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      this.update();
    });
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') window.removeEventListener('scroll', this.onScroll);
    if (this.frame) cancelAnimationFrame(this.frame);
  }

  private update(): void {
    const el = this.host.nativeElement;
    const rect = el.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const speed = typeof this.parallax === 'number' ? this.parallax : 0.08;
    const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * -speed;
    el.style.setProperty('--parallax', `${offset.toFixed(1)}px`);
  }
}

/**
 * Drives a pinned scroll scene. Sets `--p` (0 to 1) on the host as it scrolls
 * through its own height, and, when the host holds a `[data-track]` element,
 * sets `--dist` to how far that track must slide sideways. The host adds
 * `.is-scene` only when motion is allowed and the screen is wide enough;
 * without it, the CSS shows the plain, unpinned layout.
 */
@Directive({
  selector: '[scrollScene]',
})
export class ScrollScene implements OnInit, OnDestroy {
  @Input() sceneMin = 960;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private frame = 0;
  private resizeObserver?: ResizeObserver;
  private readonly onScroll = () => {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.update();
    });
  };

  ngOnInit(): void {
    if (typeof window === 'undefined') return;
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onScroll, { passive: true });
      this.resizeObserver = new ResizeObserver(() => this.onScroll());
      this.resizeObserver.observe(this.host.nativeElement);
      this.update();
    });
  }

  ngOnDestroy(): void {
    if (typeof window === 'undefined') return;
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
    this.resizeObserver?.disconnect();
    if (this.frame) cancelAnimationFrame(this.frame);
  }

  private update(): void {
    const el = this.host.nativeElement;
    const on = !prefersReducedMotion() && window.innerWidth >= this.sceneMin;
    el.classList.toggle('is-scene', on);
    if (!on) {
      el.style.setProperty('--p', '1');
      return;
    }
    const track = el.querySelector<HTMLElement>('[data-track]');
    if (track) {
      const dist = Math.max(0, track.scrollWidth - track.clientWidth);
      el.style.setProperty('--dist', `${dist}px`);
    }
    const rect = el.getBoundingClientRect();
    const span = rect.height - window.innerHeight;
    const p = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 1;
    el.style.setProperty('--p', p.toFixed(4));
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
    if (this.frame) cancelAnimationFrame(this.frame);
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
