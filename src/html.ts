import type { UserSession } from "./session-store.js";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function actionButton(action: string, label: string): string {
  return `
    <form method="post" action="${action}">
      <button type="submit">${label}</button>
    </form>
  `;
}

export function renderHome(session: UserSession | null): string {
  const signedIn = Boolean(session);
  const scope = session?.token.scope ? escapeHtml(session.token.scope) : "No scope returned";
  const tokenType = session?.token.token_type
    ? escapeHtml(session.token.token_type)
    : "No token type returned";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>OAuth login example</title>
    <style>
      :root { color-scheme: light dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f6f6f3; color: #20201d; }
      main { width: min(92vw, 560px); }
      h1 { margin: 0 0 12px; font-size: 32px; line-height: 1.1; }
      p { line-height: 1.55; }
      .panel { border: 1px solid #deded7; border-radius: 8px; padding: 24px; background: #fff; box-shadow: 0 18px 60px rgb(32 32 29 / 8%); }
      .status { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; }
      .dot { width: 10px; height: 10px; border-radius: 999px; background: ${signedIn ? "#08875d" : "#a15c00"}; }
      .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
      a.button, button { appearance: none; border: 0; border-radius: 6px; padding: 10px 14px; background: #20201d; color: #fff; font: inherit; font-weight: 700; text-decoration: none; cursor: pointer; }
      button.secondary { background: #ecece5; color: #20201d; }
      dl { display: grid; grid-template-columns: 120px 1fr; gap: 8px 16px; padding: 16px; border-radius: 8px; background: #f6f6f3; }
      dt { font-weight: 700; }
      dd { margin: 0; overflow-wrap: anywhere; }
      @media (prefers-color-scheme: dark) {
        body { background: #151514; color: #f2f2ed; }
        .panel { background: #20201d; border-color: #3a3a34; }
        dl, button.secondary { background: #2b2b27; color: #f2f2ed; }
      }
    </style>
  </head>
  <body>
    <main class="panel">
      <span class="status"><span class="dot"></span>${signedIn ? "Signed in" : "Signed out"}</span>
      <h1>OAuth login example</h1>
      <p>This demo runs One Horizon login with PKCE. The client secret stays on the server and is only sent to the token endpoint.</p>
      ${
        signedIn
          ? `<dl>
              <dt>Token type</dt><dd>${tokenType}</dd>
              <dt>Scope</dt><dd>${scope}</dd>
              <dt>Refresh token</dt><dd>${session?.token.refresh_token ? "Stored on the server" : "No refresh token returned"}</dd>
            </dl>`
          : "<p>One Horizon will ask which provider to use after you click sign in.</p>"
      }
      <div class="actions">
        ${
          signedIn
            ? `${session?.token.refresh_token ? actionButton("/refresh", "Refresh token") : ""}${actionButton("/logout", "Sign out")}`
            : `<a class="button" href="/login">Sign in with One Horizon</a>`
        }
      </div>
    </main>
  </body>
</html>`;
}
