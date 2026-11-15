import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Site } from '../site.service';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <section class="page-head" aria-labelledby="nf-title">
      <div class="container">
        <h1 id="nf-title" class="display-s enter">{{ t().pages.notFoundTitle }}</h1>
        <p class="lead enter" style="--d: 120ms">{{ t().pages.notFoundText }}</p>
        <a class="btn btn--primary enter" style="--d: 200ms" routerLink="/">{{ t().nav.home }}</a>
      </div>
    </section>
  `,
})
export class NotFoundPage {
  protected readonly t = inject(Site).data;
}
