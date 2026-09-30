// Builds site/img/flags.svg: the 26 letter flags of the International Code of Signals, as <symbol>s
// the page <use>s by id (#flag-A ... #flag-Z). Run: node tools/flags.mjs
//
// Every design was checked against the reference drawings on Wikimedia Commons (ICS_*.svg). The
// ones that are easy to get wrong: Oscar is red at the upper fly and yellow at the lower hoist;
// Yankee's ten stripes run "/" with yellow in the top-left corner; Zulu is yellow top, black hoist,
// red bottom, blue fly; Papa and Sierra's centre square is the middle third; Charlie is five equal
// bands; Delta's blue is the middle three fifths; Whiskey is concentric fifths.
//
// Drawn in a 50 x 40 box (hoist on the left). A and B are swallowtailed.
import { writeFileSync } from 'node:fs'

const W = 50, H = 40
const C = { red: '#D8322A', yellow: '#F2B90C', blue: '#1D3F94', white: '#FFFFFF', black: '#121212' }
const rect = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`
const poly = (pts, c) => `<polygon points="${pts.map((p) => p.join(',')).join(' ')}" fill="${c}"/>`
const field = (c) => rect(0, 0, W, H, c)
const hBands = (colours) => colours.map((c, i) => rect(0, (H / colours.length) * i, W, H / colours.length, c)).join('')
const vBands = (colours) => colours.map((c, i) => rect((W / colours.length) * i, 0, W / colours.length, H, c)).join('')
const quarters = (tl, tr, bl, br) => rect(0, 0, W / 2, H / 2, tl) + rect(W / 2, 0, W / 2, H / 2, tr) + rect(0, H / 2, W / 2, H / 2, bl) + rect(W / 2, H / 2, W / 2, H / 2, br)
const centreThird = (c) => rect(W / 3, H / 3, W / 3, H / 3, c)
const cross = (c) => rect(W / 2 - 4, 0, 8, H, c) + rect(0, H / 2 - 4, W, 8, c)
const saltire = (c) => `<path d="M0 0L${W} ${H}M${W} 0L0 ${H}" stroke="${c}" stroke-width="8"/>`
const TAIL = `M0 0H${W}L${W - 12} ${H / 2}L${W} ${H}H0Z`

// Yankee: "bendy sinister of ten", yellow first at the top-left. In unit coordinates the band edges
// are lines s + t = k/5; each band is clipped to the box by the polygon below.
function yankee() {
  const bands = []
  for (let k = 0; k < 10; k++) {
    const a = k / 5, b = (k + 1) / 5
    // Corners of the region a <= s + t <= b inside the unit square, walked in order.
    const pts = []
    const edge = (u) => (u <= 1 ? [[u, 0], [0, u]] : [[1, u - 1], [u - 1, 1]])
    const [a1, a2] = edge(a), [b1, b2] = edge(b)
    pts.push(a1, b1)
    if (a < 1 && b > 1) pts.splice(1, 0, [1, 0])
    pts.push(b2)
    if (a < 1 && b > 1) pts.push([0, 1])
    pts.push(a2)
    bands.push(poly(pts.map(([s, t]) => [+(s * W).toFixed(2), +(t * H).toFixed(2)]), k % 2 === 0 ? C.yellow : C.red))
  }
  return bands.join('')
}

const FLAGS = {
  A: { name: 'Alfa', meaning: 'I have a diver down; keep well clear at slow speed.', tail: true,
    body: `<path d="M0 0H${W / 2}V${H}H0Z" fill="${C.white}"/><path d="M${W / 2} 0H${W}L${W - 12} ${H / 2}L${W} ${H}H${W / 2}Z" fill="${C.blue}"/>` },
  B: { name: 'Bravo', meaning: 'I am taking in, discharging or carrying dangerous goods.', tail: true, body: `<path d="${TAIL}" fill="${C.red}"/>` },
  C: { name: 'Charlie', meaning: 'Affirmative.', body: hBands([C.blue, C.white, C.red, C.white, C.blue]) },
  D: { name: 'Delta', meaning: 'Keep clear of me; I am manoeuvring with difficulty.', body: field(C.yellow) + rect(0, H / 5, W, (H * 3) / 5, C.blue) },
  E: { name: 'Echo', meaning: 'I am altering my course to starboard.', body: hBands([C.blue, C.red]) },
  F: { name: 'Foxtrot', meaning: 'I am disabled; communicate with me.', body: field(C.white) + poly([[W / 2, 0], [W, H / 2], [W / 2, H], [0, H / 2]], C.red) },
  G: { name: 'Golf', meaning: 'I require a pilot.', body: vBands([C.yellow, C.blue, C.yellow, C.blue, C.yellow, C.blue]) },
  H: { name: 'Hotel', meaning: 'I have a pilot on board.', body: vBands([C.white, C.red]) },
  I: { name: 'India', meaning: 'I am altering my course to port.', body: field(C.yellow) + `<circle cx="${W / 2}" cy="${H / 2}" r="10" fill="${C.black}"/>` },
  J: { name: 'Juliett', meaning: 'I am on fire and have dangerous cargo on board.', body: hBands([C.blue, C.white, C.blue]) },
  K: { name: 'Kilo', meaning: 'I wish to communicate with you.', body: vBands([C.yellow, C.blue]) },
  L: { name: 'Lima', meaning: 'You should stop your vessel instantly.', body: quarters(C.yellow, C.black, C.black, C.yellow) },
  M: { name: 'Mike', meaning: 'My vessel is stopped and making no way through the water.', body: field(C.blue) + saltire(C.white) },
  N: { name: 'November', meaning: 'No (negative).',
    body: Array.from({ length: 16 }, (_, i) => rect((i % 4) * (W / 4), Math.floor(i / 4) * (H / 4), W / 4, H / 4, (i % 4 + Math.floor(i / 4)) % 2 ? C.white : C.blue)).join('') },
  O: { name: 'Oscar', meaning: 'Man overboard!', body: poly([[0, 0], [W, 0], [W, H]], C.red) + poly([[0, 0], [0, H], [W, H]], C.yellow) },
  P: { name: 'Papa', meaning: 'All persons should report on board; the vessel is about to put to sea.', body: field(C.blue) + centreThird(C.white) },
  Q: { name: 'Quebec', meaning: 'My vessel is healthy and I request free pratique.', body: field(C.yellow) },
  R: { name: 'Romeo', meaning: 'No meaning on its own; it spells.', body: field(C.red) + cross(C.yellow) },
  S: { name: 'Sierra', meaning: 'I am operating astern propulsion.', body: field(C.white) + centreThird(C.blue) },
  T: { name: 'Tango', meaning: 'Keep clear of me.', body: vBands([C.red, C.white, C.blue]) },
  U: { name: 'Uniform', meaning: 'You are running into danger.', body: quarters(C.red, C.white, C.white, C.red) },
  V: { name: 'Victor', meaning: 'I require assistance.', body: field(C.white) + saltire(C.red) },
  W: { name: 'Whiskey', meaning: 'I require medical assistance.', body: field(C.blue) + rect(W / 5, H / 5, (W * 3) / 5, (H * 3) / 5, C.white) + rect((W * 2) / 5, (H * 2) / 5, W / 5, H / 5, C.red) },
  X: { name: 'X-ray', meaning: 'Stop carrying out your intentions and watch for my signals.', body: field(C.white) + cross(C.blue) },
  Y: { name: 'Yankee', meaning: 'I am dragging my anchor.', body: yankee() },
  Z: { name: 'Zulu', meaning: 'I require a tug.',
    body: field(C.yellow) + poly([[0, 0], [W / 2, H / 2], [0, H]], C.black) + poly([[0, H], [W / 2, H / 2], [W, H]], C.red) + poly([[W, H], [W / 2, H / 2], [W, 0]], C.blue) },
}

// A hairline edge so white flags hold their shape on the paper-coloured page.
const edge = (tail) => `<path d="${tail ? TAIL : `M0 0H${W}V${H}H0Z`}" fill="none" stroke="#0F1A2E" stroke-opacity=".18" stroke-width="1"/>`

const symbols = Object.entries(FLAGS).map(([letter, f]) => {
  const clip = `clip-${letter}`
  return `<symbol id="flag-${letter}" viewBox="0 0 ${W} ${H}"><title>${letter} · ${f.name}</title>` +
    `<clipPath id="${clip}"><path d="${f.tail ? TAIL : `M0 0H${W}V${H}H0Z`}"/></clipPath>` +
    `<g clip-path="url(#${clip})">${f.body}</g>${edge(f.tail)}</symbol>`
}).join('\n')

writeFileSync(new URL('../site/img/flags.svg', import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg">\n<!-- International Code of Signals letter flags. Generated by tools/flags.mjs - edit that, not this. -->\n${symbols}\n</svg>\n`)

// The names and meanings the page shows on hover, as a small script the page loads.
const meanings = Object.fromEntries(Object.entries(FLAGS).map(([l, f]) => [l, [f.name, f.meaning]]))
writeFileSync(new URL('../site/js/flag-meanings.js', import.meta.url),
  `// Generated by tools/flags.mjs. The International Code of Signals meaning of each letter flag.\nwindow.FLAG_MEANINGS = ${JSON.stringify(meanings, null, 1)};\n`)
console.log('wrote', Object.keys(FLAGS).length, 'flags')
