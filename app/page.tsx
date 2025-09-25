"use client";


// New landing page components
import Hero from "@/components/home/hero";
import HowToUse from "@/components/home/how-to-use";
import KeyFeatures from "@/components/home/key-features";
import Stats from "@/components/home/stats";
import Pricing from "@/components/home/pricing";
import FAQ from "@/components/home/faq";


export default function Home() {

  return (
    <div className="flex flex-col gap-8 md:gap-12 lg:gap-24">
      <Hero />
      <HowToUse />
      <KeyFeatures />
      <Stats />
      <Pricing />
      <FAQ />
    </div>
  );
}
