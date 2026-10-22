# XPENG Indonesia — evaluation, IA and key flows

Agency study case for Erajaya. Prototype only: no live payment, no data leaves the browser.

## 1. What xpeng.co.id does today (audited 22 Oct 2026)

| Area | Today | Gap |
|---|---|---|
| Models | Two model pages (New X9, G6 Pro), long carousels, colour viewer, spec table per variant | Price sits at the very bottom; variant differences hidden in a tab; no path from interest to action other than a PDF pricelist |
| Pricing | OTR Jakarta prices per variant, "Download Pricelist" PDF | No monthly view, no financing, no lease, no way to see what a choice costs over time |
| Comparison | None across models; variants only via spec tabs | Buyers torn between a 7-seat MPV and a 5-seat coupe SUV must cross-reference two pages |
| Purchase | "Book Now" = lead form (model + showroom + consent) | Feels like a callback request, not a purchase. Nothing is summarised, nothing is confirmed |
| Ownership info | Showrooms, service, hotline 150372, roadside, app | Good content, scattered across Discover / Aftersales menus |

Kept from the current site: brand marks, all photography and film, model copy, colour names and swatches, published OTR Jakarta prices and specs, the 12-showroom network, hotline.

## 2. Information architecture

```
/                       Home: film hero, About XPENG, X9/G6 showcase with 360° view, Why Choose XPENG carousel, how buying online works, showrooms (static map, area tabs, detail card)
/models/x9              New X9 story → colours → variants & prices → specifications → order
/models/g6              G6 story → colours → variants & prices → specifications → order
/compare                Up to 3 variants side by side, differences highlighting, monthly estimate per variant
/order                  4-step order: Vehicle → Payment → Your details → Review → Reservation confirmed
   ?model=&variant=&plan=   deep links from every Order button
```

Global nav: X9 · G6 · Compare · Showrooms · [Order now]. Secondary destinations (About, Charging, Service, App, Roadside) link out to the existing official pages from the footer.

## 3. Key user flows

1. **Inspired browser** → Home hero → model page → colours → "Variants & prices" → Order (variant pre-selected).
2. **Rational comparer** → Compare (from nav or model page) → toggles "Only show differences" → Order from the column header.
3. **Budget-led buyer** → any "est. per month" figure → order step 2 → switches Cash / Finance / Lease, moves DP, tenor and rate → "Compare plans" table → continues.
4. **Ready buyer** → Order now → 4 steps → reservation confirmation with reference, next steps and document checklist.

## 4. Truthfulness rules

* Official (from xpeng.co.id, Oct 2026): variant names, OTR Jakarta prices, range, 0–100, drivetrain, dimensions, seats, cargo, DC power, charging time, colours, showroom list, hotline.
* Illustrative (always tagged "Simulation" and dotted-underlined): reservation deposit, interest rates, admin fees, insurance estimate, lease residuals, lease rates and conditions. Lease availability in Indonesia is not confirmed by XPENG.
* Equipment differences between X9 Long Range Pro and Pro+ are not published on the site; the prototype says so instead of guessing.
