import { ApiTest } from '@/components/api-test';

export default function ApiTestPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">API Test Page</h1>
          <p className="text-muted-foreground">Test your APICore.ai integration</p>
        </div>

        <ApiTest />

        <div className="max-w-md mx-auto mt-8 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2">Setup Instructions:</h3>
          <ol className="text-sm space-y-1 text-muted-foreground">
            <li>1. Get API token from <a href="https://apicore.ai" className="text-primary hover:underline" target="_blank" rel="noopener">APICore.ai</a></li>
            <li>2. Add to .env.local: <code className="bg-muted px-1 rounded">NEXT_PUBLIC_APICORE_TOKEN=your_token</code></li>
            <li>3. Restart your development server</li>
            <li>4. Test with the form above</li>
          </ol>
        </div>
      </div>
    </div>
  );
}