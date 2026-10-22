"""Simulated 360° sprites for the paints XPENG publishes no turntable for.

xpeng.com has one official 360° sprite per model (X9 in Matte Grey, G6 in Stellar Purple). Every paint, however,
has an official studio shot, and all studio shots of a model share the same framing, pixel for pixel, at the same
angle as sprite frame 0. So each pair of studio shots shows exactly which pixels are paint and what each tone of
the source paint becomes in the target paint. From that pair this script learns:

  1. where the paint is: a small classifier on colour plus local context (surrounding brightness and texture),
     trained on the pixels that change between the two shots, so glass, tyres, lights and trim stay untouched;
  2. what each tone becomes: a luminance-to-colour curve taken from the changed pixels.

It applies both to every frame of the official sprite and writes public/media/<model>/360-sprite-<paint>.png
(plus the -m mobile size where the original has one). The originals in assets/original are only read.
The result is a simulation and is labelled as such on the page.

  python3 -m pip install numpy pillow
  python3 scripts/recolor-360.py            # every paint
  python3 scripts/recolor-360.py x9         # one model
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets/original"
OUT = ROOT / "public/media"
LW = np.array([0.2126, 0.7152, 0.0722], np.float32)
FRAMES = 36
CHANGED = 28  # per-channel difference that counts as a paint change; glass reflections stay below it

MODELS = {
    "x9": dict(
        source="matte-grey",
        targets=["silver-frost", "midnight-black", "arctic-white"],
        shot_body=(0.0656, 0.9344),  # bumper to bumper in the studio shots, as fractions of the width
        sprites={"360-sprite": (750, 350, (0.14, 0.9))},
    ),
    "g6": dict(
        source="stellar-purple",
        targets=["arctic-white", "graphite-gray", "silver-frost", "midnight-black", "black-edition"],
        shot_body=(0.0744, 0.9283),
        sprites={"360-sprite": (1200, 560, (0.1133, 0.87)), "360-sprite-m": (750, 350, (0.1133, 0.868))},
        # Paints that differ beyond the paint itself (black wheels and badges): their own changes are learned too.
        trim=["black-edition"],
    ),
}

rng = np.random.default_rng(7)


def blur(a, r):
    return np.asarray(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(np.float32)


def features(rgb):
    """Readable cues, deliberately few so they carry to angles the training never saw: brightness, colour,
    and local brightness and texture at three scales (paint is smooth; spokes, grilles and glass edges are not).
    Expanded with their pairwise products, so a linear model can draw curved boundaries."""
    lum = rgb @ LW
    f = [lum, rgb.max(-1) - rgb.min(-1), rgb[..., 2] - rgb[..., 0], rgb[..., 1] - (rgb[..., 0] + rgb[..., 2]) / 2]
    for r in (2, 6, 16):
        mean = blur(lum, r)
        f += [mean, np.sqrt(np.maximum(blur(lum * lum / 255, r) * 255 - mean * mean, 0))]
    f = np.stack(f, -1) / 255
    i, j = np.triu_indices(f.shape[-1])
    return np.concatenate([f, f[..., i] * f[..., j]], -1)


class Classifier:
    """Logistic regression with Adam and a little L2. A neural net fitted the training angles better but
    painted the front and rear views wrongly; this generalises round the car."""

    def fit(self, x, y, steps=3000, lr=0.02, bs=4096):
        self.mu, self.sd = x.mean(0), x.std(0) + 1e-6
        x = (x - self.mu) / self.sd
        self.w, self.b = np.zeros(x.shape[1]), 0.0
        m, v, mb, vb = np.zeros_like(self.w), np.zeros_like(self.w), 0.0, 0.0
        for t in range(1, steps + 1):
            j = rng.choice(len(x), bs)
            g = 1 / (1 + np.exp(-(x[j] @ self.w + self.b))) - y[j]
            gw, gb = x[j].T @ g / bs + 1e-3 * self.w, g.mean()
            m, v = 0.9 * m + 0.1 * gw, 0.999 * v + 0.001 * gw ** 2
            mb, vb = 0.9 * mb + 0.1 * gb, 0.999 * vb + 0.001 * gb ** 2
            self.w -= lr * (m / (1 - 0.9 ** t)) / (np.sqrt(v / (1 - 0.999 ** t)) + 1e-8)
            self.b -= lr * (mb / (1 - 0.9 ** t)) / (np.sqrt(vb / (1 - 0.999 ** t)) + 1e-8)

    def __call__(self, x):
        shape = x.shape[:-1]
        x = (x.reshape(-1, x.shape[-1]) - self.mu) / self.sd
        return (1 / (1 + np.exp(-(x @ self.w + self.b)))).reshape(shape)


def shot(model, paint, width):
    im = Image.open(SRC / model / f"color-{paint}.jpg").convert("RGB")
    return np.asarray(im.resize((width, round(width * 840 / 1800)), Image.LANCZOS)).astype(np.float32)


def over_white(rgba):
    a = rgba[..., 3:] / 255
    return rgba[..., :3] * a + 255 * (1 - a)


def extent(dark):
    """Bumper-to-bumper columns and roof-to-ground rows of a car, from a mask of its clearly dark pixels."""
    h, w = dark.shape
    cols = np.where(dark.sum(0) > h * 0.02)[0]
    rows = np.where(dark.sum(1) > w * 0.01)[0]
    return cols[0], cols[-1] + 1, rows[0], rows[-1] + 1


def carry(label, shot_rgb, frame0):
    """Carry a studio-shot label onto sprite frame 0 (same angle), scaled and shifted by the two cars' extents.
    Returns the label and a mask of trusted pixels: away from label edges, where the renders differ slightly."""
    x0, x1, y0, y1 = extent(shot_rgb.min(-1) < 200)
    u0, u1, v0, v1 = extent(over_white(frame0).min(-1) < 200)
    h, w = frame0.shape[:2]
    ys = np.clip(np.rint(y0 + (np.arange(h) - v0) * (y1 - y0) / (v1 - v0)).astype(int), 0, label.shape[0] - 1)
    xs = np.clip(np.rint(x0 + (np.arange(w) - u0) * (x1 - x0) / (u1 - u0)).astype(int), 0, label.shape[1] - 1)
    out = label[ys][:, xs]
    soft = blur(out * 255.0, 3)
    return out, ((soft > 245) | (soft < 10)) & (frame0[..., 3] > 128)


def train(samples, check=None):
    """samples: (features, label, usable) triples; each contributes a balanced sample."""
    xs, ys = [], []
    for F, label, use in samples:
        pos, neg = np.argwhere(label & use), np.argwhere(~label & use)
        n = min(len(pos), len(neg), 40000)
        pick = np.concatenate([pos[rng.choice(len(pos), n, False)], neg[rng.choice(len(neg), n, False)]])
        xs.append(F[pick[:, 0], pick[:, 1]])
        ys.append(label[pick[:, 0], pick[:, 1]].astype(np.float32))
    net = Classifier()
    net.fit(np.concatenate(xs), np.concatenate(ys))
    for name, (F, label, use) in zip(("studio shot", "sprite frame 0", "sprite frame 18"), samples):
        print(f"    mask accuracy on the {name}: {((net(F) > 0.5) == label)[use].mean():.3f}", flush=True)
    return net


def see_through(fr):
    """Glass the sprite renders partly transparent (inside the car, unlike the black ground shadow): never paint."""
    a, lum = fr[..., 3], fr[..., :3] @ LW
    return blur(((a > 60) & (a < 253) & (lum > 25)) * 255.0, 1.5) > 40


def box(a, r):
    """Mean over a (2r+1)-pixel square, float precision."""
    c = np.pad(a, ((r + 1, r), (r + 1, r)), mode="edge").cumsum(0).cumsum(1)
    k = 2 * r + 1
    return (c[k:, k:] - c[:-k, k:] - c[k:, :-k] + c[:-k, :-k]) / (k * k)


def refine(p, guide, r=4, eps=1e-3):
    """Guided filter (He et al.): the mask follows the image's own edges, so pixels the classifier is unsure of
    take the call of their surroundings. Then it is sharpened, so nothing is left half-painted (a grey haze)."""
    I = guide / 255
    mI, mp = box(I, r), box(p, r)
    a = (box(I * p, r) - mI * mp) / (box(I * I, r) - mI * mI + eps)
    b = mp - a * mI
    q = box(a, r) * I + box(b, r)
    return np.clip((q - 0.38) / 0.24, 0, 1)


def tone_curve(S, D, label):
    """Mean target colour for each luminance of the source paint, over the changed pixels."""
    edges = np.linspace(0, 255, 65)
    centres = (edges[:-1] + edges[1:]) / 2
    k = np.clip(np.digitize((S @ LW)[label], edges) - 1, 0, 63)
    n = np.bincount(k, minlength=64)
    ok = n >= 20
    curve = []
    for c in range(3):
        mean = np.bincount(k, D[label][:, c], minlength=64) / np.maximum(n, 1)
        curve.append(np.interp(centres, centres[ok], mean[ok]))
    return centres, np.stack(curve, -1)


def run(model):
    M = MODELS[model]
    for name, (fw, fh, (l, r)) in M["sprites"].items():
        print(f"{model} {name}", flush=True)
        # Studio shots at the sprite's scale, so the context features mean the same thing on both.
        width = round((r - l) * fw / (M["shot_body"][1] - M["shot_body"][0]))
        S = shot(model, M["source"], width)
        shots = {t: shot(model, t, width) for t in M["targets"]}
        changed = {t: np.abs(D - S).max(-1) > CHANGED for t, D in shots.items()}
        car = (np.abs(S - 255).sum(-1) > 10)
        # Paint = pixels most paints change; a one-off difference (a wheel caught at another rotation) is not paint.
        regular = [t for t in M["targets"] if t not in M.get("trim", [])]
        paint = np.mean([changed[t] for t in regular], 0) >= 0.5
        paint = blur(paint * 255.0, 1.0) > 127
        sprite = np.asarray(Image.open(SRC / model / f"{name}.png").convert("RGBA")).astype(np.float32)
        frame = lambda f: sprite[:, f * fw:(f + 1) * fw]

        # Trained on the studio shot and on sprite frames 0 and 18 (the left profile, and the right profile as
        # its mirror image), with the label carried across, so the classifier knows what glass and paint look
        # like in the sprite's own render.
        F, F0, F18 = features(S), features(over_white(frame(0))), features(over_white(frame(18)))
        def masks_for(label):
            on0, use0 = carry(label, S, frame(0))
            on18, use18 = carry(label[:, ::-1], S[:, ::-1], frame(18))
            base = [(F, label, car), (F0, on0, use0), (F18, on18, use18)]
            net = train(base)
            # Second pass: glass the sprite renders see-through, at every third angle, as "not paint", against
            # what the first pass is already sure is paint there, so front and rear glass are learned too.
            Fs, labs, uses = [], [], []
            for f in range(0, FRAMES, 3):
                fr = frame(f)
                Ff = features(over_white(fr))
                glass = see_through(fr)
                sure = (net(Ff) > 0.97) & (fr[..., 3] >= 253) & ~glass
                Fs.append(Ff), labs.append(sure), uses.append(sure | glass)
            if sum(u.sum() - l.sum() for l, u in zip(labs, uses)) < 500:
                return net  # no see-through glass in this sprite
            return train(base + [(np.concatenate(Fs), np.concatenate(labs), np.concatenate(uses))])
        print("  paint mask", flush=True)
        nets = {None: masks_for(paint)}
        for t in M.get("trim", []):
            print(f"  {t} mask (paint plus trim)", flush=True)
            nets[t] = masks_for(paint | (blur(changed[t] * 255.0, 1.0) > 127))

        # The sprite is a separate render, a little darker in the shadows: match its paint tones to the studio
        # shot's before looking them up (quantile mapping, measured on frame 0, which shares the shot's angle).
        f0 = frame(0)
        sprite_paint = (f0[..., :3] @ LW)[(nets[None](features(over_white(f0))) > 0.5) & (f0[..., 3] > 128)]
        shot_paint = (S @ LW)[paint]
        q = np.linspace(0, 1, 101)
        a = np.maximum.accumulate(np.quantile(sprite_paint, q) + np.arange(101) * 1e-4)
        b = np.quantile(shot_paint, q)

        masks = {}
        for key, net in nets.items():
            masks[key] = []
            for f in range(FRAMES):
                fr = frame(f)
                p = net(features(over_white(fr))) * (fr[..., 3] > 128) * ~see_through(fr)
                masks[key].append(refine(p, over_white(fr) @ LW) * (fr[..., 3] > 128) * ~see_through(fr))

        for t in M["targets"]:
            label = paint | (blur(changed[t] * 255.0, 1.0) > 127) if t in nets else paint
            centres, curve = tone_curve(S, shots[t], label & changed[t] if t not in nets else label)
            out = sprite.copy()
            for f in range(FRAMES):
                fr = frame(f)
                L = np.interp(fr[..., :3] @ LW, a, b)
                target = np.stack([np.interp(L, centres, curve[:, c]) for c in range(3)], -1)
                p = masks[t if t in nets else None][f][..., None]
                out[:, f * fw:(f + 1) * fw, :3] = fr[..., :3] + p * (target - fr[..., :3])
            im = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
            # Same 256-colour palette PNG as the official sprites, so the files stay a similar size.
            im = im.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
            dest = OUT / model / f"{name}-{t}.png"
            im.save(dest, optimize=True)
            print(f"  wrote {dest.relative_to(ROOT)} ({dest.stat().st_size // 1024} KB)", flush=True)


if __name__ == "__main__":
    for model in sys.argv[1:] or MODELS:
        run(model)
