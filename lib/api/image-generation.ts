interface ImageGenerationRequest {
  prompt: string;
  model?: string;
  size?: string;
  n?: number;
  style?: string;
  aspectRatio?: string;
  uploadedImageUrl?: string;
}

interface ImageGenerationResponse {
  data: Array<{
    url: string;
    revised_prompt?: string;
  }>;
  created: number;
}

export class ImageGenerationService {
  private static readonly API_BASE_URL = 'https://api.apicore.ai/v1/images/generations';
  private static readonly DEFAULT_MODEL = 'flux-kontext-pro';

  static async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const apiToken = process.env.NEXT_PUBLIC_APICORE_TOKEN;

    if (!apiToken) {
      throw new Error('API token not configured');
    }

    // For development/testing: Return a mock response to test frontend integration
    // Note: Real API requires sufficient quota ($0.12 per generation with flux-kontext-pro)
    // Set NEXT_PUBLIC_USE_MOCK_IMAGES=false in .env to use real API
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_IMAGES !== 'false') {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Different architectural images based on style
      const mockImagesByStyle = {
        realistic: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1024&h=576&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1024&h=576&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1024&h=576&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1024&h=576&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1024&h=576&fit=crop&auto=format'
        ],
        night: [
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1024&h=576&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1024&h=576&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=1024&h=576&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1024&h=576&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1024&h=576&fit=crop&auto=format'
        ],
        snow: [
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1024&h=576&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=1024&h=576&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1024&h=576&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1024&h=576&fit=crop&auto=format'
        ],
        rain: [
          'https://images.unsplash.com/photo-1541919329513-35f7af297129?w=1024&h=576&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1024&h=576&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1578493840467-3c9ca40f8cf3?w=1024&h=576&fit=crop&auto=format'
        ],
        modern: [
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1024&h=576&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1024&h=576&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1600573472556-e6f63c14b2e3?w=1024&h=576&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1024&h=576&fit=crop&auto=format'
        ],
        minimalist: [
          'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=1024&h=576&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1024&h=576&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1024&h=576&fit=crop&auto=format'
        ],
        default: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1024&h=576&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1024&h=576&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1024&h=576&fit=crop&auto=format'
        ]
      };

      // Generate multiple images if requested
      const imageCount = request.n || 1;
      const data = [];

      // Select images based on style
      const styleKey = request.style?.toLowerCase() || 'realistic';
      const availableImages = mockImagesByStyle[styleKey as keyof typeof mockImagesByStyle] || mockImagesByStyle.default;

      for (let i = 0; i < imageCount; i++) {
        // Use a combination of timestamp and index to ensure variety
        const seed = Date.now() + i + Math.floor(Math.random() * 1000);
        const imageIndex = seed % availableImages.length;

        data.push({
          url: `${availableImages[imageIndex]}&seed=${seed}`,
          revised_prompt: `Enhanced ${request.style?.toLowerCase() || 'architectural'} rendering: ${request.prompt}`
        });
      }

      return {
        data,
        created: Date.now()
      };
    }

    // Build the prompt based on the generation type
    let finalPrompt = request.prompt;

    // For image-to-image generation (Sketch to Render, Elevation to Render, etc.)
    if (request.uploadedImageUrl) {
      finalPrompt = `${request.uploadedImageUrl} ${request.prompt}`;
    }

    // Add style information to prompt for architectural rendering
    if (request.style && request.style !== 'Realistic') {
      if (request.style === 'Night') {
        finalPrompt += `, night scene, dramatic lighting`;
      } else if (request.style === 'Snow') {
        finalPrompt += `, winter scene with snow`;
      } else if (request.style === 'Rain') {
        finalPrompt += `, rainy weather, wet surfaces`;
      } else if (request.style === 'Modern') {
        finalPrompt += `, modern architecture style`;
      } else if (request.style === 'Industrial') {
        finalPrompt += `, industrial architecture style`;
      } else if (request.style === 'Minimalist') {
        finalPrompt += `, minimalist architecture style`;
      } else if (request.style === 'Neoclassical') {
        finalPrompt += `, neoclassical architecture style`;
      }
    }

    // Map aspect ratio to size parameter
    const sizeMap: Record<string, string> = {
      '1:1': '1x1',
      '4:3': '4x3',
      '3:2': '3x2',
      '16:9': '16x9'
    };

    const requestBody: any = {
      model: request.model || this.DEFAULT_MODEL,
      prompt: finalPrompt,
      size: sizeMap[request.aspectRatio || '16:9'] || '1x1'
    };

    // Add n parameter only if generating multiple images
    if (request.n && request.n > 1) {
      requestBody.n = request.n;
    }

    try {
      const response = await fetch(this.API_BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Image generation failed:', error);
      throw error;
    }
  }

  // Helper method to upload user image and get URL
  static async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/render/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Return the full URL for the uploaded file
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      return `${baseUrl}${result.url}`;

    } catch (error) {
      console.error('Image upload failed:', error);
      // Fallback to blob URL if upload fails
      return URL.createObjectURL(file);
    }
  }

  // Save generated image to user's gallery/history
  static async saveGeneratedImage(imageUrl: string, metadata: {
    prompt: string;
    style: string;
    type: string;
    userId?: string;
  }): Promise<void> {
    // This would typically save to your database
    // For now, we'll store in localStorage as a demo
    const savedImages = JSON.parse(localStorage.getItem('generatedImages') || '[]');

    const newImage = {
      id: Date.now().toString(),
      url: imageUrl,
      ...metadata,
      createdAt: new Date().toISOString()
    };

    savedImages.unshift(newImage);

    // Keep only last 50 images
    if (savedImages.length > 50) {
      savedImages.splice(50);
    }

    localStorage.setItem('generatedImages', JSON.stringify(savedImages));
  }

  // Get user's generation history
  static getGenerationHistory(): Array<{
    id: string;
    url: string;
    prompt: string;
    style: string;
    type: string;
    createdAt: string;
  }> {
    return JSON.parse(localStorage.getItem('generatedImages') || '[]');
  }
}