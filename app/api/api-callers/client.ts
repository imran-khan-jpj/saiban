import { CONFIG } from "@/app/config";
import { DEFAULTS } from "@/app/defaults";
import { getAuthToken } from "@/lib/cookies";

type FetchPostOptions = {
  url: string;
  fetchOptions?: RequestInit;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: Record<string, any>;
};

export const postClient = async <T>({
  url,
  fetchOptions,
  body,
}: FetchPostOptions): Promise<T> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const headers: any = {
      ...fetchOptions?.headers,
      Authorization: `Bearer ${getAuthToken()}`,
    };

    if (!(body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${CONFIG.API_URL}${url}`, {
      ...fetchOptions,
      method: "POST",
      headers,
      credentials: "include",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });

    if (!response.ok) {
      const res = await response.json();
      console.error("Error response:", res);
      throw new Error(res?.message ?? res?.error ?? DEFAULTS.ERROR_MESSAGE);
    }

    return (await response.json()) as T;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error(error.message || DEFAULTS.ERROR_MESSAGE);
  }
};

type FetchPatchOptions = {
  url: string;
  fetchOptions?: RequestInit;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: Record<string, any>;
  put?: boolean;
};
export const patchClient = async <T>({
  url,
  fetchOptions,
  body,
  put = false,
}: FetchPatchOptions): Promise<T> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const headers: any = {
      ...fetchOptions?.headers,
      Authorization: `Bearer ${getAuthToken()}`,
    };

    if (!(body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${CONFIG.API_URL}${url}`, {
      ...fetchOptions,
      method: put ? "PUT" : "PATCH",
      headers,
      credentials: "include",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
    if (!response.ok) {
      const res = await response.json();
      throw new Error(res?.message ?? res?.error ?? DEFAULTS.ERROR_MESSAGE);
    }

    return (await response.json()) as T;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error(error.message || DEFAULTS.ERROR_MESSAGE);
  }
};

type FetchGetOptions = {
  url: string;
  fetchOptions?: RequestInit;
};

export const getClient = async <T>({
  url,
  fetchOptions,
}: FetchGetOptions): Promise<T> => {
  try {
    const headers = {
      ...fetchOptions?.headers,
      Authorization: `Bearer ${getAuthToken()}`,
    };

    const response = await fetch(`${CONFIG.API_URL}${url}`, {
      ...fetchOptions,
      method: "GET",
      headers,
      credentials: "include",
    });

    if (response.status === 401) {
      throw new Error("unauthorized");
    }

    if (response.status === 403) {
      throw new Error("forbidden");
    }

    if (!response.ok) {
      const res = await response.json();
      throw new Error(res?.message ?? res?.error ?? DEFAULTS.ERROR_MESSAGE);
    }

    return (await response.json()) as T;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error(error.message || DEFAULTS.ERROR_MESSAGE);
  }
};

type DeleteClientOptions = {
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: Record<string, any>;
};
export const deleteClient = async <T>({
  url,
  body,
}: DeleteClientOptions): Promise<T> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const headers: any = {
      Authorization: `Bearer ${getAuthToken()}`,
    };

    if (!(body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${CONFIG.API_URL}${url}`, {
      method: "DELETE",
      headers,
      credentials: "include",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
    if (!response.ok) {
      const res = await response.json();
      throw new Error(res?.message ?? res?.error ?? DEFAULTS.ERROR_MESSAGE);
    }

    return (await response.json()) as T;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error(error.message || DEFAULTS.ERROR_MESSAGE);
  }
};
