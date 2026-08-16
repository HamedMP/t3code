import { describe, expect, it } from "vite-plus/test";

import {
  MATRIX_OS_CONNECT_URL,
  MATRIX_OS_SETUP_ACTION_LABEL,
  MATRIX_OS_SETUP_DESCRIPTION,
  MATRIX_OS_SETUP_MOBILE_ACTION_LABEL,
} from "./matrixOsConnect.js";

describe("MATRIX_OS_CONNECT_URL", () => {
  it("targets the standalone Matrix Server install guide", () => {
    const url = new URL(MATRIX_OS_CONNECT_URL);

    expect(url.origin).toBe("https://github.com");
    expect(url.pathname).toBe("/HamedMP/t3code/blob/main/docs/user/matrix-server.md");
    expect(url.search).toBe("");
  });
});

describe("Matrix OS setup copy", () => {
  it("describes an onboarding action instead of claiming connection status", () => {
    expect(MATRIX_OS_SETUP_ACTION_LABEL).toBe("Install guide");
    expect(MATRIX_OS_SETUP_MOBILE_ACTION_LABEL).toBe("Open Matrix Server guide");
    expect(MATRIX_OS_SETUP_DESCRIPTION).toContain("one-time pairing link");
    expect(MATRIX_OS_SETUP_DESCRIPTION).toContain("New chats use it by default");
  });
});
