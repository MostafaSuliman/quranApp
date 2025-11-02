// UI Text translations for Arabic-first app
import { usePreferencesStore } from '../stores/preferencesStore'

export interface UIText {
  // Navigation
  home: string
  learn: string
  mushaf: string
  progress: string
  settings: string

  // Common actions
  continue: string
  start: string
  next: string
  previous: string
  back: string
  done: string
  save: string
  cancel: string
  reset: string
  delete: string
  edit: string
  share: string

  // Home page
  assalamuAlaikum: string
  seekerOfKnowledge: string
  inTheNameOfAllah: string
  dayStreak: string
  level: string
  totalXP: string
  todaysGoal: string
  goalCompleted: string
  alhamdulillahGoalComplete: string
  moreAyahsToGoal: string
  startTodaysLesson: string
  continueReading: string
  traditionalMushafDemo: string
  lessonsToday: string
  timeToday: string
  todayStats: string
  lessonStats: string
  readQuranHadith: string
  prophetMuhammadPbuh: string
  sahihMuslim: string

  // Progress page
  yourProgress: string
  overview: string
  stats: string
  levelProgress: string
  xpToNextLevel: string
  lessonsCompleted: string
  atRisk: string
  streakBadges: string
  learningBadges: string
  achievementBadges: string
  specialBadges: string
  noBadgesYet: string
  keepLearningUnlockBadges: string
  nextBadgeGoals: string
  thisWeek: string
  thisMonth: string
  allTime: string
  ayahsStudied: string
  timeSpent: string
  lessonsDone: string
  xpEarned: string
  dailyActivity: string
  lessActivity: string
  moreActivity: string
  recentAchievements: string
  daysAgo: string
  weekAgo: string
  weeksAgo: string
  daysActive: string
  averageSession: string
  minutes: string
  bestDay: string
  bestDaySubtitle: string

  // Onboarding page
  welcomeToQuranJourney: string
  beginBeautifulJourney: string
  tellUsAboutYourself: string
  personalizeExperience: string
  yourQuranExperience: string
  customizeLearningPath: string
  readingPreferences: string
  chooseReciterOptions: string
  setDailyGoal: string
  manageableDailyTarget: string
  stepOf: string
  beginJourney: string
  whatShouldWeCallYou: string
  seekerOfKnowledgeDefault: string
  preferredLanguageTranslation: string
  newToQuran: string
  justStartingJourney: string
  someExperience: string
  knowSomeArabic: string
  experienced: string
  comfortableWithArabic: string
  choosePreferredReciter: string
  displayOptions: string
  showTransliterationPhonetic: string
  showTranslationText: string
  dailyLearningGoalSection: string
  chooseManageableTarget: string
  dailyReminderOptional: string
  recommendAfterMaghrib: string
  startLearningCelebration: string
  gamifiedLearning: string
  beautifulAudio: string
  trackProgressFeature: string
  completelyFree: string
  lightAndSteady: string
  recommendedBeginners: string
  goodProgress: string
  ambitious: string
  expertLevel: string
  murattal: string
  clearMelodious: string
  madinahStyle: string
  emotional: string
  slowClear: string

  // Lesson page
  lessonComplete: string
  congratulations: string
  excellentWork: string
  xpEarnedLesson: string
  backToHome: string
  nextLesson: string
  listenLearn: string
  followArabicText: string
  translationMatch: string
  selectCorrectTranslation: string
  completeVerse: string
  fillMissingWords: string
  matchMeaning: string
  matchArabicTranslation: string
  recitePractice: string
  practiceRecitation: string
  playAudio: string
  pauseAudio: string
  repeatAudio: string
  checkAnswer: string
  correctAnswer: string
  tryAgain: string
  showAnswer: string
  lessonProgress: string
  exerciseOf: string

  // Mushaf reader page
  mushafReader: string
  pageOf: string
  surahList: string
  gotoPage: string
  searchSurah: string
  memorization: string
  practiceMode: string
  testMode: string
  repeatVerse: string
  hideText: string
  showText: string
  playbackOptions: string
  autoPlay: string
  repeatMode: string
  verseByVerse: string
  continuousPlay: string
  loadingMushaf: string
  errorLoadingPage: string
  tryAgainLater: string
  refreshPage: string
  somethingWentWrong: string

  // Audio related
  loading: string
  playing: string
  paused: string
  buffering: string
  audioError: string
  noAudioAvailable: string
  downloadingAudio: string
  audioQuality: string
  reciter: string

  // Settings sections
  reading: string
  audio: string
  notifications: string
  appearance: string
  account: string
  debug: string
  settingsTitle: string
  accountInformation: string
  accountInformationHint: string
  emailVerifiedLabel: string
  emailNotVerifiedLabel: string
  emailAddress: string
  emailPlaceholder: string
  sendVerificationCode: string
  resendCode: string
  resendIn: string
  verificationCodeLabel: string
  verifyCode: string
  verificationStatusSending: string
  verificationStatusSent: string
  verificationStatusVerifying: string
  verificationStatusVerified: string
  verificationStatusError: string
  socialAccounts: string
  socialAccountsHint: string
  googleSignIn: string
  appleSignIn: string
  linkedBadge: string
  linkedOn: string
  processing: string
  linkAccount: string
  unlinkAccount: string
  manageData: string
  manageDataHint: string
  logout: string
  aboutSection: string

