import { apiTestConfig } from "./config";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiResponse<T = unknown> {
  status: number;
  data: T;
  ok: boolean;
}

export interface RequestOptions {
  method: HttpMethod;
  path: string;
  body?: Record<string, unknown>;
  /** When false, call Next local route (e.g. /api/auth/login). Default true. */
  useProxy?: boolean;
  /** When false, do not attach auth cookie. Default true for proxy routes. */
  authenticated?: boolean;
}

function proxyUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${apiTestConfig.baseUrl}/api/proxy${normalized}`;
}

function localUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${apiTestConfig.baseUrl}${normalized}`;
}

function parseSetCookie(headers: Headers): string[] {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }
  const raw = headers.get("set-cookie");
  return raw ? [raw] : [];
}

export function extractAuthToken(headers: Headers): string | null {
  for (const line of parseSetCookie(headers)) {
    const match = line.match(/auth-token=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

export function extractId(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  if (typeof obj._id === "string") return obj._id;
  if (obj.data && typeof obj.data === "object") {
    const nested = obj.data as Record<string, unknown>;
    if (typeof nested._id === "string") return nested._id;
  }
  return null;
}

export class ApiClient {
  constructor(private readonly token: string | null) {}

  static async login(
    email = apiTestConfig.email,
    password = apiTestConfig.password,
  ): Promise<ApiClient> {
    const res = await fetch(localUrl("/api/auth/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    const token = extractAuthToken(res.headers);
    if (!res.ok || !token) {
      throw new Error(
        `Login failed (${res.status}): ${JSON.stringify(data).slice(0, 200)}`,
      );
    }
    return new ApiClient(token);
  }

  async request<T = unknown>(options: RequestOptions): Promise<ApiResponse<T>> {
    const {
      method,
      path,
      body,
      useProxy = true,
      authenticated = useProxy,
    } = options;

    const url = useProxy ? proxyUrl(path) : localUrl(path);
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }
    if (authenticated && this.token) {
      headers.Cookie = `auth-token=${this.token}`;
    }

    const res = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    let data: T;
    if (res.status === 204) {
      data = undefined as T;
    } else {
      const ct = res.headers.get("content-type") ?? "";
      if (ct.includes("application/json")) {
        data = (await res.json().catch(() => null)) as T;
      } else {
        data = (await res.text().catch(() => "")) as T;
      }
    }

    return {
      status: res.status,
      data,
      ok: res.ok,
    };
  }

  get<T>(path: string, authenticated = true) {
    return this.request<T>({ method: "GET", path, authenticated });
  }

  post<T>(path: string, body?: Record<string, unknown>, authenticated = true) {
    return this.request<T>({ method: "POST", path, body, authenticated });
  }

  patch<T>(path: string, body?: Record<string, unknown>) {
    return this.request<T>({ method: "PATCH", path, body });
  }

  delete<T>(path: string) {
    return this.request<T>({ method: "DELETE", path });
  }

  async logout() {
    return this.request({
      method: "POST",
      path: "/api/auth/logout",
      useProxy: false,
      authenticated: false,
    });
  }
}
