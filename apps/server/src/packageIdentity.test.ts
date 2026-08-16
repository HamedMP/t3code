import { describe, expect, it } from "vite-plus/test";

import packageJson from "../package.json" with { type: "json" };
import { createMatrixServerPublishArgs, MATRIX_SERVER_NPM_PACKAGE } from "./packageIdentity.ts";

describe("Matrix Server package identity", () => {
  it("keeps Effect service identities compatible while exposing the public Matrix command", () => {
    expect(packageJson.name).toBe("t3");
    expect(MATRIX_SERVER_NPM_PACKAGE).toBe("matrix-server");
    expect(packageJson.bin).toEqual({ "matrix-server": "./dist/bin.mjs" });
  });

  it("targets the public Matrix package for dry-run and provenance publishes", () => {
    expect(
      createMatrixServerPublishArgs({
        access: "public",
        tag: "nightly",
        provenance: true,
        dryRun: true,
      }),
    ).toEqual([
      "publish",
      "--filter",
      "matrix-server",
      "--access",
      "public",
      "--tag",
      "nightly",
      "--no-git-checks",
      "--provenance",
      "--dry-run",
    ]);
  });
});
