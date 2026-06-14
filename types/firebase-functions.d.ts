declare module "firebase/functions" {
  import { FirebaseApp } from "firebase/app";

  export interface Functions {
    app: FirebaseApp;
    region: string;
    customDomains: string[];
    url: string;
    type: "functions";
  }

  export interface HttpsCallableResult<ResponseData = any> {
    readonly data: ResponseData;
  }

  export interface HttpsCallOptions {
    timeout?: number;
    memory?: string;
  }

  export function getFunctions(app?: FirebaseApp, regionOrCustomDomain?: string): Functions;
  export function connectFunctionsEmulator(functions: Functions, host: string, port: number): void;
  export function httpsCallable<RequestData = any, ResponseData = any>(functions: Functions, name: string, options?: HttpsCallOptions): (data?: RequestData) => Promise<HttpsCallableResult<ResponseData>>;
  export function httpsCallableFromURL<RequestData = any, ResponseData = any>(functions: Functions, url: string, options?: HttpsCallOptions): (data?: RequestData) => Promise<HttpsCallableResult<ResponseData>>;
}
