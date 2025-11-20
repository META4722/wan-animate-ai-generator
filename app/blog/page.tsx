import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/config';
import Link from "next/link";

export const metadata: Metadata = generatePageMetadata('/blog');

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
    id: "7",
    title: "ArchiQuill: AI-Powered Architectural Rendering in Seconds",
    summary: "Discover how ArchiQuill transforms architectural sketches, elevations, and design concepts into photorealistic renderings using advanced AI. Learn about its browser-based workflow, industry-leading accuracy, and how it's helping architects save hours each week while accelerating client approvals.",
    date: "December 18, 2025",
    readTime: "6 min",
    category: "AI Tools Spotlight",
    slug: "archiquill-ai-architectural-rendering"
  },
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
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-background border-b">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              AI Animation
              <span className="block text-primary">Insights</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover the latest breakthroughs in AI-powered character animation, 
              technical deep-dives, and industry insights from our research team.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-20">
        {/* Featured Article */}
        {blogPosts.length > 0 && (
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Featured Article</h2>
              <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
            </div>
            
            <article className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="p-8 md:p-12">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
                    {blogPosts[0].category}
                  </span>
                  <span className="text-muted-foreground text-sm">{blogPosts[0].date}</span>
                  <span className="text-muted-foreground text-sm">{blogPosts[0].readTime} read</span>
                </div>

                <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight hover:text-primary transition-colors">
                  <Link href={`/blog/${blogPosts[0].slug}`}>
                    {blogPosts[0].title}
                  </Link>
                </h3>

                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  {blogPosts[0].summary}
                </p>

                <Link
                  href={`/blog/${blogPosts[0].slug}`}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Read Full Article
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          </div>
        )}

        {/* Recent Articles */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Recent Articles</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.slice(1).map((post) => (
              <article key={post.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                    <span className="text-muted-foreground text-xs">{post.readTime}</span>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors">
                    <Link href={`/blog/${post.slug}`} className="line-clamp-2">
                      {post.title}
                    </Link>
                  </h3>

                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">
                    {post.summary}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{post.date}</span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                    >
                      Read more →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
}