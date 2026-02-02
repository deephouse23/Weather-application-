"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TerminalCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "interactive";
}

export function TerminalCard({
  title,
  children,
  className,
  variant = "default",
}: TerminalCardProps) {
  return (
    <div
      className={cn(
        "terminal-card",
        variant === "elevated" && "shadow-lg",
        variant === "interactive" &&
          "cursor-pointer transition-colors hover:bg-[var(--terminal-bg-secondary)]",
        className
      )}
    >
      {title && (
        <div className="terminal-title mb-[var(--terminal-space-3)]">
          {title}
        </div>
      )}
      <div className="terminal-card-content">{children}</div>
    </div>
  );
}
