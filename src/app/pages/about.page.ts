import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CountUp, RevealOnScroll } from '../animations.directive';
import { Site } from '../site.service';

@Component({
  selector: 'app-about-page',
  imports: [CountUp, RevealOnScroll, RouterLink],
  template: `
    <section class="page-head" aria-labelledby="about-title">
      <div class="container">
        <h1 id="about-title" class="display-s enter">{{ t().mission.title }}</h1>
        <p class="lead enter" style="--d: 120ms">{{ t().mission.body }}</p>
        <a class="link enter" style="--d: 200ms" routerLink="/programs">{{ t().mission.cta }}</a>
      </div>
    </section>

    <section id="mission" class="section" aria-labelledby="pillars-title">
      <div class="container split-head">
        <div class="head" data-reveal>
          <h2 id="pillars-title">{{ t().mission.eyebrow }}</h2>
        </div>
        <ul class="rows">
          @for (pillar of t().mission.pillars; track pillar.title; let i = $index) {
            <li class="row" data-reveal [style.--i]="i">
              <h3>{{ pillar.title }}</h3>
              <p>{{ pillar.text }}</p>
            </li>
          }
        </ul>
      </div>
    </section>

    <section id="founder" class="band" aria-labelledby="founder-title">
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
            @for (paragraph of t().founder.quote; track paragraph) {
              <p>{{ paragraph }}</p>
            }
          </blockquote>
          <p class="signature">
            <strong>{{ t().founder.name }}</strong>
            <span>{{ t().founder.role }}</span>
          </p>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="about-stats-title">
      <div class="container">
        <div class="head" data-reveal>
          <h2 id="about-stats-title">{{ t().stats.title }}</h2>
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

    <section class="board statement" aria-labelledby="about-close-title">
      <div class="container statement-in">
        <h2 id="about-close-title" class="statement-text" data-reveal>{{ t().volunteers.title }}</h2>
        <div class="statement-side" data-reveal style="--i: 2">
        <a class="btn btn--gold" routerLink="/get-involved">{{ t().nav.involved }}</a>
        </div>
      </div>
    </section>
  `,
})
export class AboutPage {
  protected readonly site = inject(Site);
  protected readonly t = this.site.data;
}
