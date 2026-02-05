"use client"

import { useEffect, useRef, useState } from "react"
import { useTerminalTheme, type TerminalPalette } from "@/components/terminal-theme-provider"

interface PaletteOption {
  id: TerminalPalette
  name: string
  description: string
  primaryColor: string
  secondaryColor: string
}

const PALETTE_OPTIONS: PaletteOption[] = [
  {
    id: "terminal",
    name: "TERMINAL",
    description: "cyan/magenta",
    primaryColor: "#00d4ff",
    secondaryColor: "#ff6ec7",
  },
  {
    id: "dracula",
    name: "DRACULA",
    description: "purple/pink",
    primaryColor: "#bd93f9",
    secondaryColor: "#ff79c6",
  },
  {
    id: "nord",
    name: "NORD",
    description: "frost blue",
    primaryColor: "#88c0d0",
    secondaryColor: "#81a1c1",
  },
  {
    id: "catppuccin",
    name: "CATPPUCCIN",
    description: "pastel blue",
    primaryColor: "#89b4fa",
    secondaryColor: "#cba6f7",
  },
]

export function PaletteSelector() {
  const { palette, setPalette, isTerminalDesignEnabled } = useTerminalTheme()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      return () => {
        document.removeEventListener("keydown", handleKeyDown)
      }
    }
  }, [isOpen])

  // Don't render if terminal design is not enabled
  if (!isTerminalDesignEnabled) {
    return null
  }

  const currentPalette = PALETTE_OPTIONS.find((p) => p.id === palette) || PALETTE_OPTIONS[0]

  const handleSelectPalette = (paletteId: TerminalPalette) => {
    setPalette(paletteId)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="palette-selector">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="palette-selector-button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        [PALETTE: {currentPalette.name} <span className="palette-selector-arrow">{isOpen ? "\u25B4" : "\u25BE"}</span>]
      </button>

      {isOpen && (
        <div className="palette-selector-dropdown" role="listbox" aria-label="Select color palette">
          <div className="palette-selector-dropdown-border-top">
            {"┌"}{"─".repeat(32)}{"┐"}
          </div>
          <div className="palette-selector-dropdown-content">
            {PALETTE_OPTIONS.map((option) => {
              const isActive = option.id === palette
              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSelectPalette(option.id)}
                  className={`palette-selector-option ${isActive ? "palette-selector-option-active" : ""}`}
                >
                  <span className="palette-selector-radio">{isActive ? "\u25CF" : "\u25CB"}</span>
                  <span className="palette-selector-option-name">{option.name}</span>
                  <span className="palette-selector-color-preview">
                    <span
                      className="palette-selector-color-dot"
                      style={{ backgroundColor: option.primaryColor }}
                      aria-hidden="true"
                    />
                    <span
                      className="palette-selector-color-dot"
                      style={{ backgroundColor: option.secondaryColor }}
                      aria-hidden="true"
                    />
                  </span>
                </button>
              )
            })}
          </div>
          <div className="palette-selector-dropdown-border-bottom">
            {"└"}{"─".repeat(32)}{"┘"}
          </div>
        </div>
      )}

      <style jsx>{`
        .palette-selector {
          position: relative;
          display: inline-block;
          font-family: var(--terminal-font-mono);
        }

        .palette-selector-button {
          background-color: var(--terminal-bg-elevated);
          color: var(--terminal-text-primary);
          border: 1px solid var(--terminal-border);
          padding: var(--terminal-space-2) var(--terminal-space-3);
          font-family: var(--terminal-font-mono);
          font-size: 0.8125rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: border-color 0.15s ease, background-color 0.15s ease;
        }

        .palette-selector-button:hover {
          border-color: var(--terminal-border-focus);
          background-color: var(--terminal-bg-surface);
        }

        .palette-selector-button:focus {
          outline: 1px solid var(--terminal-border-focus);
          outline-offset: 1px;
        }

        .palette-selector-arrow {
          margin-left: var(--terminal-space-1);
        }

        .palette-selector-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          z-index: 50;
          margin-top: var(--terminal-space-1);
          background-color: var(--terminal-bg-elevated);
          font-family: var(--terminal-font-mono);
          min-width: 220px;
        }

        .palette-selector-dropdown-border-top,
        .palette-selector-dropdown-border-bottom {
          color: var(--terminal-border);
          font-size: 0.875rem;
          line-height: 1;
          white-space: pre;
          overflow: hidden;
        }

        .palette-selector-dropdown-content {
          border-left: 1px solid var(--terminal-border);
          border-right: 1px solid var(--terminal-border);
          padding: var(--terminal-space-1) 0;
        }

        .palette-selector-option {
          display: flex;
          align-items: center;
          width: 100%;
          padding: var(--terminal-space-2) var(--terminal-space-3);
          background: transparent;
          border: none;
          color: var(--terminal-text-secondary);
          font-family: var(--terminal-font-mono);
          font-size: 0.8125rem;
          text-align: left;
          cursor: pointer;
          transition: background-color 0.1s ease, color 0.1s ease;
          gap: var(--terminal-space-2);
        }

        .palette-selector-option:hover {
          background-color: var(--terminal-selection);
          color: var(--terminal-text-primary);
        }

        .palette-selector-option:focus {
          outline: none;
          background-color: var(--terminal-selection);
        }

        .palette-selector-option-active {
          color: var(--terminal-accent-primary);
        }

        .palette-selector-radio {
          flex-shrink: 0;
          width: 1.2em;
        }

        .palette-selector-option-name {
          flex: 1;
          font-weight: 600;
          letter-spacing: 0.06em;
        }

        .palette-selector-color-preview {
          display: flex;
          gap: var(--terminal-space-1);
          flex-shrink: 0;
        }

        .palette-selector-color-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }
      `}</style>
    </div>
  )
}
