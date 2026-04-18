/**
 * 16-Bit Weather Platform - Standardized API error response
 *
 * Narrow set of error codes so the client can branch on `code` without pattern
 * matching on free-text messages. All API routes should return errors through
 * `apiError(...)` so downstream code (toasts, retry, logging) sees a stable
 * shape.
 */
import { NextResponse } from 'next/server';

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'UPSTREAM_ERROR'
  | 'INTERNAL_ERROR';

export interface ApiErrorBody {
  error: string;
  code: ApiErrorCode;
  /** Optional fields: populated for specific codes only. */
  retryAfter?: number;
  details?: Record<string, unknown>;
}

const CODE_TO_STATUS: Record<ApiErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  UPSTREAM_ERROR: 502,
  INTERNAL_ERROR: 500,
};

export interface ApiErrorOptions {
  /** Override the default status for the given code. Rarely needed. */
  status?: number;
  /** Added to the response headers. Caller supplies X-RateLimit-* when relevant. */
  headers?: HeadersInit;
  /** Populated on 429 responses; sets Retry-After header and retryAfter body field. */
  retryAfterSeconds?: number;
  /** Non-sensitive structured context. Never include raw DB errors or stack traces. */
  details?: Record<string, unknown>;
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  options: ApiErrorOptions = {}
): NextResponse {
  const status = options.status ?? CODE_TO_STATUS[code];
  const body: ApiErrorBody = { error: message, code };

  const headers = new Headers(options.headers);
  if (options.retryAfterSeconds !== undefined) {
    const retryAfter = Math.max(1, Math.ceil(options.retryAfterSeconds));
    body.retryAfter = retryAfter;
    if (!headers.has('Retry-After')) {
      headers.set('Retry-After', String(retryAfter));
    }
  }
  if (options.details) {
    body.details = options.details;
  }

  return NextResponse.json(body, { status, headers });
}
