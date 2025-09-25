import { NextRequest, NextResponse } from 'next/server';

interface EnhancePromptRequest {
  prompt: string;
  designType: string;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, designType }: EnhancePromptRequest = await request.json();

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    // Create context-aware system message based on design type
    const systemMessages = {
      text: 'You are an expert architectural designer and visualization specialist. Help enhance text descriptions for AI image generation of architectural and interior designs.',
      sketch: 'You are an expert architectural designer. Help enhance descriptions for converting architectural sketches to realistic renderings.',
      elevation: 'You are an expert architectural designer. Help enhance descriptions for converting architectural elevations to photorealistic renderings.',
      exterior: 'You are an expert in exterior architectural design. Help enhance descriptions for generating stunning exterior architectural visualizations.',
      interior: 'You are an expert in interior design and architectural visualization. Help enhance descriptions for generating beautiful interior design renderings.'
    };

    const systemMessage = systemMessages[designType as keyof typeof systemMessages] || systemMessages.text;

    const enhancementPrompt = `${systemMessage}

Transform the following basic description into a detailed, professional prompt for AI image generation.

Guidelines:
1. Add specific architectural details, materials, and lighting
2. Include environmental context and atmosphere
3. Specify camera angle and composition
4. Add professional rendering style details
5. Keep the core concept but make it much more detailed and visually rich
6. Maximum 200 words

User's input: "${prompt}"

Enhanced prompt:`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Rendaily - AI Design Platform'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1:free',
        messages: [
          {
            role: 'user',
            content: enhancementPrompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);

      // Fallback enhancement for basic cases
      const fallbackEnhancements = {
        text: `Professional architectural rendering of ${prompt}, highly detailed, photorealistic, perfect lighting, award-winning architecture photography style`,
        sketch: `Transform this architectural sketch: ${prompt} into a photorealistic rendering with professional lighting, detailed materials, and architectural photography composition`,
        elevation: `Convert this architectural elevation: ${prompt} into a stunning photorealistic rendering with perfect lighting, realistic materials, and professional architectural visualization`,
        exterior: `Exterior architectural design: ${prompt}, photorealistic rendering, beautiful lighting, landscaping, professional architectural photography angle`,
        interior: `Interior design rendering: ${prompt}, photorealistic, professional lighting, detailed materials, architectural visualization quality`
      };

      const fallbackPrompt = fallbackEnhancements[designType as keyof typeof fallbackEnhancements] || fallbackEnhancements.text;

      return NextResponse.json({
        enhancedPrompt: fallbackPrompt,
        fallback: true
      });
    }

    const result = await response.json();

    if (!result.choices || result.choices.length === 0) {
      return NextResponse.json(
        { error: 'No response from AI service' },
        { status: 500 }
      );
    }

    const enhancedPrompt = result.choices[0].message.content.trim();

    // Clean up the response - remove any potential prefixes
    const cleanedPrompt = enhancedPrompt.replace(/^(Enhanced prompt:|Here's the enhanced prompt:|Enhanced description:)\s*/i, '');

    return NextResponse.json({
      enhancedPrompt: cleanedPrompt,
      fallback: false
    });

  } catch (error) {
    console.error('Prompt enhancement failed:', error);
    return NextResponse.json(
      { error: 'Failed to enhance prompt. Please try again.' },
      { status: 500 }
    );
  }
}