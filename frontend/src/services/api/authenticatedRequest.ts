export interface TokenUser { getIdToken: () => Promise<string> }
export type AuthenticatedGet = (
  path: string,
  signal: AbortSignal | undefined,
  headers: Readonly<Record<string, string>>,
) => Promise<unknown>;

export async function authenticatedGet(
  user: TokenUser | null,
  request: AuthenticatedGet,
  path: string,
  signal?: AbortSignal,
): Promise<unknown> {
  if (!user) throw new Error("Sign in is required for this request.");
  const token = await user.getIdToken();
  return request(path, signal, { Authorization: `Bearer ${token}` });
}

export type AuthenticatedRequest = (
  path: string,
  options: { method?: "GET" | "POST" | "PATCH" | "DELETE"; signal?: AbortSignal; headers?: Readonly<Record<string, string>>; body?: unknown },
) => Promise<unknown>;

export async function authenticatedRequest(
  user: TokenUser | null,
  request: AuthenticatedRequest,
  path: string,
  options: Parameters<AuthenticatedRequest>[1] = {},
): Promise<unknown> {
  if (!user) throw new Error("Sign in is required for this request.");
  const token = await user.getIdToken();
  return request(path, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  });
}
