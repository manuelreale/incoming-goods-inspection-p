import { useEffect, useState } from 'react'
import type { FSMState } from "./types";
import { FSM_STATES } from "./types";


interface DebugInfoProps {
    tag: string | null
    state: FSMState
    animationState: number
    changeState: (next: FSMState) => void
    changeTag: (next: string) => void
    changeAnimation: (next: number) => void
}

export default function DebugInfo({ tag, state, animationState, changeState, changeTag, changeAnimation}: DebugInfoProps) {

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

  function nextAnim() {
    changeAnimation(animationState + 1)
  }

  function prevAnim() {
    changeAnimation(animationState - 1)
  }


    return (
      <div className="absolute z-50 flex flex-col items-center pointer-events-auto ">
        <p className="text-s mt-6">
          {tag ? `The tag is: ${tag}` : 'No tag detected'}
        </p>
        <div className="flex flex-row items-center">
          <p className='w-20'>State:</p>
          <button className="bg-white/20 m-1 p-0.5 px-2.5 rounded-full" onClick={() => {decreaseState()}}>
             -
          </button>
          <p className="text-s w-15 text-center">
            {state ? `${state}` : 'state is null'}
          </p>
          <button className="bg-white/20 m-1 p-0.5 px-2.5 rounded-full" onClick={() => {increaseState()}}>
             +
          </button>
        </div>

        <div className="flex flex-row items-center">
          <p className='w-20'>Animation:</p>
          <button className="bg-white/20 m-1 p-0.5 px-2.5 rounded-full" onClick={() => {prevAnim()}}>
             -
          </button>
          <p className="text-s w-15 text-center">
            {state ? `${animationState}` : 'state is null'}
          </p>
          <button className="bg-white/20 m-1 p-0.5 px-2.5 rounded-full" onClick={() => {nextAnim()}}>
             +
          </button>
        </div>
      </div>
    )
  }