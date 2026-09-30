'use client';

/**
 * نظام الترجمة الموحّد لمنصة "سوف 360" — يدعم العربية والإنجليزية والفرنسية.
 * كل النصوص الظاهرة في الموقع تمرّ عبر هذا الملف حتى تُترجم تلقائياً بتبديل اللغة،
 * دون الحاجة لإعادة كتابة أي مكوّن عند إضافة لغة جديدة مستقبلاً.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Lang = 'ar' | 'en' | 'fr';

export const LANGUAGES: { code: Lang; label: string; dir: 'rtl' | 'ltr'; flag: string }[] = [
  { code: 'ar', label: 'العربية', dir: 'rtl', flag: '🇩🇿' },
  { code: 'en', label: 'English', dir: 'ltr', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', dir: 'ltr', flag: '🇫🇷' },
];

const STORAGE_KEY = 'ouedna.language';
const LEGACY_STORAGE_KEY = 'souf360_lang';

/* ============================= قاموس الترجمة ============================= */
/* كل مفتاح يحمل النسخ الثلاث. أضف مفتاحاً جديداً هنا فقط وسيظهر مترجماً في كل مكان يستعمله. */
export const dict = {
  // ------- التنقل العام -------
  home: { ar: 'الرئيسية', en: 'Home', fr: 'Accueil' },
  explore: { ar: 'استكشف', en: 'Explore', fr: 'Explorer' },
  map: { ar: 'الخريطة', en: 'Map', fr: 'Carte' },
  archive: { ar: 'ذاكرة الوادي', en: 'El Oued Memories', fr: "Mémoire d'El Oued" },
  community: { ar: 'المجتمع', en: 'Community', fr: 'Communauté' },
  favorites: { ar: 'المفضلة', en: 'Favorites', fr: 'Favoris' },
  downloadApp: { ar: 'حمّل التطبيق', en: 'Download app', fr: "Télécharger l'application" },
  events: { ar: 'الفعاليات', en: 'Events', fr: 'Événements' },
  restaurants: { ar: 'المطاعم', en: 'Restaurants', fr: 'Restaurants' },
  hotels: { ar: 'الفنادق', en: 'Hotels', fr: 'Hôtels' },
  landmarks: { ar: 'المعالم', en: 'Landmarks', fr: 'Sites' },
  brandTagline: { ar: 'دليلك الرقمي لاكتشاف مدينة الألف قبة وقبة', en: 'Your digital guide to the City of a Thousand Domes', fr: "Votre guide numérique de la ville aux mille coupoles" },

  // ------- Hero -------
  heroBadge: { ar: 'الجزائر — ولاية الوادي (السوف)', en: 'Algeria — El Oued Province (Souf)', fr: "Algérie — Wilaya d'El Oued (Souf)" },
  heroTitle1: { ar: 'اكتشف المعالم', en: 'Discover the Landmarks', fr: 'Découvrez les sites' },
  heroTitle2: { ar: 'مدينة الألف قبة', en: 'City of a Thousand Domes', fr: 'La ville aux mille coupoles' },
  heroDesc: {
    ar: 'دليلك الكامل لأجمل الوجهات في الوادي: قِباب أصيلة، غيطان نخيل، وكثبان ذهبية — كل معلم موثّق بصوره وموقعه على الخريطة.',
    en: 'Your complete guide to the finest destinations in El Oued: authentic domes, palm oases, and golden dunes — every landmark documented with photos and its location on the map.',
    fr: "Votre guide complet des plus belles destinations d'El Oued : coupoles authentiques, oasis de palmiers et dunes dorées — chaque site documenté avec photos et localisation sur la carte.",
  },
  statLandmarks: { ar: 'معالم موثّقة', en: 'Documented sites', fr: 'Sites documentés' },
  statMemories: { ar: 'ذكريات أرشيفية', en: 'Archive memories', fr: 'Souvenirs d\'archives' },
  statTestimonials: { ar: 'تجارب زوار', en: 'Visitor stories', fr: 'Témoignages' },
  statLive: { ar: 'محدّث باستمرار', en: 'Always updated', fr: 'Toujours à jour' },

  // ------- قسم المعالم -------
  destinationsEyebrow: { ar: 'الوجهات', en: 'Destinations', fr: 'Destinations' },
  discoverLandmarks: { ar: 'اكتشف المعالم', en: 'Discover the landmarks', fr: 'Découvrez les sites' },
  landmarksSubtitle: { ar: 'أروع الوجهات السياحية والتاريخية في ولاية الوادي', en: 'The finest tourist and historic destinations in El Oued', fr: "Les plus belles destinations touristiques et historiques d'El Oued" },
  searchPlaceholder: { ar: 'ابحث عن معلم بالاسم أو الوصف...', en: 'Search a landmark by name or description...', fr: 'Rechercher un site par nom ou description...' },
  categoryAll: { ar: 'الكل', en: 'All', fr: 'Tous' },
  noPlacesYet: { ar: 'لا توجد معالم مضافة حالياً.', en: 'No landmarks added yet.', fr: "Aucun site ajouté pour l'instant." },
  noSearchResults: { ar: 'لا توجد نتائج مطابقة لبحثك.', en: 'No results match your search.', fr: 'Aucun résultat pour votre recherche.' },
  viewDetailsNav: { ar: 'عرض التفاصيل والملاحة', en: 'View details & directions', fr: 'Voir détails & itinéraire' },
  showOnPlatformMap: { ar: 'إظهار على خريطة المنصة', en: 'Show on platform map', fr: 'Afficher sur la carte' },
  addToFavorites: { ar: 'إضافة إلى المفضلة', en: 'Add to favorites', fr: 'Ajouter aux favoris' },
  removeFromFavorites: { ar: 'إزالة من المفضلة', en: 'Remove from favorites', fr: 'Retirer des favoris' },

  // ------- نافذة المعلم -------
  close: { ar: 'إغلاق', en: 'Close', fr: 'Fermer' },
  previousImage: { ar: 'الصورة السابقة', en: 'Previous image', fr: 'Image précédente' },
  nextImage: { ar: 'الصورة التالية', en: 'Next image', fr: 'Image suivante' },
  swipeHint: { ar: 'مرّر يميناً أو يساراً لتصفّح الصور', en: 'Swipe left or right to browse photos', fr: 'Glissez pour parcourir les photos' },
  aboutLandmark: { ar: 'معلومات عن المعلم', en: 'About this landmark', fr: 'À propos de ce site' },
  showOnMap: { ar: 'إظهار على الخريطة', en: 'Show on map', fr: 'Afficher sur la carte' },
  shareLandmark: { ar: 'مشاركة المعلم', en: 'Share landmark', fr: 'Partager le site' },
  linkCopied: { ar: 'تم نسخ الرابط', en: 'Link copied', fr: 'Lien copié' },
  category: { ar: 'الفئة', en: 'Category', fr: 'Catégorie' },
  noDescription: { ar: 'لا يتوفر وصف لهذا المعلم حالياً.', en: 'No description available for this landmark yet.', fr: "Aucune description disponible pour ce site pour l'instant." },

  // ------- الذكريات -------
  archiveEyebrow: { ar: 'الأرشيف', en: 'Archive', fr: 'Archives' },
  oldMemories: { ar: 'ذكريات قديمة', en: 'Old memories', fr: 'Anciens souvenirs' },
  memoriesSubtitle: { ar: 'لمحات من الأرشيف تحكي وجه الوادي عبر الزمن', en: 'Glimpses from the archive telling the story of El Oued through time', fr: "Aperçus d'archives racontant le visage d'El Oued à travers le temps" },
  noMemoriesYet: { ar: 'لم تُضَف صور أرشيفية بعد.', en: 'No archive photos added yet.', fr: "Aucune photo d'archive ajoutée pour l'instant." },

  // ------- تعريف الولاية -------
  wilayaTitle: { ar: 'مدينة الألف قبة والأصالة العريقة', en: 'City of a Thousand Domes & Timeless Heritage', fr: 'La ville aux mille coupoles et au patrimoine ancestral' },
  wilayaDesc: {
    ar: 'تُعد ولاية الوادي (السوف) واحدة من أبرز الوجهات السياحية والثقافية في الجزائر، حيث تدمج بفرادة بين عبق التاريخ، وعمارة القباب التقليدية المميزة، وغيطان النخيل الممتدة، وسحر الكثبان الرملية الذهبية. إنها أرض الكرم والفلاحة الواحاتية.',
    en: 'El Oued Province (Souf) is one of the most prominent tourist and cultural destinations in Algeria, uniquely blending the scent of history, distinctive traditional dome architecture, sprawling palm oases, and the magic of golden sand dunes. It is a land of generosity and oasis agriculture.',
    fr: "La wilaya d'El Oued (Souf) est l'une des destinations touristiques et culturelles les plus marquantes d'Algérie, alliant avec singularité le parfum de l'histoire, une architecture traditionnelle de coupoles distinctive, de vastes oasis de palmiers et la magie des dunes dorées. C'est une terre de générosité et d'agriculture oasienne.",
  },

  // ------- تجارب الزوار -------
  communityEyebrow: { ar: 'المجتمع', en: 'Community', fr: 'Communauté' },
  visitorExperiences: { ar: 'تجارب الزوار', en: 'Visitor experiences', fr: 'Expériences des visiteurs' },
  experiencesSubtitle: { ar: 'قصص وذكريات يشاركها زوار ولاية الوادي', en: 'Stories and memories shared by visitors to El Oued', fr: "Histoires et souvenirs partagés par les visiteurs d'El Oued" },
  shareYourExperience: { ar: 'شارك تجربتك', en: 'Share your experience', fr: 'Partagez votre expérience' },
  beFirstToShare: { ar: 'كن أول من يشارك تجربته في ولاية الوادي!', en: 'Be the first to share your experience in El Oued!', fr: "Soyez le premier à partager votre expérience à El Oued !" },
  visitorFallbackName: { ar: 'زائر', en: 'Visitor', fr: 'Visiteur' },

  // ------- نافذة مشاركة التجربة -------
  shareModerationNote: { ar: 'تُعرض بعد مراجعة المشرفين.', en: 'Shown after moderator review.', fr: 'Publié après validation par un modérateur.' },
  yourNameOptional: { ar: 'اسمك الكريم (اختياري)', en: 'Your name (optional)', fr: 'Votre nom (facultatif)' },
  howWasYourTrip: { ar: 'كيف كانت رحلتك في الوادي؟', en: 'How was your trip to El Oued?', fr: 'Comment était votre voyage à El Oued ?' },
  attachPhotosOptional: { ar: 'أرفق صوراً (اختياري)', en: 'Attach photos (optional)', fr: 'Joindre des photos (facultatif)' },
  photosSelected: { ar: 'صورة مختارة', en: 'photos selected', fr: 'photos sélectionnées' },
  messageRequired: { ar: 'يرجى كتابة نص تجربتك أولاً.', en: 'Please write your experience first.', fr: "Veuillez d'abord rédiger votre expérience." },
  sendError: { ar: 'حدث خطأ أثناء إرسال تجربتك، حاول مرة أخرى.', en: 'An error occurred while sending your experience, please try again.', fr: "Une erreur s'est produite lors de l'envoi, veuillez réessayer." },
  sending: { ar: 'جارٍ الإرسال...', en: 'Sending...', fr: 'Envoi en cours...' },
  sendMyExperience: { ar: 'إرسال تجربتي', en: 'Send my experience', fr: 'Envoyer mon expérience' },
  thankYouForSharing: { ar: 'شكراً لمشاركتك!', en: 'Thank you for sharing!', fr: 'Merci pour votre partage !' },
  pendingReviewNote: { ar: 'تجربتك قيد المراجعة وستظهر قريباً.', en: 'Your experience is under review and will appear soon.', fr: 'Votre expérience est en cours de vérification et apparaîtra bientôt.' },

  // ------- التذييل -------
  footerDesc: {
    ar: 'المنصة السياحية الرسمية لوادي سوف — دليلك الرقمي لاكتشاف مدينة الألف قبة وقبة.',
    en: 'The official tourism platform for Souf — your digital guide to the City of a Thousand Domes.',
    fr: 'La plateforme touristique officielle de Souf — votre guide numérique de la ville aux mille coupoles.',
  },

  // ------- عام -------
  language: { ar: 'اللغة', en: 'Language', fr: 'Langue' },
  back: { ar: 'العودة', en: 'Back', fr: 'Retour' },
  primaryNavigation: { ar: 'التنقل الرئيسي', en: 'Primary navigation', fr: 'Navigation principale' },
  footerNavigation: { ar: 'روابط الموقع', en: 'Footer navigation', fr: 'Navigation du pied de page' },
  privacy: { ar: 'الخصوصية', en: 'Privacy', fr: 'Confidentialité' },
  contactUs: { ar: 'تواصل معنا', en: 'Contact us', fr: 'Nous contacter' },
  footerTrusted: { ar: 'محتوى محلي موثوق ومراجع', en: 'Trusted, reviewed local content', fr: 'Contenu local fiable et vérifié' },
  allRightsReserved: { ar: 'جميع الحقوق محفوظة.', en: 'All rights reserved.', fr: 'Tous droits réservés.' },
  exploreBrand: { ar: 'وادنا · الدليل السياحي الرسمي', en: 'Ouedna · Official tourism guide', fr: 'Ouedna · Guide touristique officiel' },
  exploreBadge: { ar: 'اكتشف الوادي', en: 'Discover El Oued', fr: 'Découvrez El Oued' },
  exploreWelcomeTitle: { ar: 'مرحباً بك في', en: 'Welcome to', fr: 'Bienvenue au' },
  exploreWelcomeTitleAccent: { ar: 'قلب الصحراء', en: 'the heart of the desert', fr: 'cœur du désert' },
  exploreWelcomeDescription: { ar: 'من القباب التاريخية إلى الواحات الخضراء وسط الرمال الذهبية. خطط رحلتك واكتشف الأماكن التي تهمك.', en: 'From historic domes to green oases among golden dunes. Plan your journey and discover the places that matter to you.', fr: 'Des coupoles historiques aux oasis verdoyantes au milieu des dunes dorées. Planifiez votre voyage et découvrez les lieux qui vous ressemblent.' },
  startExploring: { ar: 'ابدأ الاستكشاف', en: 'Start exploring', fr: 'Commencer l’exploration' },
  interactiveMap: { ar: 'الخريطة التفاعلية', en: 'Interactive map', fr: 'Carte interactive' },
  itinerary: { ar: 'خط رحلتي', en: 'My itinerary', fr: 'Mon itinéraire' },
  itineraryDesc: { ar: 'خطط يومك بسهولة', en: 'Plan your day easily', fr: 'Planifiez votre journée' },
  archiveMemories: { ar: 'أرشيف وذكريات', en: 'Archive & memories', fr: 'Archives et souvenirs' },
  archiveDesc: { ar: 'اكتشف تاريخ وادي سوف', en: 'Discover Souf history', fr: 'Découvrez l’histoire du Souf' },
  mapDesc: { ar: 'مسارات سياحية دقيقة', en: 'Accurate tourism routes', fr: 'Itinéraires touristiques précis' },
  suggestLandmark: { ar: 'اقترح معلماً', en: 'Suggest a landmark', fr: 'Suggérer un site' },
  suggestDesc: { ar: 'أضف مكاناً للدليل', en: 'Add a place to the guide', fr: 'Ajouter un lieu au guide' },
  virtualVisit: { ar: 'زيارة افتراضية', en: 'Virtual visit', fr: 'Visite virtuelle' },
  beforeYourVisit: { ar: 'شاهد المعالم قبل الزيارة.', en: 'See the landmarks before your visit.', fr: 'Découvrez les sites avant votre visite.' },
  showLandmarks: { ar: 'عرض المعالم', en: 'Show landmarks', fr: 'Voir les sites' },
  exploreDirectory: { ar: 'دليل وادنا', en: 'Ouedna guide', fr: 'Guide Ouedna' },
  exploreDirectoryTitle: { ar: 'اكتشف الأماكن التي تشبهك.', en: 'Discover places that suit you.', fr: 'Découvrez les lieux qui vous ressemblent.' },
  exploreDirectoryDescription: { ar: 'ابحث عن معلمك القادم واحفظه ضمن رحلتك.', en: 'Find your next landmark and save it to your journey.', fr: 'Trouvez votre prochain site et ajoutez-le à votre voyage.' },
  availableLandmarks: { ar: 'معلم متاح', en: 'landmarks available', fr: 'sites disponibles' },
  exploreSearchPlaceholder: { ar: 'ابحث عن معلم، واحة، سوق...', en: 'Search a landmark, oasis, or market...', fr: 'Rechercher un site, une oasis ou un marché...' },
  filterByInterest: { ar: 'تصفية حسب الاهتمام', en: 'Filter by interest', fr: 'Filtrer par intérêt' },
  tour360: { ar: '360°', en: '360°', fr: '360°' },
  openMap: { ar: 'افتح الخريطة', en: 'Open map', fr: 'Ouvrir la carte' },
  newPlace: { ar: 'جديد', en: 'New', fr: 'Nouveau' },
  noExploreResults: { ar: 'لا توجد نتائج بهذا البحث', en: 'No results for this search', fr: 'Aucun résultat pour cette recherche' },
  tryAnotherFilter: { ar: 'جرّب تصنيفاً آخر أو اكتب كلمة بحث مختلفة.', en: 'Try another category or search term.', fr: 'Essayez une autre catégorie ou un autre terme.' },
  resetFilters: { ar: 'إعادة التصفية', en: 'Reset filters', fr: 'Réinitialiser les filtres' },
  unknownLandmark: { ar: 'معلم من وادي سوف', en: 'Souf landmark', fr: 'Site du Souf' },
  suggestPrompt: { ar: 'تعرف معلماً غير موجود؟', en: 'Know a landmark we missed?', fr: 'Vous connaissez un site absent ?' },
  suggestPromptDesc: { ar: 'ساعدنا في إثراء دليل وادنا المحلي.', en: 'Help us enrich the local Ouedna guide.', fr: 'Aidez-nous à enrichir le guide local Ouedna.' },
  saved: { ar: 'محفوظ', en: 'Saved', fr: 'Enregistré' },
  publishedAfterReview: { ar: 'تجارب منشورة بعد المراجعة', en: 'Experiences published after review', fr: 'Expériences publiées après vérification' },
  inspireYou: { ar: 'تجارب تلهمك.', en: 'Experiences to inspire you.', fr: 'Des expériences pour vous inspirer.' },
  experienceCount: { ar: 'تجربة', en: 'experiences', fr: 'expériences' },
  shareJourney: { ar: 'شارك أثراً من رحلتك', en: 'Share a trace of your journey', fr: 'Partagez une trace de votre voyage' },
  reviewBeforePublish: { ar: 'ستُراجع التجربة قبل نشرها حفاظاً على جودة الدليل.', en: 'Your experience will be reviewed before publication.', fr: 'Votre expérience sera vérifiée avant publication.' },
  firstShareTitle: { ar: 'كن أول من يشارك', en: 'Be the first to share', fr: 'Soyez le premier à partager' },
  firstShareDescription: { ar: 'لا توجد تجارب منشورة بعد. اترك أثراً صادقاً للزائر التالي.', en: 'No experiences have been published yet. Leave an honest trace for the next visitor.', fr: 'Aucune expérience publiée. Laissez un témoignage sincère au prochain visiteur.' },
  thankYou: { ar: 'شكراً لمشاركتك.', en: 'Thank you for sharing.', fr: 'Merci pour votre partage.' },
  receivedForReview: { ar: 'وصلت تجربتك إلى الإدارة للمراجعة.', en: 'Your experience has been sent for review.', fr: 'Votre expérience a été envoyée pour vérification.' },
  addAnother: { ar: 'إضافة تجربة أخرى', en: 'Add another experience', fr: 'Ajouter une autre expérience' },
  nameOptional: { ar: 'الاسم (اختياري)', en: 'Name (optional)', fr: 'Nom (facultatif)' },
  yourExperience: { ar: 'تجربتك *', en: 'Your experience *', fr: 'Votre expérience *' },
  namePlaceholder: { ar: 'اسمك', en: 'Your name', fr: 'Votre nom' },
  experiencePlaceholder: { ar: 'ما الذي ترك أثراً في رحلتك؟', en: 'What left an impression on your journey?', fr: 'Qu’est-ce qui vous a marqué pendant votre voyage ?' },
  visitorPhotoAlt: { ar: 'صورة من تجربة زائر', en: 'Photo from a visitor experience', fr: 'Photo d’une expérience visiteur' },
  attachPhotos: { ar: 'أرفق صوراً (اختياري)', en: 'Attach photos (optional)', fr: 'Joindre des photos (facultatif)' },
  submitForReview: { ar: 'إرسال للمراجعة', en: 'Submit for review', fr: 'Envoyer pour vérification' },

  // ------- صفحة الخريطة -------
  mapSearchPlaceholder: { ar: 'ابحث عن معلم، فندق، مطعم...', en: 'Search a landmark, hotel, restaurant...', fr: 'Rechercher un site, un hôtel, un restaurant...' },
  mapNoResults: { ar: 'لا توجد نتائج مطابقة', en: 'No matching results', fr: 'Aucun résultat trouvé' },
  emergencyServices: { ar: 'الطوارئ والخدمات', en: 'Emergency & services', fr: 'Urgences & services' },
  emergencyTitle: { ar: 'أرقام الطوارئ والخدمات', en: 'Emergency & service numbers', fr: "Numéros d'urgence et services" },
  civilProtection: { ar: 'الحماية المدنية', en: 'Civil protection', fr: 'Protection civile' },
  police: { ar: 'الشرطة (الأمن الوطني)', en: 'Police (National Security)', fr: 'Police (Sûreté nationale)' },
  gendarmerie: { ar: 'الدرك الوطني', en: 'National Gendarmerie', fr: 'Gendarmerie nationale' },
  loadingMap: { ar: 'جاري تحميل خريطة سوف 360 التفاعلية...', en: 'Loading the interactive Souf 360 map...', fr: 'Chargement de la carte interactive Souf 360...' },
  categoryRestaurants: { ar: 'المطاعم', en: 'Restaurants', fr: 'Restaurants' },
  categoryHotels: { ar: 'الفنادق', en: 'Hotels', fr: 'Hôtels' },
  categoryLandmarks: { ar: 'معالم سياحية', en: 'Tourist sites', fr: 'Sites touristiques' },
  categoryServices: { ar: 'خدمات', en: 'Services', fr: 'Services' },
  noImageAvailable: { ar: 'لا توجد صورة متاحة', en: 'No image available', fr: 'Aucune image disponible' },
  saveLandmark: { ar: 'حفظ المعلم', en: 'Save landmark', fr: 'Enregistrer le site' },
  startNavigation: { ar: 'ابدأ الملاحة', en: 'Start navigation', fr: 'Démarrer la navigation' },
  viewRouteHere: { ar: 'عرض المسار إلى هنا', en: 'Show route here', fr: "Afficher l'itinéraire" },
  dayMode: { ar: 'الوضع النهاري', en: 'Day mode', fr: 'Mode jour' },
  nightMode: { ar: 'الوضع الليلي', en: 'Night mode', fr: 'Mode nuit' },
  tripDetails: { ar: 'تفاصيل الرحلة', en: 'Trip details', fr: 'Détails du trajet' },
  collapsePanel: { ar: 'طي اللوحة لرؤية الخريطة', en: 'Collapse panel to see the map', fr: 'Réduire le panneau pour voir la carte' },
  expandPanel: { ar: 'بسط لوحة تفاصيل الرحلة', en: 'Expand trip details panel', fr: 'Développer le panneau du trajet' },
  route: { ar: 'المسار', en: 'Route', fr: 'Itinéraire' },
  refreshLocation: { ar: 'تحديث موقعك الحالي', en: 'Refresh your current location', fr: 'Actualiser votre position' },
  yourCurrentLocation: { ar: 'موقعك الحالي', en: 'Your current location', fr: 'Votre position actuelle' },
  travelMode: { ar: 'نوع التنقل', en: 'Travel mode', fr: 'Mode de transport' },
  byCar: { ar: 'سيارة', en: 'Car', fr: 'Voiture' },
  byFoot: { ar: 'مشياً', en: 'On foot', fr: 'À pied' },
  calculatingRoute: { ar: 'جاري حساب المسار الأدق عبر الطرق...', en: 'Calculating the most accurate route...', fr: "Calcul de l'itinéraire le plus précis..." },
  retry: { ar: 'إعادة المحاولة', en: 'Retry', fr: 'Réessayer' },
  turns: { ar: 'المنعطفات', en: 'Turns', fr: 'Virages' },
  estimatedTime: { ar: 'الوقت المتوقع', en: 'Estimated time', fr: 'Temps estimé' },
  distance: { ar: 'المسافة', en: 'Distance', fr: 'Distance' },
  estimatedRouteNote: { ar: 'مسار تقديري (خط مباشر) — قد يختلف قليلاً عن الطريق الفعلي', en: 'Estimated route (straight line) — may differ slightly from the actual road', fr: "Itinéraire estimé (ligne directe) — peut différer légèrement de la route réelle" },
  directions: { ar: 'تعليمات الطريق', en: 'Directions', fr: 'Instructions' },
  stopTracking: { ar: 'إيقاف التتبع', en: 'Stop tracking', fr: 'Arrêter le suivi' },
  startTrip: { ar: 'بدء الرحلة', en: 'Start trip', fr: 'Démarrer le trajet' },
  endNavigation: { ar: 'إنهاء الملاحة', en: 'End navigation', fr: 'Terminer la navigation' },
  minutesShort: { ar: 'د', en: 'min', fr: 'min' },
  kmShort: { ar: 'كم', en: 'km', fr: 'km' },

  // ------- الصفحة الرئيسية (Hero) -------
  homeBadge: { ar: 'المنصة السياحية الرسمية', en: 'The official tourism platform', fr: 'La plateforme touristique officielle' },
  homeTitle: { ar: 'وادنا', en: 'Ouedna', fr: 'Ouedna' },
  homeTagline: { ar: 'قلب الصحراء ينبض هنا', en: 'The desert’s heart beats here', fr: 'Ici bat le cœur du désert' },
  homeIntro: {
    ar: 'مرحباً بك في وادنا، منصتك لاكتشاف كنوز وادي سوف. من القباب التاريخية إلى الواحات الخضراء وسط الرمال الذهبية، خطط لرحلتك واستكشف الأماكن التي تهمك.',
    en: 'Welcome to Ouedna, your platform to discover the treasures of Wadi Souf. From historic domes to green oases amid golden sands, plan your trip and explore the places that matter to you.',
    fr: 'Bienvenue sur Ouedna, votre plateforme pour découvrir les trésors du Souf. Des coupoles historiques aux oasis vertes au milieu des sables dorés, planifiez votre voyage et explorez les lieux qui vous intéressent.',
  },
  homeFeatTrip: { ar: 'خط رحلتي', en: 'My trip planner', fr: 'Mon itinéraire' },
  homeFeatArchive: { ar: 'أرشيف وذكريات وادي سوف التاريخية', en: 'Historic archive and memories of Wadi Souf', fr: 'Archives et souvenirs historiques du Souf' },
  homeFeatMaps: { ar: 'خرائط تفاعلية ومسارات سياحية دقيقة', en: 'Interactive maps and precise tourist routes', fr: 'Cartes interactives et itinéraires touristiques précis' },
  homeCta: { ar: 'ابدأ رحلة الاستكشاف', en: 'Start exploring', fr: 'Commencer l’exploration' },
  homeGuest: { ar: 'دخول مباشر كزائر', en: 'Continue as a guest', fr: 'Continuer en tant qu’invité' },
  vrTour: { ar: 'زيارة افتراضية VR', en: 'Virtual visit VR', fr: 'Visite virtuelle VR' },
  vrEmpty: { ar: 'لا توجد معالم بصور بعد. أضف صور المعالم من لوحة التحكم لتظهر هنا تلقائياً.', en: 'No landmarks with photos yet. Add photos from the dashboard and they will appear here automatically.', fr: 'Aucun site avec photos pour le moment. Ajoutez des photos depuis le tableau de bord.' },
  vrHint: { ar: 'اسحب للتجول داخل الصورة', en: 'Drag to look around', fr: 'Faites glisser pour explorer' },
  vrGyro: { ar: 'التحكم بحركة الهاتف', en: 'Phone motion control', fr: 'Contrôle par mouvement' },
  vrGoggles: { ar: 'وضع نظارة VR', en: 'VR headset mode', fr: 'Mode casque VR' },
  vrFullscreen: { ar: 'ملء الشاشة', en: 'Fullscreen', fr: 'Plein écran' },
  vrExit: { ar: 'خروج', en: 'Exit', fr: 'Quitter' },
  vrZoomIn: { ar: 'تكبير', en: 'Zoom in', fr: 'Zoom avant' },
  vrZoomOut: { ar: 'تصغير', en: 'Zoom out', fr: 'Zoom arrière' },
  vrPano: { ar: 'جولة 360° حقيقية', en: 'True 360° tour', fr: 'Vrai tour 360°' },
  vrDetails: { ar: 'تفاصيل المعلم', en: 'Landmark details', fr: 'Détails du site' },
  vrPrev: { ar: 'السابق', en: 'Previous', fr: 'Précédent' },
  vrNext: { ar: 'التالي', en: 'Next', fr: 'Suivant' },
  vrPause: { ar: 'إيقاف مؤقت', en: 'Pause', fr: 'Pause' },
  vrPlay: { ar: 'تشغيل الجولة', en: 'Play tour', fr: 'Lancer la visite' },
  homeFeatVr: { ar: 'زيارة افتراضية VR لمعالم الوادي', en: 'Virtual VR visit of the landmarks', fr: 'Visite virtuelle VR des sites' },
} as const;

