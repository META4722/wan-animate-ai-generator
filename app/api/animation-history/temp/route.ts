import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Temporary solution: Use credits_history table for animation history stats
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

    // Get animation history from credits_history
    // Try with user_id first, fallback to customer_id if user_id doesn't exist
    let creditsHistory, error;
    
    try {
      const result = await supabase
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
      
      creditsHistory = result.data;
      error = result.error;
    } catch (userIdError) {
      // If user_id column doesn't exist, try with customer_id
      console.log("Trying customer_id approach...");
      
      // First get customer_id for this user
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("user_id", user.id)
        .single();
      
      if (customer) {
        const result = await supabase
          .from("credits_history")
          .select(`
            id,
            amount,
            type,
            description,
            created_at
          `)
          .eq("customer_id", customer.id)
          .in("type", ["wan25_text_video_generation", "wan25_video_generation"])
          .order("created_at", { ascending: false })
          .limit(20);
        
        creditsHistory = result.data;
        error = result.error;
      }
    }

    if (error) {
      console.error("Error fetching animation history:", error);
      return NextResponse.json(
        { error: "Failed to fetch animation history" },
        { status: 500 }
      );
    }

    // Transform data to match the component interface
    const logs = creditsHistory?.map((history, index) => {
      const isTextToVideo = history.type === "wan25_text_video_generation";
      const description = history.description || "";

      // Extract info from description
      const durationMatch = description.match(/(\d+)s/);
      const resolutionMatch = description.match(/(480p|720p|1080p)/);
      const duration = durationMatch ? parseInt(durationMatch[1]) : 5;
      const resolution = resolutionMatch ? resolutionMatch[1] : "1080p";

      return {
        id: history.id,
        animation_mode: isTextToVideo ? "text-to-video" : "image-to-video",
        quality_mode: resolution === "480p" ? "standard" : "high",
        credits_used: Math.abs(history.amount),
        duration_seconds: duration,
        character_name: isTextToVideo ? `Text Animation #${index + 1}` : `Image Animation #${index + 1}`,
        status: "completed",
        created_at: history.created_at,
      };
    }) || [];

    // Calculate statistics
    const totalAnimations = logs.length;
    const totalCreditsUsed = logs.reduce((sum, log) => sum + log.credits_used, 0);
    const totalDurationGenerated = logs.reduce((sum, log) => sum + log.duration_seconds, 0);
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
      message: "Temporary solution: showing credits history. Full animation table will be available after database setup."
    });

  } catch (error) {
    console.error("Error in /api/animation-history/temp:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}