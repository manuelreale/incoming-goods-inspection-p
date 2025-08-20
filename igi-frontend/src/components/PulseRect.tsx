import { motion } from "framer-motion";

type PulseRectProps = {
  width?: number;      // px
  height?: number;     // px
  radius?: number;     // borderRadius in px
  color?: string;      // any CSS color
  duration?: number;   // seconds per wave
  waves?: number;      // how many overlapping pulses
  borderWidth?: number;// px
};

export default function PulseRect({
  width = 240,
  height = 120,
  radius = 20,
  color = "#4f46e5",
  duration = 1.8,
  waves = 3,
  borderWidth = 2,
}: PulseRectProps) {
  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: radius,
      }}
      className="flex items-center justify-center"
    >
      {/* Base rectangle */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          border: `${borderWidth}px solid ${color}`,
          opacity: 0.6,
        }}
      />

      {/* Pulses */}
      {Array.from({ length: waves }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            border: `${borderWidth}px solid ${color}`,
          }}
          initial={{ opacity: 0, scale: 1 }}
          animate={{
            opacity: [0, 0.6, 0.6, 0],
            scale: [1, 1.5], // scale only increases at the end
          }}
          transition={{
            duration,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
            delay: (i * duration) / waves,
            times: [0, 0.30, 0.4, 1], // map keyframes to percentages
          }}
        />
      ))}
    </div>
  );
}