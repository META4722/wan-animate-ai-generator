"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SegmentedControlOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const SegmentedControl = React.forwardRef<
  HTMLDivElement,
  SegmentedControlProps
>(({ options, value, onChange, className }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-lg bg-muted p-1",
        className
      )}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "relative cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-all",
            value === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <input
            type="radio"
            name="segmented-control"
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
          <span className="relative z-10">{option.label}</span>
        </label>
      ))}
    </div>
  );
});

SegmentedControl.displayName = "SegmentedControl";

export { SegmentedControl };
export type { SegmentedControlOption };