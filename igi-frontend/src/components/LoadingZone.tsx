import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import PulseRect from "./PulseRect"
import type { FSMState } from "./types";




interface LoadingZoneProps {
    tag: string | null
    state: FSMState
    animationState: number
}

export default function DebugInfo({ tag, state, animationState}: LoadingZoneProps) {


    return (
        
        <motion.div className="absolute z-50 flex flex-col items-center justify-center pointer-events-auto w-1/3 h-1/2">
            <AnimatePresence mode="wait">
                {state=='state1' && (
                    <motion.div 
                    className="flex flex-col items-center justify-center"
                    initial={{ opacity: 0, y: 10}}
                    animate={{ opacity: 1, y: 0,
                    transition:{ duration: 0.4, delay: 1}
                    }}
                    exit={{ opacity: 0, y: -10,
                    transition:{ duration: 0.4, delay: 0}
                    }}
                    >
                        <PulseRect width={300} height={240} radius={28} color="#A100FF" waves={2} />
                        <p className="mt-8 text-xl font-graphik">Pick up one of these items</p>
                        <p className="mt-0 text-xl font-graphik">and put it on the belt</p>
                    </motion.div>
                )}
            </AnimatePresence>
            
        </motion.div>
    )
  }