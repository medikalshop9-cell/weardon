import React, { useId } from "react";
import { cn } from "../../lib/utils";
import './MorphText.css';

export function MorphText({
  words = ["CREATE", "DESIGN", "DEVELOP"],
  interval = 3000,
  subtext,
  fontSize = "clamp(3rem, 15vw, 10rem)",
  fontFamily = '"Space Grotesk", sans-serif',
  className,
  textClassName,
  subtextClassName,
}) {
  const uid = useId().replace(/:/g, "");
  const filterId = `morph-threshold-${uid}`;

  const totalDuration = (interval / 1000) * words.length;
  const wordDuration = interval / 1000;

  const wordStyles = words.map((_, i) => ({
    animationDelay: `${i * wordDuration}s`,
    animationDuration: `${totalDuration}s`,
  }));

  return (
    <div className={cn("morph-text-root", className)}>
      <svg
        aria-hidden="true"
        focusable="false"
        style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
      >
        <defs>
          <filter id={filterId}>
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div
        className={cn("morph-text-container", textClassName)}
        style={{
          fontSize,
          fontWeight: 700,
          filter: `url(#${filterId})`,
          fontFamily,
        }}
      >
        <div className="morph-word-rotator">
          {words.map((word, i) => (
            <span
              key={`${word}-${i}`}
              className="morph-word"
              style={wordStyles[i]}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {subtext && (
        <p
          className={cn("morph-subtext", subtextClassName)}
          style={{ fontFamily }}
        >
          {subtext}
        </p>
      )}
    </div>
  );
}

export default MorphText;
