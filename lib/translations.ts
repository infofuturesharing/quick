export type Language = "en" | "tr" | "de"

export const translations = {
  en: {
    // Search page
    title: "QuickContact",
    subtitle: "Find business contact info instantly",
    locationPlaceholder: "Location (e.g., Manhattan, New York)",
    keywordPlaceholder: "Keyword (e.g., Dentist, Restaurant)",
    searchButton: "Search",
    searching: "Searching...",
    startSearch: "Start Your Search",
    startSearchDesc: "Enter a location and keyword to find business contact information",
    recentReviews: "Recent Reviews",
    noResults: "No businesses found. Try different search terms.",
    errorMessage: "Something went wrong. Please try again.",
    errorBothFields: "Please enter both location and keyword",
    loadingMap: "Loading map...",
    mapError: "Failed to load map. Please check your API key.",
    phone: "Phone",
    availability: "Availability",

    // Landing page
    heroTag: "Fast & Accurate Business Search",
    heroTitle: "Find Any Business Contact Information in Seconds",
    heroSubtitle:
      "Search millions of businesses worldwide and get instant access to phone numbers, addresses, websites, and reviews.",
    getStarted: "Get Started",
    howItWorks: "How It Works",

    // Stats
    statBusinesses: "Businesses",
    statSpeed: "Search Time",
    statAvailable: "Available",

    // Features
    featuresTitle: "Why Choose QuickContact?",
    featuresSubtitle: "Everything you need to find and connect with businesses instantly",
    featureSearchTitle: "Smart Search",
    featureSearchDesc: "Find any business with just a location and keyword",
    featureSearchDetails:
      "Our advanced search algorithm scans millions of businesses to find exactly what you're looking for. Simply enter a location and what you're searching for, and get instant results with complete contact information.",
    featureMapTitle: "Interactive Maps",
    featureMapDesc: "See business locations on an interactive map",
    featureMapDetails:
      "Visualize search results on an interactive Google Map. Click on any business to see its exact location, get directions, and explore nearby alternatives. Perfect for planning your visits.",
    featureSpeedTitle: "Lightning Fast",
    featureSpeedDesc: "Get results in under 2 seconds",
    featureSpeedDetails:
      "Our optimized infrastructure ensures you get search results almost instantly. No more waiting around - find the information you need and move on with your day.",
    learnMore: "Learn more",

    // How it works
    howItWorksTitle: "How It Works",
    howItWorksSubtitle: "Get started in three simple steps",
    step1Title: "Enter Location & Keyword",
    step1Desc:
      "Type in where you're looking and what type of business you need. For example: 'Manhattan, New York' and 'Italian Restaurant'",
    step2Title: "Browse Results",
    step2Desc:
      "Instantly see a list of matching businesses with phone numbers, addresses, websites, ratings, and customer reviews.",
    step3Title: "Connect & Visit",
    step3Desc:
      "Click to call, visit their website, or get directions on the map. All the information you need in one place.",

    // Contact
    contactTitle: "Get in Touch",
    contactSubtitle: "Have questions? We're here to help 24/7",

    // CTA
    ctaTitle: "Ready to Find What You're Looking For?",
    ctaSubtitle: "Join thousands of users who find business information faster with QuickContact",
    startSearching: "Start Searching Now",

    // Footer
    footerRights: "All rights reserved.",
  },
  tr: {
    // Search page
    title: "QuickContact",
    subtitle: "İşletme iletişim bilgilerini anında bulun",
    locationPlaceholder: "Konum (örn: Kadıköy, İstanbul)",
    keywordPlaceholder: "Anahtar kelime (örn: Dişçi, Restoran)",
    searchButton: "Ara",
    searching: "Aranıyor...",
    startSearch: "Aramaya Başlayın",
    startSearchDesc: "İşletme iletişim bilgilerini bulmak için konum ve anahtar kelime girin",
    recentReviews: "Son Yorumlar",
    noResults: "İşletme bulunamadı. Farklı arama terimleri deneyin.",
    errorMessage: "Bir şeyler yanlış gitti. Lütfen tekrar deneyin.",
    errorBothFields: "Lütfen hem konum hem de anahtar kelime girin",
    loadingMap: "Harita yükleniyor...",
    mapError: "Harita yüklenemedi. Lütfen API anahtarınızı kontrol edin.",
    phone: "Telefon",
    availability: "Erişilebilirlik",

    // Landing page
    heroTag: "Hızlı ve Doğru İşletme Arama",
    heroTitle: "Herhangi Bir İşletmenin İletişim Bilgilerini Saniyeler İçinde Bulun",
    heroSubtitle:
      "Dünya çapında milyonlarca işletmeyi arayın ve telefon numaralarına, adreslere, web sitelerine ve yorumlara anında erişin.",
    getStarted: "Başlayın",
    howItWorks: "Nasıl Çalışır",

    // Stats
    statBusinesses: "İşletme",
    statSpeed: "Arama Süresi",
    statAvailable: "Erişilebilir",

    // Features
    featuresTitle: "Neden QuickContact?",
    featuresSubtitle: "İşletmeleri anında bulmak ve bağlantı kurmak için ihtiyacınız olan her şey",
    featureSearchTitle: "Akıllı Arama",
    featureSearchDesc: "Sadece konum ve anahtar kelime ile herhangi bir işletmeyi bulun",
    featureSearchDetails:
      "Gelişmiş arama algoritmamız, tam olarak aradığınızı bulmak için milyonlarca işletmeyi tarar. Sadece bir konum ve ne aradığınızı girin, tam iletişim bilgileriyle anında sonuçlar alın.",
    featureMapTitle: "İnteraktif Haritalar",
    featureMapDesc: "İşletme konumlarını interaktif haritada görün",
    featureMapDetails:
      "Arama sonuçlarını interaktif Google Haritası üzerinde görselleştirin. Tam konumunu görmek, yol tarifi almak ve yakındaki alternatifleri keşfetmek için herhangi bir işletmeye tıklayın.",
    featureSpeedTitle: "Yıldırım Hızı",
    featureSpeedDesc: "2 saniyeden kısa sürede sonuç alın",
    featureSpeedDetails:
      "Optimize edilmiş altyapımız, arama sonuçlarını neredeyse anında almanızı sağlar. Artık beklemeye gerek yok - ihtiyacınız olan bilgiyi bulun ve gününüze devam edin.",
    learnMore: "Daha fazla bilgi",

    // How it works
    howItWorksTitle: "Nasıl Çalışır",
    howItWorksSubtitle: "Üç basit adımda başlayın",
    step1Title: "Konum ve Anahtar Kelime Girin",
    step1Desc:
      "Nerede aradığınızı ve ne tür bir işletmeye ihtiyacınız olduğunu yazın. Örneğin: 'Kadıköy, İstanbul' ve 'İtalyan Restoranı'",
    step2Title: "Sonuçlara Göz Atın",
    step2Desc:
      "Telefon numaraları, adresler, web siteleri, puanlar ve müşteri yorumlarıyla eşleşen işletmelerin listesini anında görün.",
    step3Title: "Bağlanın ve Ziyaret Edin",
    step3Desc:
      "Aramak için tıklayın, web sitelerini ziyaret edin veya haritadan yol tarifi alın. İhtiyacınız olan tüm bilgiler tek bir yerde.",

    // Contact
    contactTitle: "İletişime Geçin",
    contactSubtitle: "Sorularınız mı var? 7/24 yardıma hazırız",

    // CTA
    ctaTitle: "Aradığınızı Bulmaya Hazır mısınız?",
    ctaSubtitle: "QuickContact ile işletme bilgilerini daha hızlı bulan binlerce kullanıcıya katılın",
    startSearching: "Şimdi Aramaya Başlayın",

    // Footer
    footerRights: "Tüm hakları saklıdır.",
  },
  de: {
    // Search page
    title: "QuickContact",
    subtitle: "Finden Sie sofort Geschäftskontaktinformationen",
    locationPlaceholder: "Standort (z.B. Mitte, Berlin)",
    keywordPlaceholder: "Stichwort (z.B. Zahnarzt, Restaurant)",
    searchButton: "Suchen",
    searching: "Suche läuft...",
    startSearch: "Suche starten",
    startSearchDesc: "Geben Sie einen Standort und ein Stichwort ein, um Geschäftskontaktinformationen zu finden",
    recentReviews: "Aktuelle Bewertungen",
    noResults: "Keine Unternehmen gefunden. Versuchen Sie andere Suchbegriffe.",
    errorMessage: "Etwas ist schief gelaufen. Bitte versuchen Sie es erneut.",
    errorBothFields: "Bitte geben Sie sowohl Standort als auch Stichwort ein",
    loadingMap: "Karte wird geladen...",
    mapError: "Karte konnte nicht geladen werden. Bitte überprüfen Sie Ihren API-Schlüssel.",
    phone: "Telefon",
    availability: "Verfügbarkeit",

    // Landing page
    heroTag: "Schnelle und genaue Unternehmenssuche",
    heroTitle: "Finden Sie jede Geschäftskontaktinformation in Sekunden",
    heroSubtitle:
      "Durchsuchen Sie Millionen von Unternehmen weltweit und erhalten Sie sofortigen Zugriff auf Telefonnummern, Adressen, Websites und Bewertungen.",
    getStarted: "Loslegen",
    howItWorks: "Wie es funktioniert",

    // Stats
    statBusinesses: "Unternehmen",
    statSpeed: "Suchzeit",
    statAvailable: "Verfügbar",

    // Features
    featuresTitle: "Warum QuickContact?",
    featuresSubtitle: "Alles, was Sie brauchen, um Unternehmen sofort zu finden und zu kontaktieren",
    featureSearchTitle: "Intelligente Suche",
    featureSearchDesc: "Finden Sie jedes Unternehmen mit nur einem Standort und Stichwort",
    featureSearchDetails:
      "Unser fortschrittlicher Suchalgorithmus durchsucht Millionen von Unternehmen, um genau das zu finden, wonach Sie suchen. Geben Sie einfach einen Standort und ein Stichwort ein und erhalten Sie sofortige Ergebnisse mit vollständigen Kontaktinformationen.",
    featureMapTitle: "Interaktive Karten",
    featureMapDesc: "Sehen Sie Unternehmensstandorte auf einer interaktiven Karte",
    featureMapDetails:
      "Visualisieren Sie Suchergebnisse auf einer interaktiven Google-Karte. Klicken Sie auf ein beliebiges Unternehmen, um seinen genauen Standort zu sehen, Wegbeschreibungen zu erhalten und Alternativen in der Nähe zu erkunden.",
    featureSpeedTitle: "Blitzschnell",
    featureSpeedDesc: "Erhalten Sie Ergebnisse in unter 2 Sekunden",
    featureSpeedDetails:
      "Unsere optimierte Infrastruktur stellt sicher, dass Sie Suchergebnisse fast sofort erhalten. Kein Warten mehr - finden Sie die Informationen, die Sie benötigen, und machen Sie weiter.",
    learnMore: "Mehr erfahren",

    // How it works
    howItWorksTitle: "Wie es funktioniert",
    howItWorksSubtitle: "Beginnen Sie in drei einfachen Schritten",
    step1Title: "Standort und Stichwort eingeben",
    step1Desc:
      "Geben Sie ein, wo Sie suchen und welche Art von Unternehmen Sie benötigen. Zum Beispiel: 'Mitte, Berlin' und 'Italienisches Restaurant'",
    step2Title: "Ergebnisse durchsuchen",
    step2Desc:
      "Sehen Sie sofort eine Liste übereinstimmender Unternehmen mit Telefonnummern, Adressen, Websites, Bewertungen und Kundenbewertungen.",
    step3Title: "Verbinden und besuchen",
    step3Desc:
      "Klicken Sie zum Anrufen, besuchen Sie ihre Website oder erhalten Sie Wegbeschreibungen auf der Karte. Alle Informationen, die Sie benötigen, an einem Ort.",

    // Contact
    contactTitle: "Kontakt aufnehmen",
    contactSubtitle: "Haben Sie Fragen? Wir sind rund um die Uhr für Sie da",

    // CTA
    ctaTitle: "Bereit, das zu finden, wonach Sie suchen?",
    ctaSubtitle:
      "Schließen Sie sich Tausenden von Benutzern an, die mit QuickContact schneller Geschäftsinformationen finden",
    startSearching: "Jetzt suchen",

    // Footer
    footerRights: "Alle Rechte vorbehalten.",
  },
}

export function getTranslation(lang: Language) {
  return translations[lang]
}