  // Reading settings
  defaultReadingMode: string
  learningMode: string
  mushafMode: string
  learningModeDesc: string
  mushafModeDesc: string
  translationSettings: string
  showTransliteration: string
  showTranslation: string
  translationLanguage: string
  uiLanguage: string
  translationAndTransliteration: string
  dailyLearningGoal: string
  ayahsPerDay: string
  estimatedTime: string
  current: string
  notSelected: string
  speed: string

  // Audio settings
  preferredReciter: string
  playbackSpeed: string
  highQualityAudio: string
  audioQualityDesc: string

  // Notifications
  dailyReminder: string
  reminderTime: string
  reminderTimeDesc: string
  notificationTypes: string
  dailyReminderLabel: string
  dailyReminderDesc: string
  streakWarning: string
  streakWarningDesc: string
  achievements: string
  achievementsDesc: string
  enableNotifications: string
  enableNotificationsDesc: string
  requestPermission: string

  // Appearance
  theme: string
  darkMode: string
  darkModeDesc: string
  animations: string
  enableAnimations: string
  enableAnimationsDesc: string
  fontSize: string
  fontSizeDesc: string

  // Account
  accountInfo: string
  name: string
  accountType: string
  joined: string
  guestUser: string
  registeredUser: string
  dataManagement: string
  resetSettings: string
  resetSettingsDesc: string
  resetProgress: string
  resetProgressDesc: string
  about: string
  appVersion: string
  dataSource: string
  lastUpdated: string

  // Fi Sabilillah section
  fiSabilillah: string
  fiSabilillahDesc: string
  fiSabilillahVerse: string

  // Progress page
  currentStreak: string
  totalAyahs: string
  xpPoints: string
  badges: string
  weeklyStats: string
  monthlyStats: string

  // Common Islamic phrases
  bismillah: string
  alhamdulillah: string
  subhanallah: string
  allahakbar: string
  astagfirullah: string
  inshallah: string
  mashallah: string
  barakallahu: string

  // Time units
  minute: string
  minutes: string
  hour: string
  hours: string
  day: string
  days: string
  week: string
  weeks: string
  month: string
  months: string
  today: string
  yesterday: string
  tomorrow: string
}

