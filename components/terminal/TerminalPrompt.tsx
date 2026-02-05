"use client";

import React, { useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface TerminalPromptProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  prefix?: string;
  className?: string;
}

export function TerminalPrompt({
  value,
  onChange,
  onSubmit,
  placeholder = "Enter command...",
  prefix = "user@16bitweather:~$",
  className,
}: TerminalPromptProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onSubmit) {
        e.preventDefault();
        onSubmit();
      }
    },
    [onSubmit]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div className={cn("terminal-prompt", className)}>
      <span
        className="terminal-prompt-prefix"
        style={{
          color: "var(--terminal-accent-success)",
          fontWeight: 600,
          flexShrink: 0,
          marginRight: "var(--terminal-space-2)",
        }}
      >
        {prefix}
      </span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Terminal command input"
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          fontFamily: "var(--terminal-font-mono)",
          fontSize: "inherit",
          color: "var(--terminal-text-primary)",
          letterSpacing: "0.02em",
        }}
      />
      <span
        className="terminal-prompt-cursor"
        style={{
          color: "var(--terminal-accent)",
          animation: "terminal-blink 1s step-end infinite",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
