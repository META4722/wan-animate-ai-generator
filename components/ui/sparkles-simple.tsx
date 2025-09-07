"use client";
import React from "react";
import { cn } from "@/lib/utils";

type ParticlesProps = {
  id?: string;
  className?: string;
  background?: string;
  particleSize?: number;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
};

// Simple sparkles replacement without tsparticles dependency
export const SparklesCore = (props: ParticlesProps) => {
  const { className, background = "transparent" } = props;
  
  return (
    <div 
      className={cn("w-full h-full relative overflow-hidden", className)}
      style={{ background }}
    >
      {/* Simple animated dots as placeholder */}
      <div className="absolute inset-0">
        <div className="w-1 h-1 bg-white rounded-full absolute top-1/4 left-1/4 animate-pulse"></div>
        <div className="w-1 h-1 bg-white rounded-full absolute top-3/4 right-1/4 animate-pulse delay-100"></div>
        <div className="w-1 h-1 bg-white rounded-full absolute top-1/2 left-1/2 animate-pulse delay-200"></div>
      </div>
    </div>
  );
};