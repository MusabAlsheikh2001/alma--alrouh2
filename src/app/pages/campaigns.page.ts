import { Component, computed, inject, signal } from '@angular/core';

import { Parallax, RevealOnScroll } from '../animations.directive';
import {
  FIELD_CAMPAIGNS,
  ONLINE_SESSIONS,
  PARTNERS,
  photoCount,
  videoCount,
  type CampaignKind,
  type FieldCampaign,
  type Media,
} from '../campaigns/campaigns.data';
import { formatDate } from '../campaigns/format';
import { LightboxComponent } from '../campaigns/lightbox.component';
import { IconComponent } from '../icon.component';
import { Site } from '../site.service';

interface Viewer {
  items: Media[];
  start: number;
  title: string;
}

/**
 * Campaigns: documented field work with photo and video galleries, the online
 * session record, and the organizations Alma Alrouh has worked with.
 * Content lives in src/app/campaigns/campaigns.data.ts.
 */
@Component({
  selector: 'app-campaigns-page',
  imports: [IconComponent, LightboxComponent, Parallax, RevealOnScroll],
  template: `
    <section class="cp-hero" aria-labelledby="campaigns-title">
      <div class="container cp-hero-in">
        <div class="cp-hero-copy">
          <h1 id="campaigns-title" class="display-s enter">{{ t().campaigns.title }}</h1>
          <p class="lead enter" style="--d: 120ms">{{ t().campaigns.lead }}</p>
          <dl class="cp-stats enter" style="--d: 240ms">
            <div>
              <dt>{{ field.length }}</dt>
              <dd>{{ t().campaigns.statCampaigns }}</dd>
            </div>
            <div>
              <dt>{{ sessions.length }}</dt>
              <dd>{{ t().campaigns.statSessions }}</dd>
            </div>
            <div>
              <dt>{{ partners.length }}</dt>
              <dd>{{ t().campaigns.statPartners }}</dd>
            </div>
          </dl>
        </div>

        <div class="cp-mosaic" aria-hidden="true">
          <figure class="cp-tile cp-tile--a" [parallax]="0.05">
            <img src="campaigns/government-school/01-sm.webp" alt="" width="720" height="1280" fetchpriority="high" />
          </figure>
          <figure class="cp-tile cp-tile--b" [parallax]="0.1">
            <img src="campaigns/parwarish-orphanage/01.webp" alt="" width="1280" height="960" fetchpriority="high" />
          </figure>
          <figure class="cp-tile cp-tile--c" [parallax]="0.02">
            <img src="campaigns/rising-star-school/01-sm.webp" alt="" width="720" height="323" />
          </figure>
          <div class="cp-mosaic-card">
            <app-icon name="images" aria-hidden="true"></app-icon>
            <span>
              <strong>{{ mediaTotal }}</strong>
              <small>{{ t().campaigns.photos }} &amp; {{ t().campaigns.videos }}</small>
            </span>
          </div>
        </div>
      </div>
    </section>

    <div class="container">
      <div class="filters cp-filters enter" style="--d: 320ms" role="group" [attr.aria-label]="t().campaigns.filterLabel">
        <button type="button" class="chip" [attr.aria-pressed]="filter() === 'all'" (click)="filter.set('all')">
          {{ t().campaigns.all }}
        </button>
        @for (kind of kinds; track kind) {
          <button type="button" class="chip" [attr.data-kind]="kind" [attr.aria-pressed]="filter() === kind" (click)="filter.set(kind)">
            {{ t().campaigns.kinds[kind] }}
            <span class="chip-count">{{ countOf(kind) }}</span>
          </button>
        }
      </div>
    </div>

    @if (visibleField().length) {
      <section class="section cp-field" aria-labelledby="field-title">
        <div class="container">
          <div class="head head--split" data-reveal>
            <h2 id="field-title">{{ t().campaigns.fieldTitle }}</h2>
            <p class="lead">{{ t().campaigns.fieldLead }}</p>
          </div>

          <div class="stories">
            @for (c of visibleField(); track c.id + filter(); let i = $index) {
              <article
                class="story"
                [class.story--lead]="i === 0"
                [class.story--flip]="i % 2 === 0 && i !== 0"
                [id]="c.id"
                [attr.data-kind]="c.kind"
                [attr.aria-labelledby]="c.id + '-title'"
              >
                <div class="story-media" [class.story-media--five]="i === 0" [class.story-media--two]="c.media.length === 2" data-reveal="image">
                  @for (m of tiles(c, i === 0 ? 5 : 3); track m.src; let j = $index; let last = $last) {
                    <button
                      type="button"
                      class="story-tile"
                      [class.story-tile--cover]="j === 0"
                      (click)="open(c, j)"
                      [attr.aria-label]="t().campaigns.openGallery + ': ' + text(c.title) + ', ' + (j + 1)"
                    >
                      <img
                        [src]="m.src + (j === 0 ? '.webp' : '-sm.webp')"
                        [style.object-position]="j === 0 ? c.focus : null"
                        alt=""
                        [width]="m.w"
                        [height]="m.h"
                        loading="lazy"
                        decoding="async"
                      />
                      @if (m.type === 'video') {
                        <span class="story-play" aria-hidden="true"><app-icon name="play"></app-icon></span>
                      }
                      @if (last && c.media.length > (i === 0 ? 5 : 3)) {
                        <span class="story-more" aria-hidden="true">
                          +{{ c.media.length - (i === 0 ? 5 : 3) }}
                          <small>{{ t().campaigns.morePhotos }}</small>
                        </span>
                      }
                    </button>
                  }
                </div>

                <div class="story-body" data-reveal style="--i: 1">
                  <p class="story-date">
                    <app-icon name="calendar" aria-hidden="true"></app-icon>
                    <time [attr.datetime]="c.date">{{ date(c.date) }}</time>
                  </p>
                  <h3 [id]="c.id + '-title'">{{ text(c.title) }}</h3>
                  <p class="story-place">
                    <app-icon name="map-pin" aria-hidden="true"></app-icon>
                    {{ text(c.place) }}
                  </p>
                  <p class="story-summary">{{ text(c.summary) }}</p>
                  <ul class="story-meta">
                    <li><span class="tag">{{ t().campaigns.kinds[c.kind] }}</span></li>
                    <li>
                      <app-icon name="images" aria-hidden="true"></app-icon>
                      {{ photos(c) }} {{ t().campaigns.photos }}
                    </li>
                    @if (videos(c)) {
                      <li>
                        <app-icon name="video" aria-hidden="true"></app-icon>
                        {{ videos(c) }} {{ t().campaigns.videos }}
                      </li>
                    }
                  </ul>
                  <button type="button" class="btn" [class.btn--primary]="i === 0" [class.btn--quiet]="i !== 0" (click)="open(c, 0)">
                    {{ t().campaigns.openGallery }}
                    <app-icon class="arrow" name="arrow-right" aria-hidden="true"></app-icon>
                  </button>
                </div>
              </article>
            }
          </div>
        </div>
      </section>
    }

    @if (filter() === 'all' || filter() === 'online') {
      <section class="band cp-sessions" aria-labelledby="sessions-title">
        <div class="container">
          <div class="head head--split" data-reveal>
            <h2 id="sessions-title">{{ t().campaigns.sessionsTitle }}</h2>
            <p class="lead">{{ t().campaigns.sessionsLead }}</p>
          </div>

          <dl class="cp-format" data-reveal>
            <div>
              <dt>25–30</dt>
              <dd>{{ t().campaigns.formatLearning }}</dd>
            </div>
            <div>
              <dt>10–15</dt>
              <dd>{{ t().campaigns.formatQuestions }}</dd>
            </div>
            <div>
              <dt>{{ t().campaigns.formatPlatform }}</dt>
              <dd>{{ t().campaigns.formatPlatformText }}</dd>
            </div>
          </dl>

          <div class="cp-sessions-grid">
            <ul class="posters">
              @for (s of withPosters; track s.date; let i = $index) {
                <li data-reveal [style.--i]="i">
                  <button type="button" class="poster" (click)="openPoster(i)" [attr.aria-label]="t().campaigns.viewPoster + ': ' + text(s.title)">
                    <img [src]="s.poster!.src + '-sm.webp'" alt="" [width]="s.poster!.w" [height]="s.poster!.h" loading="lazy" decoding="async" />
                  </button>
                </li>
              }
            </ul>

            <ol class="timeline">
              @for (s of sessions; track s.date + s.speaker; let i = $index) {
                <li data-reveal [style.--i]="i">
                  <time [attr.datetime]="s.date">{{ date(s.date) }}</time>
                  <div>
                    <h3>{{ text(s.title) }}</h3>
                    <p>
                      {{ s.speaker }}
                      @if (s.note) {
                        <span class="timeline-note">{{ text(s.note) }}</span>
                      }
                    </p>
                  </div>
                </li>
              }
            </ol>
          </div>
        </div>
      </section>
    }

    @if (filter() === 'all' || filter() === 'outreach') {
      <section class="section cp-partners" aria-labelledby="partners-title">
        <div class="container split-head">
          <div class="head" data-reveal>
            <h2 id="partners-title">{{ t().campaigns.partnersTitle }}</h2>
            <p class="lead">{{ t().campaigns.partnersLead }}</p>
          </div>
          <ul class="partner-list">
            @for (p of partners; track p.en; let i = $index) {
              <li data-reveal [style.--i]="i">{{ text(p) }}</li>
            }
          </ul>
        </div>
      </section>
    }

    <section class="board statement" aria-labelledby="host-title">
      <div class="container statement-in">
        <h2 id="host-title" class="statement-text" data-reveal>{{ t().campaigns.hostTitle }}</h2>
        <div class="statement-side" data-reveal style="--i: 2">
          <p class="lead">{{ t().campaigns.hostText }}</p>
          <a class="btn btn--gold" [href]="site.partnershipFormUrl" target="_blank" rel="noreferrer">
            {{ t().campaigns.hostCta }}
            <app-icon class="arrow" name="arrow-up-right" aria-hidden="true"></app-icon>
          </a>
        </div>
      </div>
    </section>

    @if (viewer(); as v) {
      <app-lightbox
        [items]="v.items"
        [start]="v.start"
        [title]="v.title"
        [labels]="{ close: t().campaigns.close, prev: t().campaigns.prev, next: t().campaigns.next }"
        (close)="viewer.set(null)"
      />
    }
  `,
})
export class CampaignsPage {
  protected readonly site = inject(Site);
  protected readonly t = this.site.data;
  protected readonly field = FIELD_CAMPAIGNS;
  protected readonly sessions = ONLINE_SESSIONS;
  protected readonly withPosters = ONLINE_SESSIONS.filter((s) => s.poster);
  protected readonly partners = PARTNERS;
  protected readonly kinds: CampaignKind[] = ['awareness', 'outreach', 'online'];
  protected readonly mediaTotal = FIELD_CAMPAIGNS.reduce((n, c) => n + c.media.length, 0);

