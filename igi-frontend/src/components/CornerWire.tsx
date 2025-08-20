// CornerWire.tsx
import React, {useLayoutEffect, useRef, useState, useId } from "react";
import type { CSSProperties} from "react";
import { AnimatePresence, motion } from "framer-motion";

type Direction = "up-right" | "down-right";
type Flow = "towards-dot" | "away-from-dot";

export interface CornerWireProps {
  height?: number;
  width?: number;       // horizontal reach from dot to the vertical
  radius?: number;
  stroke?: number;
  color?: string;
  dot?: number;
  direction?: Direction;
  flow?: Flow;
  animate?: boolean;
  duration?: number;
  progress?: number;    // 0..1 (overrides auto animation if provided)
  className?: string;
  style?: CSSProperties;
  fadeStartOpacity?: number; // 0..1 opacity at the far end of the wire (default 0.1)
}

export default function CornerWire({
  height = 800,
  width = 40,
  radius = 12,
  stroke = 3,
  color = "#C259FF",
  dot = 16,
  direction = "down-right",
  flow = "towards-dot",
  animate = true,
  duration = 1.2,
  progress,
  className,
  style,
  fadeStartOpacity = 0.1,
}: CornerWireProps) {
  const halfDot = dot / 2;

  // SVG box
  const svgW = Math.max(width, radius) + stroke;
  const svgH = height + radius + stroke;

  // Path variants; choose one so the animation can end at the dot
  const forward = [
    `M ${svgW - stroke / 2} ${stroke / 2}`,
    `H ${radius + stroke / 2}`,
    `Q ${stroke / 2} ${stroke / 2} ${stroke / 2} ${radius + stroke / 2}`,
    `V ${svgH - stroke / 2}`,
  ].join(" ");

  const reversed = [
    `M ${stroke / 2} ${svgH - stroke / 2}`,
    `V ${radius + stroke / 2}`,
    `Q ${stroke / 2} ${stroke / 2} ${radius + stroke / 2} ${stroke / 2}`,
    `H ${svgW - stroke / 2}`,
  ].join(" ");

  const d = flow === "towards-dot" ? reversed : forward;
  const flipY = direction === "up-right";

  // Measure path for dash animation
  const pathRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength());
  }, [svgW, svgH, d]);

  // Stroke dash style
  const dashStyle: CSSProperties = (() => {
    if (len == null) return {};
    if (typeof progress === "number") {
      const p = Math.max(0, Math.min(1, progress));
      return { strokeDasharray: len, strokeDashoffset: (1 - p) * len };
    }
    if (animate) {
      return {
        strokeDasharray: len,
        strokeDashoffset: len,
        animation: `wireDraw ${duration}s ease forwards`,
      };
    }
    return {};
  })();

  // Dot visibility logic
  const dotShouldShow =
    typeof progress === "number" ? progress >= 1 : true;

  // Gradient endpoints (userSpaceOnUse) from path start (faded) to dot end (opaque)
  // Path start/end depend on which 'd' we chose above.
  const gradId = useId();
  const start = flow === "towards-dot"
    ? { x: stroke / 2, y: svgH - stroke / 2 }                       // 'reversed' starts bottom-left
    : { x: svgW - stroke / 2, y: stroke / 2 };                      // 'forward' starts top-right
  const end = flow === "towards-dot"
    ? { x: svgW - stroke / 2, y: stroke / 2 }                       // end near the dot
    : { x: stroke / 2, y: svgH - stroke / 2 };                      // end far from dot

  return (
    <div
      className={`relative inline-block ${className ?? ""}`}
      style={{ width: dot, height: dot, ...style }}
    >
      {/* Dot */}
      <AnimatePresence>
        {dotShouldShow && (
          <motion.div
            key="dot"
            className="rounded-full"
            style={{ width: dot, height: dot, background: color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity:
                typeof progress === "number"
                  ? progress >= 1
                    ? 1
                    : 0
                  : 1,
              scale:
                typeof progress === "number"
                  ? progress >= 1
                    ? 1
                    : 0.5
                  : 1,
              transition:
                typeof progress === "number"
                  ? { type: "spring", stiffness: 240, damping: 22 }
                  : { delay: duration, type: "spring", stiffness: 240, damping: 22 },
            }}
            exit={{ opacity: 0, scale: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* Wire */}
      <svg
        className="absolute"
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{
          right: dot - stroke / 2,                // attach to the dot’s right edge
          top: flipY ? halfDot + stroke / 2 : halfDot - stroke / 2, // align with dot vertical center
          transformOrigin: "top right",
          transform: flipY ? "scaleY(-1)" : "none",
          overflow: "visible",
          pointerEvents: "none",
        }}
      >
        <defs>
          <linearGradient
            id={gradId}
            gradientUnits="userSpaceOnUse"
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
          >
            <stop offset="0%" stopColor={color} stopOpacity={fadeStartOpacity} />
            <stop offset="100%" stopColor={color} stopOpacity={1} />
          </linearGradient>
        </defs>

        <path
          ref={pathRef}
          d={d}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={dashStyle}
        />
      </svg>

      <style>{`
        @keyframes wireDraw { to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
}