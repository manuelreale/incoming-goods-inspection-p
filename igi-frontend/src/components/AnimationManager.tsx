import { useEffect, useState } from 'react'
import type { FSMState } from "./types";

interface AnimationManagerProps {
    tag: string | null
    state: FSMState
    animationState: number
    changeAnimation: (next: number) => void
}

export default function AnimationManager({ tag, state, animationState, changeAnimation}: AnimationManagerProps) {

  useEffect(() => {
      if(state=='state1'){
        changeAnimation(0)
      }
      if(state=='state2'){
        changeAnimation(1)
      }
      if(state=='state4'){
        changeAnimation(2)
      }
      if(state=='state4_1'){
        changeAnimation(3)
        setTimeout(()=>{changeAnimation(4)}, 5000)
        setTimeout(()=>{changeAnimation(5)}, 10000)
        setTimeout(()=>{changeAnimation(6)}, 15000)
        setTimeout(()=>{changeAnimation(7)}, 20000)
      }
      if(state=='state5'){
        changeAnimation(8)
      }
      if(state=='state6'){
        changeAnimation(9)
      }

    }, [state])


    return (
        <></>
    )
  }