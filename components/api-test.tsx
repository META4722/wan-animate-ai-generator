"use client";

import { useState } from 'react';
import { ImageGenerationService } from '@/lib/api/image-generation';
import { Loader2 } from 'lucide-react';

export function ApiTest() {
  const [prompt, setPrompt] = useState('画个小猪');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testApi = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await ImageGenerationService.generateImage({
        prompt: prompt,
        model: 'gemini-2.5-flash-image',
        size: '1x1',
        n: 1
      });

      if (response.data && response.data.length > 0) {
        setResult(response.data[0].url);
      } else {
        setError('No image generated');
      }
    } catch (err: any) {
      setError(err.message || 'API test failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-card rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">API Test</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Prompt:</label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="输入提示词"
          />
        </div>

        <button
          onClick={testApi}
          disabled={isLoading || !prompt.trim()}
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Test API'
          )}
        </button>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-green-600">✅ Success!</p>
            <img
              src={result}
              alt="Generated"
              className="w-full rounded-md border"
              onLoad={() => console.log('Test image loaded successfully')}
              onError={() => console.error('Test image failed to load')}
            />
            <p className="text-xs text-muted-foreground break-all">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}