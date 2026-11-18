import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { firstValueFrom, catchError, of, Subject, takeUntil, timeout } from 'rxjs';

export const CONTENT_KINDS = [
  'article',
  'page',
  'program',
  'campaign',
  'event',
  'partner',
  'resource',
  'quiz',
  'promotion',
  'settings',
] as const;
export type ContentKind = (typeof CONTENT_KINDS)[number];
export interface PublicMedia {
  type: 'image' | 'video';
  url: string;
  thumbnailUrl: string;
  alt: string;
  width: number | null;
  height: number | null;
}
export interface PublicContent {
  id: string;
  kind: ContentKind;
  slug: string;
  locale: 'en' | 'ar';
  title: string;
  summary: string;
  body: string;
  imageUrl: string;
  imageAlt: string;
  media: PublicMedia[];
  category: string;
  tags: string[];
  sources: { title: string; url: string }[];
  seoTitle: string;
  seoDescription: string;
  location: string;
  speaker: string;
  startsAt: string;
  endsAt: string;
  linkUrl: string;
  questions: { question: string; options: string[]; correctIndex: number; explanation: string }[];
  version: number;
  publishedAt: string;
  review: {
    status: 'not_reviewed' | 'under_review' | 'approved';
    type: 'clinical' | 'editorial';
    reviewedAt: string | null;
  };
  disclaimer: string | null;
}
interface Authority {
  version: 1;
  kinds: ContentKind[];
}
interface Revision {
  apiVersion: '1';
  revision: string;
  available: { content: boolean; menu: boolean };
  contentAuthority: Authority;
  refreshAfterSeconds: number;
}
const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw Error('Invalid public response.');
  return value as Record<string, unknown>;
};
const text = (value: unknown, limit = 150000): string => {
  if (typeof value !== 'string' || value.length > limit) throw Error('Invalid public text.');
  return value;
};
const list = (value: unknown, limit: number): unknown[] => {
  if (!Array.isArray(value) || value.length > limit) throw Error('Invalid public list.');
  return value;
};
const url = (value: unknown): string => {
  const result = text(value, 1500);
  if (!result) return '';
  const parsed = new URL(result);
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password)
    throw Error('Unsafe public URL.');
  return result;
};
function authority(value: unknown): Authority {
  const row = object(value);
  if (row['version'] !== 1) throw Error('Unsupported website authority.');
  const kinds = list(row['kinds'], CONTENT_KINDS.length).map((kind) => {
    if (!CONTENT_KINDS.includes(kind as ContentKind)) throw Error('Invalid content type.');
    return kind as ContentKind;
  });
  return { version: 1, kinds: [...new Set(kinds)] };
}
function revision(value: unknown, workspace: string): Revision {
  const row = object(value),
    available = object(row['available']);
  if (
    object(row['project'])['slug'] !== workspace ||
    row['apiVersion'] !== '1' ||
    !/^[a-f0-9]{64}$/.test(String(row['revision'])) ||
    typeof available['content'] !== 'boolean' ||
    typeof available['menu'] !== 'boolean'
  )
    throw Error('Invalid revision.');
  return {
    apiVersion: '1',
    revision: String(row['revision']),
    available: { content: available['content'], menu: available['menu'] },
    contentAuthority: authority(row['contentAuthority']),
    refreshAfterSeconds: 5,
  };
}
function document(value: unknown): PublicContent {
  const row = object(value),
    review = object(row['review']);
  if (
    !CONTENT_KINDS.includes(row['kind'] as ContentKind) ||
    !['en', 'ar'].includes(String(row['locale'])) ||
    !Number.isSafeInteger(row['version']) ||
    Number(row['version']) < 1 ||
    !['not_reviewed', 'under_review', 'approved'].includes(String(review['status'])) ||
    !['clinical', 'editorial'].includes(String(review['type']))
  )
    throw Error('Invalid published content.');
  const dimension = (value: unknown): number | null =>
    value === null
      ? null
      : typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= 20000
        ? value
        : (() => {
            throw Error('Invalid media dimensions.');
          })();
  const media = list(row['media'], 100).map((item): PublicMedia => {
    const m = object(item);
    if (!['image', 'video'].includes(String(m['type']))) throw Error('Invalid media.');
    return {
      type: m['type'] as 'image' | 'video',
      url: url(m['url']),
      thumbnailUrl: url(m['thumbnailUrl']),
      alt: text(m['alt'], 500),
      width: dimension(m['width']),
      height: dimension(m['height']),
    };
  });
  return {
    id: text(row['id'], 100),
    kind: row['kind'] as ContentKind,
    slug: text(row['slug'], 160),
    locale: row['locale'] as 'en' | 'ar',
    title: text(row['title'], 300),
    summary: text(row['summary'], 3000),
    body: text(row['body']),
    imageUrl: url(row['imageUrl']),
    imageAlt: text(row['imageAlt'], 500),
    media,
    category: text(row['category'], 120),
    tags: list(row['tags'], 30).map((tag) => text(tag, 100)),
    sources: list(row['sources'], 100).map((source) => {
      const s = object(source);
      return { title: text(s['title'], 500), url: url(s['url']) };
    }),
    seoTitle: text(row['seoTitle'], 300),
    seoDescription: text(row['seoDescription'], 500),
    location: text(row['location'], 500),
    speaker: text(row['speaker'], 300),
    startsAt: text(row['startsAt'], 100),
    endsAt: text(row['endsAt'], 100),
    linkUrl: url(row['linkUrl']),
    questions: list(row['questions'], 200).map((question) => {
      const q = object(question),
        options = list(q['options'], 8).map((option) => text(option, 1000));
      if (
        options.length < 2 ||
        !Number.isInteger(q['correctIndex']) ||
        Number(q['correctIndex']) < 0 ||
        Number(q['correctIndex']) >= options.length
      )
        throw Error('Invalid question.');
      return {
        question: text(q['question'], 2000),
        options,
        correctIndex: Number(q['correctIndex']),
        explanation: text(q['explanation'], 5000),
      };
    }),
    version: Number(row['version']),
    publishedAt: text(row['publishedAt'], 100),
    review: {
      status: review['status'] as PublicContent['review']['status'],
      type: review['type'] as PublicContent['review']['type'],
      reviewedAt: review['reviewedAt'] === null ? null : text(review['reviewedAt'], 100),
    },
    disclaimer: row['disclaimer'] === null ? null : text(row['disclaimer'], 3000),
  };
}

