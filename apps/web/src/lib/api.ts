export type ApiError = {
  error: string;
};

type ApiRequestOptions = RequestInit & {
  onUnauthorized?: () => Promise<string | null>;
};

export async function apiRequest<TResponse>(
  path: string,
  options: ApiRequestOptions = {},
  accessToken?: string | null,
): Promise<TResponse> {
  const headers = new Headers(options.headers ?? {});

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(path, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch (error: any) {
    throw new Error(
      error.message?.includes("Failed to fetch")
        ? "Network error: Unable to connect to the server."
        : error.message || "An unexpected network error occurred.",
    );
  }

  // Handle 401 Unauthorized by attempting to refresh the token
  if (response.status === 401 && options.onUnauthorized) {
    const newToken = await options.onUnauthorized();
    if (newToken) {
      // Retry the original request with the new token
      return apiRequest(
        path,
        { ...options, onUnauthorized: undefined },
        newToken,
      );
    }
  }

  if (!response.ok) {
    const maybeJson = (await response
      .json()
      .catch(() => null)) as ApiError | null;
    throw new Error(
      maybeJson?.error ?? `Request failed with status ${response.status}`,
    );
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}
