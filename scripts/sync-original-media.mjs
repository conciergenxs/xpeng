// Copies homepage media used as-is (hero films, About background, 360° sprites, feature film) from assets/original, the source
// of truth, into public/ byte for byte,
// so Next can serve them. Runs before `dev` and `build`; skips files that are already up to date.
import { copyFileSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  "x9/hero.mp4",
  "g6/hero.mp4",
  "home/about.png",
  "home/cta.png",
  // Official 360° turntable sprites from xpeng.com (36 frames each, 10° apart).
  "x9/360-sprite.png",
  "g6/360-sprite.png",
  "g6/360-sprite-m.png",
  // Official "Why Choose XPENG" XPILOT ASSIST film from xpeng.com.
  "home/why/xpilot.mp4",
];

for (const f of files) {
  const from = join(root, "assets/original", f);
  const to = join(root, "public/media", f);
  const src = statSync(from);
  let fresh = false;
  try {
    const dst = statSync(to);
    fresh = dst.size === src.size && dst.mtimeMs >= src.mtimeMs;
  } catch {
    /* not copied yet */
  }
  if (fresh) continue;
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
  console.log(`original media: ${f} copied to public/media`);
}
