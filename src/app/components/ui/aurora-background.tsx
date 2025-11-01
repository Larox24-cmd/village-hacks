"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-md bg-slate-900 px-8 py-16",
        className
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-md">
        <div className="aurora-background-content" />
      </div>
      {showRadialGradient && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-md bg-slate-900">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-slate-900 to-transparent" />
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
