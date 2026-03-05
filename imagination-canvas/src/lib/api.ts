export type ApiError = {
  error: string;
};

export async function apiRequest<TResponse>(
  path: string,
  options: RequestInit = {},
  accessToken?: string | null,
): Promise<TResponse> {
  const headers = new Headers(options.headers ?? {});

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(path, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const maybeJson = (await response.json().catch(() => null)) as ApiError | null;
    throw new Error(maybeJson?.error ?? `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}
