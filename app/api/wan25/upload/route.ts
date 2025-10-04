import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { randomBytes } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { fal } from "@fal-ai/client";

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'image' or 'video'

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (type === 'image' && !file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Please upload an image file' },
        { status: 400 }
      );
    }

    if (type === 'video' && !file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Please upload a video file' },
        { status: 400 }
      );
    }

    if (type === 'audio' && !file.type.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'Please upload an audio file (WAV or MP3)' },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = type === 'image' ? 25 * 1024 * 1024 : type === 'audio' ? 15 * 1024 * 1024 : 50 * 1024 * 1024; // 25MB for images, 15MB for audio, 50MB for videos
    if (file.size > maxSize) {
      const sizeLimit = type === 'image' ? '25MB' : type === 'audio' ? '15MB' : '50MB';
      return NextResponse.json(
        { error: `File size must be less than ${sizeLimit}` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = randomBytes(8).toString('hex');
    const fileExtension = file.name.split('.').pop() || (type === 'image' ? 'jpg' : type === 'audio' ? 'mp3' : 'mp4');
    const filename = `${type}-${timestamp}-${randomString}.${fileExtension}`;

    let publicUrl: string;

    // Try Fal.ai storage first (most reliable for Fal.ai APIs)
    try {
      console.log('📤 Uploading to Fal.ai storage...');
      const falFile = new File([buffer], filename, { type: file.type });
      const falUrl = await fal.storage.upload(falFile);
      publicUrl = falUrl;
      console.log('✅ Uploaded to Fal.ai storage:', publicUrl);

      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename: filename,
        size: file.size,
        type: file.type,
        storage: 'fal'
      });
    } catch (falError: any) {
      console.warn('⚠️ Fal.ai storage failed:', falError.message);
    }

    // Fallback: Try Supabase Storage or local storage

    try {
      const bucketName = 'wan-uploads';
      const { error: uploadError } = await supabase
        .storage
        .from(bucketName)
        .upload(filename, buffer, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl: supabaseUrl } } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(filename);

      publicUrl = supabaseUrl;
      console.log('✅ Uploaded to Supabase Storage:', publicUrl);

      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename: filename,
        size: file.size,
        type: file.type,
        storage: 'supabase'
      });

    } catch (storageError: any) {
      // Fallback to local file storage
      console.warn('⚠️ Supabase Storage failed, using local storage:', storageError.message);

      // Save to public/uploads directory
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'wan');

      // Create directory if it doesn't exist
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (mkdirError) {
        // Directory might already exist, ignore error
      }

      const filePath = path.join(uploadsDir, filename);
      await writeFile(filePath, buffer);

      // Return the full URL that can be accessed externally
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      publicUrl = `${baseUrl}/uploads/wan/${filename}`;
      console.log('⚠️ Using local storage (may not work with Fal.ai):', publicUrl);
      console.log('💡 Consider using ngrok or deploying to access files publicly');

      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename: filename,
        size: file.size,
        type: file.type,
        storage: 'local',
        warning: 'Local URL may not be accessible by Fal.ai. Consider using Fal.ai storage or deploying to production.'
      });
    }

  } catch (error: any) {
    console.error('❌ File upload error:', error);

    return NextResponse.json(
      {
        error: 'Failed to upload file',
        details: error.message
      },
      { status: 500 }
    );
  }
}
