import { NextRequest, NextResponse } from 'next/server';
import { ImageDownloader } from '@/lib/utils/image-downloader';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, metadata } = body;

    if (!imageUrl || !metadata) {
      return NextResponse.json(
        { error: 'Missing imageUrl or metadata' },
        { status: 400 }
      );
    }

    // Download and save the image
    const localPath = await ImageDownloader.downloadAndSave(imageUrl, {
      prompt: metadata.prompt || 'untitled',
      style: metadata.style || 'default',
      timestamp: metadata.createdAt || new Date().toISOString()
    });

    // Clean up old images (keep only last 50)
    ImageDownloader.cleanupOldImages(50);

    return NextResponse.json({
      success: true,
      localPath,
      message: 'Image saved successfully'
    });

  } catch (error: any) {
    console.error('Save image API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to save image',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const savedImages = ImageDownloader.getSavedImages();

    return NextResponse.json({
      success: true,
      images: savedImages,
      count: savedImages.length
    });

  } catch (error: any) {
    console.error('Get saved images API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to get saved images',
        details: error.message
      },
      { status: 500 }
    );
  }
}