// A painted thumbnail, or a mostly transparent placeholder of the same size while the art catches up
// (engineering plan §5, art track). Every slot sits beside the item or variety name, so the alt text is
// empty and the painting is not announced twice (illustration guide §1 "Asset identifiers and handoff").
import { artSrc, artSrcSet } from "../shared/art";

export function Art({ id, className, sizes }: { id: string | null; className: string; sizes: string }) {
  if (id === null) return <span aria-hidden className={`block rounded-full bg-surface/70 ${className}`} />;
  return (
    <img
      src={artSrc(id)}
      srcSet={artSrcSet(id)}
      sizes={sizes}
      alt=""
      width={320}
      height={320}
      loading="lazy"
      decoding="async"
      className={`block object-contain ${className}`}
    />
  );
}
