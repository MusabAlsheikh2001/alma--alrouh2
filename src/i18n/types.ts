/**
 * The translation contract. Every locale (English / Arabic) must implement this
 * shape exactly, so the UI can switch languages without missing strings.
 *
 * All user-facing copy lives here — there is NO hard-coded text in templates.
 * Stats and amounts are plain arrays so they can be edited in one place.
 */

export type LanguageCode = 'en' | 'ar';

export interface TitledCard {
  title: string;
  text: string;
}

export interface FormItem {
  id: 'support' | 'volunteer' | 'donation' | 'partnership';
  title: string;
  text: string;
  cta: string;
}

export interface LegalPage {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
}

export interface Translation {
  /** Short switcher label, e.g. "EN". */
  code: string;
  /** Language name in its own script, e.g. "English" / "العربية". */
  langName: string;
  /** Text direction for this locale. */
  dir: 'ltr' | 'rtl';
  /** Tagline under the wordmark. */
  tagline: string;
  logoAlt: string;

  a11y: {
    skipToContent: string;
    openMenu: string;
    closeMenu: string;
    home: string;
    chooseLanguage: string;
    primaryNav: string;
  };

  nav: {
    home: string;
    mission: string;
    care: string;
    forms: string;
    volunteers: string;
    programs: string;
    contact: string;
    donate: string;
  };

  hero: {
    eyebrow: string;
    title: string;
    copy: string;
    primary: string;
    secondary: string;
    tertiary: string;
    note: string;
    trust: string[];
    freeBadge: string;
  };

  forms: {
    eyebrow: string;
    title: string;
    intro: string;
    items: FormItem[];
  };

  stats: {
    eyebrow: string;
    title: string;
    /** [value, label] — value drives the count-up animation. */
    items: Array<[string, string]>;
  };

  mission: {
    eyebrow: string;
    title: string;
    body: string;
    pillars: TitledCard[];
  };

  care: {
    eyebrow: string;
    title: string;
    intro: string;
    steps: Array<[string, string]>;
  };

  volunteers: {
    eyebrow: string;
    title: string;
    text: string;
    facts: Array<[string, string]>;
    roles: string[];
  };

  programs: {
    eyebrow: string;
    title: string;
    items: Array<[string, string]>;
  };

  contact: {
    eyebrow: string;
    title: string;
    text: string;
    email: string;
    phone: string;
    location: string;
    safety: string;
  };

  footer: {
    mission: string;
    quickLinksLabel: string;
    legalLinksLabel: string;
    connectLabel: string;
    supported: string;
    website: string;
    disclaimer: string;
    rights: string;
  };

  legal: {
    terms: LegalPage;
    faqs: LegalPage;
    privacy: LegalPage;
  };
}
