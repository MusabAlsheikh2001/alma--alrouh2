import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { RevealOnScroll } from '../animations.directive';
import { Site } from '../site.service';

type LegalKey = 'terms' | 'faqs' | 'privacy';

/** FAQs, Terms, and Privacy share one layout; the route's `data.key` picks the text. */
@Component({
  selector: 'app-legal-page',
  imports: [RevealOnScroll, RouterLink],
  template: `
    <section [id]="key()" class="page-head" aria-labelledby="legal-title">
      <div class="container">
        <h1 id="legal-title" class="display-s enter">{{ page().title }}</h1>
        <p class="lead enter" style="--d: 120ms">{{ page().intro }}</p>
        <p class="meta enter" style="--d: 200ms">{{ page().updated }}</p>
      </div>
    </section>

    <section class="section" aria-labelledby="legal-title">
      <div class="container">
        <ul class="rows rows--wide">
          @for (section of page().sections; track section.title; let i = $index) {
            <li class="row" data-reveal [style.--i]="i">
              <h3>{{ section.title }}</h3>
              <p>{{ section.body }}</p>
            </li>
          }
        </ul>
        <nav class="legal-nav" [attr.aria-label]="t().footer.legalLinksLabel">
          <a class="link" routerLink="/faqs">{{ t().legal.faqs.title }}</a>
          <a class="link" routerLink="/terms">{{ t().legal.terms.title }}</a>
          <a class="link" routerLink="/privacy">{{ t().legal.privacy.title }}</a>
        </nav>
      </div>
    </section>
  `,
})
export class LegalPageComponent {
  protected readonly site = inject(Site);
  protected readonly t = this.site.data;
  /** Bound from the route's `data.key`. */
  readonly key = input.required<LegalKey>();
  protected readonly page = computed(() => this.t().legal[this.key()]);
}
