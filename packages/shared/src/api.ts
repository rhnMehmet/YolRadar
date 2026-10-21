import type { ApiError } from './types.ts'

export type TokenProvider = () => string | null | Promise<string | null>

export interface ApiClientOptions {
  baseUrl: string
  tokenProvider?: TokenProvider
  timeoutMs?: number
}

export interface ApiClientConfig {
  readonly baseUrl: string
  readonly tokenProvider?: TokenProvider
  readonly timeoutMs: number
}

export interface ApiRequestOptions {
  path: string
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError }

/** Contract only: transport and actual endpoints await the backend agreement.
 * A future transport must abort at timeoutMs, return kind=timeout/aborted for
 * cancellation, kind=http for non-2xx, and never store tokens in this package.
 */
export interface ApiClient {
  request<T>(options: ApiRequestOptions): Promise<ApiResult<T>>
}

export const DEFAULT_API_TIMEOUT_MS = 10_000

/** Validates configuration only. Does not obtain a token or make any request. */
export function createApiClientConfig(options: ApiClientOptions): ApiClientConfig {
  const url = new URL(options.baseUrl)
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new TypeError('baseUrl HTTP(S) olmalı; kimlik, sorgu veya fragment içermemeli.')
  }
  const timeoutMs = options.timeoutMs ?? DEFAULT_API_TIMEOUT_MS
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
    throw new RangeError('timeoutMs pozitif bir tamsayı olmalı.')
  }
  return Object.freeze({
    baseUrl: url.toString().replace(/\/$/, ''),
    tokenProvider: options.tokenProvider,
    timeoutMs,
  })
}
