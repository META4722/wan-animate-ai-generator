import fs from 'fs';
import path from 'path';

export class ImageDownloader {
  private static readonly SAVE_DIRECTORY = path.join(process.cwd(), 'public', 'generated-images');

  // Ensure the save directory exists
  static ensureDirectory(): void {
    if (!fs.existsSync(this.SAVE_DIRECTORY)) {
      fs.mkdirSync(this.SAVE_DIRECTORY, { recursive: true });
    }
  }

  // Download and save image from URL
  static async downloadAndSave(imageUrl: string, metadata: {
    prompt: string;
    style: string;
    timestamp: string;
  }): Promise<string> {
    try {
      this.ensureDirectory();

      // Fetch the image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sanitizedPrompt = metadata.prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-');
      const filename = `${timestamp}-${sanitizedPrompt}-${metadata.style}.png`;
      const filepath = path.join(this.SAVE_DIRECTORY, filename);

      // Save the file
      fs.writeFileSync(filepath, Buffer.from(buffer));

      console.log(`Image saved to: ${filepath}`);
      return `/generated-images/${filename}`;

    } catch (error) {
      console.error('Failed to download and save image:', error);
      throw error;
    }
  }

  // Get list of saved images
  static getSavedImages(): Array<{
    filename: string;
    path: string;
    createdAt: Date;
  }> {
    try {
      this.ensureDirectory();

      const files = fs.readdirSync(this.SAVE_DIRECTORY);
      const imageFiles = files
        .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
        .map(filename => ({
          filename,
          path: `/generated-images/${filename}`,
          createdAt: fs.statSync(path.join(this.SAVE_DIRECTORY, filename)).birthtime
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return imageFiles;
    } catch (error) {
      console.error('Failed to get saved images:', error);
      return [];
    }
  }

  // Clean up old images (keep only last N images)
  static cleanupOldImages(keepCount: number = 50): void {
    try {
      const savedImages = this.getSavedImages();

      if (savedImages.length > keepCount) {
        const imagesToDelete = savedImages.slice(keepCount);

        imagesToDelete.forEach(image => {
          const fullPath = path.join(this.SAVE_DIRECTORY, image.filename);
          try {
            fs.unlinkSync(fullPath);
            console.log(`Deleted old image: ${image.filename}`);
          } catch (error) {
            console.error(`Failed to delete ${image.filename}:`, error);
          }
        });
      }
    } catch (error) {
      console.error('Failed to cleanup old images:', error);
    }
  }
}