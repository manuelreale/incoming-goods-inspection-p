import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import RetrievedData from "./RetrievedData";
import Flow from "./Flow"
import type { FSMState } from "./types";




interface RetrievalProps {
    tag: string | null
    state: FSMState
    animationState: number
}

export default function Retrieval({ tag, state, animationState}: RetrievalProps) {


    return (
        
        <motion.div className="absolute z-50 flex flex-col items-center justify-center pointer-events-auto w-1/2 h-full">
            <AnimatePresence mode="wait">
                {animationState == 6 && (
                    <motion.div 
                    className="flex flex-col items-center justify-center w-full p-8 px-32 h-full "
                    initial={{ opacity: 0, y: 10}}
                    animate={{ opacity: 1, y: 0,
                    transition:{ duration: 0.4, delay: 1}
                    }}
                    exit={{ opacity: 0, y: -10,
                    transition:{ duration: 0.4, delay: 0}
                    }}
                    >
                    <img src="/Retrieval.svg" className='w-1/2 h-1/2'/>
                    <div className="flex flex-row items-center justify-center w-full h-full mb-8">
                        <Flow tag={tag} state={state} animationState={animationState} offset={0.0} direction='down' durationSec={4}/>
                        <Flow tag={tag} state={state} animationState={animationState} offset={0.3} direction='down' durationSec={4}/>
                        <Flow tag={tag} state={state} animationState={animationState} offset={0.6} direction='down' durationSec={4}/>
                    </div>
                    <RetrievedData/>
                    </motion.div>
                )}
            </AnimatePresence>
            
        </motion.div>
    )
  }