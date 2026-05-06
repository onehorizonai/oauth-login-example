# Login with One Horizon

A small TypeScript app that shows how to add **Login with One Horizon** to a server-rendered web app.

It uses the OAuth authorization code flow with PKCE:

- Redirect users to One Horizon.
- Verify the returned `state`.
- Exchange the code on the server with your client ID, client secret, and PKCE verifier.
- Keep tokens server-side.

## Create the app in One Horizon

1. Open **Settings -> Apps** in One Horizon.
2. Create an app.
3. Add this callback URL:

   ```text
   http://localhost:3000/oauth/callback
   ```

4. Copy the client ID and client secret.

Use your production callback URL when you deploy the app.

## Run locally

```bash
yarn install
cp .env.example .env
yarn dev
```

Fill in `.env`:

```bash
ONE_HORIZON_CLIENT_ID=your-client-id
ONE_HORIZON_CLIENT_SECRET=your-client-secret
APP_BASE_URL=http://localhost:3000
```

Then open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Name | Required | Description |
| --- | --- | --- |
| `ONE_HORIZON_CLIENT_ID` | Yes | Client ID from your One Horizon app. |
| `ONE_HORIZON_CLIENT_SECRET` | Yes | Client secret from your One Horizon app. Keep it server-side. |
| `APP_BASE_URL` | Yes | Public base URL for this app. |
| `ONE_HORIZON_BASE_URL` | No | Defaults to `https://onehorizon.ai`. |
| `ONE_HORIZON_PROVIDER` | No | Defaults to `github`. Use the provider your app expects. |
| `ONE_HORIZON_SCOPE` | No | Defaults to `openid profile email`. |
| `PORT` | No | Defaults to `3000`. |

## Files to read first

- [`src/server.ts`](src/server.ts): Routes for login, callback, refresh, and logout.
- [`src/oauth.ts`](src/oauth.ts): PKCE, authorize URL, and token request helpers.
- [`src/session-store.ts`](src/session-store.ts): In-memory flow and session storage.

## Production notes

- Do not send `ONE_HORIZON_CLIENT_SECRET` to the browser.
- Keep using PKCE. Workspace apps use client-supplied PKCE.
- Store OAuth flow state and sessions in Redis, Postgres, or another durable store.
- Set `APP_BASE_URL` to your deployed HTTPS URL.
- Add the deployed callback URL to your One Horizon app before going live.
- Avoid logging access tokens, refresh tokens, authorization codes, or client secrets.

## Scripts

```bash
yarn typecheck
yarn test
yarn build
yarn start
```

## License

MIT
