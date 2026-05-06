import { describe, expect, it } from "vitest";
import {
  getAuthorizeEndpoint,
  getCallbackUrl,
  getConfig,
  getTokenEndpoint,
} from "../src/config.js";
import {
  buildAuthorizeUrl,
  buildCodeExchangeBody,
  buildRefreshBody,
  createCodeChallenge,
} from "../src/oauth.js";

const config = getConfig({
  APP_BASE_URL: "http://localhost:3000/",
  ONE_HORIZON_BASE_URL: "https://onehorizon.ai/",
  ONE_HORIZON_CLIENT_ID: "client_test",
  ONE_HORIZON_CLIENT_SECRET: "secret_test",
  ONE_HORIZON_PROVIDER: "github",
  ONE_HORIZON_SCOPE: "openid profile email",
  PORT: "3000",
});

describe("OAuth helpers", () => {
  it("creates the RFC 7636 S256 code challenge", () => {
    const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
    expect(createCodeChallenge(verifier)).toBe(
      "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    );
  });

  it("builds the One Horizon authorize URL without exposing the client secret", () => {
    const url = new URL(
      buildAuthorizeUrl(config, {
        codeChallenge: "challenge",
        state: "state",
      }),
    );

    expect(url.origin + url.pathname).toBe(getAuthorizeEndpoint(config));
    expect(url.searchParams.get("client_id")).toBe("client_test");
    expect(url.searchParams.get("client_secret")).toBeNull();
    expect(url.searchParams.get("code_challenge")).toBe("challenge");
    expect(url.searchParams.get("redirect_uri")).toBe(getCallbackUrl(config));
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("provider")).toBe("github");
    expect(url.searchParams.get("state")).toBe("state");
  });

  it("builds the code exchange body for a confidential PKCE client", () => {
    const body = buildCodeExchangeBody(config, {
      code: "code",
      codeVerifier: "verifier",
    });

    expect(body.get("grant_type")).toBe("authorization_code");
    expect(body.get("client_id")).toBe("client_test");
    expect(body.get("client_secret")).toBe("secret_test");
    expect(body.get("code")).toBe("code");
    expect(body.get("code_verifier")).toBe("verifier");
    expect(body.get("redirect_uri")).toBe("http://localhost:3000/oauth/callback");
  });

  it("builds the refresh body for a confidential client", () => {
    const body = buildRefreshBody(config, { refreshToken: "refresh" });

    expect(getTokenEndpoint(config)).toBe("https://onehorizon.ai/app/auth/token");
    expect(body.get("grant_type")).toBe("refresh_token");
    expect(body.get("client_id")).toBe("client_test");
    expect(body.get("client_secret")).toBe("secret_test");
    expect(body.get("refresh_token")).toBe("refresh");
  });
});
