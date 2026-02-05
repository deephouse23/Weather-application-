"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface TerminalNavProps {
  items: Array<{ label: string; href: string; active?: boolean }>;
  className?: string;
}

export function TerminalNav({ items, className }: TerminalNavProps) {
  return (
    <nav className={cn("terminal-nav", className)}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn("terminal-nav-item", item.active && "active")}
          aria-current={item.active ? "page" : undefined}
          style={
            item.active
              ? {
                  color: "var(--terminal-accent)",
                  backgroundColor: "var(--terminal-selection)",
                }
              : undefined
          }
        >
          [{item.label.toUpperCase()}]
        </Link>
      ))}
    </nav>
  );
}
