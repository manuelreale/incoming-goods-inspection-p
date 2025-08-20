import { AnimatePresence, motion } from 'framer-motion';
import type { FSMState } from "./types";


interface ItemIndicatorProps {
  state: FSMState
}

export default function ItemIndicator({ state }: ItemIndicatorProps) {
  

  return (
    <motion.div 
      className="flex flex-col items-center justify-top absolute w-1/4 h-1/4 bottom-10 left-10"
      animate={ (state === "state2" || state === "state3")
        ? { x: 550 }
        : { x: 0 }
      }
      transition={{ duration: 10 }}
    >
      <AnimatePresence>
        {(state == "state1_1" || state == "state2") && (
          <>
      <motion.div
        className="bg-[#C259FF]/60 mix-blend-plus-lighter blur-[50px] rounded-full w-1/4 h-1/4"
        initial={{ opacity: 0, scale: 0}}
        animate={{ opacity: 1, scale: 4,
        transition:{ duration: 1, delay: 0}
        }}
        exit={{ opacity: 0, scale: 2,
        transition:{ duration: 0.4, delay: 0}
        }}
      />
      <motion.div
      className="w-[2px] h-[80px] bg-[#A100FF]/50 rounded-xl"
      initial={{ height: 0 }}
      animate={{ height: 150,
      transition:{ duration: 1, delay: 1}
      }}
      exit={{ height: 0,
      transition:{ duration: 0.4, delay: 0}
      }}
      ></motion.div>
      <motion.p
        className='mt-3 font-graphik text-xl'
        initial={{ opacity: 0, y: 10}}
        animate={{ opacity: 1, y: 0,
        transition:{ duration: 0.4, delay: 1}
        }}
        exit={{ opacity: 0, y: -10,
        transition:{ duration: 0.4, delay: 0}
        }}
      >
        {state == "state1_1" ? "Object Detected" : "Transporting to Scanner"}
        </motion.p>
      </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}