import { computed, inject, Injectable } from '@angular/core';
import { Site } from '../site.service';
import {
  FIELD_CAMPAIGNS,
  ONLINE_SESSIONS,
  PARTNERS,
  Bilingual,
  FieldCampaign,
  OnlineSession,
  Media,
} from '../campaigns/campaigns.data';
import { ContentKind, PublicContent, PublicContentStore } from './public-content';

export interface Program {
  slug: string;
  title: string;
  summary: string;
  managed: boolean;
}
/** Presentation adapter: existing layout, published snapshots, explicit per-section migration. */
@Injectable({ providedIn: 'root' })
export class AlmaContent {
  readonly api = inject(PublicContentStore);
  private readonly site = inject(Site);
  private bilingual(rows: PublicContent[], key: 'title' | 'summary' | 'location'): Bilingual {
    const fallback = rows[0]?.[key] || '';
    return {
      en: rows.find((r) => r.locale === 'en')?.[key] || fallback,
      ar: rows.find((r) => r.locale === 'ar')?.[key] || fallback,
    };
  }
  private groups(kind: ContentKind): PublicContent[][] {
    const grouped = new Map<string, PublicContent[]>();
    for (const row of this.api.getPublishedContent(kind))
      grouped.set(row.slug, [...(grouped.get(row.slug) || []), row]);
    return [...grouped.values()];
  }
  private selected(rows: PublicContent[]): PublicContent {
    return rows.find((r) => r.locale === this.site.language()) || rows[0];
  }
  private media(row: PublicContent): Media[] {
    const items = row.media.length
      ? row.media
      : row.imageUrl
        ? [
            {
              type: 'image' as const,
              url: row.imageUrl,
              thumbnailUrl: '',
              width: null,
              height: null,
              alt: row.imageAlt,
            },
          ]
        : [];
    return items.map((m) => ({
      type: m.type,
      src: m.url,
      url: m.url,
      thumbnailUrl: m.thumbnailUrl,
      alt: m.alt,
      w: m.width || 1600,
      h: m.height || 1200,
    }));
  }
  readonly campaigns = computed<FieldCampaign[]>(() => {
    const legacy = this.api.useLegacy('campaign') ? FIELD_CAMPAIGNS : [];
    const api = this.groups('campaign')
      .filter((rows) => !legacy.some((c) => c.id === rows[0].slug))
      .map((rows) => {
        const row = this.selected(rows);
        return {
          id: row.slug,
          managed: true,
          kind: row.category === 'outreach' ? ('outreach' as const) : ('awareness' as const),
          date: (row.startsAt || row.publishedAt).slice(0, 10),
          title: this.bilingual(rows, 'title'),
          place: this.bilingual(rows, 'location'),
          summary: this.bilingual(rows, 'summary'),
          media: this.media(row),
        };
      });
    return [...api, ...legacy];
  });
  readonly sessions = computed<OnlineSession[]>(() => [
    ...this.groups('event').map((rows) => {
      const row = this.selected(rows);
      return {
        slug: row.slug,
        date: (row.startsAt || row.publishedAt).slice(0, 10),
        speaker: row.speaker,
        title: this.bilingual(rows, 'title'),
        note: this.bilingual(rows, 'summary'),
        poster: this.media(row).find((m) => m.type === 'image'),
      };
    }),
    ...(this.api.useLegacy('event') ? ONLINE_SESSIONS : []),
  ]);
  readonly partners = computed<Bilingual[]>(() => [
    ...this.groups('partner').map((rows) => this.bilingual(rows, 'title')),
    ...(this.api.useLegacy('partner') ? PARTNERS : []),
  ]);
  readonly programs = computed<Program[]>(() => [
    ...this.groups('program').map((rows) => {
      const row = this.selected(rows);
      return { slug: row.slug, title: row.title, summary: row.summary || row.body, managed: true };
    }),
    ...(this.api.useLegacy('program')
      ? this.site.data().programs.items.map(([title, summary], i) => ({
          slug: 'legacy-' + i,
          title,
          summary,
          managed: false,
        }))
      : []),
  ]);
  readonly announcements = computed(() =>
    this.groups('page')
      .filter((rows) => ['announcement', 'update'].includes(rows[0].category))
      .map((rows) => this.selected(rows)),
  );
  getCampaignBySlug(slug: string): FieldCampaign | undefined {
    return this.campaigns().find((c) => c.id === slug);
  }
  getPublishedContent(kind: ContentKind, slug: string): PublicContent | undefined {
    const rows = this.api.getPublishedContent(kind).filter((r) => r.slug === slug);
    return rows.length ? this.selected(rows) : undefined;
  }
}
