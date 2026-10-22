import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Img from "@/components/Img";
import InViewVideo from "@/components/InViewVideo";
import ModelSubnav from "@/components/model/ModelSubnav";
import HighlightsRail from "@/components/model/HighlightsRail";
import PaintStage from "@/components/model/PaintStage";
import PaymentPlans, { PaymentPlansButton } from "@/components/model/PaymentPlans";
import { models, variantsFor, fromPrice, type ModelSlug, type Variant } from "@/lib/vehicles";
import { rupiah, rupiahShort, mm } from "@/lib/format";
import s from "./model.module.css";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return Object.keys(models).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const model = models[slug as ModelSlug];
  if (!model) return {};
  return {
    title: `${model.name}, ${model.bodyType}`,
    description: `${model.intro} From ${rupiah(fromPrice(model.slug))} OTR Jakarta.`,
  };
}

type SpecRow = { label: string; value: (v: Variant) => string };

export default async function ModelPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const model = models[slug as ModelSlug];
  if (!model) notFound();

  const vs = variantsFor(model.slug);
  const maxRange = Math.max(...vs.map((v) => v.rangeKm));
  const minAccel = Math.min(...vs.map((v) => v.accel));

  const specRows: SpecRow[] = [
    { label: "Range (NEDC)", value: (v) => v.rangeLabel },
    { label: "0–100 km/h", value: (v) => `${v.accel} s` },
    { label: "Drivetrain", value: (v) => v.drivetrain },
    { label: "DC fast charging, peak", value: (v) => `${v.dcKw} kW` },
    { label: "Charging 10–80%", value: () => "12 min" },
    { label: "Length × width × height", value: () => `${model.lengthMm} × ${model.widthMm} × ${model.heightMm} mm` },
    { label: "Wheelbase", value: () => mm(model.wheelbaseMm) },
    { label: "Seats", value: () => String(model.seats) },
    { label: "Cargo", value: () => model.cargo },
    { label: "Screens", value: () => model.screens },
  ];

  // Consecutive light chapters alternate which side the picture sits on.
  const lightIndex = (i: number) => model.chapters.slice(0, i).filter((c) => c.tone === "light").length;

  const links = [
    { id: "highlights", label: "Highlights" },
    { id: "colours", label: "Colours" },
    ...model.chapters.map((c) => ({ id: c.id, label: c.nav })),
    { id: "prices", label: "Prices" },
    { id: "specs", label: "Specs" },
  ];

  return (
    <div id="top">
      {/* Hero */}
      <section className={`${s.hero} dark`} aria-labelledby="model-title">
        <picture className={s.heroMedia}>
          {model.hero.mobile && <source media="(max-width: 760px)" srcSet={`${model.hero.mobile}-sm.webp`} />}
          <Img src={model.hero.image} priority alt="" className={s.heroImg} style={{ objectPosition: model.hero.position }} />
        </picture>
        <div className={s.heroScrim} aria-hidden />
        {/* Name bottom-left, starting price bottom-right on the same baseline; ordering lives in the header. */}
        <div className={`wrap ${s.heroInner}`}>
          <div className={s.heroBar}>
            <h1 id="model-title" className={`display ${s.heroName}`}>
              {model.name}
            </h1>
            <p className={s.heroPrice}>From {rupiah(fromPrice(model.slug))}</p>
          </div>
        </div>
      </section>

      <ModelSubnav name={model.name} slug={model.slug} links={links} />

      {/* Intro and readouts */}
      <section className={s.intro}>
        <div className={`wrap ${s.introGrid}`}>
          <p className={s.introText}>{model.intro}</p>
          <dl className={s.readouts}>
            <div>
              <dt>Range, NEDC</dt>
              <dd>
                {maxRange}
                <span>km</span>
              </dd>
            </div>
            <div>
              <dt>0–100 km/h from</dt>
              <dd>
                {minAccel}
                <span>s</span>
              </dd>
            </div>
            <div>
              <dt>Charging 10–80%</dt>
              <dd>
                12<span>min</span>
              </dd>
            </div>
            <div>
              <dt>Seats</dt>
              <dd>{model.seats}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section id="highlights" className={s.highlights}>
        <HighlightsRail title={`Get to know the ${model.shortName}.`} items={model.highlights} />
      </section>

      <PaintStage id="colours" title={model.paintTitle} modelName={model.name} slug={model.slug} paints={model.paints} body={model.paintBody} />

      {/* Story chapters */}
      {model.chapters.map((c, i) =>
        c.tone === "dark" ? (
          <section key={c.id} id={c.id} className={`${s.chapterDark} dark`} aria-labelledby={`${c.id}-title`}>
            {c.video ? (
              <InViewVideo className={s.chapterMedia} {...c.video} label={c.title} />
            ) : (
              <Img src={c.image} alt="" className={s.chapterMedia} />
            )}
            <div className={s.chapterScrim} aria-hidden />
            <div className={`wrap ${s.chapterCopy}`}>
              <h2 id={`${c.id}-title`} className="headline">
                {c.title}
              </h2>
              <p className="lede">{c.text}</p>
            </div>
          </section>
        ) : (
          <section key={c.id} id={c.id} className={s.chapterLight} aria-labelledby={`${c.id}-title`}>
            <div className={`wrap ${s.chapterGrid} ${lightIndex(i) % 2 ? s.flip : ""}`}>
              <div className={s.chapterText}>
                <h2 id={`${c.id}-title`} className="headline">
                  {c.title}
                </h2>
                <p className="lede">{c.text}</p>
              </div>
              {c.video ? (
                <InViewVideo className={s.chapterFigure} {...c.video} label={c.title} />
              ) : (
                <Img src={c.image} alt="" sizes="(max-width: 900px) 100vw, 60vw" className={s.chapterFigure} />
              )}
              {c.points && (
                <dl className={s.points}>
                  {c.points.map((p) => (
                    <div key={p.text}>
                      <dt>{p.title}</dt>
                      <dd>{p.text}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </section>
        ),
      )}

      {/* Variants and prices */}
      <section id="prices" className={s.prices} aria-labelledby="prices-title">
        <div className="wrap">
          <div className={`${s.sectionHead} ${s.pricesHead}`}>
            <h2 id="prices-title" className="headline">
              Choose your {model.name}.
            </h2>
            <p className="lede">{model.pricesIntro}</p>
          </div>

          <PaymentPlans>
            <ul className={s.variantList}>
              {vs.map((v) => (
                <li key={v.id} className={s.variant}>
                  <div className={s.vName}>
                    <h3>{v.name}</h3>
                    {v.note && <p className="fine">{v.note}</p>}
                  </div>
                  <dl className={s.vSpecs}>
                    <div>
                      <dt>Range</dt>
                      <dd>{v.rangeLabel}</dd>
                    </div>
                    <div>
                      <dt>0–100 km/h</dt>
                      <dd>{v.accel} s</dd>
                    </div>
                    <div>
                      <dt>Drive</dt>
                      <dd>{v.drivetrain}</dd>
                    </div>
                  </dl>
                  <div className={s.vPrice}>
                    <p className={s.vOtr}>{rupiah(v.price)}</p>
                    <PaymentPlansButton variantId={v.id} />
                  </div>
                </li>
              ))}
            </ul>
          </PaymentPlans>
        </div>
      </section>

      {/* Specifications */}
      <section id="specs" className={s.specs} aria-labelledby="specs-title">
        <div className="wrap">
          <div className={s.specHead}>
            <h2 id="specs-title" className="headline">
              Specifications
            </h2>
            <p className="lede">Explore the key specifications of the {model.shortName}, across all available configurations.</p>
          </div>
          <div className={s.specCard}>
            <table className={s.specTable} style={{ "--n": vs.length } as React.CSSProperties}>
              <thead>
                <tr>
                  <th scope="col">Specification</th>
                  {vs.map((v) => (
                    <th key={v.id} scope="col">
                      {v.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {specRows.map((r) => {
                  const values = vs.map(r.value);
                  // Every variant shows its value, shared or not. On phones a shared value is shown once across the row.
                  const same = values.every((x) => x === values[0]);
                  return (
                    <tr key={r.label}>
                      <th scope="row">{r.label}</th>
                      {values.map((x, i) => (
                        <td key={vs[i].id} className={same ? (i === 0 ? s.shared : s.repeat) : undefined}>
                          {/* A dash only where a figure is genuinely missing from the data. */}
                          {x || <span aria-label="Not available">—</span>}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Close */}
      <section className={s.close} aria-labelledby="close-title">
        <div className={`wrap ${s.closeInner}`}>
          <Img src={model.silhouette} alt="" sizes="(max-width: 760px) 90vw, 720px" className={s.closeCar} />
          <h2 id="close-title" className="headline">
            The {model.name}, from {rupiahShort(fromPrice(model.slug))}.
          </h2>
          <div className={s.closeCtas}>
            <Link href={`/order/?model=${model.slug}`} className="btn">
              Order now
            </Link>
            <a href="https://xpeng.co.id/en/book-now" className="btn btn-ghost">
              Book a test drive
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
