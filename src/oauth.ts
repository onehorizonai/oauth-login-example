import { createHash, randomBytes } from "node:crypto";
import {
  type AppConfig,
  getAuthorizeEndpoint,
  getCallbackUrl,
  getTokenEndpoint,
} from "./config.js";

export interface PkcePair {
  codeChallenge: string;
  codeVerifier: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
}

export function createRandomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function createCodeChallenge(codeVerifier: string): string {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

export function createPkcePair(): PkcePair {
  const codeVerifier = createRandomToken(64);

  return {
    codeChallenge: createCodeChallenge(codeVerifier),
    codeVerifier,
  };
}

export function buildAuthorizeUrl(
  config: AppConfig,
  params: { codeChallenge: string; provider?: string; state: string },
): string {
  const url = new URL(getAuthorizeEndpoint(config));

  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", getCallbackUrl(config));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("provider", params.provider || config.provider);
  url.searchParams.set("scope", config.scope);
  url.searchParams.set("state", params.state);
  url.searchParams.set("code_challenge", params.codeChallenge);

  return url.toString();
}

export function buildCodeExchangeBody(
  config: AppConfig,
  params: { code: string; codeVerifier: string },
): URLSearchParams {
  return new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code: params.code,
    code_verifier: params.codeVerifier,
    redirect_uri: getCallbackUrl(config),
  });
}

export function buildRefreshBody(
  config: AppConfig,
  params: { refreshToken: string },
): URLSearchParams {
  return new URLSearchParams({
    grant_type: "refresh_token",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: params.refreshToken,
  });
}

export async function exchangeToken(
  config: AppConfig,
  body: URLSearchParams,
): Promise<TokenResponse> {
  const response = await fetch(getTokenEndpoint(config), {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Token exchange failed (${response.status}): ${responseText}`);
  }

  return JSON.parse(responseText) as TokenResponse;
}
