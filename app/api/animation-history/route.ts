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
    let animations, animationsError;

    // Check video_generations table with error handling for missing columns
    let result;
    try {
      result = await supabase
        .from("video_generations")
        .select(`
          id,
          prompt,
          generation_type,
          resolution,
          duration,
          credits_used,
          status,
          created_at
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
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
        .order("created_at", { ascending: false })
        .limit(20);
    }

    animations = result.data;
    animationsError = result.error;

    // If video_generations is empty, also try animations table (if it exists)
    if (!animationsError && (!animations || animations.length === 0)) {
      try {
        const animResult = await supabase
          .from("animations")
          .select(`
          id,
          prompt,
          generation_type,
          resolution,
          duration,
          credits_used,
          status,
          created_at
        `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (!animResult.error && animResult.data) {
          animations = animResult.data;
        }
      } catch (error) {
        console.log("animations table not available:", error);
      }
    }

    if (animationsError) {
      console.error("Error fetching animation history:", animationsError);
      return NextResponse.json(
        { error: "Failed to fetch animation history" },
        { status: 500 }
      );
    }

    // Transform data to match the component interface
    const logs = animations?.map((anim) => ({
      id: anim.id,
      animation_mode: anim.generation_type || "text-to-video",
      quality_mode: anim.resolution === "480p" ? "standard" : "high",
      credits_used: anim.credits_used || 0,
      duration_seconds: anim.duration || 5,
      character_name: anim.prompt ? anim.prompt.substring(0, 50) + (anim.prompt.length > 50 ? "..." : "") : "Unknown",
      status: anim.status || "completed",
      created_at: anim.created_at,
    })) || [];

    // Calculate statistics with safe fallbacks
    const completedAnimations = animations?.filter(a => (a.status || 'completed') === 'completed') || [];
    const totalAnimations = completedAnimations.length;
    const totalCreditsUsed = completedAnimations.reduce((sum, a) => sum + (a.credits_used || 0), 0);
    const totalDurationGenerated = completedAnimations.reduce((sum, a) => sum + (a.duration || 5), 0);
    const avgCreditsPerAnimation = totalAnimations > 0 ? totalCreditsUsed / totalAnimations : 0;

    const stats = {
      total_animations: totalAnimations,
      total_credits_used: totalCreditsUsed,
      total_duration_generated: totalDurationGenerated,
      avg_credits_per_animation: avgCreditsPerAnimation,
    };

    return NextResponse.json({
      success: true,
      logs,
      stats,
    });

  } catch (error) {
    console.error("Error in /api/animation-history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}