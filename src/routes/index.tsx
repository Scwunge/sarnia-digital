import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/sarnia/header";
import { Hero } from "@/components/sarnia/hero";
import { Craft } from "@/components/sarnia/offer";
import { Start } from "@/components/sarnia/start";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Craft />
      <Start />
    </main>
  );
}