export type DictKey = keyof typeof dict;

/* ============================= السياق (Context) ============================= */
type LanguageContextValue = {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  setLang: (l: Lang) => void;
  t: (key: DictKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children, initialLang = 'ar' }: { children: React.ReactNode; initialLang?: Lang }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    try {
      const saved = (window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(LEGACY_STORAGE_KEY)) as Lang | null;
      if (saved && LANGUAGES.some((l) => l.code === saved)) {
        if (saved !== initialLang) queueMicrotask(() => setLangState(saved));
        window.localStorage.setItem(STORAGE_KEY, saved);
      }
    } catch {
      // تجاهل أي خطأ فالقراءة من التخزين المحلي
    }
  }, [initialLang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
      document.cookie = `${STORAGE_KEY}=${l}; Path=/; Max-Age=31536000; SameSite=Lax`;
    } catch {
      // تجاهل أي خطأ فالكتابة
    }
  }, []);

  const dir = LANGUAGES.find((l) => l.code === lang)?.dir || 'rtl';

  const t = useCallback(
    (key: DictKey) => {
      const entry = dict[key];
      if (!entry) return String(key);
      return entry[lang] || entry.ar;
    },
    [lang]
  );

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try {
      document.cookie = `${STORAGE_KEY}=${lang}; Path=/; Max-Age=31536000; SameSite=Lax`;
    } catch {
      // Cookie persistence is best-effort.
    }
  }, [lang, dir]);

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}

