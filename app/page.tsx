import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/config';

// New landing page components
import Banner from "@/components/home/banner";
import Hero from "@/components/home/hero";
import HowToUse from "@/components/home/how-to-use";
import KeyFeatures from "@/components/home/key-features";
import VideoShowcase from "@/components/home/video-showcase";
import Pricing from "@/components/home/pricing";
import FAQ from "@/components/home/faq";

export const metadata: Metadata = generatePageMetadata('/');

export default function Home() {
  return (
    <>
      <Banner />
      <div className="flex flex-col gap-8 md:gap-12 lg:gap-24">
        <Hero />
        <HowToUse />
        <KeyFeatures />
        <VideoShowcase />
        <Pricing />
        <FAQ />
      </div>
    </>
  );
}
