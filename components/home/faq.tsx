"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is RenderFlow?",
    answer: "RenderFlow is an AI-powered design tool specifically built for architects and design professionals. It helps you generate stunning architectural visualizations using our proprietary RenderFlow AI model, trained specifically for architectural design."
  },
  {
    question: "How does the AI image generation work?",
    answer: "Our platform uses our proprietary RenderFlow AI model, specifically trained on architectural data. You can generate images in two ways: Text-to-Image (describe what you want) or Image-to-Image (upload an existing image and modify it). The AI processes your prompts and creates high-quality architectural visualizations."
  },
  {
    question: "What's the difference between Text-to-Image and Image-to-Image?",
    answer: "Text-to-Image generates completely new images from your written descriptions. Image-to-Image takes an existing image you upload and modifies it based on your prompt - perfect for iterating on existing designs or changing specific elements."
  },
  {
    question: "How many images can I generate with each plan?",
    answer: "Starter Plan includes 200 images per month, Pro Plan includes 800 images per month, and Enterprise Plan offers unlimited generations. You can also purchase additional credits if needed."
  },
  {
    question: "What image formats and sizes are supported?",
    answer: "We support multiple aspect ratios including 1:1, 16:9, 3:2, 2:3, 3:4, 4:3, and 9:16. For uploads, we accept PNG, JPG, and GIF formats up to 10MB. Generated images are delivered in high-quality JPG format."
  },
  {
    question: "Can I use the generated images commercially?",
    answer: "Yes! Pro and Enterprise plans include commercial usage rights. Starter Plan is limited to personal projects only. All generated images can be used in your architectural presentations, client proposals, and marketing materials."
  },
  {
    question: "What AI technology powers RenderFlow?",
    answer: "RenderFlow is powered by our proprietary AI model, developed specifically for architectural visualization. Our model has been trained on extensive architectural datasets to understand building styles, materials, lighting, and spatial relationships, delivering superior results for design professionals."
  },
  {
    question: "How long does it take to generate an image?",
    answer: "Our RenderFlow AI model is optimized for speed and quality, with generation times typically ranging from 10-60 seconds depending on complexity. Text-to-Image is usually faster than Image-to-Image. You'll see the exact generation time displayed after each successful creation."
  },
  {
    question: "Can I customize the architectural styles?",
    answer: "Absolutely! You can specify styles like Modern, Minimalist, Vintage, or Luxury in your prompts. For more advanced customization, Enterprise plans include access to specialized style modules and custom model training tailored to your specific design preferences."
  },
  {
    question: "What happens if I run out of credits?",
    answer: "You can upgrade your plan for more monthly credits, or purchase additional credit packages (Basic: 3 credits for $9, Standard: 6 credits for $13, Premium: 9 credits for $29). Credits never expire."
  },
  {
    question: "Is there team collaboration support?",
    answer: "Yes! Enterprise Plan includes team collaboration features, allowing multiple team members to work together on projects, share generated images, and manage workflows efficiently."
  },
  {
    question: "Do you offer API access?",
    answer: "API access is available with Enterprise Plan, allowing you to integrate RenderFlow's AI generation capabilities directly into your existing workflows and applications."
  },
  {
    question: "What kind of support do you provide?",
    answer: "Starter Plan includes community support, Pro Plan gets priority customer support, and Enterprise Plan includes a dedicated account manager and technical support with SLA guarantees."
  },
  {
    question: "Can I get a custom deployment?",
    answer: "Yes! Enterprise Plan includes private deployment options with custom RenderFlow model training, local data storage, and enterprise-grade security - perfect for large firms with specific requirements."
  },
  {
    question: "Is there a free trial?",
    answer: "We offer a Starter Plan at $15/month which is perfect for trying out the platform. Students can use the discount code 'STUDENT' for additional savings."
  },
  {
    question: "How do I get started?",
    answer: "Simply sign up for an account, choose your plan, and start generating! Our intuitive interface makes it easy to create your first architectural visualization in minutes. No technical expertise required."
  }
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section id="faq" className="py-8 md:py-12 lg:py-24">
      <div className="container px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-8 md:mb-12">
          <h2 className="font-bold text-2xl sm:text-3xl md:text-6xl leading-[1.1]">
            Frequently Asked Questions
          </h2>
          <p className="max-w-[95%] sm:max-w-[85%] text-sm sm:text-lg leading-normal text-muted-foreground">
            Everything you need to know about RenderFlow and AI-powered architectural visualization.
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="border border-border rounded-lg bg-background shadow-sm"
            >
              <button
                className="w-full px-4 sm:px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                onClick={() => toggleItem(index)}
              >
                <h3 className="font-semibold text-sm sm:text-base pr-4">
                  {item.question}
                </h3>
                {openItems.includes(index) ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
              </button>
              
              {openItems.includes(index) && (
                <div className="px-4 sm:px-6 pb-4">
                  <div className="pt-2 border-t border-border">
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 md:mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Still have questions? We're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@renderflow.com"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="/docs"
              className="inline-flex items-center justify-center rounded-md border border-border px-6 py-2 text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              View Documentation
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}