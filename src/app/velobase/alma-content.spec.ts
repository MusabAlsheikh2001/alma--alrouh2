import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { beforeEach, afterEach, expect, it } from 'vitest';
import { PublicContent, PublicContentStore, ContentKind } from './public-content';
const rows = signal<PublicContent[]>([]),
  managed = signal<ContentKind[]>([]),
  state = signal('ready');
const api = {
  documents: rows,
  status: state,
  isManaged: (kind: ContentKind) => managed().includes(kind),
  useLegacy: (kind: ContentKind) => state() !== 'error' && !managed().includes(kind),
  getPublishedContent: (kind?: ContentKind, locale?: string) =>
    rows().filter((r) => (!kind || r.kind === kind) && (!locale || r.locale === locale)),
};
const fixture = (extra: Partial<PublicContent> = {}): PublicContent => ({
  id: '11111111-1111-4111-8111-111111111111',
  kind: 'article',
  slug: 'synthetic-fixture',
  locale: 'ar',
  title: '[TEST FIXTURE] عنوان',
  summary: '[TEST FIXTURE] ملخص',
  body: '[TEST FIXTURE] <script>unsafe()</script>',
  imageUrl: '',
  imageAlt: '',
  media: [],
  category: 'اختبار',
  tags: [],
  sources: [{ title: '[TEST FIXTURE] reference', url: 'https://example.org/reference' }],
  seoTitle: '',
  seoDescription: '',
  location: '',
  speaker: '',
  startsAt: '',
  endsAt: '',
  linkUrl: '',
  questions: [],
  version: 1,
  publishedAt: '2026-11-18T00:00:00.000Z',
  review: { status: 'not_reviewed', type: 'clinical', reviewedAt: null },
  disclaimer: '[TEST FIXTURE] Unreviewed',
  ...extra,
});
afterEach(() => TestBed.resetTestingModule());
import { AlmaContent } from './alma-content';
import { Site } from '../site.service';
import { FIELD_CAMPAIGNS } from '../campaigns/campaigns.data';
const language = signal<'en' | 'ar'>('en');
let content: AlmaContent;
beforeEach(() => {
  rows.set([]);
  managed.set([]);
  state.set('ready');
  language.set('en');
  TestBed.configureTestingModule({
    providers: [
      { provide: PublicContentStore, useValue: api },
      {
        provide: Site,
        useValue: {
          language,
          data: () => ({
            programs: { items: [['[TEST FIXTURE] Legacy program', 'Legacy summary']] },
          }),
        },
      },
    ],
  });
  content = TestBed.inject(AlmaContent);
});
it('preserves the existing presentation when empty delivery has not been migrated', () => {
  expect(content.campaigns()).toEqual(FIELD_CAMPAIGNS);
  expect(content.programs()).toHaveLength(1);
});
it('maps bilingual published campaigns and direct media into the existing cards', () => {
  managed.set(['campaign']);
  rows.set([
    fixture({
      kind: 'campaign',
      locale: 'en',
      title: '[TEST FIXTURE] English',
      category: 'outreach',
      media: [
        {
          type: 'image',
          url: 'https://example.org/photo.webp',
          thumbnailUrl: '',
          alt: '[TEST FIXTURE]',
          width: null,
          height: null,
        },
      ],
    }),
    fixture({
      kind: 'campaign',
      locale: 'ar',
      title: '[TEST FIXTURE] العربية',
      category: 'outreach',
    }),
  ]);
  const c = content.campaigns()[0];
  expect(content.campaigns()).toHaveLength(1);
  expect(c.title.en).toBe('[TEST FIXTURE] English');
  expect(c.title.ar).toContain('العربية');
  expect(c.media[0].url).toBe('https://example.org/photo.webp');
  language.set('ar');
  expect(content.campaigns()[0].title.ar).toContain('العربية');
});
it('withdraws migrated records without reviving historical campaigns and leaves other sections intact', () => {
  managed.set(['campaign']);
  rows.set([fixture({ kind: 'campaign' })]);
  expect(content.campaigns()).toHaveLength(1);
  rows.set([]);
  expect(content.campaigns()).toEqual([]);
  expect(content.programs()).toHaveLength(1);
});
it('does not restore historical content during a delivery failure', () => {
  state.set('error');
  expect(content.campaigns()).toEqual([]);
});
