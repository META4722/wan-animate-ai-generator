export interface Wan25VideoRequest {
  prompt: string;
  image_url: string;
  audio_url?: string;
  resolution?: "480p" | "720p" | "1080p";
  duration?: "5" | "10";
  negative_prompt?: string;
  enable_prompt_expansion?: boolean;
  seed?: number;
}

export interface Wan25VideoResponse {
  success: boolean;
  video?: {
    url: string;
    content_type: string;
    file_name: string;
    file_size: number;
    width: number;
    height: number;
    fps: number;
    duration: number;
    num_frames: number;
  };
  seed?: number;
  actual_prompt?: string;
  credits_used?: number;
  request_id?: string;
  error?: string;
}

export interface Wan25StatusResponse {
  success: boolean;
  status?: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  logs?: Array<{
    message: string;
    timestamp: string;
    level: string;
  }>;
  error?: string;
}

export class Wan25Client {
  private baseUrl: string;

  constructor(baseUrl: string = "/api/wan25") {
    this.baseUrl = baseUrl;
  }

  /**
   * Generate a video from an image using Wan 2.5
   */
  async generateVideo(request: Wan25VideoRequest): Promise<Wan25VideoResponse> {
    const response = await fetch(`${this.baseUrl}/image-to-video`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Check the status of a video generation request
   */
  async getStatus(requestId: string): Promise<Wan25StatusResponse> {
    const response = await fetch(
      `${this.baseUrl}/image-to-video?request_id=${encodeURIComponent(requestId)}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Upload a file and get a URL for use with Wan 2.5
   */
  async uploadFile(file: File): Promise<string> {
    // This would use the fal storage upload functionality
    // For now, we'll throw an error as this needs to be implemented
    throw new Error("File upload not implemented yet. Please use a publicly accessible URL.");
  }

  /**
   * Convert a file to base64 data URI
   */
  async fileToDataUri(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Validate image requirements for Wan 2.5
   */
  validateImage(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Image must be JPEG, JPG, PNG, BMP, or WEBP format'
      };
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return {
        valid: false,
        error: 'Image must be smaller than 10MB'
      };
    }

    return { valid: true };
  }

  /**
   * Validate audio requirements for Wan 2.5
   */
  validateAudio(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Audio must be WAV or MP3 format'
      };
    }

    // Check file size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      return {
        valid: false,
        error: 'Audio must be smaller than 15MB'
      };
    }

    return { valid: true };
  }

  /**
   * Calculate credits required for a video generation
   */
  calculateCredits(duration: "5" | "10"): number {
    return duration === "10" ? 2 : 1;
  }
}

// Export a default instance
export const wan25Client = new Wan25Client();