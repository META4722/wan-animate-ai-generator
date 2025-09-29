import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { createClient } from "@/utils/supabase/server";

// Configure the fal client
fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();
    const {
      prompt,
      image_url,
      audio_url,
      resolution = "1080p",
      duration = "5",
      negative_prompt = "low resolution, error, worst quality, low quality, defects",
      enable_prompt_expansion = true,
      seed
    } = body;

    // Validate required fields
    if (!prompt || !image_url) {
      return NextResponse.json(
        { error: "Prompt and image_url are required" },
        { status: 400 }
      );
    }

    // Check user credits
    const { data: customerData } = await supabase
      .from("customers")
      .select("credits")
      .eq("user_id", user.id)
      .single();

    // Calculate required credits based on resolution: 480p=5, 720p=10, 1080p=15
    const requiredCredits = resolution === '480p' ? 5 : resolution === '720p' ? 10 : 15;

    if (!customerData || customerData.credits < requiredCredits) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    // Prepare the request payload for Wan 2.5
    const input: any = {
      prompt,
      image_url,
      resolution,
      duration,
      negative_prompt,
      enable_prompt_expansion,
    };

    if (audio_url) {
      input.audio_url = audio_url;
    }

    if (seed) {
      input.seed = seed;
    }

    // Submit the request to Wan 2.5 with retry logic
    let result;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        result = await fal.subscribe("fal-ai/wan-25-preview/image-to-video", {
          input,
          logs: true,
          onQueueUpdate: (update) => {
            if (update.status === "IN_PROGRESS") {
              // Log progress for debugging
              console.log("Generation progress:", update.logs?.map((log) => log.message));
            }
          },
        });
        break; // Success, exit retry loop
      } catch (error) {
        retryCount++;
        console.log(`Attempt ${retryCount} failed:`, error instanceof Error ? error.message : error);

        if (retryCount >= maxRetries) {
          throw error; // Re-throw if all retries exhausted
        }

        // Wait before retrying (exponential backoff)
        const waitTime = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
        console.log(`Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // Deduct credits from user account
    await supabase
      .from("customers")
      .update({ credits: customerData.credits - requiredCredits })
      .eq("user_id", user.id);

    // Log the credit usage
    await supabase.from("credits_history").insert({
      user_id: user.id,
      amount: -requiredCredits,
      type: "wan25_video_generation",
      description: `Image-to-video generation (${duration}s, ${resolution})`,
    });

    // Save animation record - try animations table first, then video_generations as fallback
    const videoRecord = {
      user_id: user.id,
      prompt: prompt || "Image-to-video generation",
      video_url: result.data.video?.url || result.data.video,
      seed: result.data.seed,
      actual_prompt: result.data.actual_prompt,
      request_id: result.requestId,
      aspect_ratio,
      resolution,
      duration,
      generation_type: "image-to-video",
      character_image_url: image_url,
      status: "completed",
      credits_used: requiredCredits,
      completed_at: new Date().toISOString(),
    };

    let saved = false;

    // Try animations table first
    try {
      await supabase.from("animations").insert(videoRecord);
      console.log("✅ Saved to animations table");
      saved = true;
    } catch (animationError) {
      console.warn("Could not save to animations table:", animationError);
    }

    // Fallback to video_generations table
    if (!saved) {
      try {
        await supabase.from("video_generations").insert({
          user_id: user.id,
          prompt: prompt || "Image-to-video generation",
          video_url: result.data.video?.url || result.data.video,
          seed: result.data.seed,
          actual_prompt: result.data.actual_prompt,
          aspect_ratio,
          resolution,
          duration,
          generation_type: "image-to-video",
          status: "completed",
          credits_used: requiredCredits,
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        });
        console.log("✅ Saved to video_generations table");
        saved = true;
      } catch (videoGenError) {
        console.error("❌ Could not save to video_generations table:", videoGenError);
      }
    }

    if (!saved) {
      console.error("❌ Failed to save video record to any table!");
    }

    // Return the result
    return NextResponse.json({
      success: true,
      video: result.data.video,
      seed: result.data.seed,
      actual_prompt: result.data.actual_prompt,
      credits_used: requiredCredits,
      request_id: result.requestId,
    });

  } catch (error) {
    console.error("Error generating video:", error);

    // Handle specific fal API errors
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      if (error.message.includes("API key") || error.message.includes("FAL_KEY")) {
        return NextResponse.json(
          { error: "API configuration error. FAL_KEY may be missing or invalid." },
          { status: 500 }
        );
      }
      if (error.message.includes("quota") || error.message.includes("limit")) {
        return NextResponse.json(
          { error: "Service temporarily unavailable due to quota limits" },
          { status: 503 }
        );
      }
      if (error.message.includes("credits") || error.message.includes("insufficient")) {
        return NextResponse.json(
          { error: "Insufficient credits" },
          { status: 402 }
        );
      }
      if (error.message.includes("fetch failed") || error.message.includes("ECONNRESET") || error.message.includes("network")) {
        return NextResponse.json(
          { error: "Network connection failed. Please check your internet connection and try again." },
          { status: 503 }
        );
      }

      // Return the actual error message for debugging
      return NextResponse.json(
        { error: `Generation failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get status of a generation request
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

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("request_id");

    if (!requestId) {
      return NextResponse.json(
        { error: "request_id is required" },
        { status: 400 }
      );
    }

    // Check the status of the request
    const status = await fal.queue.status("fal-ai/wan-25-preview/image-to-video", {
      requestId,
      logs: true,
    });

    return NextResponse.json({
      success: true,
      status: status.status,
      logs: (status as any).logs || [],
    });

  } catch (error) {
    console.error("Error checking status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}