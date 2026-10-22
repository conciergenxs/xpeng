// Official figures as published on xpeng.co.id (October 2026). Anything simulated lives in lib/payment.ts.

export type ModelSlug = "x9" | "g6";

export type VariantId = "x9-sr-pro" | "x9-lr-pro" | "x9-lr-pro-plus" | "g6-pro" | "g6-pro-awd";

/** A car's measured outline in its image frame (front bumper, rear bumper, ground), as fractions of the frame. */
export type CarBody = { l: number; r: number; b: number };

export type Paint = {
  id: string;
  name: string;
  /** One plain line under the name on the colour stage. */
  description: string;
  swatch: string;
  /** Light tint used behind the car on the colour stage. */
  stage: string;
  /** Official studio shot, left profile on white. */
  image: string;
  /** 360° sprite (36 frames, 10° apart, frame 0 = the studio shot's angle). `simulated`: not an XPENG asset but
   *  the official sprite recoloured by scripts/recolor-360.py, labelled as a simulation on the page. */
  turntable?: { sprite: string; mobile: string; body: CarBody; simulated?: boolean };
};

export type Variant = {
  id: VariantId;
  model: ModelSlug;
  name: string;
  fullName: string;
  price: number;
  rangeKm: number;
  rangeLabel: string;
  accel: number;
  drivetrain: "FWD" | "RWD" | "AWD";
  dcKw: number;
  note?: string;
};

export type Feature = { title: string; text: string; image: string };

/** The order page's media tabs beyond the 360° view. */
export type GalleryTab = "interior" | "tech" | "comfort";

/** One official XPENG photo or film for a media tab; captions follow XPENG's own copy for that asset. */
export type GalleryItem = { title: string; text: string } & (
  | { image: string; video?: never }
  | { video: { mp4: string; poster: string }; image?: never }
);

export type Model = {
  slug: ModelSlug;
  name: string;
  shortName: string;
  bodyType: string;
  tagline: string;
  intro: string;
  /** Line under "Choose your …" in the Prices section. */
  pricesIntro: string;
  silhouette: string;
  hero: { image: string; mobile?: string; position: string };
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  wheelbaseMm: number;
  seats: number;
  cargo: string;
  cargoMaxL: number;
  charge: string;
  screens: string;
  paints: Paint[];
  /** Outline of the car in the studio shots; every paint of a model shares the same framing. */
  paintBody: CarBody;
  paintTitle: string;
  officialUrl: string;
  highlights: Feature[];
  chapters: {
    id: string;
    nav: string;
    title: string;
    text: string;
    image: string;
    video?: { mp4: string; webm: string; poster: string };
    points?: { title: string; text: string }[];
    tone: "dark" | "light";
  }[];
  signature: string[];
  bestFor: string;
  /** Films first where xpeng.com has one. The config-* files are from xpeng.com, originals in assets/original. */
  gallery: Record<GalleryTab, GalleryItem[]>;
};

const m = (p: string) => `/media/${p}`;

/** xpeng.com publishes one 360° sprite per model; given a paint, the simulated copy for that paint. */
const x9Spin = (paint?: string) => {
  const sprite = `/media/x9/360-sprite${paint ? `-${paint}` : ""}.png`;
  return { sprite, mobile: sprite, body: { l: 0.14, r: 0.9, b: 0.8457 }, simulated: !!paint };
};
const g6Spin = (paint?: string) => ({
  sprite: `/media/g6/360-sprite${paint ? `-${paint}` : ""}.png`,
  mobile: `/media/g6/360-sprite-m${paint ? `-${paint}` : ""}.png`,
  body: { l: 0.1133, r: 0.87, b: 0.825 },
  simulated: !!paint,
});

