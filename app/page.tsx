"use client";


// New landing page components
import Hero from "@/components/home/hero";
import LogoCloud from "@/components/home/logocloud";
import Features from "@/components/home/features";
import Stats from "@/components/home/stats";
import Pricing from "@/components/home/pricing";
import FAQ from "@/components/home/faq";


export default function Home() {

  return (
    <div className="flex flex-col gap-8 md:gap-12 lg:gap-24">
      <Hero /> 
      <LogoCloud />
      <Features />
      <Stats />
      <Pricing />
      <FAQ />
    </div>
  );
}
