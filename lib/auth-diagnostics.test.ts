import { afterEach, describe, expect, it, vi } from "vitest";
import {
  authDiagnosticsEnabled,
  configurationErrorLoginUrl,
} from "./auth-diagnostics";

afterEach(() => {
  vi.unstubAllEnvs();
});

const leakyReason =
  "Can't reach database server at db.internal:5432 (.next/server/chunks/x.js)";

describe("auth diagnostics", () => {
  it("hides raw error details in production", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(authDiagnosticsEnabled()).toBe(false);
    const url = new URL(
      configurationErrorLoginUrl("https://issues.zedu.chat", "", leakyReason),
    );
    expect(url.pathname).toBe("/login");
    expect(url.searchParams.get("error")).toBe("Configuration");
    expect(url.searchParams.has("reason")).toBe(false);
  });

  it("keeps the reason outside production for debugging", () => {
    vi.stubEnv("NODE_ENV", "development");

    expect(authDiagnosticsEnabled()).toBe(true);
    const url = new URL(
      configurationErrorLoginUrl(
        "http://localhost:3001",
        "/bug-tracker",
        leakyReason,
      ),
    );
    expect(url.pathname).toBe("/bug-tracker/login");
    expect(url.searchParams.get("reason")).toBe(leakyReason);
  });
});
