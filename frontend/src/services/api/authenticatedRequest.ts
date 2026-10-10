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