/* ============================= ترجمة آلية لمحتوى قاعدة البيانات ============================= */
/* أسماء/أوصاف المعالم والذكريات والتجارب تأتي من قاعدة البيانات بالعربية فقط.
   نستعمل خدمة ترجمة مجانية (MyMemory) لترجمتها آلياً عند تبديل اللغة، مع تخزين مؤقت (cache)
   محلي حتى لا تتكرر نفس طلبات الترجمة، ومع رجوع فوري للنص الأصلي أثناء الانتظار أو عند الفشل. */
const translationCache = new Map<string, string>();

export async function autoTranslate(text: string, targetLang: Lang): Promise<string> {
  if (!text || !text.trim() || targetLang === 'ar') return text;

  const cacheKey = `${targetLang}:${text}`;
  if (translationCache.has(cacheKey)) return translationCache.get(cacheKey)!;

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ar|${targetLang}`
    );
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (translated && typeof translated === 'string') {
      translationCache.set(cacheKey, translated);
      return translated;
    }
  } catch {
    // فشل الاتصال بخدمة الترجمة — نعيد النص الأصلي دون كسر الواجهة
  }
  return text;
}

/**
 * Hook لترجمة نص ديناميكي (قادم من قاعدة البيانات) آلياً حسب اللغة الحالية.
 * يعيد النص الأصلي فوراً، ثم يحدّثه بالنص المترجم بمجرد وصوله (تجربة استخدام سلسة دون وميض فارغ).
 */
export function useAutoTranslate(text?: string | null): string {
  const { lang } = useLanguage();
  const [translated, setTranslated] = useState(() => lang === 'ar' ? text || '' : '…');

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setTranslated(lang === 'ar' ? text || '' : '…');
    });
    if (!text || lang === 'ar') return;
    autoTranslate(text, lang).then((res) => {
      if (!cancelled) setTranslated(res);
    });
    return () => {
      cancelled = true;
    };
  }, [text, lang]);

  return translated;
}
