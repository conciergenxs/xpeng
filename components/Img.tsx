import type { ImgHTMLAttributes } from "react";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & {
  /** Path without extension; every image ships as `name.webp` (2200w) and `name-sm.webp` (1000w). */
  src: string;
  priority?: boolean;
};

export default function Img({ src, alt = "", sizes = "100vw", priority, ...rest }: Props) {
  return (
    <img
      src={`${src}.webp`}
      srcSet={`${src}-sm.webp 1000w, ${src}.webp 2200w`}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      {...rest}
    />
  );
}
