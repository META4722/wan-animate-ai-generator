'use client'

import { useRef } from 'react'

export default function LogoCloud() {
  const videoRefs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)]

  const handleMouseEnter = (index: number) => {
    const video = videoRefs[index].current
    if (video) {
      try {
        const playPromise = video.play()
        if (playPromise && typeof (playPromise as Promise<void>).catch === 'function') {
          ;(playPromise as Promise<void>).catch((error: any) => {
            if (error && error.name !== 'AbortError') {
              // Non-abort errors can be logged for debugging
              // console.warn('Video play failed:', error)
            }
          })
        }
      } catch (error: any) {
        // Some browsers may throw synchronously; ignore AbortError
        if (!error || error.name !== 'AbortError') {
          // console.warn('Video play threw:', error)
        }
      }
    }
  }

  const handleMouseLeave = (index: number) => {
    const video = videoRefs[index].current
    if (video) {
      video.pause()
      video.currentTime = 0
    }
  }

  return (
    <div className="-my-8 md:-my-12 lg:-my-16">
      <div className="bg-card py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <h2 className="text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Start Creating</h2>
            <p className="text-center text-xl text-muted-foreground mt-4">Discover our multiple AI tools for architects and designers</p>
            <div className="mx-auto mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2 max-w-7xl">

              {/* Sketch to Render */}
              <div
                className="bg-background rounded-xl p-0 shadow-lg hover:shadow-xl transition-all duration-300"
                onMouseEnter={() => handleMouseEnter(0)}
                onMouseLeave={() => handleMouseLeave(0)}
              >
                <div className="flex flex-col">
                  <div className="relative w-full aspect-video rounded-t-xl overflow-hidden">
                    <video
                      ref={videoRefs[0]}
                      className="w-full h-full object-cover"
                      loop
                      muted
                      playsInline
                    >
                      <source src="/images/Sketch to render.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="p-6 space-y-4">
                    <h3 className="text-2xl font-bold">Sketch to Render</h3>
                    <p className="text-base text-muted-foreground">Transform hand-drawn sketches into photorealistic renders</p>
                  </div>
                </div>
              </div>

              {/* Elevation to Render */}
              <div
                className="bg-background rounded-xl p-0 shadow-lg hover:shadow-xl transition-all duration-300"
                onMouseEnter={() => handleMouseEnter(1)}
                onMouseLeave={() => handleMouseLeave(1)}
              >
                <div className="flex flex-col">
                  <div className="relative w-full aspect-video rounded-t-xl overflow-hidden">
                    <video
                      ref={videoRefs[1]}
                      className="w-full h-full object-cover"
                      loop
                      muted
                      playsInline
                    >
                      <source src="/images/ElevationRender.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="p-6 space-y-4">
                    <h3 className="text-2xl font-bold">Elevation to Render</h3>
                    <p className="text-base text-muted-foreground">Convert architectural elevations to stunning visualizations</p>
                  </div>
                </div>
              </div>

              {/* Exterior Design */}
              <div
                className="bg-background rounded-xl p-0 shadow-lg hover:shadow-xl transition-all duration-300"
                onMouseEnter={() => handleMouseEnter(2)}
                onMouseLeave={() => handleMouseLeave(2)}
              >
                <div className="flex flex-col">
                  <div className="relative w-full aspect-video rounded-t-xl overflow-hidden">
                    <video
                      ref={videoRefs[2]}
                      className="w-full h-full object-cover"
                      loop
                      muted
                      playsInline
                    >
                      <source src="/images/exterior4.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="p-6 space-y-4">
                    <h3 className="text-2xl font-bold">Exterior Design</h3>
                    <p className="text-base text-muted-foreground">Create beautiful exterior architectural designs with AI</p>
                  </div>
                </div>
              </div>

              {/* Interior Design */}
              <div
                className="bg-background rounded-xl p-0 shadow-lg hover:shadow-xl transition-all duration-300"
                onMouseEnter={() => handleMouseEnter(3)}
                onMouseLeave={() => handleMouseLeave(3)}
              >
                <div className="flex flex-col">
                  <div className="relative w-full aspect-video rounded-t-xl overflow-hidden">
                    <video
                      ref={videoRefs[3]}
                      className="w-full h-full object-cover"
                      loop
                      muted
                      playsInline
                    >
                      <source src="/images/Interior2.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="p-6 space-y-4">
                    <h3 className="text-2xl font-bold">Interior Design</h3>
                    <p className="text-base text-muted-foreground">Design stunning interior spaces with AI assistance</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
