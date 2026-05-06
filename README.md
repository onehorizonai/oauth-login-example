# OAuth login example

Server-side OAuth login for a TypeScript app.

Use this example to:

- Send the user to One Horizon.
- Protect the redirect with `state` and PKCE.
- Exchange the code on your server.
- Keep the client secret and tokens out of browser code.

## Set up your One Horizon app

1. Open **Settings -> Apps** in One Horizon.
2. Create an app.
3. Add the local callback URL:

   ```text
   http://localhost:3000/oauth/callback
   ```

4. Copy the client ID and client secret into `.env`.

When you deploy, add your production callback URL too.

## Run locally

Use Node 24. This repo includes `.nvmrc` and `.node-version`.

```bash
yarn install
cp .env.example .env
```

Edit `.env`:

```bash
ONE_HORIZON_CLIENT_ID=your-client-id
ONE_HORIZON_CLIENT_SECRET=your-client-secret
APP_BASE_URL=http://localhost:3000
```

Then start the app:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000). `yarn dev` and `yarn start` load `.env` when it exists. In production, set the same variables in your host.

## Environment variables

| Name | Required | Description |
| --- | --- | --- |
| `ONE_HORIZON_CLIENT_ID` | Yes | Client ID from **Settings -> Apps**. |
| `ONE_HORIZON_CLIENT_SECRET` | Yes | Client secret from **Settings -> Apps**. Never expose it in browser code. |
| `APP_BASE_URL` | Yes | Public base URL for this app, without a trailing slash. |
| `ONE_HORIZON_BASE_URL` | No | Defaults to `https://onehorizon.ai`. |
| `ONE_HORIZON_PROVIDER` | No | Defaults to `github`. Use the provider you enabled for sign-in. |
| `ONE_HORIZON_SCOPE` | No | Defaults to `openid profile email`. |
| `PORT` | No | Defaults to `3000`. |

## Files to read first

- [`src/server.ts`](src/server.ts): Login, callback, refresh, and logout routes
- [`src/oauth.ts`](src/oauth.ts): PKCE, authorize URL, and token exchange helpers
- [`src/session-store.ts`](src/session-store.ts): In-memory OAuth flow and session storage

## Production notes

- Keep `ONE_HORIZON_CLIENT_SECRET` server-side.
- Keep PKCE enabled. One Horizon workspace apps use client-supplied PKCE.
- Move OAuth state and sessions from memory to Redis, Postgres, or another durable store.
- Set `APP_BASE_URL` to your deployed HTTPS URL.
- Add the deployed callback URL in **Settings -> Apps** before launch.
- Do not log access tokens, refresh tokens, authorization codes, or client secrets.

## Checks

```bash
yarn typecheck
yarn test
yarn build
yarn start
```

## License

MIT
