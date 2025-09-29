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
import { Upload, Play, Download, Eye, AlertCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { wan25Client, Wan25VideoRequest } from "@/lib/wan25";
import { LoginDialog } from "@/components/auth/login-dialog";

interface GenerationResult {
  video_url: string;
  seed: number;
  actual_prompt: string;
  credits_used: number;
  request_id: string;
}

export function ImageToVideoGenerator() {
  const { toast } = useToast();
  const { user, loading } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("low resolution, error, worst quality, low quality, defects");
  const [resolution, setResolution] = useState<"480p" | "720p" | "1080p">("1080p");
  const [duration, setDuration] = useState<"5" | "10">("5");
  const [enablePromptExpansion, setEnablePromptExpansion] = useState(true);
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [result, setResult] = useState<GenerationResult | null>(null);

  // Login dialog state
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate the image
    const validation = wan25Client.validateImage(file);
    if (!validation.valid) {
      toast({
        title: "Invalid image",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAudioSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate the audio
    const validation = wan25Client.validateAudio(file);
    if (!validation.valid) {
      toast({
        title: "Invalid audio",
        description: validation.error,
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

    if (!selectedImage || (useCustomPrompt && !prompt.trim())) {
      toast({
        title: "Missing required fields",
        description: useCustomPrompt
          ? "Please select an image and enter a custom prompt"
          : "Please select an image",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setResult(null);

    try {
      // Convert image to base64 data URI
      const imageDataUri = await wan25Client.fileToDataUri(selectedImage);

      let audioDataUri: string | undefined;
      if (selectedAudio) {
        audioDataUri = await wan25Client.fileToDataUri(selectedAudio);
      }

      // Prepare the request
      const finalPrompt = useCustomPrompt
        ? prompt.trim()
        : "Create a natural and engaging video animation from this image, adding subtle motion and life to the scene while maintaining the original composition and style.";

      const request: Wan25VideoRequest = {
        prompt: finalPrompt,
        image_url: imageDataUri,
        audio_url: audioDataUri,
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
      const response = await wan25Client.generateVideo(request);

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (response.success && response.video) {
        setResult({
          video_url: response.video.url,
          seed: response.seed || 0,
          actual_prompt: response.actual_prompt || prompt,
          credits_used: response.credits_used || 1,
          request_id: response.request_id || "",
        });

        toast({
          title: "Video generated successfully!",
          description: `Used ${response.credits_used} credit${response.credits_used === 1 ? '' : 's'}`,
        });
      } else {
        throw new Error(response.error || "Generation failed");
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

  const handleDownload = async () => {
    if (!result?.video_url) return;

    try {
      const response = await fetch(result.video_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wanimate-${Date.now()}.mp4`;
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

  const creditsRequired = wan25Client.calculateCredits(resolution);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Wan 2.5 Image to Video
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Transform your images into dynamic videos with AI-powered motion generation
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Input Image *</Label>
            <div className="grid gap-4 md:grid-cols-2">
              <div
                className="border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="space-y-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      {selectedImage?.name}
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload image
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPEG, PNG, BMP, WEBP (max 10MB)
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
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
                  <p className="text-xs text-muted-foreground">
                    Higher quality takes longer to process but produces better results
                  </p>
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

                <Badge variant="outline" className="w-fit">
                  {creditsRequired} credit{creditsRequired === 1 ? '' : 's'} required
                </Badge>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/bmp,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

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
                AI will automatically generate an appropriate motion prompt for your image. Turn on Custom Prompt to write your own motion description.
              </p>
            )}
          </div>

          {/* Prompt */}
          {useCustomPrompt && (
            <div className="space-y-2">
              <Label htmlFor="prompt">Motion Prompt *</Label>
              <Textarea
                id="prompt"
                placeholder="Describe the motion you want to see in the video... (e.g., 'The character slowly walks forward with determination, wind gently moving their hair')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                maxLength={800}
              />
              <p className="text-xs text-muted-foreground">
                {prompt.length}/800 characters
              </p>
            </div>
          )}

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
            disabled={(!selectedImage || (useCustomPrompt && !prompt.trim()) || isGenerating) && user}
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
                  {generationProgress < 30 && "Processing image..."}
                  {generationProgress >= 30 && generationProgress < 60 && "Analyzing motion..."}
                  {generationProgress >= 60 && generationProgress < 90 && "Generating frames..."}
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
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={result.video_url}
                    controls
                    className="w-full h-full"
                    poster={imagePreview || undefined}
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