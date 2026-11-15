/**
 * Alma Alrouh's documented campaigns, visits and online sessions.
 *
 * Media lives in public/campaigns/<id>/ as WebP (NN.webp, NN-sm.webp) and MP4
 * (vNN.mp4 with a vNN.webp cover frame). To add a campaign: drop its files in a
 * new folder, add an entry below with both languages, and it appears on the
 * Campaigns page, in the lightbox, and (if early in the list) on the home page.
 *
 * Facts come from the folders Alma Alrouh supplied and its 2026 Company Profile
 * and Institutional Booklet. Months marked `approx` were read from the photo
 * file dates, not from a written record.
 */

export type CampaignKind = 'awareness' | 'outreach' | 'online';

export interface Media {
  type: 'image' | 'video';
  /** Path without extension, e.g. campaigns/zwandoon/01 */
  src: string;
  w: number;
  h: number;
}

export interface Bilingual {
  en: string;
  ar: string;
}

export interface FieldCampaign {
  id: string;
  kind: Exclude<CampaignKind, 'online'>;
  /** ISO date or month (YYYY-MM) */
  date: string;
  title: Bilingual;
  place: Bilingual;
  summary: Bilingual;
  /** CSS object-position for the cover crop. */
  focus?: string;
  media: Media[];
}

export interface OnlineSession {
  date: string;
  speaker: string;
  title: Bilingual;
  note?: Bilingual;
  poster?: Media;
}

const img = (src: string, w: number, h: number): Media => ({ type: 'image', src, w, h });
const vid = (src: string, w: number, h: number): Media => ({ type: 'video', src, w, h });

/** Build `count` sequential items: campaigns/<id>/01 ... */
function series(id: string, sizes: Array<[number, number]>, videos: Array<[number, number]> = []): Media[] {
  const pad = (n: number) => String(n).padStart(2, '0');
  return [
    ...sizes.map(([w, h], i) => img(`campaigns/${id}/${pad(i + 1)}`, w, h)),
    ...videos.map(([w, h], i) => vid(`campaigns/${id}/v${pad(i + 1)}`, w, h)),
  ];
}

const L: [number, number] = [1600, 1200];
const P: [number, number] = [1200, 1600];

