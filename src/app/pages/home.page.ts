import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CountUp, Parallax, RevealOnScroll } from '../animations.directive';
import { IconComponent } from '../icon.component';
import { FIELD_CAMPAIGNS } from '../campaigns/campaigns.data';
import { formatDate } from '../campaigns/format';
import { Site } from '../site.service';

@Component({
  selector: 'app-home-page',
  imports: [CountUp, IconComponent, Parallax, RevealOnScroll, RouterLink],
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

        <div class="hero-visual">
          <figure class="hero-photo" [parallax]="0.06">
            <img
              [src]="site.heroImageUrl"
              [alt]="t().tagline"
              width="1717"
              height="916"
              fetchpriority="high"
              decoding="async"
            />
          </figure>
          <div class="hero-badge" aria-hidden="true">
            <span class="hero-badge-icon"><app-icon name="heart" aria-hidden="true"></app-icon></span>
            <span>
              <strong>{{ t().stats.items[1][0] }}</strong>
              <small>{{ t().stats.items[1][1] }}</small>
            </span>
          </div>
        </div>
      </div>
    </section>

    <section class="board statement" aria-labelledby="mission-title">
      <div class="container statement-in">
        <h2 id="mission-title" class="statement-text" data-reveal>{{ t().mission.title }}</h2>
        <div class="statement-side" data-reveal style="--i: 2">
          <p class="lead">{{ t().mission.body }}</p>
          <a class="btn btn--gold" routerLink="/about">
            {{ t().pages.aboutLink }}
            <app-icon class="arrow" name="arrow-right" aria-hidden="true"></app-icon>
          </a>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="stats-title">
      <div class="container">
        <div class="head" data-reveal>
          <h2 id="stats-title">{{ t().stats.title }}</h2>
        </div>
        <dl class="figures">
          @for (stat of t().stats.items; track stat[1]; let i = $index) {
            <div data-reveal [style.--i]="i">
              <dt [countUp]="stat[0]"></dt>
              <dd>{{ stat[1] }}</dd>
            </div>
          }
        </dl>
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

    <section class="section" aria-labelledby="home-campaigns-title">
      <div class="container">
        <div class="head head--split" data-reveal>
          <div>
            <h2 id="home-campaigns-title">{{ t().campaigns.homeTitle }}</h2>
            <p class="lead">{{ t().campaigns.homeLead }}</p>
          </div>
          <a class="link" routerLink="/campaigns">
            {{ t().pages.campaignsLink }}
            <app-icon class="arrow" name="arrow-right" aria-hidden="true"></app-icon>
          </a>
        </div>
        <ul class="field-cards">
          @for (c of featured; track c.id; let i = $index) {
            <li data-reveal [style.--i]="i">
              <a class="field-card" routerLink="/campaigns" [fragment]="c.id">
                <span class="field-card-media">
                  <img [src]="c.media[0].src + '-sm.webp'" [style.object-position]="c.focus" alt="" [width]="c.media[0].w" [height]="c.media[0].h" loading="lazy" decoding="async" />
                </span>
                <span class="field-card-body">
                  <time [attr.datetime]="c.date">{{ date(c.date) }}</time>
                  <h3>{{ text(c.title) }}</h3>
                  <span class="field-card-place">
                    <app-icon name="map-pin" aria-hidden="true"></app-icon>
                    {{ text(c.place) }}
                  </span>
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
  protected readonly featured = FIELD_CAMPAIGNS.slice(0, 3);
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
