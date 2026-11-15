import { Component, ElementRef, NgZone, OnDestroy, OnInit, inject, input, viewChild } from '@angular/core';

import { DUST, MARK_H, MARK_W, NODES } from './brain-points';

interface Dot {
  tx: number; // target, in mark units
  ty: number;
  x: number; // current, in CSS px
  y: number;
  vx: number;
  vy: number;
  side: number;
  delay: number;
  phase: number;
  sx: number; // scattered start, in CSS px
  sy: number;
}

const ASSEMBLE_MS = 1500;

interface Pulse {
  from: number;
  to: number;
  t: number;
}

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * The home hero's signature: the Alma Alrouh brain mark drawn as a living
 * network. fine points trace the leaf lines; 140 brighter nodes, one per
 * volunteer, are linked to their nearest neighbours, and small pulses travel
 * between them. The mark assembles on load, breathes, and parts around the
 * cursor. Under reduced motion it is drawn once, finished and still.
 */
@Component({
  selector: 'app-volunteer-network',
  template: `<canvas #canvas aria-hidden="true"></canvas>`,
  styles: [
    `
      :host { position: relative; display: block; width: 100%; height: 100%; touch-action: pan-y; }
      canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
    `,
  ],
})
export class VolunteerNetworkComponent implements OnInit, OnDestroy {
  /** Fraction of the box the mark may fill. */
  readonly fill = input(0.86);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private ctx!: CanvasRenderingContext2D;
  private dust: Dot[] = [];
  private nodes: Dot[] = [];
  private links: Array<[number, number]> = [];
  private neighbours: number[][] = [];
  private pulses: Pulse[] = [];
  private w = 0;
  private h = 0;
  private scale = 1;
  private ox = 0;
  private oy = 0;
  private start = 0;
  private frame = 0;
  private lastPulse = 0;
  private lastStep = 0;
  private pointer = { x: -9999, y: -9999, active: false };
  private visible = true;
  private still = prefersReducedMotion();
  private colors = { gold: '#a27b35', teal: '#2f625d', glowGold: '', glowTeal: '' };
  private resizeObserver?: ResizeObserver;
  private io?: IntersectionObserver;
  private themeObserver?: MutationObserver;

  ngOnInit(): void {
    if (typeof window === 'undefined') return;
    const ctx = this.canvas().nativeElement.getContext('2d');
    if (!ctx) return;
    this.ctx = ctx;
    this.build();
    this.readColors();

    this.zone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.host.nativeElement);
      this.io = new IntersectionObserver(([e]) => {
        this.visible = e.isIntersecting;
        if (this.visible) this.loop();
      });
      this.io.observe(this.host.nativeElement);
      this.themeObserver = new MutationObserver(() => {
        this.readColors();
        if (this.still) this.draw(performance.now());
      });
      this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

      const el = this.host.nativeElement;
      el.addEventListener('pointermove', this.onPointer, { passive: true });
      el.addEventListener('pointerleave', this.onLeave, { passive: true });
      document.addEventListener('visibilitychange', this.onVisibility);