export const FIELD_CAMPAIGNS: FieldCampaign[] = [
  {
    id: 'parwarish-orphanage',
    kind: 'awareness',
    date: '2026-08-12',
    title: { en: 'A day at Parwarish Orphanage', ar: 'يوم في دار برورش للأيتام' },
    place: { en: 'Parwarish Orphanage', ar: 'دار برورش للأيتام' },
    summary: {
      en: 'An ambassador-led awareness campaign with Huma Khan and fellow volunteers: a talk in the hall, group activities, handwritten notes from the students and a shared message that no one is alone.',
      ar: 'حملة توعية يقودها السفراء مع هما خان وزملائها المتطوعين: حديث في القاعة، وأنشطة جماعية، وملاحظات مكتوبة بخط الطلاب، ورسالة مشتركة بأن لا أحد وحده.',
    },
    focus: '50% 40%',
    media: series(
      'parwarish-orphanage',
      [[1280, 960], L, L, L, [1280, 960], P, P, P, L, L, [960, 1280], [960, 1280]],
      [[848, 480], [848, 480], [848, 480], [848, 480], [848, 480], [480, 864]],
    ),
  },
  {
    id: 'rising-star-school',
    kind: 'awareness',
    date: '2026-08-25',
    title: { en: 'Campaign session at The Rising Star School', ar: 'جلسة الحملة في مدرسة رايزنغ ستار' },
    place: { en: 'The Rising Star School, private school', ar: 'مدرسة رايزنغ ستار، مدرسة خاصة' },
    summary: {
      en: 'An interactive session with students: a talk in the corridor classroom, a circle exercise in the courtyard and a closing photo with the school team.',
      ar: 'جلسة تفاعلية مع الطلاب: حديث في الفصل، وتمرين جماعي في الساحة، وصورة ختامية مع فريق المدرسة.',
    },
    focus: '50% 45%',
    media: series(
      'rising-star-school',
      [[1280, 575], [1280, 575], [1280, 575], [575, 1280], [575, 1280], [575, 1280], [575, 1280]],
      [[848, 478], [478, 850]],
    ),
  },
  {
    id: 'government-school',
    kind: 'awareness',
    date: '2026-08-05',
    title: { en: 'Awareness session at a government school', ar: 'جلسة توعية في مدرسة حكومية' },
    place: { en: 'Government school', ar: 'مدرسة حكومية' },
    summary: {
      en: 'A session for students in the school hall. Students made their own signs for the day, one of them reading “Alma Alrouh, always with us.”',
      ar: 'جلسة للطالبات في قاعة المدرسة. صنعت الطالبات لافتاتهن الخاصة لهذا اليوم، وكُتب على إحداها: «ألما الروح، معنا دائمًا».',
    },
    focus: '50% 55%',
    media: series(
      'government-school',
      [[720, 1280], [720, 1280], [618, 1280], [720, 1280], [720, 1280]],
      [[1024, 576], [1024, 576], [576, 1024], [576, 1024]],
    ),
  },
  {
    id: 'swat-girls-school',
    kind: 'awareness',
    date: '2026-05',
    title: { en: 'Session at Government Girls School, Swat', ar: 'جلسة في مدرسة البنات الحكومية، سوات' },
    place: { en: 'Government Girls School, Swat', ar: 'مدرسة البنات الحكومية، سوات' },
    summary: {
      en: 'A presentation and classroom activity led by Alma Alrouh’s Swat chapter. Students’ faces are hidden to protect their privacy.',
      ar: 'عرض تقديمي ونشاط صفي قاده فرع ألما الروح في سوات. أُخفيت وجوه الطالبات حفاظًا على خصوصيتهن.',
    },
    focus: '50% 50%',
    media: series('swat-girls-school', [[1040, 780], [1080, 1080], [1080, 1080], [780, 1040]]),
  },
  {
    id: 'tedx-uap',
    kind: 'outreach',
    date: '2026-04',
    title: { en: 'Community partner of TEDx University of Agriculture Peshawar', ar: 'شريك مجتمعي لـ TEDx جامعة الزراعة بيشاور' },
    place: { en: 'University of Agriculture, Peshawar', ar: 'جامعة الزراعة، بيشاور' },
    summary: {
      en: 'Alma Alrouh joined TEDx University of Agriculture Peshawar as a community partner and in-kind sponsor, with volunteers on site through the event.',
      ar: 'انضمت ألما الروح إلى TEDx جامعة الزراعة بيشاور شريكًا مجتمعيًا وراعيًا عينيًا، مع حضور المتطوعين طوال الفعالية.',
    },
    focus: '50% 30%',
    media: series(
      'tedx-uap',
      [[720, 1280], [866, 1298], [1080, 1350], [866, 1298]],
      [[1280, 720], [480, 848], [480, 848], [480, 848], [480, 848], [480, 848]],
    ),
  },
  {
    id: 'frontier-foundation',
    kind: 'outreach',
    date: '2026-07',
    title: { en: 'Visit to Frontier Foundation', ar: 'زيارة مؤسسة فرونتير' },
    place: { en: 'Frontier Foundation Welfare Hospital & Blood Transfusion Services', ar: 'مستشفى مؤسسة فرونتير الخيري وخدمات نقل الدم' },
    summary: {
      en: 'Alma Alrouh volunteers visited Frontier Foundation’s welfare hospital and blood transfusion service to meet the team and build a working relationship.',
      ar: 'زار متطوعو ألما الروح مستشفى مؤسسة فرونتير الخيري وخدمة نقل الدم للتعرف على الفريق وبناء علاقة عمل مشتركة.',
    },
    focus: '50% 40%',
    media: series('frontier-foundation', [[1600, 897]], [[476, 846]]),
  },
  {
    id: 'zwandoon',
    kind: 'outreach',
    date: '2026-07',
    title: { en: 'Visit to Zwandoon Welfare Organization', ar: 'زيارة منظمة زوندون الخيرية' },
    place: { en: 'Zwandoon Welfare Organization', ar: 'منظمة زوندون الخيرية' },
    summary: {
      en: 'Volunteers spent time with the team and the children supported by Zwandoon Welfare Organization.',
      ar: 'قضى المتطوعون وقتًا مع فريق منظمة زوندون الخيرية والأطفال الذين تدعمهم.',
    },
    focus: '50% 40%',
    media: series('zwandoon', [[1600, 897], [1600, 897], [1600, 897]]),
  },
];

