/// <reference types="vite/client" />

// Chrome API types
interface Chrome {
  storage: {
    local: {
      get(keys: string | string[] | object | null, callback: (items: { [key: string]: any }) => void): void;
      set(items: { [key: string]: any }, callback?: () => void): void;
    };
  };
}

declare var chrome: Chrome; 