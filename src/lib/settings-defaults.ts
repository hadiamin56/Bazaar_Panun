// Everything on the website that can be changed from Admin → Settings.
// These are the starting values; whatever is saved in the admin replaces them.

export const defaultSettings = {
  store: {
    name: "Bazaar Panun",
    tagline: "Kashmir's Finest Fabric & Suits",
    logo: "/brand/logo.svg",
    announcement: "Free shipping on orders above ₹5,000  •  Cash on Delivery available",
    whatsappNumber: "918491029071",
    whatsappMessage: "Hi! I'm interested in your collection at Bazaar Panun.",
    instagramUrl: "https://instagram.com/bazaarpanun",
    instagramHandle: "@bazaarpanun",
    email: "hello@bazaarpanun.com",
    address: "Kashmir, India",
    footerAbout: "Kashmir's Finest Fabric & Suits. Bringing authentic Kashmiri craftsmanship to your wardrobe.",
    footerNote: "No Exchange / No Return on unstitched fabric.",
    seoTitle: "Bazaar Panun | Kashmir's Finest Fabric & Suits",
    seoDescription:
      "Shop authentic Kashmiri fabric, unstitched & stitched suits, bridal wear, pashmina shawls and clutches at Bazaar Panun.",
  },
  checkout: {
    shippingFee: 150,
    freeShippingThreshold: 5000,
    codEnabled: true,
    whatsappOrderEnabled: true,
  },
  home: {
    heroBadge: "Kashmir Based Online Store",
    heroTitle: "Timeless Fabric & Suits, Woven With Tradition",
    heroSubtitle: "Discover handpicked brocade, bridal wear, pashmina shawls and designer suits — crafted for every occasion.",
    heroImage: "/brand/hero.svg",
    heroPrimaryLabel: "Shop Collection",
    heroPrimaryLink: "/shop",
    heroSecondaryLabel: "Bridal Collection",
    heroSecondaryLink: "/shop?category=bridal-wear",
    showBadges: true,
    badges: [
      { title: "Pan-India Delivery", text: "Free shipping above ₹5,000" },
      { title: "Authentic Craftsmanship", text: "Sourced directly from Kashmir" },
      { title: "Cash on Delivery", text: "Pay when your order arrives" },
    ],
    showCategories: true,
    categoriesTitle: "Shop by Category",
    categoriesSubtitle: "Explore our curated collections",
    showFeatured: true,
    featuredTitle: "Featured Pieces",
    featuredSubtitle: "Handpicked favourites from our collection",
    showNewArrivals: true,
    newArrivalsTitle: "New Arrivals",
    newArrivalsSubtitle: "Fresh off the loom",
    showTestimonials: true,
    testimonialsTitle: "What Our Customers Say",
    testimonials: [
      { name: "Aaliya R.", city: "Srinagar", text: "The brocade fabric quality is outstanding — exactly like the pictures. Fast delivery too!" },
      { name: "Fatima K.", city: "Delhi", text: "Ordered my bridal suit from here and got so many compliments. Truly authentic Kashmiri craftsmanship." },
      { name: "Insha M.", city: "Jammu", text: "Loved the pashmina shawl, so soft and warm. Will definitely shop again." },
    ],
    showCta: true,
    ctaTitle: "Follow Us for Daily Drops",
    ctaText: "Join 56K+ followers for new arrivals, styling tips and exclusive offers.",
  },
  about: {
    title: "Our Story",
    subtitle: "Bismillahi Rehman Ni Rahim — rooted in Kashmiri heritage, made for the modern woman.",
    image: "/brand/hero.svg",
    paragraphs: [
      "Bazaar Panun began as a small Kashmir based venture with one goal — to bring the region's finest textile traditions to homes across India. From hand-loomed brocade and pashmina shawls to intricately embroidered bridal suits, every piece we curate carries a story of craftsmanship passed down through generations.",
      "What started as a small collection shared with friends and family has now grown into a community of over 56,000 followers who trust us for authentic, quality fabric and suits — delivered straight to their doorstep with love and care.",
    ],
    stats: ["56K+ Followers", "31K+ Products Shared", "Handpicked Quality", "Loved by Thousands"],
    promiseTitle: "Our Promise",
    promiseText:
      "Every product is checked for quality before it reaches you. We work directly with local artisans and weavers to ensure authenticity, fair trade and timely delivery — no exceptions.",
  },
  contact: {
    title: "Get in Touch",
    subtitle: "We'd love to hear from you — reach out via form, WhatsApp or Instagram.",
  },
};

export type SiteSettings = typeof defaultSettings;