  protected readonly filter = signal<CampaignKind | 'all'>('all');
  protected readonly viewer = signal<Viewer | null>(null);

  protected readonly visibleField = computed(() => {
    const f = this.filter();
    if (f === 'online') return [];
    return f === 'all' ? FIELD_CAMPAIGNS : FIELD_CAMPAIGNS.filter((c) => c.kind === f);
  });

  protected text(value: { en: string; ar: string }): string {
    return value[this.site.language()];
  }

  protected date(iso: string): string {
    return formatDate(iso, this.site.language());
  }

  protected countOf(kind: CampaignKind): number {
    return kind === 'online' ? ONLINE_SESSIONS.length : FIELD_CAMPAIGNS.filter((c) => c.kind === kind).length;
  }

  protected photos(c: FieldCampaign): number {
    return photoCount(c);
  }

  protected videos(c: FieldCampaign): number {
    return videoCount(c);
  }

  /** The first `n` items for a story's mosaic: images first, so the cover is always a photo. */
  protected tiles(c: FieldCampaign, n: number): Media[] {
    return c.media.slice(0, n);
  }

  protected open(c: FieldCampaign, start: number): void {
    this.viewer.set({ items: c.media, start, title: this.text(c.title) });
  }

  protected openPoster(i: number): void {
    this.viewer.set({
      items: this.withPosters.map((s) => s.poster!),
      start: i,
      title: this.t().campaigns.sessionsTitle,
    });
  }
}