const arabicText: UIText = {
  // Navigation
  home: 'الرئيسية',
  learn: 'تعلم',
  mushaf: 'المصحف',
  progress: 'التقدم',
  settings: 'الإعدادات',

  // Common actions
  continue: 'متابعة',
  start: 'ابدأ',
  next: 'التالي',
  previous: 'السابق',
  back: 'رجوع',
  done: 'تم',
  save: 'حفظ',
  cancel: 'إلغاء',
  reset: 'إعادة تعيين',
  delete: 'حذف',
  edit: 'تعديل',
  share: 'مشاركة',

  // Home page
  assalamuAlaikum: 'السلام عليكم',
  seekerOfKnowledge: 'طالب العلم',
  inTheNameOfAllah: 'بسم الله الرحمن الرحيم',
  dayStreak: 'أيام متتالية',
  level: 'المستوى',
  totalXP: 'إجمالي النقاط',
  todaysGoal: 'هدف اليوم',
  goalCompleted: 'تم إنجاز الهدف',
  alhamdulillahGoalComplete: '🎉 تم إنجاز الهدف! الحمد لله!',
  moreAyahsToGoal: 'آية أخرى لتحقيق هدف اليوم',
  startTodaysLesson: 'ابدأ درس اليوم',
  continueReading: 'متابعة القراءة',
  traditionalMushafDemo: 'عرض المصحف التقليدي',
  lessonsToday: 'الدروس اليوم',
  timeToday: 'الوقت اليوم',
  todayStats: 'إحصائيات اليوم',
  lessonStats: 'إحصائيات الدروس',
  readQuranHadith: 'اقْرَؤُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لِأَصْحَابِهِ',
  prophetMuhammadPbuh: 'النبي محمد ﷺ',
  sahihMuslim: 'صحيح مسلم',

  // Progress page
  yourProgress: 'تقدمك',
  overview: 'نظرة عامة',
  stats: 'الإحصائيات',
  levelProgress: 'تقدم المستوى',
  xpToNextLevel: 'نقطة للمستوى التالي',
  lessonsCompleted: 'الدروس المكتملة',
  atRisk: 'في خطر',
  streakBadges: 'أوسمة التتابع',
  learningBadges: 'أوسمة التعلم',
  achievementBadges: 'أوسمة الإنجاز',
  specialBadges: 'أوسمة خاصة',
  noBadgesYet: 'لم تحصل على أوسمة في هذه الفئة بعد',
  keepLearningUnlockBadges: 'استمر في التعلم لفتح الأوسمة!',
  nextBadgeGoals: 'أهداف الأوسمة التالية',
  thisWeek: 'هذا الأسبوع',
  thisMonth: 'هذا الشهر',
  allTime: 'كل الأوقات',
  ayahsStudied: 'الآيات المدروسة',
  timeSpent: 'الوقت المقضي',
  lessonsDone: 'الدروس المكتملة',
  xpEarned: 'النقاط المكتسبة',
  dailyActivity: 'النشاط اليومي',
  lessActivity: 'أقل',
  moreActivity: 'أكثر',
  recentAchievements: 'الإنجازات الحديثة',
  daysAgo: 'منذ يومين',
  weekAgo: 'منذ أسبوع',
  weeksAgo: 'منذ أسبوعين',
  daysActive: 'الأيام النشطة',
  averageSession: 'متوسط الجلسة',
  minutes: 'دقائق',
  bestDay: 'أفضل يوم',
  bestDaySubtitle: 'أعلى نشاط للحفظ',

  // Onboarding page
  welcomeToQuranJourney: 'مرحباً بك في رحلة القرآن',
  beginBeautifulJourney: 'ابدأ رحلتك الجميلة لحفظ القرآن مع التوجيه والتحفيز',
  tellUsAboutYourself: 'أخبرنا عن نفسك',
  personalizeExperience: 'ساعدنا في تخصيص تجربة التعلم الخاصة بك',
  yourQuranExperience: 'خبرتك مع القرآن',
  customizeLearningPath: 'هذا يساعدنا في تخصيص مسار التعلم الخاص بك',
  readingPreferences: 'تفضيلات القراءة',
  chooseReciterOptions: 'اختر قارئك المفضل وخيارات العرض',
  setDailyGoal: 'حدد هدفك اليومي',
  manageableDailyTarget: 'ابدأ بهدف يومي يمكن التحكم فيه',
  stepOf: 'الخطوة {step} من {total}',
  beginJourney: 'ابدأ الرحلة',
  whatShouldWeCallYou: 'ماذا يجب أن نناديك؟ (اختياري)',
  seekerOfKnowledgeDefault: 'سنناديك "طالب العلم" إذا تُرك فارغاً',
  preferredLanguageTranslation: 'اللغة المفضلة للترجمة',
  newToQuran: 'جديد على القرآن',
  justStartingJourney: 'أبدأ رحلتي مع القرآن للتو',
  someExperience: 'لدي بعض الخبرة',
  knowSomeArabic: 'أعرف بعض العربية وقرأت أجزاء من القرآن',
  experienced: 'ذو خبرة',
  comfortableWithArabic: 'مرتاح مع العربية وحفظت أجزاء',
  choosePreferredReciter: 'اختر قارئك المفضل',
  displayOptions: 'خيارات العرض',
  showTransliterationPhonetic: 'إظهار النطق (العربية الصوتية)',
  showTranslationText: 'إظهار الترجمة',
  dailyLearningGoalSection: 'هدف التعلم اليومي',
  chooseManageableTarget: 'اختر هدفاً يومياً يمكن التحكم فيه. يمكنك دائماً تعديل هذا لاحقاً.',
  dailyReminderOptional: 'وقت التذكير اليومي (اختياري)',
  recommendAfterMaghrib: 'نوصي بعد صلاة المغرب (حوالي 7 مساءً)',
  startLearningCelebration: 'ابدأ التعلم 🎉',
  gamifiedLearning: 'تعلم تفاعلي',
  beautifulAudio: 'صوت جميل',
  trackProgressFeature: 'تتبع التقدم',
  completelyFree: 'مجاني تماماً',
  lightAndSteady: 'خفيف ومستقر',
  recommendedBeginners: 'موصى به للمبتدئين',
  goodProgress: 'تقدم جيد',
  ambitious: 'طموح',
  expertLevel: 'مستوى خبير',
  murattal: 'مرتل',
  clearMelodious: 'واضح وعذب',
  madinahStyle: 'أسلوب المدينة',
  emotional: 'عاطفي',
  slowClear: 'بطيء وواضح',

  // Lesson page
  lessonComplete: 'اكتمل الدرس',
  congratulations: 'تهانينا',
  excellentWork: 'عمل ممتاز',
  xpEarnedLesson: 'نقطة مكتسبة',
  backToHome: 'العودة للرئيسية',
  nextLesson: 'الدرس التالي',
  listenLearn: 'استمع وتعلم',
  followArabicText: 'استمع للتلاوة وتابع النص العربي',
  translationMatch: 'مطابقة الترجمة',
  selectCorrectTranslation: 'اختر الترجمة الصحيحة لهذه الآية',
  completeVerse: 'أكمل الآية',
  fillMissingWords: 'املأ الكلمات المفقودة',
  matchMeaning: 'طابق المعنى',
  matchArabicTranslation: 'طابق العربية بالترجمة',
  recitePractice: 'تدرب على التلاوة',
  practiceRecitation: 'تدرب على تلاوة هذه الآية',
  playAudio: 'تشغيل الصوت',
  pauseAudio: 'إيقاف الصوت',
  repeatAudio: 'إعادة الصوت',
  checkAnswer: 'تحقق من الإجابة',
  correctAnswer: 'إجابة صحيحة',
  tryAgain: 'حاول مرة أخرى',
  showAnswer: 'إظهار الإجابة',
  lessonProgress: 'تقدم الدرس',
  exerciseOf: 'التمرين {current} من {total}',

  // Mushaf reader page
  mushafReader: 'قارئ المصحف',
  pageOf: 'الصفحة {current} من {total}',
  surahList: 'قائمة السور',
  gotoPage: 'انتقل للصفحة',
  searchSurah: 'البحث عن سورة',
  memorization: 'الحفظ',
  practiceMode: 'وضع التدرب',
  testMode: 'وضع الاختبار',
  repeatVerse: 'كرر الآية',
  hideText: 'إخفاء النص',
  showText: 'إظهار النص',
  playbackOptions: 'خيارات التشغيل',
  autoPlay: 'التشغيل التلقائي',
  repeatMode: 'وضع التكرار',
  verseByVerse: 'آية بآية',
  continuousPlay: 'تشغيل مستمر',
  loadingMushaf: 'جاري تحميل المصحف...',
  errorLoadingPage: 'خطأ في تحميل الصفحة',
  tryAgainLater: 'حاول مرة أخرى لاحقاً',
  refreshPage: 'تحديث الصفحة',
  somethingWentWrong: 'حدث خطأ ما',

  // Audio related
  loading: 'جاري التحميل',
  playing: 'يتم التشغيل',
  paused: 'متوقف',
  buffering: 'جاري التخزين المؤقت',
  audioError: 'خطأ في الصوت',
  noAudioAvailable: 'لا يوجد صوت متاح',
  downloadingAudio: 'جاري تحميل الصوت',
  audioQuality: 'جودة الصوت',
  reciter: 'القارئ',

  // Settings sections
  reading: 'القراءة',
  audio: 'الصوت',
  notifications: 'الإشعارات',
  appearance: 'المظهر',
  account: 'الحساب',
  debug: 'التطوير',
  settingsTitle: 'الإعدادات',
  accountInformation: 'معلومات الحساب',
  accountInformationHint: 'تحقق من بريدك الإلكتروني وأدر طرق تسجيل الدخول.',
  emailVerifiedLabel: 'مُوثَّق',
  emailNotVerifiedLabel: 'غير مُوثَّق',
  emailAddress: 'البريد الإلكتروني',
  emailPlaceholder: 'name@example.com',
  sendVerificationCode: 'إرسال الرمز',
  resendCode: 'إعادة إرسال الرمز',
  resendIn: 'إعادة الإرسال خلال',
  verificationCodeLabel: 'رمز التحقق',
  verifyCode: 'تحقق من الرمز',
  verificationStatusSending: 'جاري إرسال رسالة التحقق…',
  verificationStatusSent: 'تم إرسال الرمز! تحقق من بريدك.',
  verificationStatusVerifying: 'جاري التحقق…',
  verificationStatusVerified: 'تم توثيق البريد الإلكتروني بنجاح.',
  verificationStatusError: 'تعذر التحقق من البريد الإلكتروني. حاول مرة أخرى.',
  socialAccounts: 'الحسابات المرتبطة',
  socialAccountsHint: 'اربط مزود خدمة لتسجيل دخول أسرع.',
  googleSignIn: 'استخدم حساب Google لتسجيل الدخول عبر الأجهزة.',
  appleSignIn: 'استخدم Apple ID لتسجيل دخول آمن وخاص.',
  linkedBadge: 'مرتبط',
  linkedOn: 'تم الربط في',
  processing: 'جارٍ التنفيذ…',
  linkAccount: 'ربط الحساب',
  unlinkAccount: 'إلغاء الربط',
  manageData: 'إدارة البيانات',
  manageDataHint: 'تحكم في تفضيلاتك وتقدمك المحفوظ.',
  logout: 'تسجيل الخروج',
  aboutSection: 'حول QuranApp',

  // Reading settings
  defaultReadingMode: 'وضع القراءة الافتراضي',
  learningMode: 'وضع التعلم',
  mushafMode: 'وضع المصحف',
  learningModeDesc: 'عرض قائمة مع الترجمة والنطق',
  mushafModeDesc: 'تخطيط صفحة القرآن التقليدي',
  translationSettings: 'إعدادات الترجمة والنطق',
  showTransliteration: 'إظهار النطق',
  showTranslation: 'إظهار الترجمة',
  translationLanguage: 'لغة الترجمة',
  uiLanguage: 'لغة الواجهة',
  translationAndTransliteration: 'الترجمة والنطق',
  dailyLearningGoal: 'هدف التعلم اليومي',
  ayahsPerDay: 'آية في اليوم',
  estimatedTime: 'الوقت المقدر',
  current: 'الحالي',
  notSelected: 'غير محدد',
  speed: 'السرعة',

  // Audio settings
  preferredReciter: 'القارئ المفضل',
  playbackSpeed: 'سرعة التشغيل',
  highQualityAudio: 'صوت عالي الجودة',
  audioQualityDesc: 'جميع التسجيلات الصوتية مأخوذة من تسجيلات أصلية بجودة 128 كيلوبت لأفضل تجربة استماع.',

  // Notifications
  dailyReminder: 'التذكير اليومي',
  reminderTime: 'وقت التذكير',
  reminderTimeDesc: 'نوصي بعد صلاة المغرب (حوالي 7 مساءً)',
  notificationTypes: 'أنواع الإشعارات',
  dailyReminderLabel: 'تذكير التعلم اليومي',
  dailyReminderDesc: 'يذكرك بإنجاز هدفك اليومي',
  streakWarning: 'تحذير انقطاع السلسلة',
  streakWarningDesc: 'ينبه عندما تكون سلسلتك في خطر',
  achievements: 'إشعارات الإنجازات',
  achievementsDesc: 'يحتفل عندما تحصل على أوسمة أو ترتقي في المستوى',
  enableNotifications: 'تفعيل إشعارات المتصفح',
  enableNotificationsDesc: 'لتلقي التذكيرات، يرجى السماح بالإشعارات في إعدادات المتصفح.',
  requestPermission: 'طلب الإذن',

  // Appearance
  theme: 'المظهر',
  darkMode: 'الوضع الليلي',
  darkModeDesc: 'مريح للعينين للقراءة الليلية',
  animations: 'الحركات',
  enableAnimations: 'تفعيل الحركات',
  enableAnimationsDesc: 'انتقالات وتأثيرات جميلة',
  fontSize: 'حجم الخط',
  fontSizeDesc: 'يتم ضبط حجم النص العربي تلقائياً حسب إعدادات إمكانية الوصول في جهازك.',

  // Account
  accountInfo: 'معلومات الحساب',
  name: 'الاسم',
  accountType: 'نوع الحساب',
  joined: 'انضم في',
  guestUser: 'مستخدم زائر',
  registeredUser: 'مستخدم مسجل',
  dataManagement: 'إدارة البيانات',
  resetSettings: 'إعادة تعيين الإعدادات',
  resetSettingsDesc: 'إعادة تعيين جميع التفضيلات إلى القيم الافتراضية',
  resetProgress: 'إعادة تعيين التقدم',
  resetProgressDesc: 'حذف جميع بيانات التقدم نهائياً',
  about: 'حول التطبيق',
  appVersion: 'إصدار التطبيق',
  dataSource: 'مصدر البيانات',
  lastUpdated: 'آخر تحديث',

  // Fi Sabilillah section
  fiSabilillah: 'في سبيل الله 💚',
  fiSabilillahDesc: 'هذا التطبيق مجاني تماماً في سبيل الله. عسى أن يكون وسيلة أجر لجميع من ساهم في إنشائه.',
  fiSabilillahVerse: '"ومن يعمل مثقال ذرة خيراً يره" - القرآن 99:7',

  // Progress page
  currentStreak: 'السلسلة الحالية',
  totalAyahs: 'إجمالي الآيات',
  progressLevel: 'المستوى',
  xpPoints: 'نقاط الخبرة',
  badges: 'الأوسمة',
  weeklyStats: 'إحصائيات أسبوعية',
  monthlyStats: 'إحصائيات شهرية',

  // Common Islamic phrases
  bismillah: 'بسم الله',
  alhamdulillah: 'الحمد لله',
  subhanallah: 'سبحان الله',
  allahakbar: 'الله أكبر',
  astagfirullah: 'أستغفر الله',
  inshallah: 'إن شاء الله',
  mashallah: 'ما شاء الله',
  barakallahu: 'بارك الله',

  // Time units
  minute: 'دقيقة',
  minutes: 'دقائق',
  hour: 'ساعة',
  hours: 'ساعات',
  day: 'يوم',
  days: 'أيام',
  week: 'أسبوع',
  weeks: 'أسابيع',
  month: 'شهر',
  months: 'أشهر',
  today: 'اليوم',
  yesterday: 'أمس',
  tomorrow: 'غداً'
}

