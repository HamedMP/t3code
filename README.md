# Matrix

Matrix is a cloud-native desktop control surface for coding agents. The desktop app is only the
client: install `matrix-server` on a Matrix computer, VPS, or any reachable server, pair once, and
new chats run there by default.

```bash
npx matrix-server@latest serve --tailscale-serve
# In a second shell, print the reachable HTTPS pairing link:
npx matrix-server@latest pair --tailscale
```

The command prints a one-time pairing link. Paste it into **Settings → Connections → Matrix
Server** in the desktop app. No Matrix host-bundle change is required. See the
[Matrix Server install guide](./docs/user/matrix-server.md) for HTTPS reverse-proxy and background
service setups.

> [!IMPORTANT]
> `matrix-server` is prepared as a public npm package but is not published yet. Until the first
> release, use the source-build fallback in the install guide. Do not run an unverified package
> that later appears under this currently unclaimed name.

## Upstream foundation

This fork is built on T3 Code, an open-source agent harness control surface. Internal T3 protocol
and storage identifiers are intentionally retained where changing them would break compatibility.

Matrix controls the agent CLIs and repositories on the selected Matrix Server while keeping the UI
on your desktop. It supports Claude Code, Codex, Cursor, Grok Build, and OpenCode using the
subscriptions already authenticated on the server computer.

## Installation

> [!WARNING]
> Matrix supports Codex, Claude, Cursor, Grok Build and OpenCode. Install and authenticate at
> least one provider on the Matrix Server computer before use:
>
> - Codex: install [Codex CLI](https://developers.openai.com/codex/cli) and run `codex login`
> - Claude: install [Claude Code](https://claude.com/product/claude-code) and run `claude auth login`
> - Cursor: install [Cursor CLI](https://cursor.com/cli) and run `agent login`
> - Grok Build: install [Grok Build CLI](https://x.ai/cli) and run `grok login`
> - OpenCode: install [OpenCode](https://opencode.ai) and run `opencode auth login`

### Run the standalone server

After the first public npm release, run (requires Node.js 22.16+, 23.11+, or 24.10+):

```bash
npx matrix-server@latest serve
```

Until that release, follow the [source-build fallback](./docs/user/matrix-server.md#source-build-fallback-before-the-first-npm-publish).

Tip: Use `npx matrix-server@latest --help` for the full CLI reference after publishing.

### Desktop app

For this demo branch, build the Matrix desktop app from source with `pnpm build:desktop`. Release
installers can be published from the existing cross-platform release workflow after repository and
signing settings are moved to the Matrix fork.

## Some notes

We are very very early in this project. Expect bugs.

We are (mostly) not accepting contributions yet. Small fixes may be considered. Big features will not be.

## Documentation

Full docs live in [docs/](./docs). There's no docs site yet.

- [Install and first run](./docs/user/install.md)
- [Permission modes](./docs/user/permission-modes.md)
- [Keyboard shortcuts](./docs/user/keybindings.md)
- [Customize a project icon](./docs/user/project-settings.md)
- [Remote access from a phone or another machine](./docs/user/remote-access.md)
- [Keeping app and server in sync](./docs/user/updating.md)
- [Source control integrations](./docs/user/source-control.md)
- Multiple accounts: [Codex](./docs/user/providers-codex.md) · [Claude](./docs/user/providers-claude.md)
- Linux: [run the server as a background service](./docs/user/background-service.md)

Building from source? Start at [docs/internals/overview.md](./docs/internals/overview.md).

## If you REALLY want to contribute still.... read this first

### Install `vp`

Matrix inherits Vite+ from upstream, so source development needs the global `vp` command-line tool.

#### macOS / Linux

```bash
curl -fsSL https://vite.plus | bash
```

#### Windows

```bash
irm https://vite.plus/ps1 | iex
```

Checkout their getting started guide for more information: https://viteplus.dev/guide/

### Install dependencies

```bash
vp i
```

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before reporting a bug or opening a PR.

Have a feature request? Open an issue in the Matrix fork.

Need support? Join the [Discord](https://discord.gg/jn4EGJjrvv).
