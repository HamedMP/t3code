import type { EnvironmentId } from "@t3tools/contracts";
import * as Option from "effect/Option";

import type { ConnectionCatalogEntry } from "./catalog.ts";

const MATRIX_OS_HOSTNAME = "app.matrix-os.com";
const MATRIX_OS_T3_PROXY_PATH = /^\/(?:vm\/[^/]+\/)?api\/integrations\/t3\/?$/;

export function isMatrixOsEnvironment(entry: ConnectionCatalogEntry): boolean {
  if (
    entry.target._tag !== "BearerConnectionTarget" ||
    Option.isNone(entry.profile) ||
    entry.profile.value._tag !== "BearerConnectionProfile"
  ) {
    return false;
  }

  try {
    const endpoint = new URL(entry.profile.value.httpBaseUrl);
    const isStandaloneMatrixServer =
      entry.profile.value.distribution === "matrix-server" && endpoint.protocol === "https:";
    return (
      endpoint.username === "" &&
      endpoint.password === "" &&
      (isStandaloneMatrixServer ||
        (endpoint.protocol === "https:" &&
          endpoint.hostname === MATRIX_OS_HOSTNAME &&
          MATRIX_OS_T3_PROXY_PATH.test(endpoint.pathname)))
    );
  } catch {
    return false;
  }
}

export function resolvePrimaryEnvironmentId(
  entries: ReadonlyMap<EnvironmentId, ConnectionCatalogEntry>,
): EnvironmentId | null {
  for (const [environmentId, entry] of entries) {
    if (entry.target._tag === "PrimaryConnectionTarget") return environmentId;
  }
  return null;
}

export function resolveDefaultChatEnvironmentId(
  entries: ReadonlyMap<EnvironmentId, ConnectionCatalogEntry>,
): EnvironmentId | null {
  for (const [environmentId, entry] of entries) {
    if (isMatrixOsEnvironment(entry)) return environmentId;
  }
  return resolvePrimaryEnvironmentId(entries);
}

export function selectDefaultChatProject<
  TProject extends { readonly environmentId: EnvironmentId },
>(projects: ReadonlyArray<TProject>, environmentId: EnvironmentId | null): TProject | undefined {
  return projects.find((project) => project.environmentId === environmentId) ?? projects[0];
}
