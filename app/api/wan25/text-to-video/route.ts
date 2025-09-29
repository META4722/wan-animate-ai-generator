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
      audio_url,
      aspect_ratio = "16:9",
      resolution = "1080p",
      duration = "5",
      negative_prompt = "low resolution, error, worst quality, low quality, defects",
      enable_prompt_expansion = true,
      seed
    } = body;

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Check user credits
    const { data: customerData } = await supabase
      .from("customers")
      .select("credits")
      .eq("user_id", user.id)
      .single();

    const requiredCredits = duration === "10" ? 2 : 1; // 10s videos cost 2 credits, 5s videos cost 1 credit

    if (!customerData || customerData.credits < requiredCredits) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    // Prepare the request payload for Wan 2.5 text-to-video
    const input: any = {
      prompt,
      aspect_ratio,
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

    // Submit the request to Wan 2.5 text-to-video
    const result = await fal.subscribe("fal-ai/wan-25-preview/text-to-video", {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          // Log progress for debugging
          console.log("Generation progress:", update.logs?.map((log) => log.message));
        }
      },
    });

    // Deduct credits from user account
    await supabase
      .from("customers")
      .update({ credits: customerData.credits - requiredCredits })
      .eq("user_id", user.id);

    // Log the credit usage
    await supabase.from("credits_history").insert({
      user_id: user.id,
      amount: -requiredCredits,
      type: "wan25_text_video_generation",
      description: `Text-to-video generation (${duration}s, ${resolution}, ${aspect_ratio})`,
    });

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
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { error: "API configuration error" },
          { status: 500 }
        );
      }
      if (error.message.includes("quota") || error.message.includes("limit")) {
        return NextResponse.json(
          { error: "Service temporarily unavailable" },
          { status: 503 }
        );
      }
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
    const status = await fal.queue.status("fal-ai/wan-25-preview/text-to-video", {
      requestId,
      logs: true,
    });

    return NextResponse.json({
      success: true,
      status: status.status,
      logs: status.logs,
    });

  } catch (error) {
    console.error("Error checking status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}