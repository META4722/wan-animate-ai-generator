import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationService } from '@/lib/api/image-generation';

// GET - Retrieve user's generation history
export async function GET(request: NextRequest) {
  try {
    // For now, we'll return the localStorage-based history
    // In production, this would fetch from a database based on user authentication
    const history = ImageGenerationService.getGenerationHistory();

    return NextResponse.json({
      success: true,
      data: history,
      count: history.length
    });

  } catch (error: any) {
    console.error('History retrieval error:', error);

    return NextResponse.json(
      {
        error: 'Failed to retrieve generation history',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// POST - Save a generated image to history
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { imageUrl, prompt, style, generationType } = body;

    // Validate required fields
    if (!imageUrl || !prompt) {
      return NextResponse.json(
        { error: 'Image URL and prompt are required' },
        { status: 400 }
      );
    }

    await ImageGenerationService.saveGeneratedImage(imageUrl, {
      prompt,
      style: style || 'Realistic',
      type: generationType || 'text'
    });

    return NextResponse.json({
      success: true,
      message: 'Image saved to history'
    });

  } catch (error: any) {
    console.error('History save error:', error);

    return NextResponse.json(
      {
        error: 'Failed to save image to history',
        details: error.message
      },
      { status: 500 }
    );
  }
}