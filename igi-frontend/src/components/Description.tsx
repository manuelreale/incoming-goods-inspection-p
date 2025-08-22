import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import CornerWire from "./CornerWire"


interface DescriptionProps {
  tag: string | null
  animationState: number
}

// Text files
const FILES = [
  "01_description.txt",
  "02_description.txt",
  "03_description.txt",
  // ...
]

type Content = { title: string; description: string; imageUrl: string | null }

// --- robust image probing (no HEAD; avoid index.html fallbacks) ---
function probeImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(url)
    img.onerror = () => reject(new Error('not an image'))
    const sep = url.includes('?') ? '&' : '?'
    img.src = `${url}${sep}v=${Date.now()}`
  })
}

async function findImage(tagArg: string, nn: string): Promise<string | null> {
  const base = `/data/${tagArg}`
  const candidates = [
    `${base}/${nn}.png`,
    `${base}/${nn}.jpg`,
    `${base}/${nn}.jpeg`,
    `${base}/${nn}.webp`,
  ]
  for (const url of candidates) {
    try { return await probeImage(url) } catch { /* try next */ }
  }
  return null
}
// ------------------------------------------------------------------

export default function Description({ tag, animationState }: DescriptionProps) {
  const [{ title, description, imageUrl }, setContent] = useState<Content>({
    title: 'Scanning Item',
    description: 'Loading description...',
    imageUrl: null
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!tag) {
        if (!cancelled) setContent({ title: 'No tag detected.', description: '', imageUrl: null })
        return
      }

      const nn = String(animationState).padStart(2, '0')
      const match =
        FILES.find(f => f.startsWith(`${nn}_`) || f.startsWith(nn)) ??
        `${nn}_description.txt`

      try {
        const res = await fetch(`/data/${tag}/${match}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Not found')

        const raw = await res.text()
        const lines = raw.split(/\r?\n/)
        const newTitle = (lines[0] ?? '').trim() || 'Scanning Item'
        const newDesc = lines.slice(1).join('\n').trim() || 'Description not found.'
        const img = await findImage(tag, nn)

        if (!cancelled) {
          setContent({
            title: newTitle,
            description: newDesc,
            imageUrl: img
          })
        }
      } catch {
        if (!cancelled) {
          const img = await findImage(tag, nn)
          setContent({
            title: 'Scanning Item',
            description: 'Description not found.',
            imageUrl: img
          })
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [tag, animationState])

  return (
    <div className="flex flex-col items-left text-white px-8 pl-32 w-1/2">
        <AnimatePresence mode="wait">
          {animationState != 0 && (
          <motion.div 
            className="flex flex-row w-full"
            key={animationState}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3}}
          >
            {(animationState === 1 || animationState === 2 || animationState === 3 || animationState === 8 || animationState === 9) ? (
              <CornerWire
              className="mt-3.5"
              direction="down-right"
              height={800}
              width={100}
            />
            ) : (<CornerWire
              className="mt-3.5"
              direction="up-right"
              height={800}
              width={100}
            />)}

            <motion.div
              className="flex flex-col items-left ml-4 w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <h1 className="text-4xl font-bold w-full">
                {title}
              </h1>

              <p className="font-sectra text-3xl font-[100] whitespace-pre-wrap mt-3 w-full">
                {description}
              </p>

              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={title || 'Image'}
                  className="w-full max-w-2/3 object-contain mt-12"
                  loading="eager"
                  decoding="async"
                />
              )}
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>
    </div>
  )
}