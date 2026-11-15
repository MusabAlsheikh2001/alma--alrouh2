import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CountUp, RevealOnScroll, ScrollScene } from '../animations.directive';
import { IconComponent } from '../icon.component';
import { FIELD_CAMPAIGNS, ONLINE_SESSIONS } from '../campaigns/campaigns.data';
import { formatDate } from '../campaigns/format';
import { Site } from '../site.service';
import { VolunteerNetworkComponent } from './volunteer-network.component';

@Component({
  selector: 'app-home-page',
  imports: [CountUp, IconComponent, RevealOnScroll, RouterLink, ScrollScene, VolunteerNetworkComponent],
  template: `
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-glow" aria-hidden="true"></div>
      <div class="container hero-in">
        <div class="hero-copy">
          <h1 id="hero-title" class="hero-title" [attr.aria-label]="t().hero.title">
            @for (word of titleWords(); track $index) {
              <span class="word" aria-hidden="true" [style.--i]="$index"><span>{{ word }}</span></span>{{ ' ' }}
            }
          </h1>
          <p class="lead enter" style="--d: 520ms">{{ t().hero.copy }}</p>
          <div class="actions enter" style="--d: 640ms">
            <a class="btn btn--primary" [href]="site.supportFormUrl" target="_blank" rel="noreferrer">
              {{ t().hero.primary }}
              <app-icon class="arrow" name="arrow-right" aria-hidden="true"></app-icon>
            </a>
            <a class="btn btn--quiet" [href]="site.volunteerFormUrl" target="_blank" rel="noreferrer">
              {{ t().hero.tertiary }}
            </a>
          </div>
          <ul class="trust enter" style="--d: 760ms" [attr.aria-label]="t().tagline">
            @for (item of t().hero.trust; track item; let i = $index) {
              <li>
                <app-icon [name]="trustIcons[i]" aria-hidden="true"></app-icon>
                {{ item }}
              </li>
            }
          </ul>
        </div>

        <div class="hero-network">
          <app-volunteer-network />
          <p class="hero-network-legend">
            <span class="legend-dots" aria-hidden="true"><i></i><i></i></span>
            {{ t().home.networkLegend }}
          </p>
        </div>
      </div>
      <p class="scroll-hint" aria-hidden="true"><span></span>{{ t().home.scrollHint }}</p>
    </section>

    <section class="board lit" scrollScene aria-labelledby="mission-title">
      <div class="lit-stage">
        <div class="container">
          <h2 id="mission-title" class="lit-kicker">{{ t().mission.title }}</h2>
          <p class="lit-text" [style.--n]="missionWords().length">
            @for (word of missionWords(); track $index) {
              <span [style.--i]="$index" [class.is-key]="isKey(word)">{{ word }}</span>{{ ' ' }}
            }
          </p>
          <a class="btn btn--gold lit-cta" routerLink="/about">
            {{ t().pages.aboutLink }}
            <app-icon class="arrow" name="arrow-right" aria-hidden="true"></app-icon>
          </a>
        </div>
      </div>
    </section>

    <section class="section numbers" aria-labelledby="numbers-title">
      <div class="container">
        <div class="head head--split" data-reveal>
          <h2 id="numbers-title">{{ t().home.numbersTitle }}</h2>
          <p class="lead">{{ t().home.numbersLead }}</p>
        </div>

        <ul class="bento">
          <li class="bento-tile bento-tile--volunteers" data-reveal>
            <div class="bento-figure">
              <strong [countUp]="'140+'"></strong>
              <span>{{ t().home.volunteers }}</span>
            </div>
            <div class="dot-matrix" aria-hidden="true">
              @for (d of volunteerDots; track $index) {
                <i [style.--d]="$index"></i>
              }
            </div>
          </li>

          <li class="bento-tile bento-tile--campaigns" data-reveal style="--i: 1">
            <a routerLink="/campaigns" class="bento-link">
              <div class="bento-figure">
                <strong [countUp]="field.length + ''"></strong>
                <span>{{ t().home.campaigns }}</span>
              </div>
              <div class="photo-stack" aria-hidden="true">
                @for (c of field.slice(0, 3); track c.id; let i = $index) {
                  <img [src]="c.media[0].src + '-sm.webp'" alt="" [style.--k]="i" loading="lazy" decoding="async" />
                }
              </div>
            </a>
          </li>

          <li class="bento-tile bento-tile--sessions" data-reveal style="--i: 2">
            <a routerLink="/campaigns" fragment="sessions-title" class="bento-link">
              <div class="bento-figure">
                <strong [countUp]="sessions.length + ''"></strong>
                <span>{{ t().home.sessions }}</span>
              </div>
              <div class="session-line" aria-hidden="true">
                @for (s of sessionMarks; track s.date; let i = $index) {
                  <i [style.--x]="s.x" [style.--d]="i"></i>
                }
                @for (m of months(); track m.label) {
                  <b [style.--x]="m.x">{{ m.label }}</b>
                }
              </div>
            </a>
          </li>

          <li class="bento-tile bento-tile--themes" data-reveal style="--i: 1">
            <div class="bento-figure">
              <strong [countUp]="t().home.themes.length + ''"></strong>
              <span>{{ t().home.themesLabel }}</span>
            </div>
            <ul class="theme-chips">
              @for (theme of t().home.themes; track theme; let i = $index) {
                <li [style.--d]="i">{{ theme }}</li>
              }
            </ul>
          </li>

          <li class="bento-tile bento-tile--format" data-reveal style="--i: 2">
            <span class="bento-small">{{ t().home.sessionFormat }}</span>
            <div class="format-bar" aria-hidden="true">
              <i class="format-learning"></i><i class="format-questions"></i>
            </div>
            <dl class="format-legend">
              <div><dt>25–30 {{ t().home.minutes }}</dt><dd>{{ t().home.learning }}</dd></div>
              <div><dt>10–15 {{ t().home.minutes }}</dt><dd>{{ t().home.questions }}</dd></div>
            </dl>
          </li>

          <li class="bento-tile bento-tile--free" data-reveal>
            <strong class="bento-word">{{ t().home.free }}</strong>
            <span>{{ t().home.freeText }}</span>
          </li>

          <li class="bento-tile bento-tile--founded" data-reveal style="--i: 1">
            <strong class="bento-word" [countUp]="t().home.founded"></strong>
            <span>{{ t().home.foundedText }}</span>
          </li>
        </ul>
      </div>
    </section>

    <section class="rail-scene" scrollScene aria-labelledby="field-title">
      <div class="rail-stage">
        <div class="container rail-head">
          <h2 id="field-title" class="rail-title">{{ t().home.fieldTitle }}</h2>
          <div class="rail-side">
            <p class="lead">{{ t().home.fieldLead }}</p>
            <a class="link" routerLink="/campaigns">
              {{ t().pages.campaignsLink }}
              <app-icon class="arrow" name="arrow-right" aria-hidden="true"></app-icon>
            </a>
          </div>
        </div>
        <ul class="rail-track" data-track>
          @for (c of field; track c.id; let i = $index) {
            <li>
              <a class="rail-card" routerLink="/campaigns" [fragment]="c.id" [class.rail-card--wide]="i % 3 === 0">
                <img [src]="c.media[0].src + '.webp'" [style.object-position]="c.focus" alt="" [width]="c.media[0].w" [height]="c.media[0].h" loading="lazy" decoding="async" />
                <span class="rail-card-body">
                  <time [attr.datetime]="c.date">{{ date(c.date) }}</time>
                  <strong>{{ text(c.title) }}</strong>
                  <span class="rail-card-place">{{ text(c.place) }}</span>
                </span>
              </a>
            </li>
          }
        </ul>
        <div class="rail-progress" aria-hidden="true"><i></i></div>
      </div>
    </section>

    <section class="band" aria-labelledby="forms-title">
      <div class="container">
        <div class="head" data-reveal>
          <h2 id="forms-title">{{ t().forms.title }}</h2>
          <p class="lead">{{ t().forms.intro }}</p>
        </div>
        <ul class="tiles">
          @for (item of t().forms.items; track item.id; let i = $index) {
            <li data-reveal [style.--i]="i">
              <a class="tile" [class.tile--lead]="i === 0" [href]="site.formHref(item.id)" target="_blank" rel="noreferrer">
                <span class="tile-icon"><app-icon [name]="formIcons[item.id]" aria-hidden="true"></app-icon></span>
                <h3>{{ item.title }}</h3>
                <p>{{ item.text }}</p>
                <span class="tile-cta">
                  {{ item.cta }}
                  <app-icon class="arrow" name="arrow-up-right" aria-hidden="true"></app-icon>
                </span>
              </a>
            </li>
          }
        </ul>
      </div>
    </section>

    <section class="band" aria-labelledby="founder-title">
      <div class="container founder">
        <figure class="founder-photo" data-reveal="image">
          <img
            [src]="site.founderImageUrl"
            [alt]="t().founder.imageAlt"
            width="920"
            height="1150"
            loading="lazy"
            decoding="async"
          />
        </figure>
        <div class="founder-copy" data-reveal style="--i: 1">
          <h2 id="founder-title">{{ t().founder.title }}</h2>
          <blockquote class="quote">
            <p>{{ t().founder.quote[0] }}</p>
          </blockquote>
          <p class="signature">
            <strong>{{ t().founder.name }}</strong>
            <span>{{ t().founder.role }}</span>
          </p>
          <a class="link" routerLink="/about" fragment="founder">
            {{ t().pages.founderLink }}
            <app-icon class="arrow" name="arrow-right" aria-hidden="true"></app-icon>
          </a>
        </div>
      </div>
    </section>

    <section class="board cta-band" aria-labelledby="home-cta-title">
      <div class="container cta-in">
        <h2 id="home-cta-title" data-reveal>{{ t().contact.title }}</h2>
        <div class="actions" data-reveal style="--i: 1">
          <a class="btn btn--gold" [href]="site.supportFormUrl" target="_blank" rel="noreferrer">
            {{ t().hero.primary }}
            <app-icon class="arrow" name="arrow-right" aria-hidden="true"></app-icon>
          </a>
          <a class="btn btn--ghost" routerLink="/contact">{{ t().nav.contact }}</a>
        </div>
      </div>
    </section>
  `,
})
export class HomePage {
  protected readonly site = inject(Site);
  protected readonly t = this.site.data;
  protected readonly field = FIELD_CAMPAIGNS;
  protected readonly sessions = ONLINE_SESSIONS;
  protected readonly volunteerDots = Array.from({ length: 140 });

