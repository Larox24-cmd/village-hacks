"use client";
import React from 'react';
import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
  children: React.ReactNode;
  isDarkMode: boolean;
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({ children, isDarkMode }) => {
  return (
    <div className={cn(
      "relative w-full min-h-screen overflow-hidden transition-colors duration-300",
      isDarkMode ? "bg-zinc-900" : "bg-zinc-50"
    )}>
      <div className="absolute inset-0 overflow-hidden">
        <div className={cn(
          "aurora-blur absolute inset-1 opacity-100",
          isDarkMode ? "dark-aurora" : "light-aurora"
        )}></div>
      </div>
      <div className="relative z-10 w-full min-h-screen">
        {children}
      </div>
    </div>
  );
};
