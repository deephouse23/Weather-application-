"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

type SpinnerSize = "sm" | "md" | "lg";

const spinnerSizes: Record<SpinnerSize, string> = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
  label = "Loading",
}: LoadingSpinnerProps) {
  return (
    <div role="status" aria-label={label} className={cn("inline-flex text-primary", className)}>
      <Loader2
        className={cn("animate-spin", spinnerSizes[size])}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

interface LoadingOverlayProps {
  message?: string;
  className?: string;
  size?: SpinnerSize;
}

export function LoadingOverlay({
  message = "Loading...",
  className,
  size = "lg",
}: LoadingOverlayProps) {
  return (
    <div
      role="status"
      aria-label={message}
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-6 text-primary",
        className
      )}
    >
      <Loader2
        className={cn("animate-spin", spinnerSizes[size])}
        aria-hidden="true"
      />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

interface SkeletonCardProps {
  className?: string;
  lines?: number;
  showHeader?: boolean;
}

export function SkeletonCard({
  className,
  lines = 3,
  showHeader = true,
}: SkeletonCardProps) {
  return (
    <div
      role="status"
      aria-label="Loading content"
      className={cn(
        "rounded-lg border border-border bg-card p-4 space-y-3",
        className
      )}
    >
      {showHeader && (
        <Skeleton className="h-5 w-1/3" />
      )}
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
      <span className="sr-only">Loading content</span>
    </div>
  );
}

export function WeatherCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading weather data"
      className={cn(
        "rounded-lg border border-border bg-card p-4 space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <Skeleton className="h-12 w-20" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <span className="sr-only">Loading weather data</span>
    </div>
  );
}
