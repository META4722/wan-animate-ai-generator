'use client'

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Banner() {
  return (
    <Link
      href="https://seedream4-5.io/"
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full"
    >
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 transition-all duration-300">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>

        <div className="relative mx-auto max-w-7xl px-6 py-3 sm:py-4">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white animate-pulse" />
            <p className="text-sm sm:text-base md:text-lg font-semibold text-white text-center">
              🎨 Create stunning AI images with <span className="font-bold underline decoration-2 underline-offset-2">SeeDream 4.5</span> - Try it now!
            </p>
            <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-white animate-bounce-horizontal" />
          </div>
        </div>
      </div>
    </Link>
  );
}
