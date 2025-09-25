"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is Wan 2.5 animate?",
    answer: "Wan 2.5 animate is an AI-powered character animation platform that allows you to animate any character from a source video. Simply upload a character image and reference performance video, and our AI will transfer the motion and expressions to create stunning animations."
  },
  {
    question: "How does the character animation process work?",
    answer: "Upload a clear character portrait and a reference performance video (up to 45 seconds). Our AI analyzes the motion, facial expressions, and gestures from the reference video and applies them to your character while maintaining their unique appearance and identity."
  },
  {
    question: "What file formats are supported?",
    answer: "For character images: JPG and PNG formats up to 10MB. For reference videos: MP4 and MOV formats up to 50MB. We recommend 1080p or higher resolution for best results. The character image should be a clear front-facing portrait."
  },
  {
    question: "How long does it take to generate an animation?",
    answer: "Generation time depends on video length and quality settings. Standard quality typically takes 2-5 minutes per 10 seconds of video. High quality takes 5-10 minutes per 10 seconds. You'll receive progress updates during generation."
  },
  {
    question: "What's the difference between Standard and High Quality modes?",
    answer: "Standard quality (20 credits/5s) provides good results for most use cases. High Quality (40 credits/5s) offers enhanced detail, smoother motion, and better facial expression accuracy - ideal for professional projects."
  },
  {
    question: "What animation modes are available?",
    answer: "We offer three modes: Character Replacement (full character animation), Face Swap (facial features only), and Motion Transfer (body movement focus). Each mode is optimized for different use cases and creative needs."
  },
  {
    question: "Can I animate any type of character?",
    answer: "Yes! Our AI works with various character types including cartoon characters, realistic portraits, digital art, anime-style characters, and more. The character should have a clear, visible face for best results."
  },
  {
    question: "Do I need motion capture equipment?",
    answer: "No! That's the beauty of Wan 2.5 animate. You don't need any special equipment, mocap suits, or technical expertise. Just upload your files and our AI handles the complex motion transfer automatically."
  },
  {
    question: "What makes the lip sync and facial expressions so accurate?",
    answer: "Our AI includes phoneme-level lip sync technology and micro-expression mapping. It analyzes audio and visual cues from the reference video to create natural, believable facial animations that match the original performance."
  },
  {
    question: "Can I use the animations commercially?",
    answer: "Yes! All generated animations can be used for commercial purposes including marketing videos, presentations, social media content, and client projects. You own the rights to your animated content."
  },
  {
    question: "How does the credit system work?",
    answer: "Credits are consumed based on video length and quality: Standard quality uses 20 credits per 5 seconds, High quality uses 40 credits per 5 seconds. Credits never expire and can be purchased in packages or through monthly plans."
  },
  {
    question: "What happens if my animation doesn't look right?",
    answer: "You can try different reference videos, adjust quality settings, or use a clearer character image. Our AI works best with front-facing character portraits and well-lit reference videos with clear motion."
  },
  {
    question: "Is there a limit on video length?",
    answer: "Reference videos can be up to 45 seconds long. For longer content, you can split your video into segments and animate them separately, then combine the results in your video editor."
  },
  {
    question: "Can I run animations in the background?",
    answer: "Yes! You can queue multiple animation jobs and let them run in the background while you continue working on other projects. You'll receive notifications when each animation is complete."
  },
  {
    question: "Do you offer team collaboration features?",
    answer: "Enterprise plans include team workspaces where multiple users can share characters, animations, and collaborate on projects. Perfect for studios and agencies working on character animation projects."
  },
  {
    question: "How do I get started?",
    answer: "Simply upload a character image and reference video using our generator above, select your quality and mode preferences, then hit 'Animate'. You can also try it for free to see the results before committing to a paid plan."
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
            Everything you need to know about Wan 2.5 animate and AI-powered character animation.
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
              href="mailto:support@wanimate.ai"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="/help"
              className="inline-flex items-center justify-center rounded-md border border-border px-6 py-2 text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              Get Help
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}