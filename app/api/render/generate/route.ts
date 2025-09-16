import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationService } from '@/lib/api/image-generation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { prompt, style, aspectRatio, imageCount, generationType, uploadedImageUrl } = body;

    // Validate required fields
    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Generate the image using our service
    const result = await ImageGenerationService.generateImage({
      prompt: prompt.trim(),
      style: style || 'Realistic',
      aspectRatio: aspectRatio || '16:9',
      n: imageCount || 1,
      uploadedImageUrl: uploadedImageUrl
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      metadata: {
        prompt,
        style,
        aspectRatio,
        generationType,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Image generation API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate image',
        details: error.message
      },
      { status: 500 }
    );
  }
}