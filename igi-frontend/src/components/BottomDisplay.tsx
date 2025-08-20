import { Children, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import type { FSMState } from "./types";


interface BottomDisplayProps {
    tag: string | null
    state: FSMState
    children: React.ReactNode
}

export default function BottomDisplay({ tag, state, children }: BottomDisplayProps) {
    return (
        <div className='relative flex flex-row items-center h-auto w-full aspect-[16/9] border-t-1 border-white z-1'>
            <img src="/Bottom.svg" className='w-full'/>
            {children}
        </div>
    )
}