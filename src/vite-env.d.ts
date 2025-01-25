/// <reference types="vite/client" />

interface Chrome {
  tabs: {
    query: (queryInfo: any, callback: (tabs: any[]) => void) => void;
    sendMessage: (tabId: number, message: any, callback?: (response: any) => void) => void;
  };
  runtime: {
    id?: string;
    lastError?: Error;
    onMessage: {
      addListener: (callback: (message: any, sender: any, sendResponse: (response?: any) => void) => void) => void;
    };
  };
  storage: {
    local: {
      get: (keys: string[], callback: (result: { [key: string]: any }) => void) => void;
      set: (items: { [key: string]: any }, callback?: () => void) => void;
    };
  };
}

declare const chrome: Chrome;