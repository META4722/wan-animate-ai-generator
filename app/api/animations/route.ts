import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try video_generations table first since animations table doesn't exist yet
    let animations, error;

    // Check video_generations table with error handling for missing columns
    let result;
    try {
      result = await supabase
        .from("video_generations")
        .select(`
          id,
          prompt,
          video_url,
          resolution,
          duration,
          aspect_ratio,
          generation_type,
          character_image_url,
          status,
          credits_used,
          seed,
          actual_prompt,
          created_at,
          completed_at
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
    } catch (selectError) {
      // If some columns don't exist, try with basic columns only
      console.log("Trying basic columns for video_generations...");
      result = await supabase
        .from("video_generations")
        .select(`
          id,
          prompt,
          resolution,
          duration,
          status,
          created_at
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
    }

    animations = result.data;
    error = result.error;

    // If video_generations is empty, also try animations table (if it exists)
    if (!error && (!animations || animations.length === 0)) {
      try {
        const animResult = await supabase
          .from("animations")
          .select(`
          id,
          prompt,
          video_url,
          resolution,
          duration,
          aspect_ratio,
          generation_type,
          character_image_url,
          status,
          credits_used,
          seed,
          actual_prompt,
          created_at,
          completed_at
        `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!animResult.error && animResult.data) {
          animations = animResult.data;
        }
      } catch (animationsError) {
        console.log("animations table not available:", animationsError);
      }
    }

    if (error) {
      console.error("Error fetching animations:", error);
      return NextResponse.json(
        { error: "Failed to fetch animations" },
        { status: 500 }
      );
    }

    // Transform data to match the component interface with safe fallbacks
    const transformedAnimations = animations?.map((anim) => ({
      id: anim.id,
      character_name: anim.prompt ? anim.prompt.substring(0, 50) + (anim.prompt.length > 50 ? "..." : "") : "Unknown Animation",
      character_image_url: anim.character_image_url || "",
      reference_video_url: "", // We don't store this currently
      output_video_url: anim.video_url || "",
      status: (anim.status || "completed") as "pending" | "processing" | "completed" | "failed",
      quality_mode: anim.resolution === "480p" ? "standard" : "high" as "standard" | "high",
      animation_mode: (anim.generation_type === "text-to-video" ? "character_replacement" : "face_swap") as "character_replacement" | "face_swap" | "motion_transfer",
      credits_used: anim.credits_used || 0,
      duration_seconds: anim.duration || 5,
      created_at: anim.created_at,
      completed_at: anim.completed_at || anim.created_at,
    })) || [];

    return NextResponse.json({
      success: true,
      animations: transformedAnimations,
    });

  } catch (error) {
    console.error("Error in /api/animations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}