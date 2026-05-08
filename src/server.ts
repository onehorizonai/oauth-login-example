import express, { type Request, type Response } from "express";
import { pathToFileURL } from "node:url";
import { getConfig, type AppConfig } from "./config.js";
import {
  buildAuthorizeUrl,
  buildCodeExchangeBody,
  createPkcePair,
  createRandomToken,
  exchangeToken,
} from "./oauth.js";
import { renderHome } from "./html.js";
import { MemoryStore } from "./session-store.js";

const FLOW_COOKIE = "one_horizon_login_flow";
const SESSION_COOKIE = "one_horizon_session";
const TEN_MINUTES = 10 * 60;
const THIRTY_DAYS = 30 * 24 * 60 * 60;

function parseCookies(header: string | undefined): Map<string, string> {
  const cookies = new Map<string, string>();

  for (const part of header?.split(";") || []) {
    const [name, ...valueParts] = part.trim().split("=");

    if (name && valueParts.length > 0) {
      cookies.set(name, decodeURIComponent(valueParts.join("=")));
    }
  }

  return cookies;
}

function readCookie(req: Request, name: string): string | undefined {
  return parseCookies(req.headers.cookie).get(name);
}

function cookieHeader(
  name: string,
  value: string,
  config: AppConfig,
  maxAgeSeconds: number,
): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];

  if (config.appBaseUrl.startsWith("https://")) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function clearCookie(name: string): string {
  return `${name}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
}

function fail(res: Response, status: number, message: string): void {
  res.status(status).type("text/plain").send(message);
}

export function createServer(config = getConfig(), store = new MemoryStore()) {
  const app = express();

  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.use(express.urlencoded({ extended: false }));

  app.get("/", (req, res) => {
    const session = store.getSession(readCookie(req, SESSION_COOKIE));
    res.type("html").send(renderHome(session));
  });

  app.get("/login", (_req, res) => {
    const flowId = createRandomToken();
    const state = createRandomToken();
    const { codeChallenge, codeVerifier } = createPkcePair();

    // The cookie stores only a random flow ID. The PKCE verifier stays server-side.
    store.createFlow(flowId, {
      codeVerifier,
      createdAt: Date.now(),
      state,
    });

    res.setHeader("Set-Cookie", cookieHeader(FLOW_COOKIE, flowId, config, TEN_MINUTES));
    res.redirect(buildAuthorizeUrl(config, { codeChallenge, state }));
  });

  app.get("/oauth/callback", async (req, res) => {
    const error = typeof req.query.error === "string" ? req.query.error : null;

    if (error) {
      fail(res, 400, `One Horizon returned an OAuth error: ${error}`);
      return;
    }

    const code = typeof req.query.code === "string" ? req.query.code : null;
    const state = typeof req.query.state === "string" ? req.query.state : null;
    const flowId = readCookie(req, FLOW_COOKIE);
    const flow = flowId ? store.consumeFlow(flowId) : null;

    // State prevents callback mixups and replayed links.
    if (!code || !state || !flow || flow.state !== state) {
      fail(res, 400, "This sign-in link is invalid or expired. Start again.");
      return;
    }

    try {
      const token = await exchangeToken(
        config,
        buildCodeExchangeBody(config, { code, codeVerifier: flow.codeVerifier }),
      );
      const sessionId = createRandomToken();

      // Store tokens server-side and send the browser only an opaque session ID.
      store.createSession(sessionId, token);
      res.setHeader("Set-Cookie", [
        clearCookie(FLOW_COOKIE),
        cookieHeader(SESSION_COOKIE, sessionId, config, THIRTY_DAYS),
      ]);
      res.redirect("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not exchange the code.";
      fail(res, 502, message);
    }
  });

  app.post("/logout", (req, res) => {
    store.deleteSession(readCookie(req, SESSION_COOKIE));
    res.setHeader("Set-Cookie", clearCookie(SESSION_COOKIE));
    res.redirect("/");
  });

  app.use((_req, res) => {
    fail(res, 404, "Not found");
  });

  return app;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const config = getConfig();
  const app = createServer(config);

  app.listen(config.port, () => {
    console.log(`OAuth login example running at ${config.appBaseUrl}`);
  });
}
