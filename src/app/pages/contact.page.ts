import { Component, inject } from '@angular/core';

import { IconComponent } from '../icon.component';
import { RevealOnScroll } from '../animations.directive';
import { Site } from '../site.service';

@Component({
  selector: 'app-contact-page',
  imports: [RevealOnScroll, IconComponent],
  template: `
    <section id="contact" class="page-head" aria-labelledby="contact-title">
      <div class="container">
        <h1 id="contact-title" class="display-s enter">{{ t().contact.title }}</h1>
        <p class="lead enter" style="--d: 120ms">{{ t().contact.text }}</p>
      </div>
    </section>

    <section class="section" aria-labelledby="channels-title">
      <div class="container">
        <h2 id="channels-title" class="visually-hidden">{{ t().contact.eyebrow }}</h2>
        <ul class="channels">
          <li data-reveal style="--i: 0">
            <a [href]="site.contactMailto">
              <app-icon name="mail" aria-hidden="true"></app-icon>
              <small>{{ t().pages.emailLabel }}</small>
              <strong>{{ t().contact.email }}</strong>
            </a>
          </li>
          <li data-reveal style="--i: 1">
            <a [href]="'tel:' + t().contact.phone.replaceAll(' ', '')">
              <app-icon name="phone" aria-hidden="true"></app-icon>
              <small>{{ t().pages.phoneLabel }}</small>
              <strong dir="ltr">{{ t().contact.phone }}</strong>
            </a>
          </li>
          <li data-reveal style="--i: 2">
            <div>
              <app-icon name="map-pin" aria-hidden="true"></app-icon>
              <small>{{ t().pages.locationLabel }}</small>
              <strong>{{ t().contact.location }}</strong>
            </div>
          </li>
        </ul>
        <p class="safety" role="note" data-reveal>
          <app-icon name="triangle-alert" aria-hidden="true"></app-icon>
          {{ t().contact.safety }}
        </p>
      </div>
    </section>

    <section class="band" aria-labelledby="contact-forms-title">
      <div class="container">
        <div class="head" data-reveal>
          <h2 id="contact-forms-title">{{ t().forms.title }}</h2>
          <p class="lead">{{ t().forms.intro }}</p>
        </div>
        <ul class="rows">
          @for (item of t().forms.items; track item.id; let i = $index) {
            <li class="row row--action" data-reveal [style.--i]="i">
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
  `,
})
export class ContactPage {
  protected readonly site = inject(Site);
  protected readonly t = this.site.data;
}