export const variants: Variant[] = [
  {
    id: "x9-sr-pro",
    model: "x9",
    name: "Standard Range Pro",
    fullName: "New X9 Standard Range Pro",
    price: 1_140_000_000,
    rangeKm: 620,
    rangeLabel: "620 km",
    accel: 8.2,
    drivetrain: "FWD",
    dcKw: 537,
  },
  {
    id: "x9-lr-pro",
    model: "x9",
    name: "Long Range Pro",
    fullName: "New X9 Long Range Pro",
    price: 1_219_000_000,
    rangeKm: 715,
    rangeLabel: "715 km",
    accel: 7.75,
    drivetrain: "FWD",
    dcKw: 542,
  },
  {
    id: "x9-lr-pro-plus",
    model: "x9",
    name: "Long Range Pro+",
    fullName: "New X9 Long Range Pro+",
    price: 1_259_000_000,
    rangeKm: 715,
    rangeLabel: "715 km",
    accel: 7.75,
    drivetrain: "FWD",
    dcKw: 452,
    note: "Equipment added over Long Range Pro is listed in the official pricelist.",
  },
  {
    id: "g6-pro",
    model: "g6",
    name: "Pro",
    fullName: "G6 Pro",
    price: 679_000_000,
    rangeKm: 600,
    rangeLabel: "Up to 600 km",
    accel: 6.7,
    drivetrain: "RWD",
    dcKw: 451,
  },
  {
    id: "g6-pro-awd",
    model: "g6",
    name: "Pro AWD",
    fullName: "G6 Pro AWD",
    price: 769_000_000,
    rangeKm: 575,
    rangeLabel: "575 km",
    accel: 4.13,
    drivetrain: "AWD",
    dcKw: 451,
  },
];

