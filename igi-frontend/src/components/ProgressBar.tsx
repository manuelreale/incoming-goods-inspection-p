import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import type { FSMState } from "./types";

interface ProgressProps {
    duration: number
    delay?: number
    // tag: string | null
    state: FSMState
    // animationState: number
}

export default function ProgressBar({ state, duration, delay = 0}: ProgressProps) {

    return (
        <AnimatePresence mode="wait">
            <motion.div 
                className="relative flex flex-col justify-start w-full h-4 mt-6 bg-white/20"
                initial={{ opacity: 0, y: 30}}
                animate={{ opacity: 1, y: 0,
                transition:{ duration: 0.3, delay: 2.2}
                }}
            >
                <motion.div 
                style={{ transformOrigin: "left center" }}
                className="w-full h-4 bg-white"
                initial={{ scaleX: 0}}
                    animate={{ scaleX: 1,
                    transition:{ duration, delay}
                    }}
                />
            </motion.div>
        </AnimatePresence>
    )
  }