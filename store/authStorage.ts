const TOKEN_KEY = "adminToken";

type StorageMode = "session" | "memory";

let inMemoryToken: string | null = null;

const canUseWindow = () => typeof window !== "undefined";

const getSessionStorage = () => {
  if (!canUseWindow()) {
    return null;
  }

  return window.sessionStorage;
};

export const getToken = (): string | null => {
  const storage = getSessionStorage();

  if (!storage) {
    return inMemoryToken;
  }

  return storage.getItem(TOKEN_KEY);
};

export const setToken = (token: string, mode: StorageMode = "session") => {
  if (mode === "memory") {
    inMemoryToken = token;
    return;
  }

  const storage = getSessionStorage();

  if (!storage) {
    inMemoryToken = token;
    return;
  }

  storage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  inMemoryToken = null;

  const storage = getSessionStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(TOKEN_KEY);
};
