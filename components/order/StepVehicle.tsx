"use client";

import { useRef } from "react";
import { preloadTurntable } from "@/components/CarTurntable";
import Img from "@/components/Img";
import { modelList, models, variantsFor, fromPrice, type ModelSlug } from "@/lib/vehicles";
import { num, rupiah } from "@/lib/format";
import type { OrderState } from "@/lib/order";
import CompareModal from "./CompareModal";
import s from "./order.module.css";

type Props = { order: OrderState; update: (p: Partial<OrderState>) => void };

export default function StepVehicle({ order, update }: Props) {
  const model = models[order.model];
  const longest = Math.max(...modelList.map((m) => m.lengthMm));
  const compare = useRef<HTMLDialogElement>(null);

  const chooseModel = (slug: ModelSlug) =>
    update({ model: slug, variantId: variantsFor(slug)[0].id, paintId: models[slug].paints[0].id });

  return (
    <>
      <h2 id="step-title" className="headline">
        Pertama, pilih mobilnya.
      </h2>

      <fieldset className={s.group}>
        <legend className="sr-only">Model</legend>
        <div className={s.groupHead}>
          <span className={s.groupLabel} aria-hidden>
            Model
          </span>
          <button type="button" className={`link ${s.groupAction}`} onClick={() => compare.current?.showModal()}>
            Bandingkan X9 dan G6
          </button>
        </div>
        <div className={s.modelCards}>
          {modelList.map((m) => (
            <label
              key={m.slug}
              className={`${s.modelCard} ${m.slug === order.model ? s.selected : ""}`}
              onPointerEnter={() => preloadTurntable(m.paints[0])}
            >
              <input
                type="radio"
                name="model"
                className="sr-only"
                checked={m.slug === order.model}
                onChange={() => chooseModel(m.slug)}
                onFocus={() => preloadTurntable(m.paints[0])}
              />
              <span className={s.modelCardStage}>
                <span className={s.modelCardCar} style={{ width: `${(m.lengthMm / longest) * 100}%` }}>
                  <Img src={m.silhouette} alt="" sizes="240px" />
                </span>
              </span>
              <span className={s.modelCardText}>
                <span className={s.tick} aria-hidden />
                <span className={s.modelCardName}>{m.name}</span>
                <span className={s.modelCardMeta}>{m.bodyType}</span>
                <span className={s.modelCardPrice}>Mulai {rupiah(fromPrice(m.slug))}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={s.group}>
        <legend className={s.groupLabel}>Varian</legend>
        <div className={s.options}>
          {variantsFor(order.model).map((v) => (
            <label key={v.id} className={`${s.option} ${v.id === order.variantId ? s.selected : ""}`}>
              <input
                type="radio"
                name="variant"
                className="sr-only"
                checked={v.id === order.variantId}
                onChange={() => update({ variantId: v.id })}
              />
              <span className={s.optionName}>{v.name}</span>
              <span className={s.optionPrice}>{rupiah(v.price)}</span>
              <span className={s.optionMeta}>
                Jarak tempuh {v.rangeLabel.charAt(0).toLowerCase() + v.rangeLabel.slice(1)} <span aria-hidden>·</span> 0–100 km/jam {num(v.accel)} dtk{" "}
                <span aria-hidden>·</span>{" "}
                {v.drivetrain}
              </span>
              {v.note && <span className={s.optionNote}>{v.note}</span>}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={s.group}>
        <legend className={s.groupLabel}>
          Warna <span className={s.groupValue}>{model.paints.find((p) => p.id === order.paintId)?.name}</span>
        </legend>
        <div className={s.swatches}>
          {model.paints.map((p) => (
            <label key={p.id} className={s.swatch} title={p.name}>
              <input
                type="radio"
                name="paint"
                className="sr-only"
                checked={p.id === order.paintId}
                onChange={() => update({ paintId: p.id })}
              />
              <span className={s.swatchDot} style={{ background: p.swatch }} aria-hidden />
              <span className="sr-only">{p.name}</span>
            </label>
          ))}
        </div>
        <p className={s.hint}>Ketersediaan warna dan perkiraan waktu kirim akan dikonfirmasi konsultan di showroom Anda.</p>
      </fieldset>

      <CompareModal ref={compare} current={order.model} />
    </>
  );
}
