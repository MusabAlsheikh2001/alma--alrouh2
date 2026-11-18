import { Component, inject } from '@angular/core';
import { PublicContentStore } from './public-content';
import { Site } from '../site.service';
@Component({
  selector: 'app-content-status',
  standalone: true,
  host: { '[attr.data-state]': 'api.status()' },
  template: `
    @if (api.status() === 'loading') {
      <p class="container" role="status">
        {{ ar ? 'جارٍ التحقق من آخر التحديثات…' : 'Checking the latest updates…' }}
      </p>
    }
    @if (api.status() === 'error') {
      <div class="container" role="alert">
        <p>
          {{
            ar
              ? 'تعذّر تحميل آخر المحتوى. حاول مرة أخرى.'
              : 'The latest content could not be loaded. Please try again.'
          }}
        </p>
        <button class="btn btn--quiet" (click)="api.refresh(true)">
          {{ ar ? 'إعادة المحاولة' : 'Try again' }}
        </button>
      </div>
    }
  `,
})
export class ContentStatus {
  readonly api = inject(PublicContentStore);
  private readonly site = inject(Site);
  get ar() {
    return this.site.language() === 'ar';
  }
}
