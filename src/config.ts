export interface AppConfig {
  appBaseUrl: string;
  clientId: string;
  clientSecret: string;
  oneHorizonBaseUrl: string;
  port: number;
  scope: string;
}

const DEFAULT_ONE_HORIZON_BASE_URL = "https://onehorizon.ai";
const DEFAULT_SCOPE = "openid profile email";
const DEFAULT_PORT = 3000;

function required(env: NodeJS.ProcessEnv, key: string): string {
  const value = env[key]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const appBaseUrl = stripTrailingSlash(required(env, "APP_BASE_URL"));
  const oneHorizonBaseUrl = stripTrailingSlash(
    env.ONE_HORIZON_BASE_URL?.trim() || DEFAULT_ONE_HORIZON_BASE_URL,
  );
  const port = Number(env.PORT || DEFAULT_PORT);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a number between 1 and 65535.");
  }

  return {
    appBaseUrl,
    clientId: required(env, "ONE_HORIZON_CLIENT_ID"),
    clientSecret: required(env, "ONE_HORIZON_CLIENT_SECRET"),
    oneHorizonBaseUrl,
    port,
    scope: env.ONE_HORIZON_SCOPE?.trim() || DEFAULT_SCOPE,
  };
}

export function getCallbackUrl(config: AppConfig): string {
  return `${config.appBaseUrl}/oauth/callback`;
}

export function getAuthorizeEndpoint(config: AppConfig): string {
  return `${config.oneHorizonBaseUrl}/app/auth/authorize`;
}

export function getTokenEndpoint(config: AppConfig): string {
  return `${config.oneHorizonBaseUrl}/app/auth/token`;
}
