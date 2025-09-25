import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  summary: string;
  date: string;
  readTime: string;
  category: string;
  slug: string;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Wan 2.2 Animate: The Evolution of AI Character Animation",
    summary: "Explore the groundbreaking features of Wan 2.2 Animate, the unified character animation and replacement AI that combines holistic replication technology with advanced motion transfer capabilities. Learn about its dual-mode operation, technical innovations, and open-source accessibility.",
    date: "December 15, 2025",
    readTime: "8 min",
    category: "Technology Deep Dive",
    slug: "wan-22-animate-evolution-ai-character-animation"
  },
  {
    id: "2",
    title: "Understanding Motion Transfer Technology in 2025",
    summary: "Dive deep into the technical architecture behind AI-powered motion transfer systems. From spatially-aligned skeleton signals to implicit facial feature extraction, discover how modern neural networks enable real-time character animation with unprecedented fidelity.",
    date: "December 12, 2025",
    readTime: "10 min",
    category: "Technical Tutorial",
    slug: "motion-transfer-technology-2025"
  },
  {
    id: "3",
    title: "The Future of Markerless Motion Capture",
    summary: "Analyzing how AI tools are revolutionizing motion capture by eliminating the need for expensive marker systems. Explore the computer vision breakthroughs that enable high-quality animation from standard camera footage and their impact on content creation workflows.",
    date: "December 8, 2025",
    readTime: "6 min",
    category: "Industry Insights",
    slug: "future-markerless-motion-capture"
  },
  {
    id: "4",
    title: "Neural Networks for Real-Time Character Animation",
    summary: "Examine the Phase-Functioned Neural Network approach and other cutting-edge architectures that enable real-time character animation. Learn about gating networks, motion prediction systems, and how CUDA acceleration makes live virtual production possible.",
    date: "December 5, 2025",
    readTime: "12 min",
    category: "Technical Deep Dive",
    slug: "neural-networks-realtime-character-animation"
  },
  {
    id: "5",
    title: "From 2D Video to 3D Animation: AI-Powered Workflows",
    summary: "Discover how modern AI systems can transform simple 2D video footage into sophisticated 3D character animations. Explore the technical challenges of depth estimation, pose detection, and motion synthesis in automated animation pipelines.",
    date: "December 2, 2025",
    readTime: "9 min",
    category: "Workflow Optimization",
    slug: "2d-video-3d-animation-ai-workflows"
  },
  {
    id: "6",
    title: "Holistic Replication: Body, Face, and Environment Integration",
    summary: "Understanding how Wan 2.2's holistic replication technology seamlessly combines body motion, facial expressions, and environmental lighting. Explore the Relighting LoRA technique and cross-attention mechanisms that create natural-looking character animations.",
    date: "November 28, 2025",
    readTime: "7 min",
    category: "Technology Analysis",
    slug: "holistic-replication-body-face-environment"
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Blog Articles
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Sharing technical insights on high-fidelity character animation.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid gap-8 md:gap-12">
          {blogPosts.length > 0 ? (
            blogPosts.map((post) => (
              <article key={post.id} className="border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span>{post.date}</span>
                  <span>{post.readTime} read</span>
                </div>

                <h2 className="text-2xl font-semibold mb-4 text-foreground hover:text-primary transition-colors">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>

                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {post.summary}
                </p>

                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Read more →
                </Link>
              </article>
            ))
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold mb-4 text-muted-foreground">
                Blog articles coming soon...
              </h3>
              <p className="text-muted-foreground">
                We're working on bringing you the latest insights on character animation technology.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}