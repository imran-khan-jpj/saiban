import { DEFAULTS } from "@/app/defaults";
import { parseApiErrorMessage } from "@/lib/api-error";

const PROXY_PREFIX = "/api/proxy";

/**
 * Typed error thrown by the API client. Preserves the HTTP status code and
 * the parsed response body so UI can react to specific cases (e.g. 422 vs 404)
 * and surface backend error messages.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }
}

const handleUnauthorized = () => {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

const buildUrl = (url: string) => {
  const normalized = url.startsWith("/") ? url : `/${url}`;
  return `${PROXY_PREFIX}${normalized}`;
};

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  url: string;
  method: HttpMethod;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: Record<string, any> | FormData;
  fetchOptions?: RequestInit;
};

/**
 * Single canonical request helper. All other client helpers
 * (getClient, postClient, patchClient, deleteClient) delegate here.
 *
 * On non-2xx responses this throws an `ApiError` carrying the status code
 * and the parsed JSON body.
 */
export const request = async <T>({
  url,
  method,
  body,
  fetchOptions,
}: RequestOptions): Promise<T> => {
  const isFormData = body instanceof FormData;

  const headers: Record<string, string> = {
    ...((fetchOptions?.headers as Record<string, string>) ?? {}),
  };
  if (body !== undefined && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(url), {
      ...fetchOptions,
      method,
      headers,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body),
    });
  } catch (networkError) {
    throw new ApiError(
      networkError instanceof Error
        ? networkError.message
        : DEFAULTS.ERROR_MESSAGE,
      0,
      null,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  let parsed: unknown = undefined;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    parsed = await response.json().catch(() => undefined);
  } else {
    parsed = await response.text().catch(() => undefined);
  }

  if (response.status === 401) {
    handleUnauthorized();
    throw new ApiError("Unauthorized", 401, parsed);
  }

  if (!response.ok) {
    throw new ApiError(
      parseApiErrorMessage(parsed),
      response.status,
      parsed,
    );
  }

  return parsed as T;
};

// ---------------------------------------------------------------------------
// Backwards-compatible thin wrappers used throughout the codebase.
// ---------------------------------------------------------------------------

type FetchPostOptions = {
  url: string;
  fetchOptions?: RequestInit;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: Record<string, any>;
};

export const postClient = <T>({
  url,
  fetchOptions,
  body,
}: FetchPostOptions): Promise<T> =>
  request<T>({ url, method: "POST", body, fetchOptions });

type FetchPatchOptions = {
  url: string;
  fetchOptions?: RequestInit;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: Record<string, any>;
  put?: boolean;
};

export const patchClient = <T>({
  url,
  fetchOptions,
  body,
  put = false,
}: FetchPatchOptions): Promise<T> =>
  request<T>({ url, method: put ? "PUT" : "PATCH", body, fetchOptions });

type FetchGetOptions = {
  url: string;
  fetchOptions?: RequestInit;
};

export const getClient = <T>({
  url,
  fetchOptions,
}: FetchGetOptions): Promise<T> =>
  request<T>({ url, method: "GET", fetchOptions });

type DeleteClientOptions = {
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: Record<string, any>;
};

export const deleteClient = <T>({
  url,
  body,
}: DeleteClientOptions): Promise<T> =>
  request<T>({ url, method: "DELETE", body });
