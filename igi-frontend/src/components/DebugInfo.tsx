import { useEffect, useState } from 'react'
import type { FSMState } from "./types";
import { FSM_STATES } from "./types";


interface DebugInfoProps {
    tag: string | null
    state: FSMState
    animationState: number
    changeState: (next: FSMState) => void
    changeTag: (next: string) => void
}

export default function DebugInfo({ tag, state, animationState, changeState, changeTag}: DebugInfoProps) {

  const [count, setCount] = useState(0);

  function increaseState() {
    setCount(prevCount => {
      changeTag("tag one")
      const newCount = prevCount < 9 ? prevCount + 1 : 1;
      changeState(FSM_STATES[newCount - 1]);
      return newCount;
    });
  }

  function decreaseState() {
    setCount(prevCount => {
      changeTag("tag one")
      const newCount = prevCount > 1 ? prevCount - 1 : 1;
      changeState(FSM_STATES[newCount - 1]);
      return newCount;
    });
  }


    return (
      <div className="absolute z-50 flex flex-col items-left pointer-events-auto ">
        <p className="text-s mt-6">
          {tag ? `The tag is: ${tag}` : 'No tag detected'}
        </p>
        <p className="text-s">
          {state ? `Current state is: ${state}` : 'state is null'}
        </p>
        <p className="text-s">
          {state ? `Animation state is: ${animationState}` : 'state is null'}
        </p>
        <button onClick={() => {increaseState()}}>
        Next State
      </button>

      <button onClick={() => {decreaseState()}}>
        Prev State
      </button>
      </div>
    )
  }