/** Published snapshots only. No keys, cookies, database access or build-time API data. */
@Injectable({ providedIn: 'root' })
export class PublicContentStore {
  private readonly http = inject(HttpClient);
  private readonly doc = inject(DOCUMENT);
  private readonly destroy = inject(DestroyRef);
  readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly workspace = 'alma-alrouh';
  private readonly endpoint = 'https://velobase.space/api/v1/public/' + this.workspace;
  private readonly stop = new Subject<void>();
  private readonly values = signal<PublicContent[]>([]);
  readonly documents = this.values.asReadonly();
  private readonly state = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
  readonly status = this.state.asReadonly();
  private readonly policy = signal<Authority>({ version: 1, kinds: [] });
  readonly contentAuthority = this.policy.asReadonly();
  private readonly observedKinds = new Set<ContentKind>();
  private etag = '';
  private token = '';
  private pending?: Promise<boolean>;
  private disposed = false;
  constructor() {
    afterNextRender(() => {
      void this.refresh();
      const refresh = () => {
        if (this.doc.visibilityState !== 'hidden') void this.refresh();
      };
      const timer = setInterval(refresh, 5000);
      this.doc.addEventListener('visibilitychange', refresh);
      this.doc.defaultView?.addEventListener('focus', refresh);
      this.destroy.onDestroy(() => {
        this.disposed = true;
        clearInterval(timer);
        this.stop.next();
        this.stop.complete();
        this.doc.removeEventListener('visibilitychange', refresh);
        this.doc.defaultView?.removeEventListener('focus', refresh);
      });
    });
  }
  isManaged(kind: ContentKind): boolean {
    return this.policy().kinds.includes(kind);
  }
  useLegacy(kind: ContentKind): boolean {
    return this.state() !== 'error' && !this.isManaged(kind);
  }
  getPublishedContent(kind?: ContentKind, locale?: 'en' | 'ar'): PublicContent[] {
    return this.values().filter(
      (row) => (!kind || row.kind === kind) && (!locale || row.locale === locale),
    );
  }
  getContentRevision(): string {
    return this.token;
  }
  refresh(force = false): Promise<boolean> {
    if (!this.browser || this.disposed) return Promise.resolve(false);
    if (this.pending) return this.pending;
    this.pending = this.load(force).finally(() => {
      this.pending = undefined;
    });
    return this.pending;
  }
  private get(path: string, etag = ''): Promise<HttpResponse<unknown>> {
    const separator = path.includes('?') ? '&' : '?';
    return firstValueFrom(
      this.http
        .get<unknown>(this.endpoint + '/' + path + separator + 'ngsw-bypass=true', {
          observe: 'response',
          transferCache: false,
          withCredentials: false,
          credentials: 'omit',
          redirect: 'error',
          cache: 'no-store',
          headers: etag ? { 'If-None-Match': etag } : {},
        })
        .pipe(
          timeout(12000),
          takeUntil(this.stop),
          catchError((error: unknown) => {
            if (error instanceof HttpErrorResponse && error.status === 304)
              return of(new HttpResponse({ status: 304, headers: error.headers }));
            throw error;
          }),
        ),
    );
  }
  private async load(force: boolean): Promise<boolean> {
    if (this.state() === 'idle') this.state.set('loading');
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        const firstResponse = await this.get(
          'revision',
          !force && this.state() === 'ready' ? this.etag : '',
        );
        if (firstResponse.status === 304) return true;
        const first = revision(firstResponse.body, this.workspace);
        for (const kind of this.observedKinds)
          if (!first.contentAuthority.kinds.includes(kind))
            throw Error('Website authority was removed.');
        for (const kind of first.contentAuthority.kinds) this.observedKinds.add(kind);
        if (first.contentAuthority.kinds.length) this.policy.set(first.contentAuthority);
        const rows: PublicContent[] = [];
        let expected = 0;
        const ids = new Set<string>();
        if (first.available.content) {
          for (let page = 1; page <= 40; page++) {
            const response = object((await this.get('content?page=' + page)).body),
              project = object(response['project']);
            if (
              response['apiVersion'] !== '1' ||
              project['slug'] !== this.workspace ||
              response['page'] !== page ||
              response['pageSize'] !== 50 ||
              !Number.isSafeInteger(response['total']) ||
              Number(response['total']) < 0 ||
              Number(response['total']) > 2000
            )
              throw Error('Invalid workspace snapshot.');
            if (page === 1) expected = Number(response['total']);
            else if (response['total'] !== expected) throw Error('Inconsistent pagination.');
            const pageAuthority = authority(response['contentAuthority']);
            if (JSON.stringify(pageAuthority) !== JSON.stringify(first.contentAuthority)) {
              force = true;
              throw Error('Publication policy changed while loading.');
            }
            const data = list(response['data'], 50).map(document);
            for (const row of data) {
              if (ids.has(row.id)) throw Error('Repeated public record.');
              ids.add(row.id);
              rows.push(row);
            }
            if (page * 50 >= Number(response['total'])) break;
          }
        }
        if (rows.length !== expected) throw Error('Incomplete published snapshot.');
        if (rows.length && rows.some((row) => !row.id || !row.slug))
          throw Error('Invalid published identity.');
        const lastResponse = await this.get('revision'),
          last = revision(lastResponse.body, this.workspace);
        if (first.revision !== last.revision) {
          force = true;
          continue;
        }
        if (this.disposed) return false;
        for (const kind of last.contentAuthority.kinds) this.observedKinds.add(kind);
        this.policy.set(last.contentAuthority);
        this.values.set(rows);
        this.token = last.revision;
        this.etag = lastResponse.headers.get('ETag') || '"' + last.revision + '"';
        this.state.set('ready');
        return true;
      }
      throw Error('Publication changed while loading.');
    } catch {
      if (!this.disposed) {
        this.values.set([]);
        this.etag = '';
        this.token = '';
        this.state.set('error');
      }
      return false;
    }
  }
}
