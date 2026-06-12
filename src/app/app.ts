import { Component, computed, signal } from '@angular/core';
import {
  LucideArrowDown,
  LucideAtSign,
  LucideBookOpenCheck,
  LucideBriefcaseBusiness,
  LucideCheck,
  LucideChevronRight,
  LucideHandCoins,
  LucideHeart,
  LucideHeartHandshake,
  LucideMail,
  LucideMailCheck,
  LucideMapPin,
  LucideMegaphone,
  LucideMenu,
  LucideMessageCircleHeart,
  LucidePhone,
  LucideQuote,
  LucideSend,
  LucideShieldCheck,
  LucideUsersRound,
  LucideX,
} from '@lucide/angular';

type Language = 'en' | 'ar';

const LOGO_URL = 'assets/alma-alrouh-logo.png';
const NAY_LOGO_URL = 'https://nayalrouh.b-cdn.net/website/logo.png';

const copy = {
  en: {
    code: 'EN',
    switchLabel: 'العربية',
    nav: ['Mission', 'Care', 'Volunteers', 'Partners', 'Donate', 'Contact'],
    donate: 'Donate',
    logoAlt: 'Alma Alrouh logo',
    heroEyebrow: 'Nonprofit mental health support',
    heroTitle: 'Free mental health care, carried by a community that listens.',
    heroCopy:
      'Alma Alrouh is a trauma-informed nonprofit initiative in Peshawar providing culturally sensitive support, awareness programs, and free mental health sessions through a growing network of 140+ volunteers, including psychologists and mental health professionals.',
    heroPrimary: 'Fund free sessions',
    heroSecondary: 'Explore the work',
    heroNote: 'Breaking silence, one conversation at a time.',
    stats: [
      ['140+', 'volunteers including psychologists and mental health professionals'],
      ['Free', 'mental health sessions for people who cannot afford private care'],
      ['2025', 'founded as a nonprofit mental health and wellbeing initiative'],
      ['Peshawar', 'headquarters in Khyber Pakhtunkhwa, Pakistan'],
    ],
    missionEyebrow: 'Public-profile research',
    missionTitle: 'A trauma-informed organization built around access, dignity, and resilience.',
    missionText:
      'Their LinkedIn profile describes Alma Alrouh as dedicated to healing, resilience, emotional empowerment, culturally sensitive support, awareness programs, and evidence-based mental wellness. Their public posts emphasize reducing shame, reaching students and families, and making support feel close enough to use.',
    pillars: [
      {
        title: 'Confidential support',
        text: 'Free consultation and guided sessions for stress, grief, trauma, anxiety, and emotional overwhelm.',
      },
      {
        title: 'Awareness campaigns',
        text: 'Seminars, campus conversations, and community programs that normalize speaking about mental health.',
      },
      {
        title: 'Evidence-led care',
        text: 'Psychologists and mental health professionals support the work with structured, culturally aware approaches.',
      },
    ],
    careEyebrow: 'Care pathway',
    careTitle: 'Simple access for people who need someone safe to talk to.',
    careSteps: [
      ['Reach out', 'A person contacts Alma Alrouh through public channels and shares what support they need.'],
      ['Match support', 'The team routes the request to a suitable volunteer or mental health professional.'],
      ['Keep care free', 'Donations help cover coordination, outreach, volunteer support, and access work.'],
    ],
    volunteerEyebrow: 'Volunteer-led',
    volunteerTitle: 'Psychologists, counselors, students, and advocates moving in the same direction.',
    volunteerText:
      'Recent LinkedIn posts include calls for volunteer clinical psychologists with field experience, creativity, and a drive to build supportive community care. Instagram search results also reference schools, colleges, universities, seminars, mental health camps, and free consultations.',
    volunteerFacts: [
      ['Specialties', 'Mental health, awareness, wellbeing, psychological counseling'],
      ['Public voice', 'Hopeful, direct, stigma-fighting, grounded in small daily change'],
      ['Community work', 'Student outreach, TEDx partnership mentions, expos, seminars, and camps'],
    ],
    quote:
      'Real change begins when care is reachable, shame is interrupted, and people are met before the crisis becomes heavier.',
    impactEyebrow: 'Why giving matters',
    impactTitle: 'Every donation protects the promise of free support.',
    impactCards: [
      ['Remove cost barriers', 'Help people receive care before private session costs push support out of reach.'],
      ['Power outreach', 'Support campus work, awareness materials, and public conversations that reduce stigma.'],
      ['Equip volunteers', 'Fund coordination, intake, training, referrals, and the quiet operations behind care.'],
    ],
    makersEyebrow: 'Behind Alma Alrouh',
    makersTitle: 'Alma Alrouh was created by Nay Alrouh.',
    makersText:
      'Nay Alrouh is the company behind Alma Alrouh, supporting the mission to make mental health care more reachable, visible, and human.',
    makersCards: [
      ['Created by', 'Nay Alrouh built Alma Alrouh as a nonprofit mental health initiative.'],
      ['Free marketing', 'This website receives free marketing support so more people can discover the available sessions and volunteer work.'],
      ['Website by Veloura', 'This website was created by Veloura, a marketing company launching soon.'],
    ],
    sourcesEyebrow: 'Research notes',
    sourcesTitle: 'Content is grounded in public public-profile details.',
    sources: [
      'LinkedIn: nonprofit organization, Peshawar headquarters, founded 2025, specialties, and trauma-informed description.',
      'LinkedIn updates: volunteer clinical psychologist call, community-building language, TEDx University of Agriculture Peshawar partnership post.',
      'Instagram search snippets: free mental health services, consultations, seminars, camps, and school/college/university outreach.',
    ],
    contactEyebrow: 'Connect',
    contactTitle: 'Ask for sessions, volunteer, partner, or request verified donation details.',
    contactText:
      'Use Alma Alrouh public channels for session access, volunteer applications, partnerships, and payment verification.',
    footerLeft: 'Alma Alrouh Organization',
    footerRight: 'Bilingual nonprofit website built in Angular.',
    donation: {
      eyebrow: 'Donation screen',
      title: 'Help fund free mental health sessions.',
      text: 'Choose a giving level and contact Alma Alrouh for verified payment instructions. No unverified bank or wallet details are shown here.',
      selected: 'Selected support',
      choose: 'Choose an amount',
      amounts: ['PKR 1,000', 'PKR 5,000', 'PKR 10,000', 'Custom'],
      email: 'Request payment details',
      instagram: 'Message on Instagram',
      close: 'Close donation screen',
    },
  },
  ar: {
    code: 'AR',
    switchLabel: 'English',
    nav: ['الرسالة', 'الرعاية', 'المتطوعون', 'الشركاء', 'التبرع', 'تواصل'],
    donate: 'تبرع',
    logoAlt: 'شعار ألما الروح',
    heroEyebrow: 'دعم نفسي غير ربحي',
    heroTitle: 'رعاية نفسية مجانية يحملها مجتمع يعرف كيف يصغي.',
    heroCopy:
      'ألما الروح مبادرة غير ربحية واعية بالصدمات في بيشاور، تقدم دعما حساسا للثقافة وبرامج توعية وجلسات صحة نفسية مجانية عبر شبكة تضم أكثر من 140 متطوعا، من بينهم أخصائيون نفسيون ومهنيون في الصحة النفسية.',
    heroPrimary: 'ادعم الجلسات المجانية',
    heroSecondary: 'تعرف على العمل',
    heroNote: 'كسر الصمت، محادثة بعد محادثة.',
    stats: [
      ['+140', 'متطوعا من بينهم أخصائيون نفسيون ومهنيون في الصحة النفسية'],
      ['مجانا', 'جلسات صحة نفسية لمن لا يستطيعون تحمل تكلفة الرعاية الخاصة'],
      ['2025', 'تأسست كمبادرة غير ربحية للصحة النفسية والرفاه'],
      ['بيشاور', 'المقر في خيبر بختونخوا، باكستان'],
    ],
    missionEyebrow: 'بحث من الملفات العامة',
    missionTitle: 'منظمة واعية بالصدمات، مبنية على الوصول والكرامة والقدرة على التعافي.',
    missionText:
      'يصف حساب لينكدإن ألما الروح بأنها مبادرة مكرسة للشفاء والمرونة والتمكين العاطفي، مع دعم حساس للثقافة وبرامج توعية ومقاربات قائمة على الدليل. وتؤكد منشوراتهم العامة تقليل الوصمة والوصول إلى الطلاب والعائلات وجعل الدعم أقرب وأسهل.',
    pillars: [
      {
        title: 'دعم سري',
        text: 'استشارة مجانية وجلسات موجهة للتوتر والحزن والصدمات والقلق والضغط العاطفي.',
      },
      {
        title: 'حملات توعية',
        text: 'ندوات وحوارات جامعية وبرامج مجتمعية تجعل الحديث عن الصحة النفسية أكثر طبيعية.',
      },
      {
        title: 'رعاية قائمة على الدليل',
        text: 'يساند العمل أخصائيون نفسيون ومهنيون في الصحة النفسية بمقاربات منظمة ومراعية للثقافة.',
      },
    ],
    careEyebrow: 'مسار الرعاية',
    careTitle: 'وصول بسيط لمن يحتاج إلى شخص آمن يتحدث معه.',
    careSteps: [
      ['تواصل', 'يتواصل الشخص مع ألما الروح عبر القنوات العامة ويشرح نوع الدعم الذي يحتاجه.'],
      ['مطابقة الدعم', 'يوجه الفريق الطلب إلى متطوع أو مختص مناسب في الصحة النفسية.'],
      ['إبقاء الرعاية مجانية', 'تساعد التبرعات في التنسيق والتوعية ودعم المتطوعين وتسهيل الوصول.'],
    ],
    volunteerEyebrow: 'يقوده المتطوعون',
    volunteerTitle: 'أخصائيون ومرشدون وطلاب ومناصرون يتحركون في اتجاه واحد.',
    volunteerText:
      'تتضمن منشورات لينكدإن الحديثة دعوات لأخصائيين نفسيين سريريين متطوعين لديهم خبرة ميدانية وإبداع ورغبة في بناء رعاية مجتمعية داعمة. وتشير نتائج البحث في إنستغرام إلى المدارس والكليات والجامعات والندوات والمخيمات والاستشارات المجانية.',
    volunteerFacts: [
      ['التخصصات', 'الصحة النفسية، التوعية، الرفاه، الإرشاد النفسي'],
      ['الصوت العام', 'مفعم بالأمل، مباشر، يحارب الوصمة، ويؤمن بالتغيير اليومي الصغير'],
      ['العمل المجتمعي', 'توعية طلابية، شراكات TEDx، معارض، ندوات، ومخيمات'],
    ],
    quote:
      'يبدأ التغيير الحقيقي عندما تصبح الرعاية قريبة، وتنكسر الوصمة، ويجد الإنسان من يراه قبل أن تثقل الأزمة.',
    impactEyebrow: 'لماذا يهم التبرع',
    impactTitle: 'كل تبرع يحمي وعد الدعم المجاني.',
    impactCards: [
      ['إزالة عائق التكلفة', 'ساعد الناس على الوصول للرعاية قبل أن تمنعهم تكلفة الجلسات الخاصة.'],
      ['دعم التوعية', 'ساند العمل الجامعي ومواد التوعية والحوارات العامة التي تقلل الوصمة.'],
      ['تمكين المتطوعين', 'ادعم التنسيق والاستقبال والتدريب والإحالات والعمل التشغيلي الهادئ خلف الرعاية.'],
    ],
    makersEyebrow: 'خلف ألما الروح',
    makersTitle: 'تم إنشاء ألما الروح بواسطة ناي الروح.',
    makersText:
      'ناي الروح هي الشركة التي أنشأت ألما الروح، وتدعم الرسالة في جعل الرعاية النفسية أقرب وأكثر وضوحا وإنسانية.',
    makersCards: [
      ['تم الإنشاء بواسطة', 'أنشأت ناي الروح ألما الروح كمبادرة غير ربحية للصحة النفسية.'],
      ['تسويق مجاني', 'يحصل هذا الموقع على دعم تسويقي مجاني حتى يتمكن عدد أكبر من الناس من الوصول إلى الجلسات والعمل التطوعي.'],
      ['الموقع بواسطة Veloura', 'تم إنشاء هذا الموقع بواسطة Veloura، وهي شركة تسويق سيتم إطلاقها قريبا.'],
    ],
    sourcesEyebrow: 'ملاحظات البحث',
    sourcesTitle: 'المحتوى مبني على تفاصيل منشورة في الملفات العامة.',
    sources: [
      'لينكدإن: منظمة غير ربحية، مقر بيشاور، تأسست 2025، التخصصات، والوصف الواعي بالصدمات.',
      'تحديثات لينكدإن: دعوة لأخصائي نفسي سريري متطوع، لغة بناء المجتمع، ومنشور شراكة TEDx جامعة الزراعة بيشاور.',
      'مقتطفات بحث إنستغرام: خدمات صحة نفسية مجانية، استشارات، ندوات، مخيمات، وتوعية في المدارس والكليات والجامعات.',
    ],
    contactEyebrow: 'تواصل',
    contactTitle: 'اطلب جلسة، تطوع، ابدأ شراكة، أو اطلب تفاصيل تبرع موثقة.',
    contactText:
      'استخدم القنوات العامة لألما الروح للوصول للجلسات وطلبات التطوع والشراكات والتحقق من طرق الدفع.',
    footerLeft: 'منظمة ألما الروح',
    footerRight: 'موقع غير ربحي ثنائي اللغة مبني بأنجولار.',
    donation: {
      eyebrow: 'شاشة التبرع',
      title: 'ساعد في تمويل جلسات الصحة النفسية المجانية.',
      text: 'اختر قيمة الدعم ثم تواصل مع ألما الروح للحصول على تعليمات دفع موثقة. لا نعرض أي تفاصيل مصرفية أو محافظ غير مؤكدة.',
      selected: 'الدعم المختار',
      choose: 'اختر المبلغ',
      amounts: ['PKR 1,000', 'PKR 5,000', 'PKR 10,000', 'مبلغ آخر'],
      email: 'اطلب تفاصيل الدفع',
      instagram: 'راسل عبر إنستغرام',
      close: 'إغلاق شاشة التبرع',
    },
  },
} as const;

