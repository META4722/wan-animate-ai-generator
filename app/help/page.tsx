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

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Getting Started
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li><a href="#account" className="hover:text-blue-600 dark:hover:text-blue-400">Create Account</a></li>
              <li><a href="#first-video" className="hover:text-blue-600 dark:hover:text-blue-400">Generate First Video</a></li>
              <li><a href="#dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard Overview</a></li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Video Creation
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li><a href="#prompts" className="hover:text-blue-600 dark:hover:text-blue-400">Writing Prompts</a></li>
              <li><a href="#styles" className="hover:text-blue-600 dark:hover:text-blue-400">Video Styles</a></li>
              <li><a href="#quality" className="hover:text-blue-600 dark:hover:text-blue-400">Quality Settings</a></li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Account & Billing
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li><a href="#subscription" className="hover:text-blue-600 dark:hover:text-blue-400">Subscription Plans</a></li>
              <li><a href="#credits" className="hover:text-blue-600 dark:hover:text-blue-400">Credits System</a></li>
              <li><a href="#billing" className="hover:text-blue-600 dark:hover:text-blue-400">Billing Support</a></li>
            </ul>
          </div>
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

        {/* Contact Support */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
            Need More Help?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="/community" 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Join Community
            </a>
            <a 
              href="mailto:support@wanimate.io" 
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors text-center"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}