"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TerminalTableProps {
  headers: string[];
  rows: (string | number | React.ReactNode)[][];
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
}

export function TerminalTable({
  headers,
  rows,
  className,
  striped = true,
  hoverable = true,
}: TerminalTableProps) {
  return (
    <table
      className={cn(
        "terminal-table",
        className
      )}
    >
      <thead>
        <tr className="terminal-table-header">
          {headers.map((header, index) => (
            <th key={index} className="terminal-data-label">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className={cn(
              "terminal-table-row",
              striped && rowIndex % 2 === 1 && "bg-[var(--terminal-bg-secondary)]",
              hoverable && "hover:bg-[var(--terminal-bg-tertiary)]"
            )}
          >
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="terminal-body">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
