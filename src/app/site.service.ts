import { Injectable, computed, effect, signal } from '@angular/core';

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  isLanguageCode,
  languageOrder,
  translations,
  type LanguageCode,
} from '../i18n';
import type { FormItem } from '../i18n/types';

// Responsive transparent PNGs generated from the supplied CDN logo source.
const LOGO_SMALL_URL = 'assets/alma-alrouh-logo.png';
const LOGO_MEDIUM_URL = 'assets/alma-alrouh-logo-1024.png';
const LOGO_DARK_SMALL_URL = 'assets/alma-alrouh-logo-dark.png';
const LOGO_DARK_MEDIUM_URL = 'assets/alma-alrouh-logo-dark-1024.png';
const LOGO_SRCSET = LOGO_SMALL_URL + ' 256w, ' + LOGO_MEDIUM_URL + ' 1024w';
const LOGO_DARK_SRCSET = LOGO_DARK_SMALL_URL + ' 256w, ' + LOGO_DARK_MEDIUM_URL + ' 1024w';
const EMAIL = 'almaalrouh1@gmail.com';
const SUPPORT_FORM_URL = 'https://forms.gle/7hsbZn6zek9DKuN28';
const VOLUNTEER_FORM_URL = 'https://forms.gle/DUXSJjyQ5ShBj4ew6';
const DONATION_FORM_URL = 'https://forms.gle/RAEK81jqP23W5HTMA';
const PARTNERSHIP_FORM_URL = 'https://forms.gle/a95GzQrxXEXFumsP8';
const THEME_STORAGE_KEY = 'alma-alrouh-theme';

export type Theme = 'light' | 'dark';

/**
 * Shared state for every page: language, theme, the active translation, and
 * the real outbound links (Google Forms, email, socials). No fake backend.
 */
@Injectable({ providedIn: 'root' })
export class Site {
  readonly founderImageUrl =
    'https://nayalrouh.b-cdn.net/Team/WhatsApp%20Image%202026-06-16%20at%2023.08.21.jpeg';
  readonly heroImageUrl = 'assets/hero-support-circle.png';
  readonly instagramUrl = 'https://www.instagram.com/alma.alrouh1/';
  readonly linkedinUrl =
    'https://www.linkedin.com/company/alma-alrouh-foundation/posts/?feedView=all';
  readonly velouraUrl = 'https://veloura-marketing.com/';
  readonly supportFormUrl = SUPPORT_FORM_URL;
  readonly volunteerFormUrl = VOLUNTEER_FORM_URL;
  readonly donationFormUrl = DONATION_FORM_URL;
  readonly partnershipFormUrl = PARTNERSHIP_FORM_URL;
  readonly languages = languageOrder;

  readonly language = signal<LanguageCode>(this.initialLanguage());
  readonly theme = signal<Theme>(this.initialTheme());
  readonly data = computed(() => translations[this.language()]);
  readonly isRtl = computed(() => this.data().dir === 'rtl');

  readonly logoUrl = computed(() =>
    this.theme() === 'dark' ? LOGO_DARK_MEDIUM_URL : LOGO_MEDIUM_URL,
  );
  readonly logoSrcset = computed(() =>
    this.theme() === 'dark' ? LOGO_DARK_SRCSET : LOGO_SRCSET,
  );
  /** The footer always sits on the dark band. */
  readonly logoDarkUrl = LOGO_DARK_MEDIUM_URL;
  readonly logoDarkSrcset = LOGO_DARK_SRCSET;

  readonly contactMailto = `mailto:${EMAIL}?subject=${encodeURIComponent(
    'Contact Alma Alrouh',
  )}&body=${encodeURIComponent('Hello Alma Alrouh,\n\nI would like to get in touch.\n\nThank you.')}`;

  constructor() {
    // Keep <html lang/dir> in sync for accessibility, SEO, and RTL.
    effect(() => {
      const lang = this.language();
      const dir = this.data().dir;
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
        document.documentElement.dir = dir;
      }
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      } catch {
        /* storage unavailable — ignore */
      }
    });

    effect(() => {
      const theme = this.theme();
      if (typeof document !== 'undefined') {
        document.documentElement.dataset['theme'] = theme;
        document.documentElement.style.colorScheme = theme;
      }
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch {
        /* storage unavailable — ignore */
      }
    });
  }

  setLanguage(lang: LanguageCode): void {
    this.language.set(lang);
  }

  toggleTheme(): void {
    this.theme.update((theme) => (theme === 'light' ? 'dark' : 'light'));
  }

  translationName(lang: LanguageCode): string {
    return translations[lang].langName;
  }

  languageCode(lang: LanguageCode): string {
    return translations[lang].code;
  }

  formHref(id: FormItem['id']): string {
    switch (id) {
      case 'support':
        return SUPPORT_FORM_URL;
      case 'volunteer':
        return VOLUNTEER_FORM_URL;
      case 'donation':
        return DONATION_FORM_URL;
      case 'partnership':
        return PARTNERSHIP_FORM_URL;
    }
  }

  private initialLanguage(): LanguageCode {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (isLanguageCode(stored)) {
        return stored;
      }
    } catch {
      /* storage unavailable — fall through */
    }
    return DEFAULT_LANGUAGE;
  }

  private initialTheme(): Theme {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {
      /* storage unavailable — fall through */
    }
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
    return 'light';
  }
}
