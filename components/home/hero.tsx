'use client'

import { AuroraBackground } from "@/components/ui/aurora-background";
import { FlipWords } from "@/components/ui/flip-words";
import { GlowingEffect } from "@/components/ui/glowing-effect";


export default function Hero() {
  const words = ["character", "person", "avatar", "figure"];

  return (
    <AuroraBackground className="h-auto min-h-screen">
      <div className="relative w-full">
        <div className="mx-auto max-w-7xl">
          <div className="relative z-10 pt-4 lg:w-full lg:max-w-2xl">
            <div className="relative px-6 py-16 sm:py-20 lg:px-8 lg:py-24 lg:pr-0">
              <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
                <h1 className="text-4xl font-semibold tracking-tight text-pretty text-foreground sm:text-6xl">
                  Wan 2.5 animate
                  <br />
                  <span className="whitespace-nowrap">
                    Animate any <FlipWords words={words} duration={1500} className="text-primary" />
                  </span>
                  from a source video
                </h1>
                <p className="mt-8 text-lg font-medium text-pretty text-muted-foreground sm:text-xl/8">
                  Transform any character with AI-powered animation from source videos
                </p>
                <div className="mt-10 flex-col gap-4">
                  <div className="relative inline-block hover:rotate-[10deg] hover:scale-105 transition-all duration-300 ease-out rounded-lg">
                    <GlowingEffect
                      spread={40}
                      glow={true}
                      disabled={false}
                      proximity={64}
                      inactiveZone={0.01}
                      borderWidth={2}
                      className="rounded-xl"
                    />
                    <a href="/creation" className="relative rounded-lg bg-primary px-8 py-3 text-lg font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary inline-block">
                      Get Started
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 flex items-center justify-center">
          <div className="relative p-4 lg:p-8">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/10 transform hover:scale-105 transition-transform duration-300">
              <video
                className="w-full h-auto min-h-[400px] lg:min-h-[500px] object-cover"
                autoPlay
                muted
                loop
                playsInline
                controls={false}
              >
                <source src="/images/first page video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  )
}
