import Link from "next/link";
import Image from "next/image";
import { Anton } from "next/font/google";
import {
  ArrowUpRight,
  Users,
  Pencil,
  Move,
  Undo2,
  Share2,
  Sparkles,
  MousePointer2,
} from "lucide-react";


const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display" });

const PILLS = ["REAL-TIME", "MULTIPLAYER", "PEN & SHAPES", "UNDO / REDO", "ZOOM & PAN"];
const TICKER = ["LIVE CURSORS", "INFINITE CANVAS", "RESIZE & MOVE", "SHARE A LINK", "AUTOSAVE", "TEXT & PENCIL"];

export default function Home() {
  return (
    <main className={`${anton.variable} relative min-h-screen overflow-hidden bg-[#121212] text-[#ECE3D2] selection:bg-[#1C726D] selection:text-white`}>
      {/* warm depth: dual radial glows + grain */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-[#1C726D] opacity-25 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 top-40 h-[32rem] w-[32rem] rounded-full bg-[#ECC19C] opacity-[0.14] blur-[150px]" />
      <div className="grain absolute inset-0" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* ───────────────────────── NAV ───────────────────────── */}
        <nav className="flex items-center justify-between py-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/image.png" alt="Drawly logo" width={32} height={32} className="h-8 w-8 rounded-lg object-contain" priority />
            <span className={`${anton.className} text-xl tracking-wide`}>DRAWLY</span>
          </Link>
          <div className="hidden items-center gap-9 text-sm text-[#ECE3D2]/60 md:flex">
            <a href="#features" className="transition-colors hover:text-[#ECC19C]">Features</a>
            <a href="#how" className="transition-colors hover:text-[#ECC19C]">How it works</a>
            <a href="#showcase" className="transition-colors hover:text-[#ECC19C]">Showcase</a>
          </div>
          <Link
            href="/auth"
            className="rounded-full bg-[#1C726D] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            Start creating
          </Link>
        </nav>

        {/* ───────────────────────── HERO ───────────────────────── */}
        <section className="grid grid-cols-1 gap-10 pb-16 pt-6 lg:grid-cols-12 lg:gap-6">
          {/* Headline bleeds across the top */}
          <div className="lg:col-span-12">
            <h1 className={`${anton.className} leading-[0.84] tracking-tight`}>
              <span className="block text-[18vw] text-[#F4EAD5] sm:text-[15vw] lg:text-[11rem]">DRAW</span>
              <span className="block text-[18vw] text-[#ECC19C] sm:text-[15vw] lg:text-[11rem]">
                TOGETHER<span className="text-[#1C726D]">.</span>
              </span>
            </h1>
          </div>

          {/* Left: copy + pills + CTA */}
          <div className="flex flex-col gap-7 lg:col-span-5">
            <p className="max-w-md text-lg text-[#ECE3D2]/70">
              A shared canvas where your whole team sketches together — in real time. Open a room,
              drop a link, and watch everyone&apos;s cursor move at once.
            </p>

            <div className="flex flex-wrap gap-2.5">
              {/* {PILLS.map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-[#ECE3D2]/15 px-4 py-1.5 text-xs font-medium tracking-wide text-[#ECE3D2]/70"
                >
                  {p}
                </span>
              ))} */}
            </div>

            <Link
              href="/auth"
              className="group mt-1 flex max-w-md items-center justify-between rounded-2xl bg-[#1C726D] p-5 transition-colors hover:bg-[#1C726D]/90"
            >
              <span>
                <span className="block text-base font-semibold text-white">Start a room — it&apos;s free</span>
                <span className="block text-sm text-white/70">Invite anyone with a single link.</span>
              </span>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-[#1C726D] transition-transform group-hover:rotate-45">
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </Link>

            {/* live-now social proof */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  { i: "S", c: "#22c55e" },
                  { i: "P", c: "#3b82f6" },
                  { i: "C", c: "#ef4444" },
                ].map((a) => (
                  <span
                    key={a.i}
                    className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#121212] text-xs font-bold text-white"
                    style={{ background: a.c }}
                  >
                    {a.i}
                  </span>
                ))}
              </div>
              <span className="flex items-center gap-2 text-sm text-[#ECE3D2]/55">
                <span className="anim-live h-2 w-2 rounded-full bg-[#22c55e]" />
                creators drawing together right now
              </span>
            </div>
          </div>

          {/* Right: live multiplayer canvas mock */}
          <div className="lg:col-span-7">
            <CanvasMock />
          </div>
        </section>

        {/* feature ticker */}
        <div className="relative overflow-hidden border-y border-[#ECE3D2]/10 py-4">
          <div className="anim-ticker flex w-[200%] gap-10 whitespace-nowrap">
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className={`${anton.className} flex items-center gap-10 text-2xl text-[#ECE3D2]/15`}>
                {t} <Sparkles className="h-5 w-5 text-[#1C726D]" />
              </span>
            ))}
          </div>
        </div>

        {/* ───────────────────────── FEATURES ───────────────────────── */}
        <section id="features" className="py-20">
          <h2 className={`${anton.className} mb-10 text-4xl text-[#F4EAD5] sm:text-5xl`}>
            EVERYTHING ON ONE CANVAS
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Users, t: "Real-time multiplayer", d: "Every stroke syncs instantly through a Redis-backed pipeline." },
              { icon: Pencil, t: "A full toolset", d: "Rectangles, circles, lines, freehand pencil, and text." },
              { icon: Move, t: "Select, move, resize", d: "Grab a shape and drag its handles to reshape it." },
              { icon: Undo2, t: "Undo & autosave", d: "Ctrl+Z that syncs, and a board that reloads as you left it." },
            ].map((f) => (
              <div
                key={f.t}
                className="group rounded-2xl border border-[#ECE3D2]/10 bg-[#1A1A1A] p-6 transition-colors hover:border-[#1C726D]"
              >
                <span className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-[#1C726D]/15 text-[#ECC19C] transition-colors group-hover:bg-[#1C726D] group-hover:text-white">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mb-2 text-lg font-semibold text-[#F4EAD5]">{f.t}</h3>
                <p className="text-sm text-[#ECE3D2]/55">{f.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ───────────────────────── HOW IT WORKS ───────────────────────── */}
        <section id="how" className="border-t border-[#ECE3D2]/10 py-20">
          <h2 className={`${anton.className} mb-12 text-4xl text-[#F4EAD5] sm:text-5xl`}>THREE STEPS</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { n: "01", icon: Sparkles, t: "Create a room", d: "Sign in and spin up a fresh canvas in a click." },
              { n: "02", icon: Share2, t: "Share the link", d: "Copy the room link from the top-right and send it." },
              { n: "03", icon: MousePointer2, t: "Draw together", d: "Watch live cursors and shapes appear in real time." },
            ].map((s) => (
              <div key={s.n} className="relative">
                <span className={`${anton.className} text-6xl text-[#ECE3D2]/10`}>{s.n}</span>
                <div className="mt-3 flex items-center gap-3">
                  <s.icon className="h-5 w-5 text-[#1C726D]" />
                  <h3 className="text-xl font-semibold text-[#F4EAD5]">{s.t}</h3>
                </div>
                <p className="mt-2 max-w-xs text-sm text-[#ECE3D2]/55">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ───────────────────────── FINAL CTA ───────────────────────── */}
        <section id="showcase" className="pb-24">
          <div className="relative overflow-hidden rounded-3xl border border-[#1C726D]/40 bg-gradient-to-br from-[#143f3c] to-[#1A1A1A] p-10 text-center sm:p-16">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#ECC19C] opacity-10 blur-3xl" />
            <h2 className={`${anton.className} relative text-5xl text-[#F4EAD5] sm:text-7xl`}>
              IMAGINE FREELY
            </h2>
            <p className="relative mx-auto mt-4 max-w-md text-[#ECE3D2]/65">
              Bring your team to the canvas. No installs, no friction — just a link.
            </p>
            <Link
              href="/auth"
              className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-[#ECC19C] px-7 py-3.5 font-semibold text-[#121212] transition-transform hover:-translate-y-0.5"
            >
              Start creating <ArrowUpRight className="h-5 w-5" />
            </Link>
          </div>
        </section>

        {/* ───────────────────────── FOOTER ───────────────────────── */}
        <footer className="flex flex-col items-center justify-between gap-4 border-t border-[#ECE3D2]/10 py-8 text-sm text-[#ECE3D2]/40 sm:flex-row">
          <span className={`${anton.className} text-base text-[#ECE3D2]/70`}>DRAWLY</span>
          <span>Engineered with care by <b>SPC.</b></span>
        </footer>
      </div>
    </main>
  );
}

/* ── The signature element: a live multiplayer canvas preview ───────────── */
function CanvasMock() {
  return (
    <div className="anim-floaty relative aspect-[4/3] w-full rounded-3xl border border-[#ECE3D2]/10 bg-[#161616] shadow-2xl shadow-black/40">
      {/* window chrome */}
      <div className="flex items-center justify-between border-b border-[#ECE3D2]/10 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ef4444]/70" />
          <span className="h-3 w-3 rounded-full bg-[#ECC19C]/70" />
          <span className="h-3 w-3 rounded-full bg-[#22c55e]/70" />
        </div>
        <span className="flex items-center gap-2 text-xs text-[#ECE3D2]/40">
          <span className="anim-live h-2 w-2 rounded-full bg-[#22c55e]" /> room · live
        </span>
      </div>

      {/* the board */}
      <div className="relative h-[calc(100%-2.75rem)] w-full overflow-hidden rounded-b-3xl">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 280" preserveAspectRatio="xMidYMid meet">
          {/* translucent shapes in the app's drawing colors */}
          <rect x="44" y="48" width="120" height="84" rx="6" fill="#3b82f6" fillOpacity="0.12" stroke="#3b82f6" strokeWidth="2.5" />
          <circle cx="290" cy="92" r="46" fill="#22c55e" fillOpacity="0.12" stroke="#22c55e" strokeWidth="2.5" />
          <line x1="70" y1="210" x2="210" y2="168" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          {/* hand-drawn squiggle (echoes the reference image) */}
          <path
            className="anim-draw"
            d="M150 230 C 190 200, 210 250, 250 220 S 320 180, 360 215"
            fill="none"
            stroke="#ECC19C"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        {/* live cursors */}
        <div className="anim-cursorA absolute left-[26%] top-[30%]">
          <Cursor color="#22c55e" name="Aria" />
        </div>
        <div className="anim-cursorB absolute left-[62%] top-[58%]">
          <Cursor color="#3b82f6" name="Sam" />
        </div>
      </div>
    </div>
  );
}

function Cursor({ color, name }: { color: string; name: string }) {
  return (
    <div className="flex items-start gap-1">
      <MousePointer2 className="h-5 w-5 -rotate-12" style={{ color, fill: color }} />
      <span
        className="-mt-0.5 rounded-md px-2 py-0.5 text-[11px] font-semibold text-white"
        style={{ background: color }}
      >
        {name}
      </span>
    </div>
  );
}
