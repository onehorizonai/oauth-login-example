import type { TokenResponse } from "./oauth.js";

export interface OAuthFlow {
  codeVerifier: string;
  createdAt: number;
  state: string;
}

export interface UserSession {
  createdAt: number;
  token: TokenResponse;
}

const FLOW_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

// Demo storage only. Use Redis, Postgres, or your app DB before deploying.
export class MemoryStore {
  private readonly flows = new Map<string, OAuthFlow>();
  private readonly sessions = new Map<string, UserSession>();

  createFlow(id: string, flow: OAuthFlow): void {
    this.flows.set(id, flow);
  }

  consumeFlow(id: string): OAuthFlow | null {
    const flow = this.flows.get(id);
    this.flows.delete(id);

    if (!flow || Date.now() - flow.createdAt > FLOW_TTL_MS) {
      return null;
    }

    return flow;
  }

  createSession(id: string, token: TokenResponse): void {
    const now = Date.now();
    this.sessions.set(id, { createdAt: now, token });
  }

  getSession(id: string | undefined): UserSession | null {
    if (!id) {
      return null;
    }

    const session = this.sessions.get(id);

    if (!session || Date.now() - session.createdAt > SESSION_TTL_MS) {
      this.sessions.delete(id);
      return null;
    }

    return session;
  }

  deleteSession(id: string | undefined): void {
    if (id) {
      this.sessions.delete(id);
    }
  }
}
