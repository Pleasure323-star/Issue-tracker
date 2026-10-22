import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";

const pageSource = readFileSync("app/page.tsx", "utf8");

describe("HomePage (public root page)", () => {
  it("renders the public root page without redirecting", () => {
    expect(pageSource).not.toContain('redirect("/login")');
    expect(pageSource).not.toContain("redirect(");
  });

  it("reads the session via auth() to switch calls to action", () => {
    expect(pageSource).toContain("auth()");
    expect(pageSource).toContain("signedIn");
  });

  it("renders the banner header element", () => {
    expect(pageSource).toContain("<header");
    expect(pageSource).toContain('className="fixed top-0');
  });

  it("renders the main navigation with aria-label='Main navigation'", () => {
    expect(pageSource).toContain('aria-label="Main navigation"');
    expect(pageSource).toContain("<nav");
  });

  it("renders key level-one heading (h1)", () => {
    expect(pageSource).toContain("<h1");
    // The source uses HTML entities for apostrophes and em-dashes
    expect(pageSource).toContain("Your issues.");
    expect(pageSource).toContain("Your agents.");
    expect(pageSource).toContain("Real progress.");
  });

  it("renders key level-two headings (h2)", () => {
    expect(pageSource).toContain("<h2");
    // Check for multiple h2 headings
    const h2Matches = pageSource.match(/<h2/g);
    expect(h2Matches).not.toBeNull();
    expect((h2Matches || []).length).toBeGreaterThanOrEqual(3);
    expect(pageSource).toContain("From reported issue to meaningful progress");
    expect(pageSource).toContain("Let agents do the legwork");
    expect(pageSource).toContain("Good work should count");
  });

  it("signed out: shows Sign in link targeting /login", () => {
    expect(pageSource).toContain('href="/login"');
    expect(pageSource).toContain("Sign in");
  });

  it("signed out: shows Get started button-link targeting /signup", () => {
    expect(pageSource).toContain('href="/signup"');
    expect(pageSource).toContain("Get started");
  });

  it("signed in: shows Go to your issues button-link targeting /issues", () => {
    expect(pageSource).toContain('href="/issues"');
    expect(pageSource).toContain("Go to your issues");
  });

  it("does not nest a <button> inside an <a>", () => {
    expect(pageSource).not.toMatch(/<Link[^>]*>\s*<Button/);
    expect(pageSource).not.toMatch(/<a[^>]*>\s*<button/);
  });

  it("uses existing BrandLockup component", () => {
    expect(pageSource).toContain("BrandLockup");
    expect(pageSource).toContain("from \"@/components/brand-lockup\"");
  });

  it("uses Next.js Link for navigation", () => {
    expect(pageSource).toContain("Link");
    expect(pageSource).toContain("from \"next/link\"");
  });

  it("defines an inline ButtonLink styled like Button", () => {
    expect(pageSource).toContain("ButtonLink");
    expect(pageSource).toContain("inline-flex items-center justify-center rounded-full");
  });
});
