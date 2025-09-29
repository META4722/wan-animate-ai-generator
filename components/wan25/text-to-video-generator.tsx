"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { Upload, Play, Download, Eye, Sparkles, Video } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LoginDialog } from "@/components/auth/login-dialog";

interface TextToVideoRequest {
  prompt: string;
  audio_url?: string;
  aspect_ratio?: "16:9" | "9:16" | "1:1";
  resolution?: "480p" | "720p" | "1080p";
  duration?: "5" | "10";
  negative_prompt?: string;
  enable_prompt_expansion?: boolean;
  seed?: number;
}

interface GenerationResult {
  video_url: string;
  seed: number;
  actual_prompt: string;
  credits_used: number;
  request_id: string;
}

export function TextToVideoGenerator() {
  const { toast } = useToast();
  const { user, loading } = useUser();
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("low resolution, error, worst quality, low quality, defects");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [resolution, setResolution] = useState<"480p" | "720p" | "1080p">("1080p");
  const [duration, setDuration] = useState<"5" | "10">("5");
  const [enablePromptExpansion, setEnablePromptExpansion] = useState(true);
  const [useCustomPrompt, setUseCustomPrompt] = useState(true);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [result, setResult] = useState<GenerationResult | null>(null);

  // Login dialog state
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleAudioSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate the audio
    const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid audio format",
        description: "Audio must be WAV or MP3 format",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Audio must be smaller than 15MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedAudio(file);
  };

  const handleGenerate = async () => {
    // Check if user is authenticated first
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    if (useCustomPrompt && !prompt.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please enter a text prompt to generate your video",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setResult(null);

    try {
      let audioDataUri: string | undefined;
      if (selectedAudio) {
        audioDataUri = await fileToDataUri(selectedAudio);
      }

      // Prepare the request
      const finalPrompt = useCustomPrompt
        ? prompt.trim()
        : "Create a cinematic video scene with natural movement, engaging visuals, and professional quality cinematography.";

      const request: TextToVideoRequest = {
        prompt: finalPrompt,
        audio_url: audioDataUri,
        aspect_ratio: aspectRatio,
        resolution,
        duration,
        negative_prompt: negativePrompt.trim() || undefined,
        enable_prompt_expansion: enablePromptExpansion,
      };

      // Start generation with progress simulation
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 2000);

      // Generate the video
      const response = await fetch('/api/wan25/text-to-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.video) {
        setResult({
          video_url: data.video.url,
          seed: data.seed || 0,
          actual_prompt: data.actual_prompt || finalPrompt,
          credits_used: data.credits_used || 1,
          request_id: data.request_id || "",
        });

        toast({
          title: "Video generated successfully!",
          description: `Used ${data.credits_used} credit${data.credits_used === 1 ? '' : 's'}`,
        });
      } else {
        throw new Error(data.error || "Generation failed");
      }

    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDownload = async () => {
    if (!result?.video_url) return;

    try {
      const response = await fetch(result.video_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wanimate-text-to-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Please try again or open the video in a new tab",
        variant: "destructive",
      });
    }
  };

  const calculateCredits = (resolution: "480p" | "720p" | "1080p"): number => {
    return resolution === "480p" ? 5 : resolution === "720p" ? 10 : 15;
  };

  const creditsRequired = calculateCredits(resolution);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Text to Video Generation
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Create dynamic videos from text descriptions using AI-powered generation
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Custom Prompt Toggle */}
          <div className="space-y-2">
            <div className="gap-2 flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
              <Label htmlFor="custom-prompt-toggle" className="flex items-center gap-2 select-none text-sm font-medium">
                Custom Prompt
              </Label>
              <Switch
                id="custom-prompt-toggle"
                checked={useCustomPrompt}
                onCheckedChange={setUseCustomPrompt}
              />
            </div>
            {!useCustomPrompt && (
              <p className="text-xs text-muted-foreground px-3">
                AI will automatically generate a high-quality cinematic video. Turn on Custom Prompt to write your own scene description.
              </p>
            )}
          </div>

          {/* Text Prompt */}
          {useCustomPrompt && (
            <div className="space-y-2">
              <Label htmlFor="text-prompt">Video Description *</Label>
              <Textarea
                id="text-prompt"
                placeholder="Describe the video you want to create... (e.g., 'A majestic dragon soaring through clouds at sunset, cinematic lighting, epic fantasy scene')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                maxLength={800}
              />
              <p className="text-xs text-muted-foreground">
                {prompt.length}/800 characters
              </p>
            </div>
          )}

          {/* Video Settings */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={(value: "16:9" | "9:16" | "1:1") => setAspectRatio(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">
                    <div className="flex flex-col">
                      <span>16:9 - Landscape</span>
                      <span className="text-xs text-muted-foreground">Widescreen format</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="9:16">
                    <div className="flex flex-col">
                      <span>9:16 - Portrait</span>
                      <span className="text-xs text-muted-foreground">Mobile/TikTok format</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="1:1">
                    <div className="flex flex-col">
                      <span>1:1 - Square</span>
                      <span className="text-xs text-muted-foreground">Instagram format</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Video Quality</Label>
              <Select value={resolution} onValueChange={(value: "480p" | "720p" | "1080p") => setResolution(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="480p">
                    <div className="flex flex-col">
                      <span>480p - Standard</span>
                      <span className="text-xs text-muted-foreground">Fast processing</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="720p">
                    <div className="flex flex-col">
                      <span>720p - High</span>
                      <span className="text-xs text-muted-foreground">Good quality</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="1080p">
                    <div className="flex flex-col">
                      <span>1080p - Premium</span>
                      <span className="text-xs text-muted-foreground">Best quality (Recommended)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={duration} onValueChange={(value: "5" | "10") => setDuration(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 seconds</SelectItem>
                  <SelectItem value="10">10 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Badge variant="outline" className="w-fit">
            {creditsRequired} credit{creditsRequired === 1 ? '' : 's'} required
          </Badge>

          {/* Audio Upload (Optional) */}
          <div className="space-y-2">
            <Label>Background Audio (Optional)</Label>
            <div
              className="border border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => audioInputRef.current?.click()}
            >
              {selectedAudio ? (
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedAudio.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAudio(null);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <Upload className="h-5 w-5 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload audio (WAV, MP3, max 15MB)
                  </p>
                </div>
              )}
            </div>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/wav,audio/mp3,audio/mpeg"
              onChange={handleAudioSelect}
              className="hidden"
            />
          </div>

          {/* Negative Prompt */}
          <div className="space-y-2">
            <Label htmlFor="negative-prompt">Negative Prompt (Optional)</Label>
            <Textarea
              id="negative-prompt"
              placeholder="Describe what you don't want to see..."
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              rows={2}
              maxLength={500}
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={((useCustomPrompt && !prompt.trim()) || isGenerating) && user}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating Video...
              </>
            ) : !user ? (
              <>
                <Play className="h-4 w-4 mr-2" />
                Login to Generate Video
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Generate Video ({creditsRequired} credit{creditsRequired === 1 ? '' : 's'})
              </>
            )}
          </Button>

          {/* Progress */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Progress value={generationProgress} />
                <p className="text-sm text-muted-foreground text-center">
                  {generationProgress < 30 && "Analyzing prompt..."}
                  {generationProgress >= 30 && generationProgress < 60 && "Generating keyframes..."}
                  {generationProgress >= 60 && generationProgress < 90 && "Creating video..."}
                  {generationProgress >= 90 && "Finalizing video..."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Generated Video
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`${aspectRatio === '16:9' ? 'aspect-video' : aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-square'} bg-black rounded-lg overflow-hidden`}>
                  <video
                    src={result.video_url}
                    controls
                    className="w-full h-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Generation Details</p>
                    <p className="text-xs text-muted-foreground">
                      Seed: {result.seed} • Credits used: {result.credits_used}
                    </p>
                    {result.actual_prompt !== prompt && (
                      <details className="text-xs text-muted-foreground">
                        <summary className="cursor-pointer">Enhanced prompt</summary>
                        <p className="mt-1 p-2 bg-muted rounded text-xs">
                          {result.actual_prompt}
                        </p>
                      </details>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(result.video_url, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Dialog */}
      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />
    </div>
  );
}