import { AlmaContent } from '../velobase/alma-content';
import { ContentStatus } from '../velobase/content-status';
import { mediaImage } from '../campaigns/campaigns.data';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { RevealOnScroll } from '../animations.directive';
import { IconComponent } from '../icon.component';
import { formatDate } from '../campaigns/format';
import { Site } from '../site.service';

@Component({
  selector: 'app-programs-page',
  imports: [ContentStatus, IconComponent, RevealOnScroll, RouterLink],
  template: `
    <app-content-status />
    <section class="page-head" aria-labelledby="programs-title">
      <div class="container">
        <h1 id="programs-title" class="display-s enter">{{ t().programs.title }}</h1>
        <p class="lead enter" style="--d: 120ms">{{ t().pages.programsLead }}</p>
      </div>
    </section>

    <section id="programs" class="section" aria-labelledby="programs-list-title">
      <div class="container">
        <h2 id="programs-list-title" class="visually-hidden">{{ t().programs.eyebrow }}</h2>
        <ul class="cards">
          @for (program of content.programs(); track program.slug; let i = $index) {
            <li class="card" data-reveal [style.--i]="i">
              <span class="tile-icon"
                ><app-icon
                  [name]="programIcons[i % programIcons.length]"
                  aria-hidden="true"
                ></app-icon
              ></span>
              <h3>{{ program.title }}</h3>
              <p>{{ program.summary }}</p>
              @if (program.managed) {
                <a class="link" [routerLink]="['/programs', program.slug]">{{
                  site.language() === 'ar' ? 'اقرأ المزيد' : 'Read more'
                }}</a>
              }
            </li>
          }
        </ul>
      </div>
    </section>

    <section id="care" class="band" aria-labelledby="care-title">
      <div class="container">
        <div class="head" data-reveal>
          <h2 id="care-title">{{ t().care.title }}</h2>
          <p class="lead">{{ t().care.intro }}</p>
        </div>
        <ol class="steps">
          @for (step of t().care.steps; track step[0]; let i = $index) {
            <li data-reveal [style.--i]="i">
              <h3>{{ step[0] }}</h3>
              <p>{{ step[1] }}</p>
            </li>
          }
        </ol>
        <div class="actions">
          <a class="btn btn--primary" [href]="site.supportFormUrl" target="_blank" rel="noreferrer">
            {{ t().hero.primary }}
            <app-icon class="arrow" name="arrow-right" aria-hidden="true"></app-icon>
          </a>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="programs-campaigns-title">
      <div class="container">
        <div class="head head--split" data-reveal>
          <div>
            <h2 id="programs-campaigns-title">{{ t().campaigns.homeTitle }}</h2>
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
                  <img
                    [hidden]="!c.media.length"
                    [attr.src]="image(c.media[0], true) || null"
                    [style.object-position]="c.focus"
                    alt=""
                    [attr.width]="c.media[0]?.w"
                    [attr.height]="c.media[0]?.h"
                    loading="lazy"
                    decoding="async"
                  />
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
  `,
})
export class ProgramsPage {
  protected readonly site = inject(Site);
  protected readonly content = inject(AlmaContent);
  protected readonly image = mediaImage;
  protected readonly t = this.site.data;
  protected get featured() {
    return this.content.campaigns().slice(0, 3);
  }
  protected text(value: { en: string; ar: string }): string {
    return value[this.site.language()];
  }
  protected date(iso: string): string {
    return formatDate(iso, this.site.language());
  }
  protected readonly programIcons = [
    'message-circle-heart',
    'megaphone',
    'graduation-cap',
    'tent',
    'speech',
    'route',
  ] as const;
}
