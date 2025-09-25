export default function VideoShowcase() {
  const videos = [
    {
      src: "https://storage.wananimate.video/demo1.mp4",
      title: "Animation Sample",
      description: "Character animation with expressive movements"
    },
    {
      src: "https://storage.wananimate.video/demo2.mp4",
      title: "Live-Action Sample",
      description: "Realistic motion transfer from live video"
    },
    {
      src: "https://storage.wananimate.video/demo3.mp4",
      title: "Commercial Sample",
      description: "Professional-grade animation for business use"
    }
  ]

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto flex w-full max-w-6xl flex-col gap-12">
        <header className="mx-auto max-w-3xl text-center space-y-4">
          <h2 className="text-4xl font-bold text-foreground md:text-5xl">
            Wan Animate Video Showcase
          </h2>
          <p className="text-lg text-muted-foreground md:text-xl">
            See the model's portrait-first outputs across real-world scenarios.
          </p>
        </header>

        <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((video, index) => (
            <div key={index} className="flex flex-col gap-5">
              <div className="relative aspect-[9/16] w-full overflow-hidden rounded-3xl border border-border/70 bg-black shadow-xl">
                <video
                  src={video.src}
                  className="absolute inset-0 h-full w-full object-cover"
                  autoPlay
                  playsInline
                  loop
                  controls
                  muted
                />
              </div>
              <h3 className="text-lg font-semibold text-foreground text-center">
                {video.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}