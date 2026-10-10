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

export async function apiGet(
  path: string,
  signal?: AbortSignal,
  headers: Readonly<Record<string, string>> = {},
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${apiConfig.baseUrl}${path}`, {
      method: "GET",
      headers: { Accept: "application/json", ...headers },
      signal,
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
