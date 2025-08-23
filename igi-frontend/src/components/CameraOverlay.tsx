import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ProgressBar from "./ProgressBar";
import type { FSMState } from "./types";

interface CameraOverlayProps {
  tag: string | null;
  state: FSMState;
  boxes: [number, number, number, number][]; // [x1, y1, x2, y2] in *source video pixels*
}

export default function CameraOverlay({ boxes, state }: CameraOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // ---------- Camera init ----------
  useEffect(() => {
    let active = true;
    (async () => {
      const video = videoRef.current;
      if (!video) return;
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        const usbCamera = videoDevices.find((d) =>
          d.label?.toLowerCase().includes("usb")
        );
        const selectedDeviceId =
          usbCamera?.deviceId ||
          videoDevices[1]?.deviceId ||
          videoDevices[0]?.deviceId;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true,
          audio: false,
        });

        if (!active) {
          // If unmounted before the stream arrives, stop tracks
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        video.srcObject = stream;
        await video.play();
      } catch (err) {
        console.error("Failed to start webcam:", err);
      }
    })();

    return () => {
      active = false;
      const v = videoRef.current;
      const s = v?.srcObject as MediaStream | null;
      if (s) s.getTracks().forEach((t) => t.stop());
      if (v) v.srcObject = null;
    };
  }, []);

  // ---------- Overlay scale/position sync (object-contain math) ----------
  useEffect(() => {
    const video = videoRef.current;
    const overlay = overlayRef.current;
    if (!video || !overlay) return;

    function updateScale() {
      if (!video || !overlay) return;

      // Intrinsic camera frame size (source pixels)
      const vw = video.videoWidth || 1;
      const vh = video.videoHeight || 1;

      // CSS box the <video> occupies (after responsive layout)
      const rect = video.getBoundingClientRect();
      const cw = rect.width;
      const ch = rect.height;

      // With object-contain, scale fits entirely without cropping
      const s = Math.min(cw / vw, ch / vh);

      // Displayed video area size (inside the video box)
      const dispW = vw * s;
      const dispH = vh * s;

      // Letterbox/pillarbox offset within the video box
      const offX = (cw - dispW) / 2;
      const offY = (ch - dispH) / 2;

      // Render overlay in *source pixel grid* then position/scale to match
      overlay.style.width = `${vw}px`;
      overlay.style.height = `${vh}px`;
      overlay.style.transformOrigin = "top left";
      overlay.style.transform = `translate(${offX}px, ${offY}px) scale(${s})`;
    }

    video.addEventListener("loadedmetadata", updateScale);
    const ro = new ResizeObserver(updateScale);
    ro.observe(video);
    window.addEventListener("resize", updateScale);

    // Initial run
    updateScale();

    return () => {
      video.removeEventListener("loadedmetadata", updateScale);
      ro.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  // Optional visual padding around boxes (set to 0 to verify perfect alignment)
  const PADDING = 0;

  return (
    <div className="w-full p-[6vw]">
      <motion.h1
        className="mt-10 text-black bg-white w-fit px-4 py-1 text-lg font-bold"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.4, delay: 2 } }}
        exit={{ opacity: 0, y: -10, transition: { duration: 0.4, delay: 0 } }}
      >
        Scanner feed
      </motion.h1>

      <motion.div
        className="relative overflow-hidden border-white border-2 w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.4, delay: 2 } }}
        exit={{ opacity: 0, y: -10, transition: { duration: 0.4, delay: 0 } }}
      >
        {/* The video uses object-contain so our math (no cropping) stays valid */}
        <video
          ref={videoRef}
          className="w-full h-auto object-contain opacity-100 block"
          muted
          autoPlay
          playsInline
        />

        {/* Overlay draws in source pixel space and is positioned/scaled via transform */}
        <div
          ref={overlayRef}
          className="absolute top-0 left-0 pointer-events-none"
          // width/height + transform are set in JS
        >
          {boxes.map(([x1, y1, x2, y2], idx) => {
            const left = x1 - PADDING;
            const top = y1 - PADDING;
            const w = (x2 - x1) + 2 * PADDING;
            const h = (y2 - y1) + 2 * PADDING;

            return (
              <div key={idx} className="absolute" style={{ left, top }}>
                {/* Label */}
                <div className="absolute -top-8 bg-purple-500 text-white font-semibold px-2 py-1 text-sm whitespace-nowrap border-2 border-purple-500 rounded-t-md">
                  Scanning Object
                </div>

                {/* Box */}
                <div
                  className="border-2 border-purple-500 rounded-md rounded-tl-none shadow-2xl shadow-purple-500/30"
                  style={{ width: w, height: h }}
                />
              </div>
            );
          })}

          {/* Finish overlay (kept as-is) */}
          <motion.div
            className="absolute inset-0 bg-black/80 flex flex-col justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5, delay: 30.5 } }}
          >
            <motion.img
              src="/Finished.svg"
              className="w-1/3 h-1/3"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 1, delay: 10 } }}
            />
          </motion.div>
        </div>
      </motion.div>

      <ProgressBar state={state} duration={30} delay={2} />
    </div>
  );
}