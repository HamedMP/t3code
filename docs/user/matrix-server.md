# Matrix Server

Matrix Server is the standalone backend for the Matrix desktop app. Install it on the computer
that has your repositories and agent CLIs. That can be a Matrix OS VPS, a regular cloud server, or
another computer you control. The Matrix OS host bundle does not need to change.

## Requirements

- Node.js 22.16+, 23.11+, or 24.10+
- At least one supported agent CLI installed and authenticated on the server
- A private HTTPS route, preferably Tailscale, or an HTTPS reverse proxy you control

> [!IMPORTANT]
> The public `matrix-server` npm artifact is release-ready but has not had its first publish. The
> `npx` commands below become available after that release. For today’s demo, use the source-build
> fallback at the end of this guide and do not install an unverified package under this unclaimed
> name.

## Start with Tailscale

On the server:

```bash
npx matrix-server@latest serve --tailscale-serve
```

Then, in a second shell, ask the running server for its reachable Tailscale pairing link:

```bash
npx matrix-server@latest pair --tailscale
```

The pair command prints a QR code and one-time pairing link. In the desktop app, open **Settings →
Connections → Matrix Server**, paste or scan the link, and connect. The desktop app will prefer the
paired Matrix Server for new chats.

The client device must be able to reach the same tailnet. Pairing credentials are one-time and are
exchanged for a revocable client session.

## Use an HTTPS reverse proxy

Bind Matrix Server to loopback and tell it the public base URL exposed by your proxy:

```bash
npx matrix-server@latest serve \
  --host 127.0.0.1 \
  --port 3773 \
  --pairing-base-url https://agents.example.com/
```

Proxy both HTTP and WebSocket traffic to `http://127.0.0.1:3773`. Keep the public endpoint on HTTPS,
do not put credentials in the URL, and restrict network access when possible.

## Install as a background service

```bash
npx matrix-server@latest service install
npx matrix-server@latest service status
```

The service keeps Matrix Server running after logout. Run the following to update it later:

```bash
npx matrix-server@latest service update
```

## Source-build fallback before the first npm publish

```bash
pnpm install --frozen-lockfile
pnpm build:matrix-server
node apps/server/dist/bin.mjs serve --tailscale-serve
```

In a second shell in the same checkout, print the reachable link:

```bash
node apps/server/dist/bin.mjs pair --tailscale
```

Maintainers can validate the public artifact without publishing it:

```bash
node apps/server/scripts/cli.ts publish --dry-run --verbose
```