  /** Each session placed along July to October 2026, as a percentage. */
  private readonly span = [Date.parse('2026-07-01'), Date.parse('2026-11-01')] as const;
  protected readonly sessionMarks = ONLINE_SESSIONS.map((s) => ({
    date: s.date,
    x: `${(((Date.parse(s.date) - this.span[0]) / (this.span[1] - this.span[0])) * 100).toFixed(1)}%`,
  }));
  protected readonly months = computed(() =>
    ['2026-07', '2026-08', '2026-09', '2026-10'].map((m, i) => ({
      label: new Intl.DateTimeFormat(this.site.language() === 'ar' ? 'ar' : 'en-US', { month: 'short' }).format(new Date(`${m}-15T12:00:00`)),
      x: `${i * 25}%`,
    })),
  );

  protected readonly missionWords = computed(() => this.t().mission.body.split(' '));
  private readonly keyWords = /^(free|culturally|sensitive|safely|alone|المجاني|المراعية|للثقافة|بأمان|وحدهم)/i;
  protected isKey(word: string): boolean {
    return this.keyWords.test(word.replace(/[.,،]/g, ''));
  }
  protected text(value: { en: string; ar: string }): string {
    return value[this.site.language()];
  }
  protected date(iso: string): string {
    return formatDate(iso, this.site.language());
  }
  protected readonly titleWords = computed(() => this.t().hero.title.split(' '));
  protected readonly trustIcons = ['shield-check', 'heart', 'users-round', 'globe'] as const;
  protected readonly formIcons = {
    support: 'life-buoy',
    volunteer: 'hand-heart',
    donation: 'hand-coins',
    partnership: 'handshake',
  } as const;
}
