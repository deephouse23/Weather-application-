import { NextResponse } from "next/server";
import path from "node:path";
import os from "node:os";
import { appendFile, mkdir } from "node:fs/promises";

export const runtime = "nodejs";

function isEnabled(): boolean {
  // Safety defaults:
  // - Never enabled in production
  // - Only enabled when explicitly opted-in
  if (process.env.NODE_ENV === "production") return false;
  return process.env.DEBUG_LOG_ENABLED === "true";
}

function getLogPath(): string {
  // Prefer explicit directory, otherwise use OS temp (works on Vercel/serverless too)
  const baseDir = process.env.DEBUG_LOG_DIR || os.tmpdir();
  return path.join(baseDir, "16bitweather-debug.log");
}

async function writeLine(payload: unknown) {
  const logPath = getLogPath();
  const logDir = path.dirname(logPath);

  await mkdir(logDir, { recursive: true });
  await appendFile(logPath, `${JSON.stringify(payload)}\n`, { encoding: "utf8" });

  return { logDir, logPath };
}

export async function GET() {
  if (!isEnabled()) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  try {
    const paths = await writeLine({
      location: "api/debug-log:GET",
      message: "debug-log ping",
      timestamp: Date.now(),
    });

    return NextResponse.json({ ok: true, ...paths });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!isEnabled()) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  try {
    const payload = await req.json();

    // Debug-only: write exactly what caller sends.
    await writeLine(payload);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "unknown" },
      { status: 400 }
    );
  }
}