      this.resize();
      this.start = performance.now();
      this.loop();
    });
  }

  ngOnDestroy(): void {
    if (typeof window === 'undefined' || !this.ctx) return;
    cancelAnimationFrame(this.frame);
    this.resizeObserver?.disconnect();
    this.io?.disconnect();
    this.themeObserver?.disconnect();
    const el = this.host.nativeElement;
    el.removeEventListener('pointermove', this.onPointer);
    el.removeEventListener('pointerleave', this.onLeave);
    document.removeEventListener('visibilitychange', this.onVisibility);
  }

  private readonly onPointer = (e: PointerEvent) => {
    const r = this.host.nativeElement.getBoundingClientRect();
    this.pointer = { x: e.clientX - r.left, y: e.clientY - r.top, active: true };
  };
  private readonly onLeave = () => {
    this.pointer.active = false;
  };
  private readonly onVisibility = () => {
    if (!document.hidden) this.loop();
  };

  private build(): void {
    const rand = mulberry32(140);
    const make = ([tx, ty, side]: readonly [number, number, number], i: number, n: number): Dot => ({
      tx,
      ty,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      side,
      // Assemble from the centre outward, with a little jitter.
      delay: Math.hypot(tx - MARK_W / 2, ty - MARK_H / 2) * 900 + rand() * 500 + (i / n) * 120,
      phase: rand() * Math.PI * 2,
      sx: 0,
      sy: 0,
    });
    this.dust = DUST.map((p, i) => make(p, i, DUST.length));
    this.nodes = NODES.map((p, i) => ({ ...make(p, i, NODES.length), delay: 900 + rand() * 900 }));

    // Link each volunteer to its two nearest neighbours.
    const seen = new Set<string>();
    this.neighbours = this.nodes.map(() => []);
    this.nodes.forEach((a, i) => {
      const nearest = this.nodes
        .map((b, j) => ({ j, d: (a.tx - b.tx) ** 2 + (a.ty - b.ty) ** 2 }))
        .filter((o) => o.j !== i)
        .sort((p, q) => p.d - q.d)
        .slice(0, 2);
      for (const { j } of nearest) {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (seen.has(key)) continue;
        seen.add(key);
        this.links.push([i, j]);
        this.neighbours[i].push(j);
        this.neighbours[j].push(i);
      }
    });

    // Scatter: everything starts as a loose cloud.
    for (const d of [...this.dust, ...this.nodes]) {
      const a = rand() * Math.PI * 2;
      const r = 0.35 + rand() * 0.6;
      d.x = Math.cos(a) * r;
      d.y = Math.sin(a) * r;
    }
  }

  private resize(): void {
    const el = this.host.nativeElement;
    const rect = el.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const firstSize = this.w === 0;
    this.w = rect.width;
    this.h = rect.height;
    const c = this.canvas().nativeElement;
    c.width = Math.round(this.w * dpr);
    c.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.scale = Math.min(this.w / MARK_W, this.h / MARK_H) * this.fill();
    this.ox = (this.w - MARK_W * this.scale) / 2;
    this.oy = (this.h - MARK_H * this.scale) / 2;

    if (firstSize) {
      // Convert the unit cloud to pixels around the centre of the box.
      const R = Math.max(this.w, this.h) * 0.6;
      for (const d of [...this.dust, ...this.nodes]) {
        d.x = this.w / 2 + d.x * R;
        d.y = this.h / 2 + d.y * R;
        d.sx = d.x;
        d.sy = d.y;
      }
    }
    if (this.still) {
      for (const d of [...this.dust, ...this.nodes]) {
        d.x = this.ox + d.tx * this.scale;
        d.y = this.oy + d.ty * this.scale;
      }
      this.draw(performance.now());
    }
  }

  private readColors(): void {
    const cs = getComputedStyle(document.documentElement);
    const gold = cs.getPropertyValue('--color-gold').trim() || '#a27b35';
    const teal = cs.getPropertyValue('--color-teal').trim() || '#2f625d';
    this.colors = { gold, teal, glowGold: withAlpha(gold, 0.18), glowTeal: withAlpha(teal, 0.18) };
  }

  private loop = (): void => {
    cancelAnimationFrame(this.frame);
    if (this.still || !this.visible || document.hidden) return;
    this.frame = requestAnimationFrame((now) => {
      this.step(now);
      this.draw(now);
      this.loop();
    });
  };

  private step(now: number): void {
    const t = now - this.start;
    // Frame-rate independent: scale every per-frame quantity by elapsed time.
    const f = Math.min((now - (this.lastStep || now)) / 16.7 || 1, 4);
    this.lastStep = now;
    const damp = 0.82 ** f;
    const { x: px, y: py, active } = this.pointer;
    const R = 110;
    const settle = (d: Dot, k: number, drift: number) => {
      const bx = this.ox + d.tx * this.scale + Math.sin(now / 1400 + d.phase) * drift;
      const by = this.oy + d.ty * this.scale + Math.cos(now / 1700 + d.phase) * drift;
      // Assembly is a timed glide from the scattered start, so it always lands.
      const p = (t - d.delay) / ASSEMBLE_MS;
      if (p < 1) {
        if (p <= 0) return;
        const e = easeOutCubic(p);
        d.x = d.sx + (bx - d.sx) * e;
        d.y = d.sy + (by - d.sy) * e;
        return;
      }
      let fx = (bx - d.x) * k * f;
      let fy = (by - d.y) * k * f;
      if (active) {
        const dx = d.x - px;
        const dy = d.y - py;
        const dist = Math.hypot(dx, dy);
        if (dist < R && dist > 0.01) {
          const push = (1 - dist / R) ** 2 * 6 * f;
          fx += (dx / dist) * push;
          fy += (dy / dist) * push;
        }
      }
      d.vx = (d.vx + fx) * damp;
      d.vy = (d.vy + fy) * damp;
      d.x += d.vx;
      d.y += d.vy;
    };
    for (const d of this.dust) settle(d, 0.045, 0.8);
    for (const n of this.nodes) settle(n, 0.05, 1.6);

    // A pulse leaves a random volunteer every so often and travels to a neighbour.
    if (t > 2600 && now - this.lastPulse > 220 && this.pulses.length < 14) {
      this.lastPulse = now;
      const from = Math.floor(Math.random() * this.nodes.length);
      const options = this.neighbours[from];
      if (options.length) this.pulses.push({ from, to: options[Math.floor(Math.random() * options.length)], t: 0 });
    }
    this.pulses = this.pulses.filter((p) => (p.t += 0.018 * f) < 1);
  }

  private draw(now: number): void {
    const ctx = this.ctx;
    const t = this.still ? Infinity : now - this.start;
    ctx.clearRect(0, 0, this.w, this.h);

    // Fine points: the leaf lines of the mark.
    for (const d of this.dust) {
      const appear = clamp((t - d.delay * 0.6) / 600, 0, 1);
      ctx.globalAlpha = 0.18 + 0.62 * appear;
      ctx.fillStyle = d.side ? this.colors.teal : this.colors.gold;
      ctx.fillRect(d.x - 0.8, d.y - 0.8, 1.6, 1.6);
    }

    // Links between volunteers.
    const linkIn = clamp((t - 1900) / 1200, 0, 1);
    if (linkIn > 0) {
      ctx.lineWidth = 1;
      for (const [i, j] of this.links) {
        const a = this.nodes[i];
        const b = this.nodes[j];
        ctx.globalAlpha = 0.22 * linkIn;
        ctx.strokeStyle = a.side ? this.colors.teal : this.colors.gold;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(a.x + (b.x - a.x) * linkIn, a.y + (b.y - a.y) * linkIn);
        ctx.stroke();
      }
    }

    // Cursor: nearby volunteers reach toward it.
    if (this.pointer.active && !this.still) {
      ctx.lineWidth = 1;
      for (const n of this.nodes) {
        const dist = Math.hypot(n.x - this.pointer.x, n.y - this.pointer.y);
        if (dist < 150) {
          ctx.globalAlpha = (1 - dist / 150) * 0.5;
          ctx.strokeStyle = n.side ? this.colors.teal : this.colors.gold;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(this.pointer.x, this.pointer.y);
          ctx.stroke();
        }
      }
    }

    // Volunteers: brighter nodes with a soft halo.
    for (const n of this.nodes) {
      const pop = clamp((t - n.delay) / 500, 0, 1);
      if (pop <= 0) continue;
      const s = easeOutBack(pop);
      const breathe = this.still ? 1 : 1 + Math.sin(now / 900 + n.phase) * 0.12;
      ctx.globalAlpha = pop;
      ctx.fillStyle = n.side ? this.colors.glowTeal : this.colors.glowGold;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 7 * s * breathe, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = n.side ? this.colors.teal : this.colors.gold;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 2.6 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pulses travelling along links.
    for (const p of this.pulses) {
      const a = this.nodes[p.from];
      const b = this.nodes[p.to];
      const e = easeInOut(p.t);
      const x = a.x + (b.x - a.x) * e;
      const y = a.y + (b.y - a.y) * e;
      ctx.globalAlpha = Math.sin(p.t * Math.PI);
      ctx.fillStyle = a.side ? this.colors.teal : this.colors.gold;
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = Math.sin(p.t * Math.PI) * 0.25;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
}

function easeOutCubic(x: number): number {
  return 1 - (1 - x) ** 3;
}

function easeInOut(x: number): number {
  return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
}

function withAlpha(hex: string, a: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
