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
    <link rel="icon" href="https://onehorizon.ai/images/favicons/favicon-light.svg" type="image/svg+xml" media="(prefers-color-scheme: light)" sizes="any">
    <link rel="icon" href="https://onehorizon.ai/images/favicons/favicon-light.png" type="image/png" media="(prefers-color-scheme: light)" sizes="120x120">
    <link rel="icon" href="https://onehorizon.ai/images/favicons/favicon-dark.svg" type="image/svg+xml" media="(prefers-color-scheme: dark)" sizes="any">
    <link rel="icon" href="https://onehorizon.ai/images/favicons/favicon-dark.png" type="image/png" media="(prefers-color-scheme: dark)" sizes="120x120">
    <link rel="icon" href="https://onehorizon.ai/images/favicons/favicon-light-16x16.png" type="image/png" sizes="16x16">
    <link rel="icon" href="https://onehorizon.ai/images/favicons/favicon-light-32x32.png" type="image/png" sizes="32x32">
    <style>
      :root {
        color-scheme: light dark;
        --background: #f8f8f7;
        --surface: rgba(255, 255, 255, 0.78);
        --surface-muted: #f4f5f5;
        --text: #16181f;
        --muted: #555a63;
        --line: rgba(22, 24, 31, 0.12);
        --line-soft: rgba(22, 24, 31, 0.045);
        --shadow: 0 20px 64px rgba(15, 23, 42, 0.08);
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100svh;
        background:
          linear-gradient(var(--line-soft) 1px, transparent 1px),
          linear-gradient(90deg, var(--line-soft) 1px, transparent 1px),
          var(--background);
        background-size: 44px 44px;
        color: var(--text);
      }

      body::before {
        position: fixed;
        inset: 0;
        pointer-events: none;
        content: "";
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 248, 247, 0.72) 42%, rgba(248, 248, 247, 0.96)),
          linear-gradient(135deg, rgba(79, 70, 229, 0.08), transparent 38%, rgba(20, 184, 166, 0.08));
      }

      .page {
        position: relative;
        width: min(880px, calc(100% - 32px));
        min-height: 100svh;
        margin: 0 auto;
        padding: 40px 0;
        display: grid;
        align-content: center;
        gap: 24px;
      }

      .brand { width: fit-content; }
      .brand img { display: block; width: 136px; height: auto; }
      .logo-light { display: none; }

      main {
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(260px, 0.9fr);
        gap: 18px;
      }

      .panel {
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 28px;
        background: var(--surface);
        box-shadow: var(--shadow);
        backdrop-filter: blur(18px);
      }

      h1 { margin: 14px 0 0; font-size: 42px; line-height: 1; font-weight: 720; }
      p { margin: 16px 0 0; color: var(--muted); line-height: 1.6; }
      a { color: inherit; font-weight: 700; text-decoration: none; }
      a:hover { text-decoration: underline; }

      .status { display: inline-flex; align-items: center; gap: 8px; color: var(--muted); font-size: 14px; font-weight: 700; }
      .dot { width: 10px; height: 10px; border-radius: 999px; background: ${signedIn ? "#16a34a" : "#d97706"}; }
      .setup { padding-top: 8px; }
      .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
      a.button, button {
        appearance: none;
        border: 0;
        border-radius: 6px;
        padding: 11px 14px;
        background: #16181f;
        color: #fff;
        font: inherit;
        font-weight: 700;
        text-decoration: none;
        cursor: pointer;
      }

      button.secondary { background: var(--surface-muted); color: var(--text); }
      dl { display: grid; grid-template-columns: 112px 1fr; gap: 9px 16px; margin: 0; }
      dt { color: var(--muted); font-weight: 700; }
      dd { margin: 0; overflow-wrap: anywhere; }
      .hint { display: grid; gap: 12px; margin: 0; padding: 0; list-style: none; }
      .hint li { padding: 13px 14px; border: 1px solid var(--line); border-radius: 8px; background: rgba(255, 255, 255, 0.46); color: var(--muted); line-height: 1.45; }

      @media (max-width: 760px) {
        .page { padding: 24px 0; }
        main { grid-template-columns: 1fr; }
        h1 { font-size: 36px; }
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --background: #050505;
          --surface: rgba(16, 16, 17, 0.84);
          --surface-muted: #171719;
          --text: #f4f4f5;
          --muted: #a1a1aa;
          --line: rgba(255, 255, 255, 0.10);
          --line-soft: rgba(255, 255, 255, 0.035);
          --shadow: 0 20px 64px rgba(0, 0, 0, 0.34);
        }

        body::before {
          background:
            linear-gradient(180deg, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.42) 42%, rgba(0, 0, 0, 0.92)),
            linear-gradient(135deg, rgba(99, 102, 241, 0.10), transparent 38%, rgba(20, 184, 166, 0.07));
        }

        .logo-dark { display: none; }
        .logo-light { display: block; }
        .hint li { background: rgba(255, 255, 255, 0.04); }
        a.button, button { background: #f4f4f5; color: #16181f; }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <a class="brand" href="https://onehorizon.ai" aria-label="One Horizon">
        <img class="logo-dark" src="https://onehorizon.ai/logo_dark.svg" alt="One Horizon" />
        <img class="logo-light" src="https://onehorizon.ai/logo_light.svg" alt="One Horizon" />
      </a>

      <main aria-label="OAuth login example">
        <section class="panel">
          <span class="status"><span class="dot"></span>${signedIn ? "Signed in" : "Signed out"}</span>
          <h1>OAuth login example</h1>
          <p>This demo runs One Horizon login with PKCE. The client secret stays on the server and is only sent to the token endpoint.</p>
          <p class="setup">Need credentials? Create an app in <a href="https://onehorizon.ai/app/my/settings/apps" rel="nofollow">Settings -&gt; Apps</a>, then add your callback URL.</p>
          <div class="actions">
            ${
              signedIn
                ? actionButton("/logout", "Sign out")
                : `<a class="button" href="/login">Sign in with One Horizon</a>`
            }
          </div>
        </section>

        <aside class="panel" aria-label="${signedIn ? "Session details" : "Setup notes"}">
          ${
            signedIn
              ? `<dl>
                  <dt>Token type</dt><dd>${tokenType}</dd>
                  <dt>Scope</dt><dd>${scope}</dd>
                  <dt>Tokens</dt><dd>Stored on the server</dd>
                </dl>`
              : `<ul class="hint">
                  <li>One Horizon shows the available providers after sign in starts.</li>
                  <li>PKCE protects the callback before the server exchanges the code.</li>
                  <li>Tokens and the client secret stay out of browser code.</li>
                </ul>`
          }
        </aside>
      </main>
    </div>
  </body>
</html>`;
}
