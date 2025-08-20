import { motion } from 'framer-motion';
import type { FSMState } from "./types";


interface LightProps {
  state: FSMState
}

const PRESETS: Record<LightProps['state'], { x: string; y: string; width: string; height: string }> = {
  state1: { x: "0%",    y: "75%",    width: "40%", height: "40%" },
  state1_1: { x: "20%",    y: "75%",    width: "20%", height: "20%" },
  state2: { x: "50%",    y: "50%",    width: "40%", height: "75%" }, 
  state3: { x: "50%",    y: "50%",    width: "40%", height: "75%" }, 
  state4: { x: "50%",    y: "50%",    width: "40%", height: "75%" }, 
  state4_1: { x: "50%",    y: "0%",    width: "40%",  height: "50%" }, 
  state5: { x: "50%",    y: "50%",    width: "40%",  height: "50%" }, 
  state6: { x: "75%",    y: "75%",    width: "40%",  height: "50%" }, 
  state7: { x: "75%",    y: "75%",    width: "40%",  height: "50%" }, 
};

export default function Light({ state }: LightProps) {
  
  const { x, y, width, height } = PRESETS[state] ?? { 
    x: "50%", y: "50%", width: "40%", height: "40%" 
  };

  // If you want offsets to shrink when the blob is larger, keep these multipliers.
  // Otherwise, set both to 1.
  const xMul = 100 / parseFloat(width);   // e.g. width=100% -> 1, 40% -> 2.5
  const yMul = 100 / parseFloat(height);  // e.g. height=50% -> 2

  return (
    <motion.div
      className="pointer-events-none bg-[#C259FF]/60 mix-blend-plus-lighter blur-[450px] rounded-full absolute"
      style={{
        top: "0%",
        left: "0%",
      }}
      initial={false}
      animate={{
        // lock to center, then offset; multiply if you want inverse scaling vs size
        x: `calc(-50% + (${x}) * ${xMul})`,
        y: `calc(-50% + (${y}) * ${yMul})`,
        width,
        height,
      }}
      transition={{ type: 'spring', stiffness: 120, damping: 50, mass: 5 }}
    />
  );
}