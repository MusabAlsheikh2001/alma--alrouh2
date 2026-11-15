import { Component, computed, inject } from '@angular/core';

import { RevealOnScroll } from '../animations.directive';
import { IconComponent } from '../icon.component';
import { Site } from '../site.service';

@Component({
  selector: 'app-involved-page',
  imports: [IconComponent, RevealOnScroll],
  template: `
    <section class="page-head" aria-labelledby="involved-title">
      <div class="container">
        <h1 id="involved-title" class="display-s enter">{{ t().pages.involvedTitle }}</h1>
        <p class="lead enter" style="--d: 120ms">{{ t().pages.involvedLead }}</p>
      </div>
    </section>

    <section id="forms" class="section" aria-labelledby="ways-title">
      <div class="container">
        <h2 id="ways-title" class="visually-hidden">{{ t().forms.eyebrow }}</h2>
        <ul class="cards">
          @for (item of ways(); track item.id; let i = $index) {
            <li class="card card--action" data-reveal [style.--i]="i">
              <span class="tile-icon"><app-icon [name]="formIcons[item.id]" aria-hidden="true"></app-icon></span>
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
              <a class="btn btn--quiet" [href]="site.formHref(item.id)" target="_blank" rel="noreferrer">
                {{ item.cta }}
                <app-icon class="arrow" name="arrow-up-right" aria-hidden="true"></app-icon>
              </a>
            </li>
          }
        </ul>
      </div>
    </section>

    <section id="volunteers" class="band" aria-labelledby="volunteers-title">
      <div class="container split-head">
        <div class="head" data-reveal>
          <h2 id="volunteers-title">{{ t().volunteers.title }}</h2>
          <p class="lead">{{ t().volunteers.text }}</p>
          <a class="btn btn--primary" [href]="site.volunteerFormUrl" target="_blank" rel="noreferrer">
            {{ t().hero.tertiary }}
            <app-icon class="arrow" name="arrow-up-right" aria-hidden="true"></app-icon>
          </a>
        </div>
        <div>
          <ul class="rows">
            @for (fact of t().volunteers.facts; track fact[0]; let i = $index) {
              <li class="row" data-reveal [style.--i]="i">
                <h3>{{ fact[0] }}</h3>
                <p>{{ fact[1] }}</p>
              </li>
            }
            <li class="row">
              <h3>{{ t().pages.rolesLabel }}</h3>
              <p>{{ t().volunteers.roles.join(site.isRtl() ? '، ' : ', ') }}</p>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="board statement" aria-labelledby="donate-title">
      <div class="container statement-in">
        <h2 id="donate-title" class="statement-text" data-reveal>{{ t().hero.secondary }}</h2>
        <div class="statement-side" data-reveal style="--i: 2">
        <p class="lead">{{ t().legal.terms.sections[4].body }}</p>
        <a class="btn" [href]="site.donationFormUrl" target="_blank" rel="noreferrer">
          {{ t().nav.donate }}
        </a>
        </div>
      </div>
    </section>
  `,
})
export class InvolvedPage {
  protected readonly site = inject(Site);
  protected readonly t = this.site.data;
  protected readonly formIcons = { support: 'life-buoy', volunteer: 'hand-heart', donation: 'hand-coins', partnership: 'handshake' } as const;
  /** Support requests live on the home and contact pages; this page is for helpers. */
  protected readonly ways = computed(() =>
    this.t().forms.items.filter((item) => item.id !== 'support'),
  );
}