export const models: Record<ModelSlug, Model> = {
  x9: {
    slug: "x9",
    name: "New X9",
    shortName: "X9",
    bodyType: "7-seat electric MPV",
    tagline: "Ultra intelligent seven seater",
    intro:
      "A first-class cabin for seven, a rear axle that steers, and a third row that folds itself away. The X9 rethinks what a family car can be.",
    pricesIntro: "Discover the X9 configuration that suits your journey.",
    silhouette: m("x9/featured"),
    hero: { image: m("x9/space"), position: "60% 70%" },
    lengthMm: 5316,
    widthMm: 1988,
    heightMm: 1785,
    wheelbaseMm: 3160,
    seats: 7,
    cargo: "Up to 2,554 L with the third row folded",
    cargoMaxL: 2554,
    charge: "10–80% in 12 min",
    screens: '10.25" driver, 17.3" centre, 21.4" rear entertainment',
    paints: [
      { id: "silver-frost", name: "Silver Frost", description: "A cool, bright silver.", swatch: "#c0c4cc", stage: "#e9ebee", image: m("x9/color-silver-frost"), turntable: x9Spin("silver-frost") },
      { id: "midnight-black", name: "Midnight Black", description: "A deep, understated black.", swatch: "#282c30", stage: "#dfe1e4", image: m("x9/color-midnight-black"), turntable: x9Spin("midnight-black") },
      { id: "arctic-white", name: "Arctic White", description: "A clean, bright white.", swatch: "#f1f1f2", stage: "#eef0f2", image: m("x9/color-arctic-white"), turntable: x9Spin("arctic-white") },
      {
        id: "matte-grey",
        name: "Matte Grey",
        description: "A grey with a matte finish.",
        swatch: "#6c6d70",
        stage: "#e4e4e5",
        image: m("x9/color-matte-grey"),
        turntable: x9Spin(),
      },
    ],
    paintBody: { l: 0.0656, r: 0.9344, b: 0.8333 },
    paintTitle: "Colours inspired by the cosmos.",
    officialUrl: "https://xpeng.co.id/en/x9",
    highlights: [
      { title: "Starship design", text: "Fluid, low-drag lines with a 0.236 Cd drag coefficient — remarkably slippery for a seven-seater.", image: m("x9/hl-design") },
      { title: "Active rear-wheel steering", text: "The rear wheels turn with the front, so a 5.3 m MPV slips through narrow streets and tight car parks.", image: m("x9/hl-steering") },
      { title: "Space that transforms", text: "One touch folds the third row completely flat, opening up to 2,554 L for cargo.", image: m("x9/hl-space") },
      { title: "Comfort first", text: "Dual-chamber air suspension and an AI chassis read the road 30 m ahead and pre-set the damping.", image: m("x9/hl-comfort") },
    ],
    chapters: [
      {
        id: "interior",
        nav: "Interior",
        title: "A first-class cabin, for every row.",
        text: "A flat, step-free floor runs the length of the cabin. Second-row seats glide 1,100 mm on electric rails for easy access to the third row, which reclines electrically too.",
        image: m("x9/lounge"),
        points: [
          { title: '21.4"', text: "Rear entertainment screen" },
          { title: "27", text: "Speaker XOpera surround sound" },
          { title: "14-way", text: "Zero-gravity seat adjustment" },
        ],
        tone: "light",
      },
      {
        id: "technology",
        nav: "Technology",
        title: "It reverses out of dead ends by itself.",
        text: "Reversing Assist retraces the path you drove in on. Alongside it, XPILOT Assist on the XP5 chip handles adaptive cruise, lane centring, lane changes, auto parking, remote parking and straight summon.",
        image: m("x9/xpilot"),
        video: { mp4: m("x9/film.mp4"), webm: m("x9/film.webm"), poster: m("x9/film-poster.jpg") },
        // Shown like the G6 film: as a figure beside the copy. Full-bleed, this dark 2:1 film left a tall empty band.
        tone: "light",
      },
      {
        id: "cockpit",
        nav: "Cockpit",
        title: "A cockpit that keeps learning.",
        text: "XOS runs a 17.3\" central screen with six-zone voice control that keeps working offline. Over-the-air updates add features long after delivery.",
        image: m("x9/cockpit"),
        tone: "light",
      },
      {
        id: "safety",
        nav: "Safety",
        title: "Engineered to E-NCAP five-star standards.",
        text: "A 2,000 MPa ultra-high-strength safety cage, nine airbags as standard, and 5C battery protection against heat and impact.",
        image: m("x9/safety"),
        tone: "dark",
      },
    ],
    signature: [
      "Active rear-wheel steering",
      "Dual-chamber air suspension with AI chassis",
      "Electric fold-flat third row",
      '21.4" rear entertainment screen',
      "Electric heating and cooling refrigerator",
      "27-speaker XOpera sound",
      "Nine airbags as standard",
    ],
    bestFor: "Families of up to seven, chauffeured travel, long trips with luggage for everyone.",
    gallery: {
      interior: [
        {
          title: "One-touch easy access",
          text: "Second-row seats glide 1,100 mm on electric rails for easy access to the third row.",
          video: { mp4: m("x9/config-easy-access.mp4"), poster: m("x9/config-easy-access-poster.jpg") },
        },
        { title: "A first-class cabin, for every row", text: "A flat, step-free floor runs the length of the cabin.", image: m("x9/lounge") },
        {
          title: "Space that transforms",
          text: "One touch folds the third row completely flat, opening up to 2,554 L for cargo.",
          video: { mp4: m("x9/config-third-row.mp4"), poster: m("x9/config-third-row-poster.jpg") },
        },
      ],
      tech: [
        {
          title: "Reversing Assist",
          text: "Retraces the path you drove in on, to back out of dead ends and narrow roads by itself.",
          video: { mp4: m("x9/film.mp4"), poster: m("x9/film-poster.jpg") },
        },
        { title: "XPILOT Assist", text: "Adaptive cruise, lane centring and lane changes, powered by the XP5 chip.", image: m("x9/xpilot") },
        { title: "Intelligent parking", text: "Auto park, remote parking and straight summon for tight spaces.", image: m("x9/config-parking") },
        { title: "XOS cockpit", text: 'A 17.3" central screen with six-zone voice control that keeps working offline.', image: m("x9/cockpit") },
      ],
      comfort: [
        {
          title: "Dual-chamber air suspension",
          text: "An AI chassis reads the road 30 m ahead and pre-sets the damping.",
          video: { mp4: m("x9/config-air-suspension.mp4"), poster: m("x9/config-air-suspension-poster.jpg") },
        },
        {
          title: "Ventilation, heating and massage",
          text: "Seats that cool, warm and massage, set at a touch.",
          video: { mp4: m("x9/config-seats.mp4"), poster: m("x9/config-seats-poster.jpg") },
        },
        { title: "Zero-gravity seats", text: "14-way adjustment for a first-class ride.", image: m("x9/hl-comfort") },
      ],
    },
  },
  g6: {
    slug: "g6",
    name: "G6",
    shortName: "G6",
    bodyType: "5-seat electric coupe SUV",
    tagline: "Ultra smart coupe SUV",
    intro:
      "A fastback silhouette, a full-width light bar and a 5C battery that charges from 10 to 80% in twelve minutes. Now with dual-motor AWD — the fastest G6 yet.",
    pricesIntro: "Find the G6 configuration that fits your lifestyle.",
    silhouette: m("g6/featured"),
    hero: { image: m("g6/hl-exterior"), mobile: m("g6/hero"), position: "50% 55%" },
    lengthMm: 4758,
    widthMm: 1920,
    heightMm: 1650,
    wheelbaseMm: 2890,
    seats: 5,
    cargo: "571 L, 1,374 L with rear seats folded",
    cargoMaxL: 1374,
    charge: "10–80% in 12 min",
    screens: '10.2" driver, 14.96" centre',
    paints: [
      {
        id: "stellar-purple",
        name: "Stellar Purple",
        description: "A colour inspired by deep space.",
        swatch: "#cfc8d3",
        stage: "#ece8ef",
        image: m("g6/color-stellar-purple"),
        turntable: g6Spin(),
      },
      { id: "arctic-white", name: "Arctic White", description: "A clean, bright white.", swatch: "#e7e9ec", stage: "#eef0f2", image: m("g6/color-arctic-white"), turntable: g6Spin("arctic-white") },
      { id: "graphite-gray", name: "Graphite Gray", description: "A deep, darker grey.", swatch: "#686b72", stage: "#e3e4e6", image: m("g6/color-graphite-gray"), turntable: g6Spin("graphite-gray") },
      { id: "silver-frost", name: "Silver Frost", description: "A cool, bright silver.", swatch: "#99a0a7", stage: "#e7e9ec", image: m("g6/color-silver-frost"), turntable: g6Spin("silver-frost") },
      { id: "midnight-black", name: "Midnight Black", description: "A deep, understated black.", swatch: "#282b2f", stage: "#dfe1e4", image: m("g6/color-midnight-black"), turntable: g6Spin("midnight-black") },
      { id: "black-edition", name: "Black Edition", description: "Black paint with blacked-out wheels and badges.", swatch: "#222326", stage: "#dcdddf", image: m("g6/color-black-edition"), turntable: g6Spin("black-edition") },
    ],
    paintBody: { l: 0.0744, r: 0.9283, b: 0.8476 },
    paintTitle: "Colours inspired by deep space.",
    officialUrl: "https://xpeng.co.id/en/c/g6",
    highlights: [
      { title: "Starship-inspired exterior", text: "A long front overhang, fastback roofline and full-width light bar give the G6 its robot face.", image: m("g6/hl-exterior") },
      { title: "Immersive lounge cabin", text: "Power-reclining nappa leather seats with generous leg and headroom in both rows.", image: m("g6/interior-front") },
      { title: "XPILOT Assist", text: "Assisted driving that adapts across highway, city and parking scenarios.", image: m("g6/xpilot-sense") },
      { title: "800V SiC platform", text: "A structural 5C battery integrated into the body for rigidity, safety and cabin space.", image: m("g6/platform") },
    ],
    chapters: [
      {
        id: "performance",
        nav: "Performance",
        title: "Smarter, now faster.",
        text: "Dual-motor all-wheel drive takes the G6 Pro AWD from 0 to 100 km/h in 4.13 seconds, the quickest G6 ever built.",
        image: m("g6/performance"),
        tone: "dark",
      },
      {
        id: "interior",
        nav: "Interior",
        title: "Look up. There's 2.12 m² of sky.",
        text: "The all-season panoramic skylight uses silver-plated glass that blocks 99.99% of UV. Double-laminated windows all round keep the cabin quiet.",
        image: m("g6/skylight"),
        points: [
          { title: "12-way", text: "Nappa leather front seats" },
          { title: "18", text: "Speaker XOPERA 2.0 sound" },
          { title: "571 L", text: "Boot, 1,374 L seats folded" },
        ],
        tone: "light",
      },
      {
        id: "charging",
        nav: "Charging",
        title: "Twelve minutes. 10 to 80%.",
        text: "The full-domain 800V silicon-carbide platform and next-generation 5C battery make a coffee stop long enough for a road-trip's worth of charge.",
        image: m("g6/platform"),
        video: { mp4: m("g6/film.mp4"), webm: m("g6/film.webm"), poster: m("g6/film-poster.jpg") },
        tone: "light",
      },
      {
        id: "cockpit",
        nav: "Cockpit",
        title: "A cabin that listens from every seat.",
        text: "Fast multi-zone voice control works from the rear seats too, with custom scene modes and over-the-air updates that evolve with you.",
        image: m("g6/cockpit"),
        tone: "dark",
      },
    ],
    signature: [
      "Dual-motor AWD, 0–100 km/h in 4.13 s (Pro AWD)",
      "2.12 m² panoramic skylight",
      "Nappa leather, 12-way front seats",
      "18-speaker XOPERA 2.0 sound",
      "Structural battery with triple-layer shield",
      "Front and rear giga-casting",
      "Black Edition styling option",
    ],
    bestFor: "Drivers who want performance and style, couples and young families, daily city use with fast charging.",
    gallery: {
      interior: [
        { title: "2.12 m² panoramic skylight", text: "Silver-plated glass that blocks 99.99% of UV.", image: m("g6/skylight") },
        { title: "Immersive lounge cabin", text: "Power-reclining Nappa leather seats up front.", image: m("g6/interior-front") },
        { title: "Lounge-like rear cabin", text: "Generous leg and headroom in both rows.", image: m("g6/interior-rear") },
      ],
      tech: [
        {
          title: "Twelve minutes, 10 to 80%",
          text: "The 800V silicon-carbide platform and 5C battery charge in a coffee stop.",
          video: { mp4: m("g6/film.mp4"), poster: m("g6/film-poster.jpg") },
        },
        { title: "XPILOT Assist", text: "Assisted driving that adapts across highway, city and parking scenarios.", image: m("g6/xpilot-sense") },
        { title: "XOS cockpit", text: "Fast multi-zone voice control that works from the rear seats too.", image: m("g6/cockpit") },
        { title: "800V SiC platform", text: "A structural 5C battery integrated into the body for rigidity and safety.", image: m("g6/platform") },
      ],
      comfort: [
        {
          title: "Heated, ventilated and adjustable",
          text: "12-way power front seats with ventilation and heating for year-round comfort.",
          video: { mp4: m("g6/config-front-seats.mp4"), poster: m("g6/config-front-seats-poster.jpg") },
        },
        {
          title: "Relaxed rear cabin",
          text: "Rear seats recline up to 11.4°, with integrated heating.",
          video: { mp4: m("g6/config-rear-recline.mp4"), poster: m("g6/config-rear-recline-poster.jpg") },
        },
        { title: "Quiet-cabin glass", text: "Double-laminated glass on all windows keeps the cabin calm.", image: m("g6/config-quiet-glass") },
      ],
    },
  },
};

export const modelList = [models.x9, models.g6];

export const variantsFor = (slug: ModelSlug) => variants.filter((v) => v.model === slug);

export const getVariant = (id: string | null | undefined) => variants.find((v) => v.id === id);

export const fromPrice = (slug: ModelSlug) => Math.min(...variantsFor(slug).map((v) => v.price));
