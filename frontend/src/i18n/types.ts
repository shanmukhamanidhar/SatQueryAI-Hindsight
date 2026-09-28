export type LanguageCode = 
  | 'en' // English
  | 'te' // Telugu (తెలుగు)
  | 'hi' // Hindi (हिन्दी)
  | 'ta' // Tamil (தமிழ்)
  | 'kn' // Kannada (ಕನ್ನಡ)
  | 'ml' // Malayalam (മലയാളം)
  | 'mr' // Marathi (मराठी)
  | 'bn' // Bengali (বাংলা)
  | 'gu' // Gujarati (ગુજરાતી)
  | 'pa' // Punjabi (ਪੰਜਾਬੀ)
  | 'or' // Odia (ଓଡ଼ିଆ)
  | 'as' // Assamese (অসমীয়া)
  | 'ur'; // Urdu (اردو)

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  isRTL?: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', isRTL: true },
];

export interface TranslationDict {
  // Navigation
  'nav.home': string;
  'nav.studio': string;
  'nav.upload': string;
  'nav.environmental': string;
  'nav.hotspots': string;
  'nav.india': string;
  'nav.language': string;
  'nav.report': string;
  'nav.provenance': string;
  'nav.alerts': string;
  'nav.theme': string;

  // Hero Section
  'hero.badge': string;
  'hero.headline': string;
  'hero.subtitle': string;
  'hero.searchPlaceholder': string;
  'hero.searchBtn': string;
  'hero.liveStatus': string;

  // Environmental Categories
  'env.badge': string;
  'env.title': string;
  'env.subtitle': string;
  'env.vegTitle': string;
  'env.vegSub': string;
  'env.waterTitle': string;
  'env.waterSub': string;
  'env.urbanTitle': string;
  'env.urbanSub': string;
  'env.agriTitle': string;
  'env.agriSub': string;
  'env.analyzeBtn': string;
  'env.monitoredArea': string;
  'env.activeHotspots': string;

  // Hotspots Section
  'hotspots.badge': string;
  'hotspots.title': string;
  'hotspots.subtitle': string;
  'hotspots.inspectBtn': string;
  'hotspots.confidence': string;
  'hotspots.area': string;
  'hotspots.detectedIn': string;
  'hotspots.noHotspots': string;

  // Chatbot
  'chat.title': string;
  'chat.activeInvestigation': string;
  'chat.placeholder': string;
  'chat.send': string;
  'chat.analyzing': string;
  'chat.showOnMap': string;
  'chat.viewEvidence': string;
  'chat.whenHappened': string;
  'chat.why': string;
  'chat.newResponse': string;

  // Upload Studio
  'upload.title': string;
  'upload.subtitle': string;
  'upload.single': string;
  'upload.compare': string;
  'upload.multiple': string;
  'upload.dropImage': string;
  'upload.dropCompare1': string;
  'upload.dropCompare2': string;
  'upload.analyzeBtn': string;
  'upload.compareBtn': string;
  'upload.diffResults': string;

  // Map & Controls
  'map.alignedHotspots': string;
  'map.resetView': string;
  'map.timeMachine': string;
  'map.explainMap': string;
  'map.legendVegetation': string;
  'map.legendWater': string;
  'map.legendUrban': string;
  'map.legendAgriculture': string;
  'map.legendCritical': string;

  // Reports
  'report.title': string;
  'report.downloadPdf': string;
  'report.downloadMd': string;
  'report.close': string;

  // Common
  'common.loading': string;
  'common.error': string;
  'common.success': string;
  'common.baseline': string;
  'common.comparative': string;
}
