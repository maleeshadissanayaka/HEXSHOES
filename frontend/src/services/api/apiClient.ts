import { apiConfig } from "../../config/api";

export class ApiError extends Error {
  readonly status: number | undefined;
  constructor(
    message: string,
    status?: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  signal?: AbortSignal;
  headers?: Readonly<Record<string, string>>;
  body?: unknown;
}

export async function apiRequest(
  path: string,
  options: ApiRequestOptions = {},
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${apiConfig.baseUrl}${path}`, {
      method: options.method ?? "GET",
      headers: {
        Accept: "application/json",
        ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError("The API is unavailable.", undefined, { cause: error });
  }

  if (!response.ok) {
    throw new ApiError(
      response.status === 404 ? "The requested product was not found." : "The API request failed.",
      response.status,
    );
  }
  try {
    return await response.json();
  } catch (error) {
    throw new ApiError("The API returned invalid JSON.", response.status, { cause: error });
  }
}

export function apiGet(
  path: string,
  signal?: AbortSignal,
  headers: Readonly<Record<string, string>> = {},
): Promise<unknown> {
  return apiRequest(path, { signal, headers });
}
