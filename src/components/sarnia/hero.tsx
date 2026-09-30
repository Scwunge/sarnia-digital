import { useEffect, useState } from "react";
import { STUDIO, WORK } from "@/data/studio";

const TICKER = [
  "Sarnia.Digital",
  "EnderPhone",
  "A phone inside Minecraft",
  "EnderBio",
  "One link that proves it",
  "Based in Guernsey",
  "Sites for businesses and products",
];

export function Hero() {
  const [index, setIndex] = useState(0);
  const [fact, setFact] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [motionOk, setMotionOk] = useState(true);
  const piece = WORK[index];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setMotionOk(!media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!motionOk) return;
    const id = window.setInterval(() => {
      setFact((current) => (current + 1) % piece.facts.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [motionOk, piece.facts.length, index]);

  function choose(next: number) {
    setIndex(next);
    setFact(0);
    setTilt({ x: 0, y: 0 });
  }

  return (
    <section id="top" className="bg-night">
      <div className="overflow-hidden border-b border-line">
        <div className="marquee-track py-2">
          {[0, 1].map((copy) => (
            <p key={copy} className="flex shrink-0 font-mono text-xs tracking-wide text-fog/50">
              {TICKER.map((item) => (
                <span key={`${copy}-${item}`} className="px-4">
                  {item}
                  <span className="pl-4 text-signal">/</span>
                </span>
              ))}
            </p>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 lg:grid-cols-2 lg:py-16">
        <div className="min-w-0">
          <p className="rise font-mono text-xs tracking-wide text-signal">Studio · {STUDIO.place}</p>
          <h1 className="rise mt-4 font-display text-5xl font-semibold leading-none tracking-tight sm:text-7xl" style={{ animationDelay: "80ms" }}>
            Sarnia
            <span className="mt-1 block">Digital</span>
          </h1>
          <p className="rise mt-6 max-w-md text-lg leading-relaxed text-fog/75" style={{ animationDelay: "160ms" }}>
            We design and build the site a client can understand — and, when the job calls for it, the product
            behind it. Based in {STUDIO.place}.
          </p>
          <div className="rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
            <a href="#start" className="tap inline-flex h-12 items-center bg-signal px-5 font-mono text-sm text-night">
              Start a project
            </a>
            <a
              href="#stage"
              className="tap inline-flex h-12 items-center border border-line px-5 font-mono text-sm text-fog"
            >
              See the live work
            </a>
          </div>
        </div>

        <div id="stage" className="min-w-0" style={{ perspective: "1200px" }}>
          <div className="mb-3 flex flex-wrap gap-2">
            {WORK.map((item, itemIndex) => {
              const on = itemIndex === index;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => choose(itemIndex)}
                  className={`tap h-11 px-4 font-mono text-xs ${on ? "bg-signal text-night" : "border border-line text-fog"}`}
                  aria-pressed={on}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
          <div
            className="overflow-hidden rounded-lg border border-line bg-panel transition-transform duration-200 ease-out"
            style={{
              transform: motionOk ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : undefined,
            }}
            onPointerMove={(event) => {
              if (!motionOk || event.pointerType !== "mouse") return;
              const rect = event.currentTarget.getBoundingClientRect();
              const px = (event.clientX - rect.left) / rect.width - 0.5;
              const py = (event.clientY - rect.top) / rect.height - 0.5;
              setTilt({ x: py * -5, y: px * 7 });
            }}
            onPointerLeave={() => setTilt({ x: 0, y: 0 })}
          >
            <div className="flex h-10 items-center justify-between border-b border-line px-3 font-mono text-xs text-fog/50">
              <span>{piece.host}</span>
              <span className="text-signal">{piece.facts[fact]}</span>
            </div>
            <div className="relative aspect-video bg-night">
              {WORK.map((item, itemIndex) => (
                <img
                  key={item.name}
                  src={item.image}
                  alt={`${item.name} homepage`}
                  className={`absolute inset-0 h-full w-full object-contain object-top transition-all duration-500 ease-out ${
                    itemIndex === index ? "opacity-100" : "translate-y-2 opacity-0"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl border-t border-line">
        {WORK.map((item, itemIndex) => (
          <article
            key={item.name}
            inert={itemIndex !== index}
            className={`col-start-1 row-start-1 px-4 py-8 transition-opacity duration-300 ${
              itemIndex === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <p className="font-mono text-xs text-signal">0{itemIndex + 1}</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{item.line}</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-fog/70">{item.body}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {item.facts.map((label, factIndex) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setIndex(itemIndex);
                    setFact(factIndex);
                  }}
                  className={`tap h-10 border px-3 font-mono text-xs ${
                    factIndex === fact && itemIndex === index
                      ? "border-signal text-signal"
                      : "border-line text-fog/70"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="tap mt-6 inline-flex h-12 items-center font-mono text-sm text-signal"
            >
              Open {item.host} →
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
