import { motion } from "framer-motion";
import type { FSMState } from "./types";

interface FlowProps {
  tag: string | null;
  state: FSMState;
  animationState: number;
  durationSec?: number; // control speed
  offset?: number;      // 0–1 fraction of cycle offset
  direction?: "up" | "down"; // flow direction
}

export default function Flow({
  tag,
  state,
  animationState,
  durationSec = 6,
  offset = 0,
  direction = "up",
}: FlowProps) {
  const Panel = () => (
    <div
      className="
        w-full h-full
        bg-gradient-to-b
        from-[#A100FF]/100 from-5%
        via-[#A100FF]/10 via-15%
        to-[#A100FF]/0 to-90%
      "
    />
  );

  // Animation keyframes depending on direction
  const keyframes =
    direction === "up"
      ? ["0%", "-33.3333%", "-66.6667%"]
      : ["-66.6667%", "-33.3333%", "0%"];

  return (
    <div className="top-0 w-[0.5vw] h-full overflow-hidden blur-[1px] mr-[2vw]">
      <motion.div
        className="relative w-full h-[300%] flex flex-col will-change-transform"
        animate={{ y: keyframes }}
        transition={{
          duration: durationSec,
          ease: "linear",
          times: [0, 0.5, 1],
          repeat: Infinity,
          delay: -offset * durationSec, // negative delay = phase shift
        }}
      >
        <div className="w-full h-1/3"><Panel /></div>
        <div className="w-full h-1/3"><Panel /></div>
        <div className="w-full h-1/3"><Panel /></div>
      </motion.div>
    </div>
  );
}