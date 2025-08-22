import { useEffect, useState } from 'react'
import Description from "./components/Description"
import CameraOverlay from "./components/CameraOverlay"
import TopDisplay from "./components/TopDisplay"
import BottomDisplay from "./components/BottomDisplay"
import DebugInfo from "./components/DebugInfo"
import IdleTop from "./components/IdleTop"
import Light from "./components/Light"
import LoadingZone from "./components/LoadingZone"
import AnimationManager from "./components/AnimationManager"
import type { FSMState } from "./component/types";
import { motion, AnimatePresence } from 'framer-motion';
import ItemIndicator from './components/ItemIndicator'

export default function App() {
  const [tag, setTag] = useState<string | null>(null)
  const [state, setState] = useState<FSMState>('state1')
  const [animationState, setAnimationState] = useState<number>(0)
  const [boxes, setBoxes] = useState<[number, number, number, number][]>([])

  useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout

    const connect = () => {
      console.log('🔄 Connecting to WebSocket...')
      ws = new WebSocket('ws://localhost:8000/ws')

      ws.onopen = () => {
        console.log('✅ WebSocket connected')
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log('📨 Data received:', data)

        if ('tag' in data || 'state' in data) {
          if ('tag' in data) setTag(data.tag)
          if ('state' in data) setState(data.state)
        }
        if ('boxes' in data) setBoxes(data.boxes)
      }

      ws.onerror = (err) => {
        console.error('❌ WebSocket error', err)
      }

      ws.onclose = () => {
        console.warn('⚠️ WebSocket closed, retrying in 2s...')
        reconnectTimeout = setTimeout(connect, 2000)
      }
    }

    connect()

    return () => {
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        console.log('🔌 Closing WebSocket...')
        ws.close()
      }
      clearTimeout(reconnectTimeout)
    }
  }, [])

  return (
      <div className="relative flex flex-col items-center justify-top h-screen w-full text-white overflow-hidden bg-black"> 
        <AnimationManager tag={tag} state={state} animationState={animationState} changeAnimation={(newValue) => setAnimationState(newValue)} changeState={(newValue) => setState(newValue)}/>
        <Light state={state}/>
        <ItemIndicator state={state}/>
        <DebugInfo tag={tag} state={state} animationState={animationState} changeState={(newValue) => setState(newValue)} changeTag={(newTag) => setTag(newTag)} changeAnimation={(newAnimation) => setAnimationState(newAnimation)}/>

        <TopDisplay tag={tag} state={state} animationState={animationState}>
          <IdleTop tag={tag} state={state} animationState={animationState}/>
          <div className='w-1/2 h-full overflow-hidden flex flex-col items-center justify-center'>
          <AnimatePresence>
            {(state == 'state4') && (
              <CameraOverlay boxes={boxes} tag={tag} state={state} />
            )}
          </AnimatePresence>
          </div>
          <Description tag={tag} animationState={animationState}/>
        </TopDisplay>

        <BottomDisplay tag={tag} state={state} animationState={animationState}>
          <LoadingZone tag={tag} state={state} animationState={animationState}/>
        </BottomDisplay>
      </div>
  )
}