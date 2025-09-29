import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Temporary solution: Use credits_history table to show animation history
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

    // Get user's video generation history from credits_history
    const { data: creditsHistory, error } = await supabase
      .from("credits_history")
      .select(`
        id,
        amount,
        type,
        description,
        created_at
      `)
      .eq("user_id", user.id)
      .in("type", ["wan25_text_video_generation", "wan25_video_generation"])
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching animation history:", error);
      return NextResponse.json(
        { error: "Failed to fetch animation history" },
        { status: 500 }
      );
    }

    // Transform data to match the component interface
    const animations = creditsHistory?.map((history, index) => {
      const isTextToVideo = history.type === "wan25_text_video_generation";
      const description = history.description || "";

      // Extract info from description like "Text-to-video generation (5s, 1080p, 16:9)"
      const durationMatch = description.match(/(\d+)s/);
      const resolutionMatch = description.match(/(480p|720p|1080p)/);
      const duration = durationMatch ? parseInt(durationMatch[1]) : 5;
      const resolution = resolutionMatch ? resolutionMatch[1] : "1080p";

      return {
        id: history.id,
        character_name: isTextToVideo ? `Text Animation #${index + 1}` : `Image Animation #${index + 1}`,
        character_image_url: "",
        reference_video_url: "",
        output_video_url: "", // We don't have this in credits_history
        status: "completed" as const, // Assume completed since credits were deducted
        quality_mode: resolution === "480p" ? "standard" : "high" as const,
        animation_mode: isTextToVideo ? "character_replacement" : "face_swap" as const,
        credits_used: Math.abs(history.amount),
        duration_seconds: duration,
        created_at: history.created_at,
        completed_at: history.created_at,
      };
    }) || [];

    return NextResponse.json({
      success: true,
      animations,
      message: "Temporary solution: showing credits history. Full animation table will be available after database setup."
    });

  } catch (error) {
    console.error("Error in /api/animations/temp:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}