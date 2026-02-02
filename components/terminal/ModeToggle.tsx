"use client";

import { useTerminalTheme } from "@/components/terminal-theme-provider";

export function ModeToggle() {
  const { mode, setMode, isTerminalDesignEnabled } = useTerminalTheme();

  if (!isTerminalDesignEnabled) {
    return null;
  }

  const handleClick = () => {
    // Cycle: dark → light → system → dark
    if (mode === "dark") {
      setMode("light");
    } else if (mode === "light") {
      setMode("system");
    } else {
      setMode("dark");
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case "dark":
        return "[◐ DARK]";
      case "light":
        return "[◑ LIGHT]";
      case "system":
        return "[◐ SYSTEM]";
      default:
        return "[◐ DARK]";
    }
  };

  return (
    <button
      onClick={handleClick}
      className="terminal-nav-text px-2 py-1 border transition-colors"
      style={{
        backgroundColor: "var(--terminal-bg-secondary)",
        borderColor: "var(--terminal-border)",
        color: "var(--terminal-text-primary)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--terminal-bg-elevated)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--terminal-bg-secondary)";
      }}
      aria-label={`Current mode: ${mode}. Click to cycle modes.`}
    >
      {getModeLabel()}
    </button>
  );
}
