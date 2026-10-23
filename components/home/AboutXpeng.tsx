import s from "./AboutXpeng.module.css";

const icon = {
  width: 34,
  height: 34,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const highlights = [
  {
    title: "AI",
    text: "Menggerakkan setiap inovasi",
    icon: (
      <svg {...icon}>
        <rect x="6" y="6" width="12" height="12" rx="1.5" />
        <rect x="9.5" y="9.5" width="5" height="5" rx="0.5" />
        <path d="M9 3v3M12 3v3M15 3v3M9 18v3M12 18v3M15 18v3M3 9h3M3 12h3M3 15h3M18 9h3M18 12h3M18 15h3" />
      </svg>
    ),
  },
  {
    title: "Global",
    text: "Melaju di banyak negara",
    icon: (
      <svg {...icon}>
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3.6 8.5h16.8M3.6 15.5h16.8M12 3v18" />
      </svg>
    ),
  },
  {
    title: "Lebih bersih",
    text: "Mobilitas listrik yang lebih cerdas",
    icon: (
      <svg {...icon}>
        <path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15" />
        <path d="M5 19l9-9M9.5 14.5h4M9.5 14.5v-4" />
      </svg>
    ),
  },
];

export default function AboutXpeng() {
  return (
    <section className={`${s.section} dark`} aria-labelledby="about-title">
      {/* Background is used exactly as supplied in assets/original/home/about.png. */}
      <img
        src="/media/home/about.png"
        alt=""
        width={1774}
        height={887}
        loading="lazy"
        decoding="async"
        className={s.bg}
      />
      <div className={s.veil} aria-hidden />

      <div className={`wrap ${s.content}`}>
        <h2 id="about-title" className={`headline ${s.title}`}>
          <span>Teknologi yang bekerja</span> untuk manusia.
        </h2>
        <p className={`lede ${s.copy}`}>
          XPENG membuat kendaraan listrik pintar untuk pengendara di berbagai negara. AI, teknologi bantuan
          berkendara, dan desain yang berpihak pada penggunanya kami padukan agar setiap perjalanan terasa lebih ringan.
        </p>
        <a href="https://www.xpeng.com/brand" className={`btn ${s.story}`} target="_blank" rel="noopener noreferrer">
          Kisah XPENG
          <span className="sr-only"> (terbuka di tab baru)</span>
        </a>
      </div>

      <ul className={`wrap ${s.highlights}`}>
        {highlights.map((h) => (
          <li key={h.title}>
            {h.icon}
            <p className={s.hTitle}>{h.title}</p>
            <p className={s.hText}>{h.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
