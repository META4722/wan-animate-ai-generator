import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help & Support | Wanimate AI',
  description: 'Get help with Wanimate AI - tutorials, FAQs, and support resources for creating amazing AI-generated videos.',
  keywords: 'help, support, tutorial, FAQ, Wanimate AI, video generation',
};

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Help & Support
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Everything you need to know about using Wanimate AI
          </p>
        </div>



        {/* FAQ Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                How do I create my first video?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Simply sign up for an account, go to the Creation page, enter your prompt, and click generate. 
                Your video will be ready in minutes!
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                What video formats are supported?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We generate videos in MP4 format with high quality settings. Videos are optimized for web sharing 
                and social media platforms.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                How does the credit system work?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Each video generation consumes credits based on duration and quality. You can purchase additional 
                credits or upgrade to a subscription plan for better value.
              </p>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}