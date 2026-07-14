import {
  Component,
  HostListener,
  OnDestroy,
  computed,
  effect,
  signal,
} from '@angular/core';

import { CountUp, RevealOnScroll } from './animations.directive';
import { IconComponent } from './icon.component';
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
const LOGO_CLEAN_MEDIUM_URL = 'assets/alma-alrouh-logo-clean-1024.png';
const LOGO_SRCSET =
  LOGO_SMALL_URL + ' 256w, ' + LOGO_MEDIUM_URL + ' 1024w';
const LOGO_CLEAN_SRCSET = LOGO_CLEAN_MEDIUM_URL + ' 1024w';
const EMAIL = 'almaalrouh1@gmail.com';
const INSTAGRAM_URL = 'https://www.instagram.com/alma.alrouh1/';
const LINKEDIN_URL =
  'https://www.linkedin.com/company/alma-alrouh-foundation/posts/?feedView=all';
const SUPPORT_FORM_URL = 'https://forms.gle/7hsbZn6zek9DKuN28';
const VOLUNTEER_FORM_URL = 'https://forms.gle/DUXSJjyQ5ShBj4ew6';
const DONATION_FORM_URL = 'https://forms.gle/RAEK81jqP23W5HTMA';
const PARTNERSHIP_FORM_URL = 'https://forms.gle/a95GzQrxXEXFumsP8';
const THEME_STORAGE_KEY = 'alma-alrouh-theme';

type Theme = 'light' | 'dark';
type LegalSectionId = 'terms' | 'faqs' | 'privacy';

const SECTION_IDS = ['forms', 'mission', 'care', 'programs', 'volunteers', 'contact', 'terms', 'faqs', 'privacy'];

@Component({
  selector: 'app-root',
  imports: [
    CountUp,
    IconComponent,
    RevealOnScroll,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {
  protected readonly instagramUrl = INSTAGRAM_URL;
  protected readonly linkedinUrl = LINKEDIN_URL;
  protected readonly supportFormUrl = SUPPORT_FORM_URL;
  protected readonly volunteerFormUrl = VOLUNTEER_FORM_URL;
  protected readonly donationFormUrl = DONATION_FORM_URL;
  protected readonly languages = languageOrder;

  protected readonly language = signal<LanguageCode>(this.initialLanguage());
  protected readonly theme = signal<Theme>(this.initialTheme());
  protected readonly logoUrl = computed(() =>
    this.theme() === 'dark' ? LOGO_CLEAN_MEDIUM_URL : LOGO_MEDIUM_URL,
  );
  protected readonly logoSrcset = computed(() =>
    this.theme() === 'dark' ? LOGO_CLEAN_SRCSET : LOGO_SRCSET,
  );
  protected readonly scrolled = signal(false);
  protected readonly activeSection = signal('');
  protected readonly mobileNavOpen = signal(false);
  protected readonly langMenuOpen = signal(false);
  protected readonly expandedLegal = signal<LegalSectionId | null>(null);

  protected readonly data = computed(() => translations[this.language()]);
  protected readonly isRtl = computed(() => this.data().dir === 'rtl');
  protected readonly pageDir = computed(() => this.data().dir);
  private scrollFrame = 0;

  // Real routes for visitor actions — no fake backend.
  protected readonly contactMailto = this.mailto(
    'Contact Alma Alrouh',
    'Hello Alma Alrouh,\n\nI would like to get in touch.\n\nThank you.',
  );

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

    effect(() => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = this.mobileNavOpen() ? 'hidden' : '';
      }
    });
  }

  @HostListener('window:scroll')
  protected onScroll(): void {
    if (this.scrollFrame) return;
    this.scrollFrame = window.requestAnimationFrame(() => {
      this.scrollFrame = 0;
      this.updateScrollState();
    });
  }

  ngOnDestroy(): void {
    if (this.scrollFrame) {
      window.cancelAnimationFrame(this.scrollFrame);
    }
  }

  private updateScrollState(): void {
    const isScrolled = window.scrollY > 24;
    if (this.scrolled() !== isScrolled) {
      this.scrolled.set(isScrolled);
    }

    const probe = window.scrollY + 160;
    let current = '';
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= probe) {
        current = id;
      }
    }
    if (this.activeSection() !== current) {
      this.activeSection.set(current);
    }
  }

  protected setLanguage(lang: LanguageCode): void {
    this.language.set(lang);
    this.langMenuOpen.set(false);
    this.mobileNavOpen.set(false);
  }

  protected toggleTheme(): void {
    this.theme.update((theme) => (theme === 'light' ? 'dark' : 'light'));
    this.langMenuOpen.set(false);
  }

  protected toggleLangMenu(): void {
    this.langMenuOpen.update((open) => !open);
  }

  protected closeLangMenu(): void {
    this.langMenuOpen.set(false);
  }

  protected toggleMobileNav(): void {
    this.mobileNavOpen.update((open) => !open);
  }

  protected closeMobileNav(): void {
    this.mobileNavOpen.set(false);
  }

  protected isLegalOpen(section: LegalSectionId): boolean {
    return this.expandedLegal() === section;
  }

  protected toggleLegal(section: LegalSectionId): void {
    this.expandedLegal.update((openSection) => (openSection === section ? null : section));
  }

  protected openLegal(section: LegalSectionId): void {
    this.expandedLegal.set(section);
    this.mobileNavOpen.set(false);
  }

  protected translationName(lang: LanguageCode): string {
    return translations[lang].langName;
  }

  protected languageCode(lang: LanguageCode): string {
    return translations[lang].code;
  }

  protected formHref(id: FormItem['id']): string {
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

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.langMenuOpen.set(false);
    this.mobileNavOpen.set(false);
    this.expandedLegal.set(null);
  }

  private mailto(subject: string, body: string): string {
    return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
