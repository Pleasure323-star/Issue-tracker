import { afterEach, describe, expect, it } from "vitest";
import {
  buildPasswordResetUrl,
  createRawResetToken,
  hashResetToken,
} from "./password-reset";

describe("password-reset helpers", () => {
  it("hashes tokens deterministically", () => {
    const token = "fixed-test-token";
    expect(hashResetToken(token)).toBe(hashResetToken(token));
    expect(hashResetToken(token)).not.toBe(token);
  });

  it("creates unique raw tokens", () => {
    expect(createRawResetToken()).not.toBe(createRawResetToken());
  });

  it("builds a reset URL under the app base", () => {
    const url = buildPasswordResetUrl("tok123");
    expect(url).toContain("/reset-password?token=tok123");
  });

  describe("with AUTH_URL set to the documented Auth.js base", () => {
    const original = {
      AUTH_URL: process.env.AUTH_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    };

    afterEach(() => {
      for (const [key, value] of Object.entries(original)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    });

    it("links to the reset page, not under /api/auth", () => {
      process.env.AUTH_URL =
        "https://contributors.zedu.chat/bug-tracker/api/auth";
      delete process.env.NEXTAUTH_URL;

      expect(buildPasswordResetUrl("tok123")).toBe(
        "https://contributors.zedu.chat/bug-tracker/reset-password?token=tok123",
      );
    });
  });
});
