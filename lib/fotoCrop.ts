import type { FotoCrop } from "./sobre";
import type { CSSProperties } from "react";

/** Returns CSS styles to apply a stored FotoCrop to an <img> inside an overflow-hidden wrapper. */
export function applyCropStyles(crop: FotoCrop): {
  containerStyle: CSSProperties;
  imgStyle: CSSProperties;
} {
  return {
    containerStyle: { overflow: "hidden", position: "relative" },
    imgStyle: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: `${crop.x}% ${crop.y}%`,
      transform: `scale(${crop.scale})`,
      transformOrigin: `${crop.x}% ${crop.y}%`,
    },
  };
}