@Component({
  selector: 'app-root',
  imports: [
    LucideArrowDown,
    LucideAtSign,
    LucideBookOpenCheck,
    LucideBriefcaseBusiness,
    LucideCheck,
    LucideChevronRight,
    LucideHandCoins,
    LucideHeart,
    LucideHeartHandshake,
    LucideMail,
    LucideMailCheck,
    LucideMapPin,
    LucideMegaphone,
    LucideMenu,
    LucideMessageCircleHeart,
    LucidePhone,
    LucideQuote,
    LucideSend,
    LucideShieldCheck,
    LucideUsersRound,
    LucideX,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly logoUrl = LOGO_URL;
  protected readonly nayLogoUrl = NAY_LOGO_URL;
  protected readonly language = signal<Language>('en');
  protected readonly donationOpen = signal(false);
  protected readonly mobileNavOpen = signal(false);
  protected readonly selectedAmountIndex = signal(1);
  protected readonly data = computed(() => copy[this.language()]);
  protected readonly isArabic = computed(() => this.language() === 'ar');
  protected readonly pageDir = computed(() => (this.isArabic() ? 'rtl' : 'ltr'));

  protected readonly selectedAmount = computed(
    () => this.data().donation.amounts[this.selectedAmountIndex()],
  );

  protected readonly donationMailto = computed(() => {
    const subject = encodeURIComponent('Donation for Alma Alrouh');
    const body = encodeURIComponent(
      `Hello Alma Alrouh,\n\nI would like to donate ${this.selectedAmount()} to support free mental health sessions. Please send verified payment details.\n\nThank you.`,
    );

    return `mailto:almaalrouh1@gmail.com?subject=${subject}&body=${body}`;
  });

  protected toggleLanguage(): void {
    this.language.update((lang) => (lang === 'en' ? 'ar' : 'en'));
    this.mobileNavOpen.set(false);
  }

  protected openDonation(): void {
    this.donationOpen.set(true);
    this.mobileNavOpen.set(false);
  }

  protected closeDonation(): void {
    this.donationOpen.set(false);
  }

  protected toggleMobileNav(): void {
    this.mobileNavOpen.update((open) => !open);
  }

  protected closeMobileNav(): void {
    this.mobileNavOpen.set(false);
  }

  protected chooseAmount(index: number): void {
    this.selectedAmountIndex.set(index);
  }
}
