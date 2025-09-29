import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { TextToVideoGenerator } from "@/components/wan25/text-to-video-generator";
import { ImageToVideoGenerator } from "@/components/wan25/image-to-video-generator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Image, Sparkles } from "lucide-react";

export const metadata = {
  title: "Wan 2.5 AI Video Generation | Wanimate AI",
  description: "Transform text and images into dynamic videos with AI-powered generation using Wan 2.5",
};

export default async function Wan25Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get user credits
  const { data: customerData } = await supabase
    .from("customers")
    .select("credits")
    .eq("user_id", user.id)
    .single();

  const credits = customerData?.credits || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-primary" />
                Wan 2.5 AI Video Generation
              </h1>
              <p className="text-muted-foreground mt-2">
                Create stunning videos from text descriptions or transform images into dynamic animations
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Available Credits</p>
              <p className="text-2xl font-bold">{credits}</p>
            </div>
          </div>

          {/* Warning for low credits */}
          {credits < 2 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Low Credits Warning
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      You have {credits} credit{credits === 1 ? '' : 's'} remaining.
                      5-second videos require 1 credit, and 10-second videos require 2 credits.
                      {credits === 0 && " You need to purchase more credits to generate videos."}
                    </p>
                  </div>
                  {credits === 0 && (
                    <div className="mt-4">
                      <a
                        href="/dashboard#pricing"
                        className="text-sm font-medium text-yellow-800 underline hover:text-yellow-900"
                      >
                        Purchase more credits →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generator Tabs */}
        <Tabs defaultValue="text-to-video" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="text-to-video" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Text to Video
            </TabsTrigger>
            <TabsTrigger value="image-to-video" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Image to Video
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text-to-video">
            <TextToVideoGenerator />
          </TabsContent>

          <TabsContent value="image-to-video">
            <ImageToVideoGenerator />
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Wan 2.5 Features</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-6">
              <h3 className="font-semibold mb-3">Native Audio</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Built-in audio generation</li>
                <li>• Custom audio upload support</li>
                <li>• Synchronized sound and visuals</li>
                <li>• Rich, immersive storytelling</li>
              </ul>
            </div>

            <div className="rounded-lg border p-6">
              <h3 className="font-semibold mb-3">Quality Options</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>480p:</strong> Fast processing</li>
                <li>• <strong>720p:</strong> Balanced quality</li>
                <li>• <strong>1080p:</strong> Premium quality</li>
                <li>• Multiple aspect ratios</li>
              </ul>
            </div>

            <div className="rounded-lg border p-6">
              <h3 className="font-semibold mb-3">Supported Formats</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Images: JPEG, PNG, BMP, WEBP</li>
                <li>• Audio: WAV, MP3</li>
                <li>• Aspect ratios: 16:9, 9:16, 1:1</li>
                <li>• Duration: 5 or 10 seconds</li>
              </ul>
            </div>

            <div className="rounded-lg border p-6">
              <h3 className="font-semibold mb-3">Advanced Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Improved prompt adherence</li>
                <li>• Automatic prompt expansion</li>
                <li>• Cinematic camera movements</li>
                <li>• Character consistency</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Use Cases</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border p-6 text-center">
              <Video className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Content Creation</h3>
              <p className="text-sm text-muted-foreground">
                Create engaging videos for social media, marketing campaigns, and storytelling
              </p>
            </div>

            <div className="rounded-lg border p-6 text-center">
              <Image className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Animation</h3>
              <p className="text-sm text-muted-foreground">
                Bring static images to life with natural movements and cinematic effects
              </p>
            </div>

            <div className="rounded-lg border p-6 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Prototyping</h3>
              <p className="text-sm text-muted-foreground">
                Quickly visualize concepts and ideas for films, games, and digital art
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}