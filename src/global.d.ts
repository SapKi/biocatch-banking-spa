/// <reference types="vite/client" />

interface CdApi {
  setCustomerSessionId(csid: string): void;
  changeContext(context: string): void;
  setCustomerBrand(brand: string): void;
}

declare global {
  interface Window {
    cdApi?: CdApi;
  }
}

export {};
