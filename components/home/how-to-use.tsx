export default function HowToUse() {
  const steps = [
    {
      number: 1,
      title: "Prepare your character still",
      description: "Upload a clear front-facing portrait or keyframe of your character at 1080p or higher so the generator can lock the design."
    },
    {
      number: 2,
      title: "Add a reference performance",
      description: "Select an MP4 or MOV clip under 45 seconds that captures the motion and expression you want Wan Animate to mirror."
    },
    {
      number: 3,
      title: "Launch the animation",
      description: "Hit \"Start animating.\" We'll upload, process, and queue the job—progress updates appear beside the generator."
    },
    {
      number: 4,
      title: "Wait for completion and save",
      description: "Once the job finishes, download the rendered clip and archive it with your project files. Assets remain in your library for later runs."
    }
  ]

  return (
    <section className="py-12 md:py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            How to Use Wan Animate
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Follow these steps to go from static art to a finished animation in minutes.
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