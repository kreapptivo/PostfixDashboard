/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_TOKEN_EXPIRY_HOURS: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_AI_PROVIDER?: string;
  readonly VITE_OLLAMA_API_BASE_URL?: string;
  readonly VITE_AI_ANALYSIS_DEFAULT_LOGS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
