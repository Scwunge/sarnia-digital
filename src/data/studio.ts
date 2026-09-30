export const STUDIO = {
  name: "Sarnia Digital",
  email: "hello@sarnia.digital",
  place: "Guernsey",
} as const;

export const WORK = [
  {
    name: "EnderPhone",
    href: "https://enderphone.cloud/",
    host: "enderphone.cloud",
    image: `${import.meta.env.BASE_URL}work/enderphone.jpg`,
    line: "A real phone, inside Minecraft.",
    body: "Players press H and get messages, calls, a camera, a map and proximity voice — on any server, not just one. The site is the download, the explanation, and the cape shop.",
    facts: ["Free mod", "Fabric & NeoForge", "Works on any server"],
  },
  {
    name: "EnderBio",
    href: "https://ender.bio/",
    host: "ender.bio",
    image: `${import.meta.env.BASE_URL}work/enderbio.jpg`,
    line: "One link that proves the games you play.",
    body: "Sign in with Steam, Discord or Minecraft and the page shows what is actually yours: skins, ranks, a CS2 inventory. Free to start. Premium is £2.50 a month.",
    facts: ["ender.bio/yourname", "Proof, not a pasted link", "Premium £2.50 / month"],
  },
] as const;

export const OFFERS = [
  {
    id: "business",
    label: "A business",
    title: "A site a customer can trust in a minute.",
    points: [
      "What you sell, said in one clear sentence.",
      "Who it is for, and where you are.",
      "A single next step: call, book, or write.",
      "Nothing listed that you do not actually do.",
    ],
  },
  {
    id: "product",
    label: "A product",
    title: "A site that gets the thing into their hands.",
    points: [
      "What it does, without the jargon.",
      "Where it runs, and who it is for.",
      "The price, or that it is free.",
      "A download or a signup on the first screen.",
    ],
  },
] as const;

export const NEEDS = [
  { id: "business", label: "A business site" },
  { id: "product", label: "A product site" },
  { id: "both", label: "The product and the site" },
] as const;
