import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import type { FSMState } from "./types";




interface IdleTopProps {
    tag: string | null
    state: FSMState
    animationState: number
}

export default function IdleTop({ tag, state, animationState}: IdleTopProps) {

    return (
        <AnimatePresence>
            {state == "state1" && (
            <motion.div className="absolute z-500 flex flex-row w-full h-full"
                    initial={{ opacity: 0, y: 10}}
                    animate={{ opacity: 1, y: 0,
                    transition:{ duration: 0.4, delay: 1}
                    }}
                    exit={{ opacity: 0, y: -10,
                    transition:{ duration: 0.4, delay: 0}
                    }}
            >
                <div className="flex flex-col w-full h-full px-[4vw] py-[8vw] justify-center">
                    <img src="gts.svg" className="w-[4vw] mb-[2vw]"></img>
                    <h1 className="text-[3vw]/[3.2vw] font-graphik font-bold mt-6">
                        Incoming Goods Inspection
                    </h1>
                    <h2 className="text-[2.3vw]/[2.5vw] font-sectra mt-2 text-white/70">
                        GenAI can bring significant automation in quality checks and report generation        
                    </h2>
                    <p className="text-[1.6vw]/[1.8vw] font-graphik font-light mt-16 text-white">
                    It also leverages a robotic arm to automatically sort cookies based on the detection results. This setup exemplifies how combining artificial intelligence with robotic automation can enhance manufacturing processes. The system aims to deliver a real-time, efficient, and scalable quality assurance solution for production lines.
                    </p>
                </div>
                <div className="flex flex-col w-full h-full px-[4vw] py-[8vw] justify-center">
                    <video src="Video.mp4" autoPlay muted loop className="w-full h-auto mb-8 rounded-xl"></video>
                </div>
            </motion.div>
            )}
        </AnimatePresence>
    )
  }