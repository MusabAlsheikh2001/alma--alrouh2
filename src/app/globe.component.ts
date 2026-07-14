import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  afterNextRender,
  signal,
  viewChild,
} from '@angular/core';

interface CountryFeature {
  type: 'Feature';
  properties: {
    ISO_A2?: string;
  };
  geometry: unknown;
}

interface CountryCollection {
  type: 'FeatureCollection';
  features: CountryFeature[];
}

const COUNTRIES_URL = '/assets/ne_110m_admin_0_countries.geojson';

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A real, interactive 3D globe (Three.js via globe.gl) for the founder section.
 * Deep-green surface, mint atmosphere, country land masses and subtle graticules.
 * Drag to rotate (mouse + touch); it auto-rotates slowly when idle.
 *
 * The heavy 3D libraries are code-split and only fetched once the globe nears
 * the viewport, so they never weigh down the initial page load.
 */
@Component({
  selector: 'app-globe',
  standalone: true,
  template: `
    <div
      #host
      class="globe-host"
      role="img"
      [attr.aria-label]="label"
      [class.is-ready]="ready()"
    ></div>
    @if (!ready()) {
      <span class="globe-loading" aria-hidden="true"></span>
    }
  `,
  styles: [
    `
      :host {
        position: relative;
        display: block;
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
      .globe-host {
        width: 100%;
        height: 100%;
        cursor: grab;
        opacity: 0;
        transition: opacity 1s ease;
        touch-action: pan-y;
        overflow: hidden;
      }
      .globe-host.is-ready {
        opacity: 1;
      }
      .globe-host:active {
        cursor: grabbing;
      }
      .globe-host canvas {
        display: block;
        width: 100% !important;
        height: 100% !important;
        border-radius: 50%;
      }
      /* Calm fallback while the 3D libraries load. */
      .globe-loading {
        position: absolute;
        inset: 4%;
        border-radius: 50%;
        background:
          radial-gradient(circle at 38% 32%, rgba(156, 217, 196, 0.5), transparent 55%),
          radial-gradient(circle at 60% 70%, rgba(31, 58, 46, 0.95), #16201b 70%);
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.45);
      }
      @media (prefers-reduced-motion: reduce) {
        .globe-host {
          transition: none;
        }
      }
    `,
  ],
})
export class GlobeComponent implements OnDestroy {
  @Input() label = 'Interactive 3D globe with visible countries and continents';

  protected readonly ready = signal(false);
  private readonly hostRef = viewChild.required<ElementRef<HTMLDivElement>>('host');

  private world: { _destructor?: () => void; width: (v?: number) => unknown; height: (v?: number) => unknown } | null =
    null;
  private resizeObserver?: ResizeObserver;
  private io?: IntersectionObserver;
  private resumeRotationTimer?: ReturnType<typeof setTimeout>;
  private removeControlListeners?: () => void;
  private destroyed = false;

  constructor() {
    afterNextRender(() => this.observe());
  }

  /** Defer loading the 3D bundle until the globe is about to be seen. */
  private observe(): void {
    const el = this.hostRef().nativeElement;

    if (typeof IntersectionObserver === 'undefined') {
      void this.load(el);
      return;
    }

    this.io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          this.io?.disconnect();
          void this.load(el);
        }
      },
      { rootMargin: '300px' },
    );
    this.io.observe(el);
  }

  private async load(el: HTMLElement): Promise<void> {
    try {
      const [{ default: Globe }, countries] = await Promise.all([
        import('globe.gl'),
        fetch(COUNTRIES_URL).then((res) => {
          if (!res.ok) throw new Error(`Unable to load countries: ${res.status}`);
          return res.json() as Promise<CountryCollection>;
        }),
      ]);
      if (this.destroyed) return;

      const reduce = prefersReducedMotion();
      const size = el.clientWidth || 360;
      const countryFeatures = countries.features.filter((feature) => feature.properties.ISO_A2 !== 'AQ');

      const world = new Globe(el, { animateIn: true })
        .width(size)
        .height(size)
        .backgroundColor('rgba(0,0,0,0)')
        .lineHoverPrecision(0)
        .showGlobe(true)
        .showGraticules(true)
        .showAtmosphere(true)
        .atmosphereColor('#bfe6d6')
        .atmosphereAltitude(0.12)
        .pointsData([])
        .arcsData([])
        .ringsData([])
        .labelsData([])
        .htmlElementsData([])
        .polygonsData(countryFeatures)
        .polygonAltitude(0.012)
        .polygonCapColor(() => 'rgba(88, 139, 115, 0.72)')
        .polygonSideColor(() => 'rgba(42, 79, 61, 0.28)')
        .polygonStrokeColor(() => 'rgba(197, 231, 217, 0.2)')
        .polygonLabel(() => '')
        .polygonsTransitionDuration(0);

      // Deep therapeutic-green surface under the country shapes.
      const mat = world.globeMaterial() as {
        color: { set: (c: number) => void };
        emissive: { set: (c: number) => void };
        emissiveIntensity: number;
        shininess: number;
      };
      mat.color.set(0x244636);
      mat.emissive.set(0x10241b);
      mat.emissiveIntensity = 0.42;
      mat.shininess = 4;

      // Cap pixel ratio for performance on hi-dpi screens.
      const renderer = world.renderer() as { setPixelRatio: (n: number) => void };
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      world.pointOfView({ lat: 18, lng: 54, altitude: 2.28 }, 0);

      const controls = world.controls() as {
        autoRotate: boolean;
        autoRotateSpeed: number;
        enableZoom: boolean;
        enablePan: boolean;
        rotateSpeed: number;
        minDistance: number;
        maxDistance: number;
        addEventListener?: (type: string, listener: (event?: unknown) => void) => void;
        removeEventListener?: (type: string, listener: (event?: unknown) => void) => void;
      };
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.autoRotate = !reduce;
      controls.autoRotateSpeed = 0.28;
      controls.rotateSpeed = 0.42;

      const pauseRotation = (): void => {
        if (this.resumeRotationTimer) clearTimeout(this.resumeRotationTimer);
        controls.autoRotate = false;
      };
      const resumeRotation = (): void => {
        if (reduce) return;
        if (this.resumeRotationTimer) clearTimeout(this.resumeRotationTimer);
        this.resumeRotationTimer = setTimeout(() => {
          controls.autoRotate = true;
        }, 900);
      };
      controls.addEventListener?.('start', pauseRotation);
      controls.addEventListener?.('end', resumeRotation);
      this.removeControlListeners = () => {
        controls.removeEventListener?.('start', pauseRotation);
        controls.removeEventListener?.('end', resumeRotation);
      };

      this.world = world as typeof this.world;

      this.resizeObserver = new ResizeObserver(() => {
        const s = el.clientWidth || size;
        this.world?.width(s);
        this.world?.height(s);
      });
      this.resizeObserver.observe(el);

      this.ready.set(true);
    } catch (err) {
      // 3D unavailable (no WebGL / blocked import) — the CSS fallback orb remains.
      console.warn('[globe] interactive globe unavailable:', err);
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.io?.disconnect();
    this.resizeObserver?.disconnect();
    this.removeControlListeners?.();
    if (this.resumeRotationTimer) clearTimeout(this.resumeRotationTimer);
    try {
      this.world?._destructor?.();
    } catch {
      /* ignore teardown errors */
    }
    this.world = null;
  }
}
