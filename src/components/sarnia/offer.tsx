import { useEffect, useState } from "react";

const THEMES = [
  { id: "night", label: "Night", panel: "bg-night", ink: "text-fog", chip: "bg-signal" },
  { id: "signal", label: "Signal", panel: "bg-signal", ink: "text-night", chip: "bg-night" },
  { id: "fog", label: "Fog", panel: "bg-fog", ink: "text-night", chip: "bg-signal" },
] as const;

const BLOCKS = ["Nav", "Headline", "Stage", "Proof", "Price", "Action"];

export function Craft() {
  const [theme, setTheme] = useState<(typeof THEMES)[number]["id"]>("night");
  const [built, setBuilt] = useState(false);
  const look = THEMES.find((item) => item.id === theme) ?? THEMES[0];

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setBuilt(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function rebuild() {
    setBuilt(false);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setBuilt(true));
    });
  }

  return (
    <section id="craft" className="border-t border-line bg-night">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <p className="font-mono text-xs text-signal">Craft</p>
        <h2 className="mt-3 max-w-xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          The page should move when the product does.
        </h2>
        <p className="mt-4 max-w-xl text-fog/70">
          EnderPhone lets you flip the handset and the theme. EnderBio lets you claim a name and watch the
          page prove it. This is the same kind of switch, built for a studio site.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="min-w-0 border border-line bg-panel p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-xs text-fog/50">Theme switch</p>
              <div className="flex gap-2">
                {THEMES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={theme === item.id}
                    onClick={() => setTheme(item.id)}
                    className={`tap h-10 px-3 font-mono text-xs ${
                      theme === item.id ? "bg-signal text-night" : "border border-line text-fog"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className={`mt-6 border border-line p-5 transition-colors duration-300 ${look.panel} ${look.ink}`}>
              <p className="font-mono text-xs opacity-70">sarnia.digital</p>
              <p className="mt-3 font-display text-3xl font-semibold leading-none">A site that answers.</p>
              <p className="mt-3 max-w-sm text-sm leading-relaxed opacity-80">
                Colour, type and the next step, settled before a visitor has to hunt.
              </p>
              <span className={`mt-5 inline-flex h-10 items-center px-4 font-mono text-xs ${look.chip} ${theme === "signal" ? "text-fog" : "text-night"}`}>
                Get in touch
              </span>
            </div>
          </div>

          <div className="min-w-0 border border-line bg-panel p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-xs text-fog/50">Page assemble</p>
              <button type="button" onClick={rebuild} className="tap h-10 border border-line px-3 font-mono text-xs">
                Rebuild
              </button>
            </div>
            <div className="mt-6 grid grid-cols-6 gap-2">
              {BLOCKS.map((label, blockIndex) => (
                <div
                  key={label}
                  className={`flex h-16 items-end border border-line bg-night p-2 font-mono text-xs text-fog/60 transition-all duration-500 ease-out ${
                    blockIndex === 0 ? "col-span-6" : blockIndex === 1 ? "col-span-4" : "col-span-2"
                  } ${built ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
                  style={{ transitionDelay: built ? `${blockIndex * 70}ms` : "0ms" }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
