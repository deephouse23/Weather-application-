"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TerminalStatusBarProps {
  items: Array<{ label: string; value: string }>;
  className?: string;
}

export function TerminalStatusBar({ items, className }: TerminalStatusBarProps) {
  return (
    <div className={cn("terminal-status-bar", className)}>
      {items.map((item, index) => (
        <span key={index} className="terminal-status-text">
          [{item.label.toUpperCase()}: {item.value}]
        </span>
      ))}
    </div>
  );
}
