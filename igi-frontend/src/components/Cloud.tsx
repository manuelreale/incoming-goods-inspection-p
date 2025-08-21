import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import Flow from "./Flow"
import type { FSMState } from "./types";




interface CloudProps {
    tag: string | null
    state: FSMState
    animationState: number
}

export default function Cloud({ tag, state, animationState}: CloudProps) {


    return (
        
        <motion.div className="absolute z-50 flex flex-col items-center justify-center pointer-events-auto w-1/2 h-full">
            <AnimatePresence mode="wait">
                {animationState == 4 && (
                    <motion.div 
                    className="flex flex-col items-center justify-center 1/3 h-full my-24"
                    initial={{ opacity: 0, y: 10}}
                    animate={{ opacity: 1, y: 0,
                    transition:{ duration: 0.4, delay: 1}
                    }}
                    exit={{ opacity: 0, y: -10,
                    transition:{ duration: 0.4, delay: 0}
                    }}
                    >
                    <img src="/Cloud.svg" className='w-full h-1/2'/>

                    <div className="flex flex-row items-center justify-center w-full h-1/2">
                        <Flow tag={tag} state={state} animationState={animationState} offset={0.0}/>
                        <Flow tag={tag} state={state} animationState={animationState} offset={0.3}/>
                        <Flow tag={tag} state={state} animationState={animationState} offset={0.6}/>
                    </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
        </motion.div>
    )
  }