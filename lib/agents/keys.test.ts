import { describe, expect, it } from "vitest";
import {
  API_KEY_PREFIX,
  bearerToken,
  generateApiKey,
  hasAuthorizationCredentials,
  generateUserCode,
  hashSecret,
  normalizeUserCode,
} from "./keys";

describe("agent keys (#427)", () => {
  it("makes a random key and keeps only its hash and a short prefix", () => {
    const a = generateApiKey();
    const b = generateApiKey();
    expect(a.raw).not.toBe(b.raw);
    expect(a.raw.startsWith(API_KEY_PREFIX)).toBe(true);
    expect(a.raw.length).toBeGreaterThan(40);
    expect(a.hash).toBe(hashSecret(a.raw));
    expect(a.hash).not.toContain(a.raw);
    expect(a.raw.startsWith(a.prefix)).toBe(true);
    expect(a.prefix.length).toBeLessThan(15);
  });

  it("reads only a Bearer header carrying a Ziki key", () => {
    expect(bearerToken("Bearer ziki_abc")).toBe("ziki_abc");
    expect(bearerToken("bearer   ziki_abc ")).toBe("ziki_abc");
    expect(bearerToken("Basic ziki_abc")).toBeNull();
    expect(bearerToken("Bearer sk-other")).toBeNull();
    expect(bearerToken("Bearer ziki_a ziki_b")).toBeNull();
    expect(bearerToken(null)).toBeNull();
  });

  it("tells a sent-but-unusable token apart from no credentials (#467)", () => {
    // Nothing was sent: the agent really does need to add the header.
    expect(hasAuthorizationCredentials(null)).toBe(false);
    expect(hasAuthorizationCredentials(undefined)).toBe(false);
    expect(hasAuthorizationCredentials("")).toBe(false);
    expect(hasAuthorizationCredentials("   ")).toBe(false);
    // A scheme with nothing after it carries no credentials either.
    expect(hasAuthorizationCredentials("Bearer")).toBe(false);
    expect(hasAuthorizationCredentials("  Bearer  ")).toBe(false);
    expect(hasAuthorizationCredentials("bearer")).toBe(false);
    expect(hasAuthorizationCredentials("Basic")).toBe(false);

    // Something was sent. It is unusable, but it is not missing.
    expect(hasAuthorizationCredentials("Bearer bad")).toBe(true);
    expect(hasAuthorizationCredentials("Bearer a b")).toBe(true);
    expect(hasAuthorizationCredentials("Basic abc")).toBe(true);
    expect(hasAuthorizationCredentials('Bearer "ziki_abc"')).toBe(true);
    // A scheme-less token is still something the caller sent.
    expect(hasAuthorizationCredentials("ziki_abc")).toBe(true);
    expect(hasAuthorizationCredentials("garbage")).toBe(true);
    // A key of the right shape is already handled by bearerToken.
    expect(hasAuthorizationCredentials("Bearer ziki_abc")).toBe(true);
  });

  it("makes user codes that survive being retyped loosely", () => {
    const code = generateUserCode();
    expect(code).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    expect(normalizeUserCode(code.toLowerCase().replace("-", " "))).toBe(code.replace("-", ""));
    expect(normalizeUserCode("ABCD-234")).toBeNull();
    // Look-alike characters are never in a code, so they can't match one.
    expect(normalizeUserCode("ABCD-0O1I")).toBeNull();
  });
});
