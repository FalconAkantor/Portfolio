/// <reference types="vite/client" />

/** ISO timestamp of the build, injected by vite.config.ts. */
declare const __BUILD_TIME__: string;
/** Short commit SHA of the build ("local" outside CI). */
declare const __BUILD_SHA__: string;
