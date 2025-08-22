import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import ProgressBar  from "./ProgressBar";
import type { FSMState } from "./types";


interface CameraOverlayProps {
    tag: string | null
    state: FSMState
    boxes: [number, number, number, number][] // [x1, y1, x2, y2]
}

export default function CameraOverlay({ boxes, state }: CameraOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function initCamera() {
      const video = videoRef.current
      if (!video) return
  
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        const usbCamera = videoDevices.find(d => d.label.toLowerCase().includes('usb'))
        const selectedDeviceId = usbCamera?.deviceId || videoDevices[1]?.deviceId || videoDevices[0]?.deviceId
  
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined }
        })
  
        video.srcObject = stream
        video.play()
      } catch (err) {
        console.error('Failed to start webcam:', err)
      }
    }
  
    initCamera()
  }, [])

  // Scale overlay to match rendered <video> without hardcoding source size
  useEffect(() => {
    const video = videoRef.current
    const overlay = overlayRef.current
    if (!video || !overlay) return

    function updateScale() {
      if (!video || !overlay) return
      const vw = video.videoWidth || 1
      const vh = video.videoHeight || 1
      const cw = video.clientWidth || vw
      const ch = video.clientHeight || vh
      const sx = cw / vw
      const sy = ch / vh
      overlay.style.transformOrigin = 'top left'
      overlay.style.transform = `scale(${sx}, ${sy})`
    }

    // Update when metadata is ready (intrinsic size known)
    video.addEventListener('loadedmetadata', updateScale)

    // Update when the rendered size changes
    const ro = new ResizeObserver(() => updateScale())
    ro.observe(video)

    // Initial try (in case metadata already available)
    updateScale()

    return () => {
      video.removeEventListener('loadedmetadata', updateScale)
      ro.disconnect()
    }
  }, [])

  return (
    <div className=''>
    <motion.h1 
        className="mt-10 text-black bg-white w-fit px-4 py-1 text-lg font-bold"
        initial={{ opacity: 0, y: 10}}
        animate={{ opacity: 1, y: 0,
          transition:{ duration: 0.4, delay: 2}
         }}
        exit={{ opacity: 0, y: -10,
          transition:{ duration: 0.4, delay: 0}
        }}
    >Scanner feed</motion.h1>
    <motion.div 
    className="relative overflow-hidden border-white border-2 w-fit"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0,
      transition:{ duration: 0.4, delay: 2}
     }}
    exit={{ opacity: 0, y: -10,
      transition:{ duration: 0.4, delay: 0}
    }}
    >
      <video
        ref={videoRef}
        className="w-auto h-auto object-cover opacity-100"
        muted
        autoPlay
        playsInline
      />
      <div ref={overlayRef} className="absolute inset-0 pointer-events-none ">
        {boxes.map(([x1, y1, x2, y2], idx) => (
          <div
            key={idx}
            className="absolute"
            style={{
              left: `${x1 - 10}px`,
              top: `${y1 - 10}px`,
            }}
          >
            {/* Label */}
            <div className="absolute -top-8 bg-purple-500 text-white font-semibold px-2 py-1 text-sm whitespace-nowrap border-2 border-purple-500 rounded-t-md ">
              Scanning Object
            </div>
  
            {/* Box */}
            <div
              className="border-2 border-purple-500 rounded-md rounded-tl-none shadow-2xl shadow-purple-500/30"
              style={{
                width: `${x2 - x1 + 20}px`,
                height: `${y2 - y1 + 20}px`,
              }}
            />
          </div>
        ))}
        <motion.div
        className='absolute w-full h-full bg-black/80 flex flex-col justify-center items-center'
        initial={{ opacity: 0}}
            animate={{ opacity: 1,
            transition:{ duration: 0.5, delay: 30.5}
            }}
        >
          <motion.img 
            src="/Finished.svg" 
            className='w-1/3 h-1/3'
            initial={{ opacity: 0, y: 50}}
            animate={{ opacity: 1, y: 0,
            transition:{ duration: 1, delay: 10}
            }}
          />
        </motion.div>
      </div>
    </motion.div>
    <ProgressBar state={state} duration={30} delay={2}/>
    </div>
  )
}