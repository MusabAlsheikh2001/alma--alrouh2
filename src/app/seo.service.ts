import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { FIELD_CAMPAIGNS, ONLINE_SESSIONS } from './campaigns/campaigns.data';
import { Site } from './site.service';
import type { SeoKey } from '../i18n/types';

/** The live domain. Every canonical URL, sitemap entry and schema id uses it. */
export const SITE_URL = 'https://alma-alrouh.com';

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;
const OG_IMAGE = { url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630 };
const LOGO = `${SITE_URL}/assets/alma-alrouh-logo-1024.png`;

/** Path for each page, as the router serves it. */
export const SEO_PATHS: Record<Exclude<SeoKey, 'notFound'>, string> = {
  home: '/',
  about: '/about',
  programs: '/programs',
  campaigns: '/campaigns',
  involved: '/get-involved',
  contact: '/contact',
  faqs: '/faqs',
  terms: '/terms',
  privacy: '/privacy',
};

type Json = Record<string, unknown>;

/**
 * Sets the page title, description, canonical URL, Open Graph and Twitter tags,
 * robots, and schema.org JSON-LD for the current route and language. Runs in
 * the browser and during prerendering, so crawlers get it in the static HTML.
 */
@Injectable({ providedIn: 'root' })
export class Seo {
  private readonly doc = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly site = inject(Site);

  apply(key: SeoKey): void {
    const t = this.site.data();
    const seo = t.seo[key];
    const path = key === 'notFound' ? null : SEO_PATHS[key];
    const url = path ? SITE_URL + (path === '/' ? '/' : path) : null;
    const fullTitle = seo.title.includes(t.seo.siteName) ? seo.title : `${seo.title} | ${t.seo.siteName}`;

    this.title.setTitle(fullTitle);
    this.tag('name', 'description', seo.description);
    this.tag('name', 'robots', key === 'notFound' ? 'noindex, follow' : 'index, follow, max-image-preview:large');

    this.tag('property', 'og:type', 'website');
    this.tag('property', 'og:site_name', t.seo.siteName);
    this.tag('property', 'og:title', fullTitle);
    this.tag('property', 'og:description', seo.description);
    this.tag('property', 'og:locale', t.seo.locale);
    this.tag('property', 'og:image', OG_IMAGE.url);
    this.tag('property', 'og:image:width', String(OG_IMAGE.width));
    this.tag('property', 'og:image:height', String(OG_IMAGE.height));
    this.tag('property', 'og:image:alt', t.seo.imageAlt);
    this.tag('name', 'twitter:card', 'summary_large_image');
    this.tag('name', 'twitter:title', fullTitle);
    this.tag('name', 'twitter:description', seo.description);
    this.tag('name', 'twitter:image', OG_IMAGE.url);
    this.tag('name', 'twitter:image:alt', t.seo.imageAlt);

    if (url) {
      this.tag('property', 'og:url', url);
      this.canonical(url);
    } else {
      this.meta.removeTag("property='og:url'");
      this.doc.head.querySelector('link[rel="canonical"]')?.remove();
    }

    this.jsonLd(key === 'notFound' || !url ? null : this.schema(key, url, fullTitle, seo.description));
  }

  private tag(attr: 'name' | 'property', key: string, content: string): void {
    this.meta.updateTag({ [attr]: key, content }, `${attr}='${key}'`);
  }

  private canonical(url: string): void {
    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  /** One page-level JSON-LD block, replaced on every navigation. */
  private jsonLd(data: Json | null): void {
    this.doc.head.querySelector('script[data-seo="page"]')?.remove();
    if (!data) return;
    const script = this.doc.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-seo', 'page');
    script.textContent = JSON.stringify(data);
    this.doc.head.appendChild(script);
  }

  private schema(key: Exclude<SeoKey, 'notFound'>, url: string, name: string, description: string): Json {
    const t = this.site.data();
    const lang = this.site.language();
    const text = (v: { en: string; ar: string }) => v[lang];
    const page: Json = {
      '@type': pageType(key),
      '@id': `${url}#webpage`,
      url,
      name,
      description,
      inLanguage: lang,
      isPartOf: { '@id': SITE_ID },
      about: { '@id': ORG_ID },
      primaryImageOfPage: { '@type': 'ImageObject', url: OG_IMAGE.url, width: OG_IMAGE.width, height: OG_IMAGE.height },
    };
    const graph: Json[] = [page];

    if (key !== 'home') {
      graph.push({
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t.nav.home, item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: t.seo[key].title, item: url },
        ],
      });
      page['breadcrumb'] = { '@id': `${url}#breadcrumb` };
    }

    if (key === 'home') {
      graph.push({
        '@type': 'WebSite',
        '@id': SITE_ID,
        url: `${SITE_URL}/`,
        name: t.seo.siteName,
        inLanguage: ['en', 'ar'],
        publisher: { '@id': ORG_ID },
      });
    }

    if (key === 'about') {
      graph.push({
        '@type': 'Person',
        '@id': `${SITE_URL}/about#founder`,
        name: t.founder.name,
        jobTitle: t.founder.role,
        image: this.site.founderImageUrl,
        worksFor: { '@id': ORG_ID },
      });
    }

    if (key === 'programs') {
      page['mainEntity'] = {
        '@type': 'ItemList',
        itemListElement: t.programs.items.map(([title, body], i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Service',
            name: title,
            description: body,
            provider: { '@id': ORG_ID },
            areaServed: 'Peshawar, Khyber Pakhtunkhwa, Pakistan',
            offers: { '@type': 'Offer', price: 0, priceCurrency: 'PKR' },
          },
        })),
      };
    }

    if (key === 'faqs') {
      page['@type'] = ['WebPage', 'FAQPage'];
      page['mainEntity'] = t.legal.faqs.sections.map((q) => ({
        '@type': 'Question',
        name: q.title,
        acceptedAnswer: { '@type': 'Answer', text: q.body },
      }));
    }

    if (key === 'campaigns') {
      const field = FIELD_CAMPAIGNS.map((c) => ({
        '@type': 'Event',
        name: text(c.title),
        description: text(c.summary),
        startDate: c.date,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        isAccessibleForFree: true,
        location: { '@type': 'Place', name: text(c.place), address: { '@type': 'PostalAddress', addressCountry: 'PK' } },
        image: c.media.filter((m) => m.type === 'image').slice(0, 3).map((m) => `${SITE_URL}/${m.src}.webp`),
        organizer: { '@id': ORG_ID },
        url: `${SITE_URL}/campaigns#${c.id}`,
      }));
      const online = ONLINE_SESSIONS.map((s) => ({
        '@type': 'EducationEvent',
        name: text(s.title),
        startDate: s.date,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
        isAccessibleForFree: true,
        location: { '@type': 'VirtualLocation', url: `${SITE_URL}/campaigns` },
        performer: { '@type': 'Person', name: s.speaker },
        organizer: { '@id': ORG_ID },
        ...(s.poster ? { image: `${SITE_URL}/${s.poster.src}.webp` } : {}),
      }));
      page['mainEntity'] = {
        '@type': 'ItemList',
        itemListElement: [...field, ...online].map((item, i) => ({ '@type': 'ListItem', position: i + 1, item })),
      };
    }

    return { '@context': 'https://schema.org', '@graph': graph };
  }
}

function pageType(key: Exclude<SeoKey, 'notFound'>): string {
  switch (key) {
    case 'about':
      return 'AboutPage';
    case 'contact':
      return 'ContactPage';
    case 'campaigns':
    case 'programs':
      return 'CollectionPage';
    default:
      return 'WebPage';
  }
}

export { LOGO, ORG_ID, SITE_ID };
