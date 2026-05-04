export type ApiError = {
  error: string;
};

type ApiRequestOptions = RequestInit;

let unauthorizedCallback: (() => Promise<string | null>) | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setUnauthorizedCallback(cb: () => Promise<string | null>) {
  unauthorizedCallback = cb;
}

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

  // Handle 401 Unauthorized globally using the callback
  if (
    response.status === 401 &&
    unauthorizedCallback &&
    path !== "/api/auth/refresh"
  ) {
    // If a refresh is already in progress, wait for it
    if (!refreshPromise) {
      refreshPromise = unauthorizedCallback().finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;
    if (newToken) {
      // Retry the original request with the new token
      return apiRequest(path, options, newToken);
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
