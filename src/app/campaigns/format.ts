import type { LanguageCode } from '../../i18n';

/** "12 Aug 2026" for a full date, "May 2026" for a month (YYYY-MM). */
export function formatDate(iso: string, lang: LanguageCode): string {
  if (!iso) return '';
  iso = iso.slice(0, 10);
  const monthOnly = /^\d{4}-\d{2}$/.test(iso);
  const date = new Date(monthOnly ? `${iso}-01T12:00:00` : `${iso}T12:00:00`);
  if (lang === 'ar') {
    return new Intl.DateTimeFormat(
      'ar',
      monthOnly
        ? { month: 'long', year: 'numeric' }
        : { day: 'numeric', month: 'long', year: 'numeric' },
    ).format(date);
  }
  const parts = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: monthOnly ? 'long' : 'short',
    year: 'numeric',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return monthOnly
    ? `${get('month')} ${get('year')}`
    : `${get('day')} ${get('month')} ${get('year')}`;
}
