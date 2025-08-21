import React, { useEffect, useState } from "react";
import type { FSMState } from "./types";

type Pt = { x: number; y: number };
type ItemResult = "Discarded" | "Good" | "Inspection" | null;

interface ArrowsProps {
  tag: string | null;
  state: FSMState; // ensure it includes "state6"
}

function roundedOrthogonalPath(start: Pt, end: Pt, r = 18) {
  const midX = (start.x + end.x) / 2;
  if (start.y === end.y) return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  const dirY = end.y > start.y ? 1 : -1;
  return [
    `M ${start.x} ${start.y}`,
    `H ${midX - r}`,
    `Q ${midX} ${start.y}, ${midX} ${start.y + dirY * r}`,
    `V ${end.y - dirY * r}`,
    `Q ${midX} ${end.y}, ${midX + r} ${end.y}`,
    `H ${end.x}`,
  ].join(" ");
}

export default function ArrowsSVG({ tag, state }: ArrowsProps) {
  // Visual constants
  const strokeWidth = 2;
  const gray = "#9ca3af";
  const purple = "#A100FF";
  const dash = "6 6";

  // Layout
  const W = 1137, H = 640;
  const startX = 900, endX = W;
  const yTopStart = 0.40 * H, yMidStart = 0.50 * H, yBotStart = 0.60 * H;
  const yTopEnd = 0.20 * H,  yMidEnd = 0.50 * H,  yBotEnd = 0.80 * H;

  const topStart: Pt = { x: startX, y: yTopStart };
  const midStart: Pt = { x: startX, y: yMidStart };
  const botStart: Pt = { x: startX, y: yBotStart };
  const topEnd: Pt = { x: endX, y: yTopEnd };
  const midEnd: Pt = { x: endX, y: yMidEnd };
  const botEnd: Pt = { x: endX, y: yBotEnd };
  const middleStraight = `M ${midStart.x} ${midStart.y} L ${midEnd.x} ${midEnd.y}`;

  // Result from file (first non-empty line)
  const [result, setResult] = useState<ItemResult>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if ((state !== "state6" && state !== "state7") || !tag) { if (!cancelled) setResult(null); return; }
      try {
        const res = await fetch(`/data/${tag}/ItemResult.txt?ts=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) throw new Error();
        const first = (await res.text()).split(/\r?\n/).map(l => l.trim()).find(Boolean) || "";
        const norm =
          first.toLowerCase() === "discarded" ? "Discarded" :
          first.toLowerCase() === "good" ? "Good" :
          first.toLowerCase() === "inspection" ? "Inspection" : null;
        if (!cancelled) setResult(norm);
      } catch { if (!cancelled) setResult(null); }
    }
    load();
    return () => { cancelled = true; };
  }, [state, tag]);

  // Style helpers
  const isActive = (name: Exclude<ItemResult, null>) => (state === "state6" || state === "state7") && result === name;
  const strokeFor = (name: Exclude<ItemResult, null>) => (isActive(name) ? purple : gray);
  const dashFor = (name: Exclude<ItemResult, null>) => (isActive(name) ? undefined : dash);
  const filterFor = (name: Exclude<ItemResult, null>) => (isActive(name) ? "url(#glow)" : undefined);
  const labelClass = (name: Exclude<ItemResult, null>) =>
    `absolute right-0 font-graphik ${isActive(name) ? "text-white font-bold" : "text-white/40"}`;

  return (
    <div className="absolute right-0 mr-32 w-full h-full">
      <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox={`0 0 ${W} ${H}`}>
        <defs>
          {/* Arrowhead inherits the stroke color of the path using context-stroke */}
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 Z" fill="context-stroke" />
          </marker>

          {/* Soft glow for active arrow */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b2" />
            <feMerge>
              <feMergeNode in="b2" />
              <feMergeNode in="b1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Top → Discarded */}
        <path
          d={roundedOrthogonalPath(topStart, topEnd)}
          fill="none"
          stroke={strokeFor("Discarded")}
          strokeWidth={strokeWidth}
          strokeDasharray={dashFor("Discarded")}
          markerEnd="url(#arrow)"
          vectorEffect="non-scaling-stroke"
          filter={filterFor("Discarded")}
        />

        {/* Middle → Good */}
        <path
          d={middleStraight}
          fill="none"
          stroke={strokeFor("Good")}
          strokeWidth={strokeWidth}
          strokeDasharray={dashFor("Good")}
          markerEnd="url(#arrow)"
          vectorEffect="non-scaling-stroke"
          filter={filterFor("Good")}
        />

        {/* Bottom → Inspection */}
        <path
          d={roundedOrthogonalPath(botStart, botEnd)}
          fill="none"
          stroke={strokeFor("Inspection")}
          strokeWidth={strokeWidth}
          strokeDasharray={dashFor("Inspection")}
          markerEnd="url(#arrow)"
          vectorEffect="non-scaling-stroke"
          filter={filterFor("Inspection")}
        />
      </svg>

      {/* Labels */}
      <div className={labelClass("Discarded")} style={{ top: "16%" }}>
        Discarded Item
      </div>
      <div className={labelClass("Good")} style={{ top: "52%" }}>
        Item Good
      </div>
      <div className={labelClass("Inspection")} style={{ bottom: "16%" }}>
        Item set for Inspection
      </div>
    </div>
  );
}