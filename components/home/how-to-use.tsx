export default function HowToUse() {
  const steps = [
    {
      number: 1,
      title: "Sign up and get credits",
      description: "Create your account and purchase credits. 480p videos cost 5-10 credits, 720p costs 10-20 credits, and 1080p costs 15-30 credits depending on duration."
    },
    {
      number: 2,
      title: "Choose your generation method",
      description: "Select Text-to-Video to create videos from descriptions, or Image-to-Video to animate your existing images. Both support 5-second and 10-second durations."
    },
    {
      number: 3,
      title: "Configure and generate",
      description: "Enter your prompt or upload an image, choose resolution (480p/720p/1080p), aspect ratio (16:9/9:16/1:1), and optional audio. Click generate to start."
    },
    {
      number: 4,
      title: "Download your video",
      description: "Wait for processing to complete (usually 1-3 minutes), then download your AI-generated video. All videos are saved to your dashboard for future access."
    }
  ]

  return (
    <section className="py-12 md:py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            How to Use Wanimate AI
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Create stunning AI-powered videos from text or images in just a few simple steps.
          </p>
        </div>

        <div className="grid gap-6 md:gap-8 md:grid-cols-2">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl border-2 border-primary/20 bg-background/80 backdrop-blur-sm p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:border-primary/40"
            >
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {step.number}. {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}