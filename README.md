# XPENG Indonesia — redesign prototype

An agency study case for Erajaya: XPENG Indonesia's website rebuilt as a premium explore → compare → pay → reserve experience.

Prototype only. No payment is taken and no data leaves the browser.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out, host anywhere
```

## What's inside

| Route | Purpose |
|---|---|
| `/` | Two-film hero (X9, G6) with a progress indicator synced to the playing film, About XPENG, single-vehicle showcase with the official drag-to-rotate 360° view, Why Choose XPENG carousel (XPILOT ASSIST, XMART OS, OTA UPDATES, SAFETY) with a floating glass control, three-ways-to-pay snapshot, compare teaser, showroom section (static Indonesia map, area markers, showroom tabs for Jakarta and Surabaya, always-visible detail card), closing order CTA |
| `/models/x9`, `/models/g6` | Floating glass section nav (after the hero), highlights rail, colour stage (drag-to-rotate 360° in every paint, keeping the angle across colour changes; simulated paints are labelled), story chapters, variants & prices, specifications |
| `/compare` | Up to three variants, sticky heads, relative bars, "Only show differences", deep-linkable (`?a=&b=&c=`) |
| `/order` | Vehicle → Payment (Cash / Finance / Lease + side-by-side plan comparison) → Your details → Review → Reservation confirmed |

Order deep links: `/order/?model=g6&variant=g6-pro-awd&paint=stellar-purple&plan=lease&step=payment`. Progress persists in `sessionStorage`, so a refresh doesn't lose the order.

## Where things live

```
lib/vehicles.ts      official model and variant data (prices, specs, paints, copy)
lib/payment.ts       every illustrative assumption + cash / finance / lease maths
lib/order.ts         order state, deep links, validation, reference numbers
lib/showrooms.ts     the 12 official showrooms: address, hours and phone from xpeng.co.id/en/find-us, plus geocoded coordinates
components/          shared UI (header, footer, segmented control, range field, tweened numbers)
components/order/    the order flow
components/compare/  the comparison tool
docs/                evaluation of the current site, IA and key flows
assets/original/     untouched source media, including the hero films (x9/hero.mp4, g6/hero.mp4), home/about.png, home/cta.png, the 360° sprites and the Why Choose XPENG media (home/why)
scripts/             build-map.py draws the static map public/media/map/indonesia.svg from Natural Earth coastlines; sync-original-media.mjs copies the hero films, About and CTA backgrounds, 360° sprites and the XPILOT film into public/ before dev and build; recolor-360.py (numpy, Pillow) regenerates the simulated 360° sprites
public/media/        optimised WebP (2200w + 1000w) and MP4 derived from it
```

## Design system in one paragraph

Colours are lifted from XPENG's own paint swatches: Arctic `#F2F3F5`, Midnight `#22262B`, Graphite `#686B72`, Silver Frost `#C0C4CC`, Stellar `#CFC8D3`. One variable typeface, Archivo, separates display from text through width (125% vs 100%) rather than a second family. Every silhouette is drawn at its real length (X9 5,316 mm, G6 4,758 mm). Official figures render solid; every simulated figure has a dotted underline and a "Simulation" tag. Motion is limited to one hero entrance plus responses to user actions: crossfades on model and paint changes, and numbers that count to their new value.

## Truthfulness

* **Official** (xpeng.co.id, October 2026): variant names, OTR Jakarta prices, range, 0–100, drivetrain, DC peak power, 10–80% time, dimensions, seats, cargo, paints, showrooms, hotline.
* **Illustrative** (all in `lib/payment.ts`): reservation deposit, insurance rate, flat interest rate, admin fee, lease residuals, rate, service bundle and conditions. Lease availability in Indonesia is not confirmed by XPENG and is presented as a concept.
* Equipment differences between X9 Long Range Pro and Pro+ aren't published on the site, so the prototype points to the official pricelist instead of guessing.
* Showroom section: names, addresses and operating hours are exactly as listed on xpeng.co.id/en/find-us (12 showrooms). Greater Jakarta groups the 7 Jakarta and Tangerang showrooms; each card still shows the showroom's real city. Medan and Bali are not official locations, so they are not marked. Opening days are not published, so none are stated. Marker positions are the mean of each area's showrooms, geocoded from the official street addresses with OpenStreetMap Nominatim. No per-showroom photos are published, so every card uses XPENG's own in-showroom photo. The map is a static SVG drawn from Natural Earth 1:10m coastlines (public domain).
* The Why Choose XPENG carousel uses the media from the same module on xpeng.com (one film, three photos). The Safety photo is only 1095×551, so it is slightly soft on large screens.
* The 360° views use XPENG's own turntable sprites from xpeng.com (`rotate_car` module: 36 frames, 10° apart). The X9 sprite exists only at 750×350 per frame, so it is slightly soft on large screens. xpeng.com publishes one sequence per model (X9 in Matte Grey, G6 in Stellar Purple). The other paints on the model pages use simulated sequences: `scripts/recolor-360.py` learns from each pair of official studio shots (which share the sprite's frame-0 angle, pixel for pixel) where the paint is and what each tone becomes, then recolours every frame of the official sprite (`public/media/<model>/360-sprite-<paint>.png`). They are labelled "Simulated colour" on the page; replace them with XPENG's own renders when available. Clear reuse with XPENG before production.
* DC peak power figures (537 / 542 / 452 kW for X9) are reproduced exactly as listed on xpeng.co.id; they look inconsistent and should be verified with XPENG before any public use.
