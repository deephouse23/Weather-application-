"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TerminalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function TerminalHeader({ children, className }: TerminalHeaderProps) {
  return (
    <div className={cn("terminal-header", className)}>
      <span
        className="terminal-title"
        style={{ color: "var(--terminal-accent)" }}
      >
        {children}
      </span>
    </div>
  );
}
