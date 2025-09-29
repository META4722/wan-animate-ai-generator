"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Download, Eye, Trash2, Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface AnimationProject {
  id: string;
  character_name: string;
  character_image_url: string;
  reference_video_url: string;
  output_video_url?: string;
  status: "pending" | "processing" | "completed" | "failed";
  quality_mode: "standard" | "high";
  animation_mode: "character_replacement" | "face_swap" | "motion_transfer";
  credits_used: number;
  duration_seconds: number;
  progress_percentage?: number;
  created_at: string;
  completed_at?: string;
}

export function MyAnimationsCard() {
  const { user } = useUser();
  const { toast } = useToast();
  const [animations, setAnimations] = useState<AnimationProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnimations();
    }
  }, [user]);

  const fetchAnimations = async () => {
    try {
      // Try main API first, fallback to temp API
      let response = await fetch('/api/animations');
      if (!response.ok) {
        response = await fetch('/api/animations/temp');
      }

      if (response.ok) {
        const data = await response.json();
        setAnimations(data.animations || []);

        if (data.message) {
          console.log("Dashboard info:", data.message);
        }
      }
    } catch (error) {
      console.error('Failed to fetch animations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnimation = async (animationId: string) => {
    try {
      const response = await fetch(`/api/animations/${animationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAnimations(anims => anims.filter(anim => anim.id !== animationId));
        toast({
          title: "Animation deleted",
          description: "The animation has been removed from your projects.",
        });
      }
    } catch (error) {
      console.error('Failed to delete animation:', error);
      toast({
        title: "Failed to delete animation",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (animationId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/animations/${animationId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to download animation:', error);
      toast({
        title: "Failed to download",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case "character_replacement":
        return "Character Replace";
      case "face_swap":
        return "Face Swap";
      case "motion_transfer":
        return "Motion Transfer";
      default:
        return mode;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            My Animations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading your animations...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (animations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            My Animations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <div className="text-muted-foreground">No animations created yet</div>
            <Button onClick={() => window.location.href = '/#generator'}>
              Create Your First Animation
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          My Animations ({animations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {animations.map((animation, index) => (
            <motion.div
              key={animation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    {animation.character_image_url ? (
                      <img
                        src={animation.character_image_url}
                        alt="Character"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Play className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">
                        {animation.character_name || "Unnamed Character"}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getStatusColor(animation.status)}`}
                      >
                        {getStatusIcon(animation.status)}
                        <span className="ml-1 capitalize">{animation.status}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="capitalize">{getModeLabel(animation.animation_mode)}</span>
                      <span>•</span>
                      <span className="capitalize">{animation.quality_mode} Quality</span>
                      <span>•</span>
                      <span>{animation.duration_seconds}s</span>
                    </div>
                    {animation.status === "processing" && animation.progress_percentage && (
                      <div className="w-32 bg-muted rounded-full h-1.5 mt-1">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${animation.progress_percentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {animation.status === "completed" && animation.output_video_url && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(animation.output_video_url, '_blank')}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(animation.id, `${animation.character_name || 'animation'}.mp4`)}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAnimation(animation.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>Created {new Date(animation.created_at).toLocaleDateString()}</span>
                  {animation.completed_at && (
                    <>
                      <span>•</span>
                      <span>Completed {new Date(animation.completed_at).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span>{animation.credits_used} credits used</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}