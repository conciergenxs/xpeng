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
    note: "Rincian perlengkapan tambahannya ada di daftar harga resmi.",
  },
  {
    id: "g6-pro",
    model: "g6",
    name: "Pro",
    fullName: "G6 Pro",
    price: 679_000_000,
    rangeKm: 600,
    rangeLabel: "Hingga 600 km",
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
    bodyType: "MPV listrik 7 kursi",
    tagline: "Cerdas di jalan, lega untuk tujuh orang",
    intro:
      "Kenyamanan kelas satu untuk tujuh orang. Roda belakangnya ikut berbelok di jalan sempit, dan baris ketiga terlipat rata secara elektrik. Bersama X9, urusan keluarga terasa jauh lebih ringan.",
    pricesIntro: "Tiga varian, berbeda di jarak tempuh dan perlengkapan.",
    silhouette: m("x9/featured"),
    hero: { image: m("x9/space"), position: "60% 70%" },
    lengthMm: 5316,
    widthMm: 1988,
    heightMm: 1785,
    wheelbaseMm: 3160,
    seats: 7,
    cargo: "Hingga 2.554 L saat baris ketiga dilipat",
    cargoMaxL: 2554,
    charge: "10–80% dalam 12 menit",
    screens: '10,25" pengemudi, 17,3" tengah, 21,4" hiburan belakang',
    paints: [
      { id: "silver-frost", name: "Silver Frost", description: "Perak terang yang sejuk dipandang.", swatch: "#c0c4cc", stage: "#e9ebee", image: m("x9/color-silver-frost"), turntable: x9Spin("silver-frost") },
      { id: "midnight-black", name: "Midnight Black", description: "Hitam pekat yang tegas tanpa berlebihan.", swatch: "#282c30", stage: "#dfe1e4", image: m("x9/color-midnight-black"), turntable: x9Spin("midnight-black") },
      { id: "arctic-white", name: "Arctic White", description: "Putih bersih yang selalu tampak segar.", swatch: "#f1f1f2", stage: "#eef0f2", image: m("x9/color-arctic-white"), turntable: x9Spin("arctic-white") },
      {
        id: "matte-grey",
        name: "Matte Grey",
        description: "Abu-abu doff, kalem tapi berkarakter.",
        swatch: "#6c6d70",
        stage: "#e4e4e5",
        image: m("x9/color-matte-grey"),
        turntable: x9Spin(),
      },
    ],
    paintBody: { l: 0.0656, r: 0.9344, b: 0.8333 },
    paintTitle: "Empat warna yang terinspirasi semesta.",
    officialUrl: "https://xpeng.co.id/en/x9",
    highlights: [
      { title: "Desain Starship, minim hambatan", text: "Garis bodinya mengalir dengan koefisien hambatan 0,236 Cd — sangat rendah untuk mobil tujuh kursi.", image: m("x9/hl-design") },
      { title: "Lincah di jalan sempit", text: "Roda belakang ikut berbelok bersama roda depan, jadi MPV sepanjang 5,3 m ini tetap luwes di gang dan parkiran yang sempit.", image: m("x9/hl-steering") },
      { title: "Dari tujuh kursi jadi bagasi lega", text: "Satu sentuhan melipat baris ketiga hingga rata dan membuka ruang hingga 2.554 L.", image: m("x9/hl-space") },
      { title: "Nyaman sebelum guncangan terasa", text: "Suspensi udara dua ruang dan sasis AI membaca kondisi jalan 30 m di depan, lalu menyetel peredaman lebih dulu.", image: m("x9/hl-comfort") },
    ],
    chapters: [
      {
        id: "interior",
        nav: "Interior",
        title: "Kursi terbaik ada di setiap baris.",
        text: "Lantainya rata dari depan sampai belakang, tanpa undakan. Kursi baris kedua bergeser 1.100 mm di atas rel elektrik, jadi naik-turun ke baris ketiga tetap mudah — dan baris ketiga pun bisa direbahkan secara elektrik.",
        image: m("x9/lounge"),
        points: [
          { title: '21,4"', text: "Layar hiburan untuk penumpang belakang" },
          { title: "27", text: "Speaker dengan suara surround XOpera" },
          { title: "14 arah", text: "Pengaturan kursi zero-gravity" },
        ],
        tone: "light",
      },
      {
        id: "technology",
        nav: "Teknologi",
        title: "Terjebak di gang buntu? X9 bisa mundur sendiri.",
        text: "Reversing Assist menelusuri kembali jalur yang tadi Anda lewati, persis seperti saat masuk. Di jalan dan saat parkir, XPILOT Assist dengan chip XP5 ikut membantu: adaptive cruise, menjaga mobil di tengah lajur, pindah lajur, parkir otomatis, parkir jarak jauh, hingga straight summon.",
        image: m("x9/xpilot"),
        video: { mp4: m("x9/film.mp4"), webm: m("x9/film.webm"), poster: m("x9/film-poster.jpg") },
        // Shown like the G6 film: as a figure beside the copy. Full-bleed, this dark 2:1 film left a tall empty band.
        tone: "light",
      },
      {
        id: "cockpit",
        nav: "Kokpit",
        title: "Makin lama, makin pintar.",
        text: "XOS menjalankan layar tengah 17,3\" dengan kontrol suara enam zona yang tetap bekerja tanpa koneksi internet. Lewat pembaruan over-the-air, fitur baru terus berdatangan, jauh setelah mobil tiba di garasi Anda.",
        image: m("x9/cockpit"),
        tone: "light",
      },
      {
        id: "safety",
        nav: "Keselamatan",
        title: "Dirancang dengan standar bintang lima E-NCAP.",
        text: "Rangka pelindung dari baja ultra-kuat 2.000 MPa, sembilan airbag sebagai standar, dan baterai 5C yang terlindung dari panas maupun benturan.",
        image: m("x9/safety"),
        tone: "dark",
      },
    ],
    signature: [
      "Kemudi roda belakang aktif",
      "Suspensi udara dua ruang dengan sasis AI",
      "Baris ketiga terlipat rata secara elektrik",
      'Layar hiburan belakang 21,4"',
      "Kulkas elektrik yang bisa mendinginkan dan menghangatkan",
      "Audio XOpera dengan 27 speaker",
      "Sembilan airbag sebagai standar",
    ],
    bestFor: "Keluarga hingga tujuh orang, perjalanan dengan sopir, dan perjalanan jauh dengan barang bawaan semua orang.",
    gallery: {
      interior: [
        {
          title: "Satu sentuhan, jalan terbuka",
          text: "Kursi baris kedua bergeser 1.100 mm di atas rel elektrik untuk memudahkan akses ke baris ketiga.",
          video: { mp4: m("x9/config-easy-access.mp4"), poster: m("x9/config-easy-access-poster.jpg") },
        },
        { title: "Kursi terbaik di setiap baris", text: "Lantai rata tanpa undakan di sepanjang kabin.", image: m("x9/lounge") },
        {
          title: "Dari tujuh kursi jadi bagasi lega",
          text: "Satu sentuhan melipat baris ketiga hingga rata dan membuka ruang hingga 2.554 L.",
          video: { mp4: m("x9/config-third-row.mp4"), poster: m("x9/config-third-row-poster.jpg") },
        },
      ],
      tech: [
        {
          title: "Reversing Assist",
          text: "Menelusuri kembali jalur masuk, lalu mundur sendiri dari gang buntu dan jalan sempit.",
          video: { mp4: m("x9/film.mp4"), poster: m("x9/film-poster.jpg") },
        },
        { title: "XPILOT Assist", text: "Adaptive cruise, menjaga mobil di tengah lajur, dan pindah lajur, ditenagai chip XP5.", image: m("x9/xpilot") },
        { title: "Parkir cerdas", text: "Parkir otomatis, parkir jarak jauh, dan straight summon untuk ruang yang sempit.", image: m("x9/config-parking") },
        { title: "Kokpit XOS", text: 'Layar tengah 17,3" dengan kontrol suara enam zona yang tetap bekerja tanpa internet.', image: m("x9/cockpit") },
      ],
      comfort: [
        {
          title: "Suspensi udara dua ruang",
          text: "Sasis AI membaca jalan 30 m di depan dan menyiapkan peredaman lebih awal.",
          video: { mp4: m("x9/config-air-suspension.mp4"), poster: m("x9/config-air-suspension-poster.jpg") },
        },
        {
          title: "Sejuk, hangat, sekaligus memijat",
          text: "Kursi dengan ventilasi, pemanas, dan fungsi pijat, cukup diatur dengan satu sentuhan.",
          video: { mp4: m("x9/config-seats.mp4"), poster: m("x9/config-seats-poster.jpg") },
        },
        { title: "Kursi zero-gravity", text: "Bisa diatur ke 14 arah untuk perjalanan senyaman kelas satu.", image: m("x9/hl-comfort") },
      ],
    },
  },
  g6: {
    slug: "g6",
    name: "G6",
    shortName: "G6",
    bodyType: "SUV coupe listrik 5 kursi",
    tagline: "Sigap melaju, cepat terisi",
    intro:
      "Siluetnya fastback, wajahnya langsung dikenali dari lampu strip selebar bodi. Baterai 5C-nya terisi dari 10 ke 80% hanya dalam 12 menit, dan kini tersedia pula AWD dua motor untuk akselerasi yang lebih cepat.",
    pricesIntro: "Jarak tempuh lebih jauh dengan penggerak roda belakang, atau akselerasi lebih cepat dengan AWD dua motor.",
    silhouette: m("g6/featured"),
    hero: { image: m("g6/hl-exterior"), mobile: m("g6/hero"), position: "50% 55%" },
    lengthMm: 4758,
    widthMm: 1920,
    heightMm: 1650,
    wheelbaseMm: 2890,
    seats: 5,
    cargo: "571 L, atau 1.374 L saat kursi belakang dilipat",
    cargoMaxL: 1374,
    charge: "10–80% dalam 12 menit",
    screens: '10,2" pengemudi, 14,96" tengah',
    paints: [
      {
        id: "stellar-purple",
        name: "Stellar Purple",
        description: "Ungu lembut, terinspirasi luar angkasa.",
        swatch: "#cfc8d3",
        stage: "#ece8ef",
        image: m("g6/color-stellar-purple"),
        turntable: g6Spin(),
      },
      { id: "arctic-white", name: "Arctic White", description: "Putih bersih yang selalu tampak segar.", swatch: "#e7e9ec", stage: "#eef0f2", image: m("g6/color-arctic-white"), turntable: g6Spin("arctic-white") },
      { id: "graphite-gray", name: "Graphite Gray", description: "Abu-abu gelap yang tenang dan berwibawa.", swatch: "#686b72", stage: "#e3e4e6", image: m("g6/color-graphite-gray"), turntable: g6Spin("graphite-gray") },
      { id: "silver-frost", name: "Silver Frost", description: "Perak terang yang sejuk dipandang.", swatch: "#99a0a7", stage: "#e7e9ec", image: m("g6/color-silver-frost"), turntable: g6Spin("silver-frost") },
      { id: "midnight-black", name: "Midnight Black", description: "Hitam pekat yang tegas tanpa berlebihan.", swatch: "#282b2f", stage: "#dfe1e4", image: m("g6/color-midnight-black"), turntable: g6Spin("midnight-black") },
      { id: "black-edition", name: "Black Edition", description: "Serba hitam, sampai ke pelek dan emblemnya.", swatch: "#222326", stage: "#dcdddf", image: m("g6/color-black-edition"), turntable: g6Spin("black-edition") },
    ],
    paintBody: { l: 0.0744, r: 0.9283, b: 0.8476 },
    paintTitle: "Enam warna, dari kedalaman angkasa.",
    officialUrl: "https://xpeng.co.id/en/c/g6",
    highlights: [
      { title: "Wajah yang langsung dikenali", text: "Terinspirasi desain Starship: overhang depan yang panjang, atap fastback, dan lampu strip selebar bodi membentuk wajah robot khas G6.", image: m("g6/hl-exterior") },
      { title: "Kabin rasa lounge", text: "Kursi kulit nappa yang bisa direbahkan secara elektrik, dengan ruang kaki dan kepala yang lega di kedua baris.", image: m("g6/interior-front") },
      { title: "XPILOT Assist", text: "Bantuan mengemudi yang menyesuaikan diri, dari jalan tol, jalanan kota, sampai saat parkir.", image: m("g6/xpilot-sense") },
      { title: "Platform 800V SiC", text: "Baterai 5C menyatu dengan struktur bodi, jadi rangka lebih kaku, lebih aman, dan kabin lebih lega.", image: m("g6/platform") },
    ],
    chapters: [
      {
        id: "performance",
        nav: "Performa",
        title: "G6 tercepat yang pernah ada.",
        text: "Dua motor menggerakkan keempat roda, membawa G6 Pro AWD dari diam ke 100 km/jam dalam 4,13 detik.",
        image: m("g6/performance"),
        tone: "dark",
      },
      {
        id: "interior",
        nav: "Interior",
        title: "Langit seluas 2,12 m², tepat di atas kepala.",
        text: "Skylight panorama untuk segala cuaca ini memakai kaca berlapis perak yang menahan 99,99% sinar UV. Semua jendelanya berlaminasi ganda, jadi kabin tetap senyap.",
        image: m("g6/skylight"),
        points: [
          { title: "12 arah", text: "Kursi depan berlapis kulit nappa" },
          { title: "18", text: "Speaker dengan audio XOPERA 2.0" },
          { title: "571 L", text: "Bagasi, 1.374 L saat kursi dilipat" },
        ],
        tone: "light",
      },
      {
        id: "charging",
        nav: "Pengisian",
        title: "Secangkir kopi, baterai sudah 80%.",
        text: "Platform 800V silikon karbida full-domain dan baterai 5C generasi terbaru mengisi daya dari 10 ke 80% hanya dalam 12 menit — cukup untuk melanjutkan perjalanan jauh.",
        image: m("g6/platform"),
        video: { mp4: m("g6/film.mp4"), webm: m("g6/film.webm"), poster: m("g6/film-poster.jpg") },
        tone: "light",
      },
      {
        id: "cockpit",
        nav: "Kokpit",
        title: "Cukup bicara, dari kursi mana pun.",
        text: "Kontrol suara multi-zona merespons dengan cepat, termasuk dari kursi belakang. Mode suasana bisa diatur sesuai selera, dan pembaruan over-the-air terus menambah kemampuannya.",
        image: m("g6/cockpit"),
        tone: "dark",
      },
    ],
    signature: [
      "AWD dua motor, 0–100 km/jam 4,13 dtk (Pro AWD)",
      "Skylight panorama 2,12 m²",
      "Kursi depan kulit nappa, 12 arah",
      "Audio XOPERA 2.0 dengan 18 speaker",
      "Baterai struktural dengan pelindung tiga lapis",
      "Giga-casting depan dan belakang",
      "Pilihan tampilan Black Edition",
    ],
    bestFor: "Pengemudi yang menginginkan performa sekaligus gaya, pasangan dan keluarga muda, serta pemakaian harian di kota dengan pengisian cepat.",
    gallery: {
      interior: [
        { title: "Skylight panorama 2,12 m²", text: "Kaca berlapis perak yang menahan 99,99% sinar UV.", image: m("g6/skylight") },
        { title: "Kabin rasa lounge", text: "Kursi depan kulit nappa yang bisa direbahkan secara elektrik.", image: m("g6/interior-front") },
        { title: "Baris belakang yang lapang", text: "Ruang kaki dan kepala yang lega di kedua baris.", image: m("g6/interior-rear") },
      ],
      tech: [
        {
          title: "10 ke 80% dalam 12 menit",
          text: "Platform 800V silikon karbida dan baterai 5C, cukup selama rehat kopi.",
          video: { mp4: m("g6/film.mp4"), poster: m("g6/film-poster.jpg") },
        },
        { title: "XPILOT Assist", text: "Bantuan mengemudi yang menyesuaikan diri, dari jalan tol, jalanan kota, sampai saat parkir.", image: m("g6/xpilot-sense") },
        { title: "Kokpit XOS", text: "Kontrol suara multi-zona yang responsif, juga dari kursi belakang.", image: m("g6/cockpit") },
        { title: "Platform 800V SiC", text: "Baterai 5C menyatu dengan struktur bodi untuk rangka yang lebih kaku dan aman.", image: m("g6/platform") },
      ],
      comfort: [
        {
          title: "Hangat, sejuk, dan pas",
          text: "Kursi depan elektrik 12 arah dengan ventilasi dan pemanas, nyaman dalam cuaca apa pun.",
          video: { mp4: m("g6/config-front-seats.mp4"), poster: m("g6/config-front-seats-poster.jpg") },
        },
        {
          title: "Santai di baris belakang",
          text: "Sandaran kursi belakang bisa direbahkan hingga 11,4°, lengkap dengan pemanas.",
          video: { mp4: m("g6/config-rear-recline.mp4"), poster: m("g6/config-rear-recline-poster.jpg") },
        },
        { title: "Kabin yang senyap", text: "Kaca laminasi ganda di semua jendela meredam bising dari luar.", image: m("g6/config-quiet-glass") },
      ],
    },
  },
};

export const modelList = [models.x9, models.g6];

export const variantsFor = (slug: ModelSlug) => variants.filter((v) => v.model === slug);

export const getVariant = (id: string | null | undefined) => variants.find((v) => v.id === id);

export const fromPrice = (slug: ModelSlug) => Math.min(...variantsFor(slug).map((v) => v.price));
