import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface RetrievedDataProps {
  tag?: string | null;
  title?: string;
}

type Row = { name: string; href: string; icon: string };

const ICON_BY_EXT: Record<string, string> = {
  stl: "/3d.svg", step: "/3d.svg", stp: "/3d.svg", iges: "/3d.svg", igs: "/3d.svg",
  pdf: "/doc.svg", doc: "/doc.svg", docx: "/doc.svg", txt: "/doc.svg",
  png: "/img.svg", jpg: "/img.svg", jpeg: "/img.svg", webp: "/img.svg", svg: "/img.svg",
  csv: "/table.svg", xls: "/table.svg", xlsx: "/table.svg", tsv: "/table.svg",
};

function pickIcon(filename: string): string {
  const ext = (filename.split(".").pop() || "").toLowerCase();
  return ICON_BY_EXT[ext] ?? "/doc.svg";
}

export default function RetrievedData({
  tag = "tag one",
  title = "Retrieved data",
}: RetrievedDataProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!tag) { setRows([]); setStatus("idle"); return; }
      setStatus("loading");
      try {
        const res = await fetch(`/data/${tag}/RetrievedData.txt`, { cache: "no-store" });
        if (!res.ok) throw new Error("Not found");
        const text = await res.text();
        const items = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const mapped: Row[] = items.map(name => ({
          name,
          href: `/data/${tag}/${name}`,
          icon: pickIcon(name)
        }));
        if (!cancelled) { setRows(mapped); setStatus("ready"); }
      } catch {
        if (!cancelled) { setRows([]); setStatus("error"); }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [tag]);

  // Parent controls the cascade; children use variants (no per-item manual delays)
  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        delayChildren: 0.2,
        staggerChildren: 0.5,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  } as const;

  return (
    <div className="w-fit pr-[5vw] rounded-xl border border-[#A100FF]/50 bg-black/70 p-5">
      <h3 className="mb-3 text-[1.4vw] font-semibold text-white">{title}</h3>

      {status === "loading" && <div className="text-sm text-gray-400">Loading files…</div>}
      {status === "error" && (
        <div className="text-sm text-gray-400">
          Couldn’t read <code className="text-gray-300">RetrievedData.txt</code>.
        </div>
      )}
      {status === "ready" && rows.length === 0 && (
        <div className="text-sm text-gray-400">No files found.</div>
      )}

      {rows.length > 0 && (
        <motion.ul
          className="space-y-3"
          variants={listVariants}
          initial="hidden"
          animate={status === "ready" ? "show" : "hidden"}
          key={`rows-${tag}-${rows.map(r => r.name).join("|")}`}
        >
          {rows.map((r) => (
            <motion.li
              key={r.name}
              className="flex items-center gap-3"
              variants={itemVariants}
            >
              <img
                src={r.icon}
                alt=""
                className="h-[1vw] w-[1vw]"
                aria-hidden
                loading="eager"
                decoding="async"
              />
              <a
                href={r.href}
                className="text-gray-200 text-[1vw]/[1.2vw]"
              >
                {r.name}
              </a>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}