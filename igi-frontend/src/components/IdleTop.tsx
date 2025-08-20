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
                <div className="flex flex-col w-full h-full px-16 py-32 justify-center">
                    <img src="gts.svg" className="w-16 mb-8"></img>
                    <h1 className="text-5xl font-graphik font-bold mt-6">
                        Incoming Goods Inspection
                    </h1>
                    <h2 className="text-4xl font-sectra mt-2 text-white/70">
                        GenAI can bring significant automation in quality checks and report generation        
                    </h2>
                    <p className="text-3xl font-graphik font-light mt-16 text-white">
                    It also leverages a robotic arm to automatically sort cookies based on the detection results. This setup exemplifies how combining artificial intelligence with robotic automation can enhance manufacturing processes. The system aims to deliver a real-time, efficient, and scalable quality assurance solution for production lines.
                    </p>
                </div>
                <div className="flex flex-col w-full h-full px-16 py-32 justify-center">
                    <video src="Video.mp4" autoPlay muted className="w-full mb-8 rounded-xl"></video>
                </div>
            </motion.div>
            )}
        </AnimatePresence>
    )
  }