const englishText: UIText = {
  // Navigation
  home: 'Home',
  learn: 'Learn',
  mushaf: 'Mushaf',
  progress: 'Progress',
  settings: 'Settings',

  // Common actions
  continue: 'Continue',
  start: 'Start',
  next: 'Next',
  previous: 'Previous',
  back: 'Back',
  done: 'Done',
  save: 'Save',
  cancel: 'Cancel',
  reset: 'Reset',
  delete: 'Delete',
  edit: 'Edit',
  share: 'Share',

  // Home page
  assalamuAlaikum: 'Assalamu alaikum',
  seekerOfKnowledge: 'Seeker of Knowledge',
  inTheNameOfAllah: 'In the name of Allah, the Most Gracious, the Most Merciful',
  dayStreak: 'Day Streak',
  level: 'Level',
  totalXP: 'Total XP',
  todaysGoal: 'Today\'s Goal',
  goalCompleted: 'Goal Completed',
  alhamdulillahGoalComplete: '🎉 Goal completed! Alhamdulillah!',
  moreAyahsToGoal: 'more ayahs to reach today\'s goal',
  startTodaysLesson: 'Start Today\'s Lesson',
  continueReading: 'Continue Reading',
  traditionalMushafDemo: 'Traditional Mushaf Demo',
  lessonsToday: 'Lessons',
  timeToday: 'Today',
  todayStats: 'Today\'s Stats',
  lessonStats: 'Lesson Stats',
  readQuranHadith: 'Read the Quran, for it will come as an intercessor for its reciters on the Day of Resurrection.',
  prophetMuhammadPbuh: 'Prophet Muhammad ﷺ',
  sahihMuslim: 'Sahih Muslim',

  // Progress page
  yourProgress: 'Your Progress',
  overview: 'Overview',
  stats: 'Stats',
  levelProgress: 'Level Progress',
  xpToNextLevel: 'XP to Level',
  lessonsCompleted: 'Lessons Completed',
  atRisk: 'At risk',
  streakBadges: 'Streak Badges',
  learningBadges: 'Learning Badges',
  achievementBadges: 'Achievement Badges',
  specialBadges: 'Special Badges',
  noBadgesYet: 'No badges earned in this category yet.',
  keepLearningUnlockBadges: 'Keep learning to unlock badges!',
  nextBadgeGoals: 'Next Badge Goals',
  thisWeek: 'This Week',
  thisMonth: 'This Month',
  allTime: 'All Time',
  ayahsStudied: 'Ayahs Studied',
  timeSpent: 'Time Spent',
  lessonsDone: 'Lessons Done',
  xpEarned: 'XP Earned',
  dailyActivity: 'Daily Activity',
  lessActivity: 'Less',
  moreActivity: 'More',
  recentAchievements: 'Recent Achievements',
  daysAgo: '2 days ago',
  weekAgo: '1 week ago',
  weeksAgo: '2 weeks ago',
  daysActive: 'Days Active',
  averageSession: 'Avg Session',
  minutes: 'minutes',
  bestDay: 'Best Day',
  bestDaySubtitle: 'Highest memorization activity',

  // Onboarding page
  welcomeToQuranJourney: 'Welcome to Your Quran Journey',
  beginBeautifulJourney: 'Begin your beautiful journey of memorizing the Quran with guidance and gamification',
  tellUsAboutYourself: 'Tell Us About Yourself',
  personalizeExperience: 'Help us personalize your learning experience',
  yourQuranExperience: 'Your Quran Experience',
  customizeLearningPath: 'This helps us customize your learning path',
  readingPreferences: 'Reading Preferences',
  chooseReciterOptions: 'Choose your preferred reciter and display options',
  setDailyGoal: 'Set Your Daily Goal',
  manageableDailyTarget: 'Start with a manageable daily target',
  stepOf: 'Step {step} of {total}',
  beginJourney: 'Begin Journey',
  whatShouldWeCallYou: 'What should we call you? (Optional)',
  seekerOfKnowledgeDefault: 'We\'ll call you "Seeker of Knowledge" if left blank',
  preferredLanguageTranslation: 'Preferred Language for Translation',
  newToQuran: 'New to Quran',
  justStartingJourney: 'I\'m just starting my journey with the Quran',
  someExperience: 'Some Experience',
  knowSomeArabic: 'I know some Arabic and have read parts of the Quran',
  experienced: 'Experienced',
  comfortableWithArabic: 'I\'m comfortable with Arabic and have memorized portions',
  choosePreferredReciter: 'Choose Your Preferred Reciter',
  displayOptions: 'Display Options',
  showTransliterationPhonetic: 'Show transliteration (phonetic Arabic)',
  showTranslationText: 'Show translation',
  dailyLearningGoalSection: 'Daily Learning Goal',
  chooseManageableTarget: 'Choose a daily target that feels manageable. You can always adjust this later.',
  dailyReminderOptional: 'Daily Reminder Time (Optional)',
  recommendAfterMaghrib: 'We recommend after Maghrib prayer (around 7 PM)',
  startLearningCelebration: 'Start Learning 🎉',
  gamifiedLearning: 'Gamified Learning',
  beautifulAudio: 'Beautiful Audio',
  trackProgressFeature: 'Track Progress',
  completelyFree: 'Completely Free',
  lightAndSteady: 'Light and steady',
  recommendedBeginners: 'Recommended for beginners',
  goodProgress: 'Good progress',
  ambitious: 'Ambitious',
  expertLevel: 'Expert level',
  murattal: 'Murattal',
  clearMelodious: 'Clear & Melodious',
  madinahStyle: 'Madinah Style',
  emotional: 'Emotional',
  slowClear: 'Slow & Clear',

  // Lesson page
  lessonComplete: 'Lesson Complete',
  congratulations: 'Congratulations',
  excellentWork: 'Excellent work',
  xpEarnedLesson: 'XP earned',
  backToHome: 'Back to Home',
  nextLesson: 'Next Lesson',
  listenLearn: 'Listen & Learn',
  followArabicText: 'Listen to the recitation and follow along with the Arabic text',
  translationMatch: 'Translation Match',
  selectCorrectTranslation: 'Select the correct translation for this ayah',
  completeVerse: 'Complete the Verse',
  fillMissingWords: 'Fill in the missing words',
  matchMeaning: 'Match the Meaning',
  matchArabicTranslation: 'Match the Arabic with its translation',
  recitePractice: 'Recite & Practice',
  practiceRecitation: 'Practice reciting this ayah',
  playAudio: 'Play Audio',
  pauseAudio: 'Pause Audio',
  repeatAudio: 'Repeat Audio',
  checkAnswer: 'Check Answer',
  correctAnswer: 'Correct!',
  tryAgain: 'Try Again',
  showAnswer: 'Show Answer',
  lessonProgress: 'Lesson Progress',
  exerciseOf: 'Exercise {current} of {total}',

  // Mushaf reader page
  mushafReader: 'Mushaf Reader',
  pageOf: 'Page {current} of {total}',
  surahList: 'Surah List',
  gotoPage: 'Go to Page',
  searchSurah: 'Search Surah',
  memorization: 'Memorization',
  practiceMode: 'Practice Mode',
  testMode: 'Test Mode',
  repeatVerse: 'Repeat Verse',
  hideText: 'Hide Text',
  showText: 'Show Text',
  playbackOptions: 'Playback Options',
  autoPlay: 'Auto Play',
  repeatMode: 'Repeat Mode',
  verseByVerse: 'Verse by Verse',
  continuousPlay: 'Continuous Play',
  loadingMushaf: 'Loading Mushaf...',
  errorLoadingPage: 'Error loading page',
  tryAgainLater: 'Please try again later',
  refreshPage: 'Refresh Page',
  somethingWentWrong: 'Something went wrong',

  // Audio related
  loading: 'Loading',
  playing: 'Playing',
  paused: 'Paused',
  buffering: 'Buffering',
  audioError: 'Audio Error',
  noAudioAvailable: 'No audio available',
  downloadingAudio: 'Downloading audio',
  audioQuality: 'Audio Quality',
  reciter: 'Reciter',

  // Settings sections
  reading: 'Reading',
  audio: 'Audio',
  notifications: 'Notifications',
  appearance: 'Appearance',
  account: 'Account',
  debug: 'Debug',
  settingsTitle: 'Settings',
  accountInformation: 'Account Information',
  accountInformationHint: 'Verify your email and manage sign-in methods.',
  emailVerifiedLabel: 'Verified',
  emailNotVerifiedLabel: 'Not verified',
  emailAddress: 'Email address',
  emailPlaceholder: 'name@example.com',
  sendVerificationCode: 'Send code',
  resendCode: 'Resend code',
  resendIn: 'Resend in',
  verificationCodeLabel: 'Verification code',
  verifyCode: 'Verify code',
  verificationStatusSending: 'Sending verification email…',
  verificationStatusSent: 'Code sent! Check your inbox.',
  verificationStatusVerifying: 'Verifying…',
  verificationStatusVerified: 'Email verified successfully.',
  verificationStatusError: 'Unable to verify email. Please try again.',
  socialAccounts: 'Social Accounts',
  socialAccountsHint: 'Link a provider for faster sign-in.',
  googleSignIn: 'Use Google to quickly sign in across devices.',
  appleSignIn: 'Use Apple ID for a private, secure sign in.',
  linkedBadge: 'Linked',
  linkedOn: 'Linked on',
  processing: 'Processing…',
  linkAccount: 'Link account',
  unlinkAccount: 'Unlink',
  manageData: 'Manage Data',
  manageDataHint: 'Control your saved preferences and progress.',
  logout: 'Sign out',
  aboutSection: 'About QuranApp',

  // Reading settings
  defaultReadingMode: 'Default Reading Mode',
  learningMode: 'Learning Mode',
  mushafMode: 'Mushaf Mode',
  learningModeDesc: 'List view with translation and transliteration',
  mushafModeDesc: 'Traditional Quran page layout',
  translationSettings: 'Translation & Transliteration',
  showTransliteration: 'Show transliteration',
  showTranslation: 'Show translation',
  translationLanguage: 'Translation Language',
  uiLanguage: 'Interface Language',
  translationAndTransliteration: 'Translation & Transliteration',
  dailyLearningGoal: 'Daily Learning Goal',
  ayahsPerDay: 'ayahs per day',
  estimatedTime: 'Estimated time',
  current: 'Current',
  notSelected: 'Not selected',
  speed: 'Speed',

  // Audio settings
  preferredReciter: 'Preferred Reciter',
  playbackSpeed: 'Playback Speed',
  highQualityAudio: 'High Quality Audio',
  audioQualityDesc: 'All audio is sourced from authentic recordings at 128 kbps quality for the best listening experience.',

  // Notifications
  dailyReminder: 'Daily Reminder',
  reminderTime: 'Reminder Time',
  reminderTimeDesc: 'We recommend after Maghrib prayer (around 7 PM)',
  notificationTypes: 'Notification Types',
  dailyReminderLabel: 'Daily Learning Reminder',
  dailyReminderDesc: 'Reminds you to complete your daily goal',
  streakWarning: 'Streak Warning',
  streakWarningDesc: 'Warns when your streak is at risk',
  achievements: 'Achievement Notifications',
  achievementsDesc: 'Celebrates when you earn badges or level up',
  enableNotifications: 'Enable Browser Notifications',
  enableNotificationsDesc: 'To receive reminders, please allow notifications in your browser settings.',
  requestPermission: 'Request Permission',

  // Appearance
  theme: 'Theme',
  darkMode: 'Dark Mode',
  darkModeDesc: 'Easy on the eyes for night reading',
  animations: 'Animations',
  enableAnimations: 'Enable Animations',
  enableAnimationsDesc: 'Beautiful transitions and effects',
  fontSize: 'Font Size',
  fontSizeDesc: 'Arabic text size automatically adjusts based on your device\'s accessibility settings.',

  // Account
  accountInfo: 'Account Information',
  name: 'Name',
  accountType: 'Account Type',
  joined: 'Joined',
  guestUser: 'Guest User',
  registeredUser: 'Registered User',
  dataManagement: 'Data Management',
  resetSettings: 'Reset Settings',
  resetSettingsDesc: 'Reset all preferences to default values',
  resetProgress: 'Reset Progress',
  resetProgressDesc: 'Permanently delete all progress data',
  about: 'About',
  appVersion: 'App Version',
  dataSource: 'Data Source',
  lastUpdated: 'Last Updated',

  // Fi Sabilillah section
  fiSabilillah: 'Fi Sabilillah 💚',
  fiSabilillahDesc: 'This app is completely free for the sake of Allah. May it be a means of reward for all who contributed to its creation.',
  fiSabilillahVerse: '"And whoever does good an atom\'s weight will see it." - Quran 99:7',

  // Progress page
  currentStreak: 'Current Streak',
  totalAyahs: 'Total Ayahs',
  progressLevel: 'Level',
  xpPoints: 'XP Points',
  badges: 'Badges',
  weeklyStats: 'Weekly Stats',
  monthlyStats: 'Monthly Stats',

  // Common Islamic phrases
  bismillah: 'Bismillah',
  alhamdulillah: 'Alhamdulillah',
  subhanallah: 'Subhanallah',
  allahakbar: 'Allahu Akbar',
  astagfirullah: 'Astaghfirullah',
  inshallah: 'Insha Allah',
  mashallah: 'Masha Allah',
  barakallahu: 'Barakallahu',

  // Time units
  minute: 'minute',
  minutes: 'minutes',
  hour: 'hour',
  hours: 'hours',
  day: 'day',
  days: 'days',
  week: 'week',
  weeks: 'weeks',
  month: 'month',
  months: 'months',
  today: 'today',
  yesterday: 'yesterday',
  tomorrow: 'tomorrow'
}

// Hook to get UI text based on current language
export const useUIText = () => {
  const { preferences } = usePreferencesStore()
  const isRTL = preferences.uiLanguage === 'ar'
  const text = isRTL ? arabicText : englishText
  
  // Fallback function to ensure we always return a string
  const getText = (key: keyof UIText): string => {
    const value = text[key]
    if (value) return value
    
    // Fallback to English if Arabic translation is missing
    if (isRTL && englishText[key]) {
      console.warn(`Missing Arabic translation for key: ${key}`)
      return englishText[key]
    }
    
    // Final fallback
    console.warn(`Missing translation for key: ${key} in both languages`)
    return key
  }
  
  return { 
    text: new Proxy(text, {
      get: (target, prop: string) => getText(prop as keyof UIText)
    }) as UIText, 
    isRTL, 
    currentLanguage: preferences.uiLanguage,
    getText
  }
}

// Function to get UI text for a specific language
export const getUIText = (language: 'ar' | 'en'): UIText => {
  return language === 'ar' ? arabicText : englishText
}

export { arabicText, englishText }
