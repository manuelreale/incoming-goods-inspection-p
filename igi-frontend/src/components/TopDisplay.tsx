import { Children, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import Cloud from "./Cloud"
import Identification from "./Identification"
import Movement from "./Movement"
import Retrieval from "./Retrieval"
import RetrievedData from "./RetrievedData"
import type { FSMState } from "./types";


interface TopDisplayProps {
    tag: string | null
    state: FSMState
    animationState: number
    children: React.ReactNode
}

export default function TopDisplay({ tag, state, animationState, children }: TopDisplayProps) {
    return (
        <div className='flex flex-row items-center h-auto w-full aspect-[16/8] z-1 relative'>
            <Cloud tag={tag} state={state} animationState={animationState}/>
            <Identification tag={tag} state={state} animationState={animationState}/>
            <Movement tag={tag} state={state} animationState={animationState}/>
            <Retrieval tag={tag} state={state} animationState={animationState}/>
            {children}
        </div>
    )
}