/** Months that were read from file dates rather than a written record. */
export const APPROX_DATES = new Set(['swat-girls-school', 'tedx-uap', 'frontier-foundation', 'zwandoon']);

export const ONLINE_SESSIONS: OnlineSession[] = [
  {
    date: '2026-10-31',
    speaker: 'Ayesha Anjum',
    title: { en: 'Boundaries and self-respect', ar: 'الحدود واحترام الذات' },
    poster: img('campaigns/online/aysha', 664, 602),
  },
  {
    date: '2026-10-24',
    speaker: 'Muhammad Umair',
    title: {
      en: 'The stress, craving and guilt cycle: how mental health shapes eating behaviour',
      ar: 'دائرة التوتر والرغبة والذنب: كيف تؤثر الصحة النفسية في سلوك الأكل',
    },
    poster: img('campaigns/online/umair', 664, 603),
  },
  {
    date: '2026-09-19',
    speaker: 'Musab Al-Sheikh',
    title: {
      en: 'The power of your subconscious mind: rewire your thoughts, transform your life',
      ar: 'قوة عقلك الباطن: أعد برمجة أفكارك وغيّر حياتك',
    },
    poster: img('campaigns/online/musab-subconscious', 720, 455),
  },
  {
    date: '2026-09-12',
    speaker: 'Musab Al-Sheikh',
    title: {
      en: 'Equality in practice: beyond rights, toward shared responsibility',
      ar: 'المساواة في الممارسة: ما بعد الحقوق نحو مسؤولية مشتركة',
    },
  },
  {
    date: '2026-08-29',
    speaker: 'Hina Iqbal',
    title: { en: 'Overcoming social anxiety', ar: 'التغلب على القلق الاجتماعي' },
  },
  {
    date: '2026-08-01',
    speaker: 'Hina Iqbal',
    title: { en: 'Breaking the cycle: codependency and healthy relationships', ar: 'كسر الدائرة: الاعتمادية والعلاقات الصحية' },
    note: { en: 'With Inspired Learning Media', ar: 'بالتعاون مع Inspired Learning Media' },
  },
  {
    date: '2026-07-25',
    speaker: 'Tayyaba Kiran',
    title: { en: 'Academic pressure and the weight of expectations', ar: 'الضغط الأكاديمي وثقل التوقعات' },
  },
  {
    date: '2026-07-18',
    speaker: 'Sughra Haider',
    title: { en: 'The balancing act: life, work and mental health', ar: 'فن التوازن: الحياة والعمل والصحة النفسية' },
  },
];

/** Organizations named in the documented activity. */
export const PARTNERS: Bilingual[] = [
  { en: 'TEDx University of Agriculture Peshawar', ar: 'TEDx جامعة الزراعة بيشاور' },
  { en: 'Frontier Foundation', ar: 'مؤسسة فرونتير' },
  { en: 'Zwandoon Welfare Organization', ar: 'منظمة زوندون الخيرية' },
  { en: 'Inspired Learning Media', ar: 'Inspired Learning Media' },
  { en: 'Parwarish Orphanage', ar: 'دار برورش للأيتام' },
  { en: 'The Rising Star School', ar: 'مدرسة رايزنغ ستار' },
];

export function photoCount(c: FieldCampaign): number {
  return c.media.filter((m) => m.type === 'image').length;
}

export function videoCount(c: FieldCampaign): number {
  return c.media.filter((m) => m.type === 'video').length;
}
