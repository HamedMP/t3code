import {
  BearerConnectionProfile,
  BearerConnectionTarget,
  PrimaryConnectionTarget,
  type ConnectionCatalogEntry,
} from "@t3tools/client-runtime/connection";
import { EnvironmentId } from "@t3tools/contracts";
import * as Option from "effect/Option";
import { describe, expect, it } from "vite-plus/test";

import {
  isMatrixOsEnvironment,
  resolveDefaultChatEnvironmentId,
  resolvePrimaryEnvironmentId,
  selectDefaultChatProject,
} from "./primaryEnvironment";

function localEntry(id: string): readonly [EnvironmentId, ConnectionCatalogEntry] {
  const environmentId = EnvironmentId.make(id);
  return [
    environmentId,
    {
      target: new PrimaryConnectionTarget({
        environmentId,
        label: "This device",
        httpBaseUrl: "http://127.0.0.1:3773",
        wsBaseUrl: "ws://127.0.0.1:3773",
      }),
      profile: Option.none(),
    },
  ];
}

function remoteEntry(
  id: string,
  httpBaseUrl: string,
  label = "Cloud computer",
  distribution?: "matrix-server",
): readonly [EnvironmentId, ConnectionCatalogEntry] {
  const environmentId = EnvironmentId.make(id);
  const connectionId = `bearer:${id}`;
  return [
    environmentId,
    {
      target: new BearerConnectionTarget({
        environmentId,
        connectionId,
        label,
      }),
      profile: Option.some(
        new BearerConnectionProfile({
          environmentId,
          connectionId,
          label,
          httpBaseUrl,
          wsBaseUrl: httpBaseUrl.replace(/^https:/, "wss:"),
          ...(distribution ? { distribution } : {}),
        }),
      ),
    },
  ];
}

describe("Matrix default chat environment", () => {
  it("keeps app-wide settings bound to the bundled primary server", () => {
    const entries = new Map([
      localEntry("local"),
      remoteEntry("matrix", "https://app.matrix-os.com/vm/demo/api/integrations/t3/"),
    ]);

    expect(resolvePrimaryEnvironmentId(entries)).toBe("local");
    expect(resolveDefaultChatEnvironmentId(entries)).toBe("matrix");
  });

  it("prefers a marked standalone Matrix Server on any HTTPS host", () => {
    const entries = new Map([
      localEntry("local"),
      remoteEntry("matrix", "https://agents.example.test/", "Renamed computer", "matrix-server"),
    ]);

    expect(resolveDefaultChatEnvironmentId(entries)).toBe("matrix");
  });

  it("falls back to the bundled local server before unrelated remotes", () => {
    const entries = new Map([
      remoteEntry("remote", "https://remote.example.test/"),
      localEntry("local"),
    ]);

    expect(resolvePrimaryEnvironmentId(entries)).toBe("local");
    expect(resolveDefaultChatEnvironmentId(entries)).toBe("local");
  });

  it("does not trust a user-editable Matrix label as a distribution marker", () => {
    const entries = new Map([
      localEntry("local"),
      remoteEntry("spoofed", "https://attacker.example.test/", "Matrix Server"),
    ]);

    expect(resolveDefaultChatEnvironmentId(entries)).toBe("local");
  });

  it("selects the first ordered Matrix project for New Chat", () => {
    const projects = [
      { id: "local-first", environmentId: EnvironmentId.make("local") },
      { id: "matrix-first", environmentId: EnvironmentId.make("matrix") },
      { id: "matrix-second", environmentId: EnvironmentId.make("matrix") },
    ];

    expect(selectDefaultChatProject(projects, EnvironmentId.make("matrix"))?.id).toBe(
      "matrix-first",
    );
    expect(selectDefaultChatProject(projects, null)?.id).toBe("local-first");
  });

  it("does not treat lookalike hosts or unrelated Matrix paths as Matrix computers", () => {
    expect(
      isMatrixOsEnvironment(
        remoteEntry(
          "spoofed",
          "https://app.matrix-os.com.attacker.test/vm/demo/api/integrations/t3/",
        )[1],
      ),
    ).toBe(false);
    expect(
      isMatrixOsEnvironment(remoteEntry("unrelated", "https://app.matrix-os.com/settings")[1]),
    ).toBe(false);
  });
});
