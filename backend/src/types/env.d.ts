/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    HOST?: string;
    LOG_LEVEL?: 'info' | 'debug' | 'warn' | 'error';
    FRONTEND_URL?: string;

    ADMIN_API_KEY: string;

    DATABASE_URL: string;

    HOSTAWAY_API_URL: string;
    HOSTAWAY_ACCOUNT_ID: string;
    HOSTAWAY_API_KEY: string;
  }
}
