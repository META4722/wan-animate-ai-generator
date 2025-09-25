export default function KeyFeatures() {
  const features = [
    {
      title: "Smooth, Natural Motion Capture-Free",
      description: "Generate full-body, facial, and hand animation with finger-level fidelity — all without mocap suits — for fluid shots that feel hand-crafted.",
      videoSrc: "https://storage.wananimate.video/feature1.mp4",
      reverse: false
    },
    {
      title: "Expressive Performance Transfer",
      description: "Mirror nuanced facial expressions, gestures, and emotional beats onto any character for believable acting, including phoneme-level lip sync and micro-expression mapping.",
      videoSrc: "https://storage.wananimate.video/feature2.mp4",
      reverse: true
    },
    {
      title: "Cinematic Camera Control",
      description: "Automatic multi-angle switching with depth and lighting polish to deliver film-grade storytelling in every shot.",
      videoSrc: "https://storage.wananimate.video/feature3.mp4",
      reverse: false
    },
    {
      title: "AI Smart Rigging",
      description: "Automated rig setup and fine-tuning so you can ship production-ready animation without technical bottlenecks.",
      videoSrc: "https://storage.wananimate.video/feature4.mp4",
      reverse: true
    }
  ]

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto flex w-full max-w-6xl flex-col gap-16">
        <header className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold text-foreground md:text-5xl">
            Wan Animate Key Features
          </h2>
          <p className="text-lg text-muted-foreground md:text-xl">
            Wan Animate keeps your character's identity locked while capturing the subtle performance beats that make every shot feel alive.
          </p>
        </header>

        <div className="space-y-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`grid gap-8 lg:grid-cols-2 lg:items-center ${
                feature.reverse
                  ? 'lg:[&>*:first-child]:col-start-2 lg:[&>*:first-child]:row-start-1 lg:[&>*:last-child]:col-start-1 lg:[&>*:last-child]:row-start-1'
                  : ''
              }`}
            >
              {/* Video */}
              <div className="overflow-hidden rounded-2xl border border-border/60 shadow-sm">
                <video
                  src={feature.videoSrc}
                  className="h-full w-full object-cover"
                  autoPlay
                  playsInline
                  loop
                  controls
                  muted
                />
              </div>

              {/* Text Content */}
              <div className="flex h-full items-center">
                <div className="space-y-4 text-left lg:space-y-6">
                  <h3 className="text-3xl font-semibold text-foreground md:text-4xl">
                    {feature.title}
                  </h3>
                  <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}