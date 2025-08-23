import { Children, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import Arrows from "./Arrows";
import type { FSMState } from "./types";


interface BottomDisplayProps {
    tag: string | null
    state: FSMState
    animationState: animationState
    children: React.ReactNode
}

export default function BottomDisplay({ tag, state, animationState, children }: BottomDisplayProps) {
    return (
        <div className='relative flex flex-row items-center h-auto w-full aspect-[16/9] border-t-1 border-white z-1'>
            <img src="/Bottom.svg" className='w-full'/>
            <Arrows tag={tag} state={state} animationState={animationState}/>
            {children}
        </div>
    )
}