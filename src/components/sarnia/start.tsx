import { useMemo, useState } from "react";
import { NEEDS, STUDIO } from "@/data/studio";

const field = "mt-1 h-12 w-full border border-line bg-night px-3 text-fog";

export function Start() {
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [need, setNeed] = useState<(typeof NEEDS)[number]["id"]>("business");
  const [audience, setAudience] = useState("");
  const [action, setAction] = useState("");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);

  const brief = useMemo(() => {
    const kind = NEEDS.find((item) => item.id === need)?.label ?? "A website";
    return [
      "Project brief for Sarnia Digital",
      "",
      `Name: ${name || "—"}`,
      `Business: ${business || "—"}`,
      `Need: ${kind}`,
      `Who it is for: ${audience || "—"}`,
      `A visitor should be able to: ${action || "—"}`,
      `Notes: ${notes || "—"}`,
    ].join("\n");
  }, [action, audience, business, name, need, notes]);

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function sendBrief() {
    const subject = encodeURIComponent(`Project brief from ${name || "a client"}`);
    const body = encodeURIComponent(brief);
    window.location.href = `mailto:${STUDIO.email}?subject=${subject}&body=${body}`;
  }

  return (
    <section id="start" className="border-t border-line bg-panel">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:py-20 lg:grid-cols-2">
        <div className="min-w-0">
          <p className="font-mono text-xs text-signal">Start</p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Tell us what you sell.
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-fog/70">
            A short brief is enough. It goes to {STUDIO.email}. Say if that inbox should be somewhere else.
          </p>
          <pre className="mt-8 max-h-80 overflow-auto whitespace-pre-wrap border border-line bg-night p-4 font-mono text-xs leading-relaxed text-fog/80">
            {brief}
            <span className="caret text-signal"> ▍</span>
          </pre>
        </div>
        <form
          className="min-w-0"
          onSubmit={(event) => {
            event.preventDefault();
            sendBrief();
          }}
        >
          <label className="block font-mono text-xs">
            Your name
            <input value={name} onChange={(event) => setName(event.target.value)} className={field} autoComplete="name" />
          </label>
          <label className="mt-4 block font-mono text-xs">
            Business or product
            <input value={business} onChange={(event) => setBusiness(event.target.value)} className={field} />
          </label>
          <fieldset className="mt-4">
            <legend className="font-mono text-xs">What do you need?</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {NEEDS.map((item) => {
                const on = need === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setNeed(item.id)}
                    className={`tap h-11 px-3 font-mono text-xs ${on ? "bg-signal text-night" : "border border-line text-fog"}`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <label className="mt-4 block font-mono text-xs">
            Who is it for?
            <input
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
              className={field}
              placeholder="Minecraft players, local customers…"
            />
          </label>
          <label className="mt-4 block font-mono text-xs">
            What should a visitor be able to do?
            <input
              value={action}
              onChange={(event) => setAction(event.target.value)}
              className={field}
              placeholder="Download it, book, send an enquiry…"
            />
          </label>
          <label className="mt-4 block font-mono text-xs">
            Anything else
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              className="mt-1 w-full border border-line bg-night px-3 py-3 text-fog"
            />
          </label>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="submit" className="tap h-12 bg-signal px-5 font-mono text-sm text-night">
              Email the brief
            </button>
            <button type="button" onClick={copyBrief} className="tap h-12 border border-line px-5 font-mono text-sm">
              {copied ? "Copied" : "Copy the brief"}
            </button>
          </div>
        </form>
      </div>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-xl">
            Sarnia<span className="text-signal">.Digital</span>
          </p>
          <p className="font-mono text-xs text-fog/50">Sarnia Digital · sarnia.digital · {STUDIO.place}</p>
        </div>
      </footer>
    </section>
  );
}
