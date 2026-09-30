import { useEffect, useState } from "react";

const LINKS = [
  { href: "#stage", label: "Work" },
  { href: "#craft", label: "Craft" },
  { href: "#start", label: "Start" },
];

export function Header() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone: "Europe/London",
      }).format(new Date());
    const tick = () => setTime(format());
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-night/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <a href="#top" className="font-display text-lg font-semibold tracking-tight">
          Sarnia<span className="text-signal">.Digital</span>
        </a>
        <p className="hidden items-center gap-2 font-mono text-xs text-fog/60 sm:flex">
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-signal" />
          Guernsey{time ? ` · ${time}` : ""}
        </p>
        <nav className="flex items-center gap-4">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="font-mono text-xs text-fog/70 hover:text-fog">
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
