const TOKEN_STORAGE_KEY = "jd-analyzer/auth-token";

let inMemoryToken: string | undefined;

export const getAuthToken = (): string | undefined => {
  if (inMemoryToken) return inMemoryToken;
  if (globalThis.window === undefined) return undefined;
  const stored =
    globalThis.localStorage.getItem(TOKEN_STORAGE_KEY) ?? undefined;
  inMemoryToken = stored ?? undefined;
  return inMemoryToken;
};

export const setAuthToken = (token: string | undefined) => {
  inMemoryToken = token;
  if (globalThis.window === undefined) return;
  if (token) {
    globalThis.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    globalThis.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

let unauthorizedHandler: (() => void) | undefined;

export const setUnauthorizedHandler = (handler: (() => void) | undefined) => {
  unauthorizedHandler = handler;
};

export const notifyUnauthorized = () => {
  unauthorizedHandler?.();
};
