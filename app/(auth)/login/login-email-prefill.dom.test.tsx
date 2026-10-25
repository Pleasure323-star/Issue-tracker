// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./page";

// Password sign-in on, so the email form renders.
vi.mock("@/lib/auth-mode", () => ({ isPasswordAuthEnabled: () => true }));
vi.mock("@/lib/google-oauth", () => ({ isGoogleOAuthConfigured: () => false }));
vi.mock("@/app/actions/auth", () => ({ googleSignInAction: vi.fn(), loginAction: vi.fn() }));
vi.mock("@/components/theme-toggle", () => ({
  ThemeToggle: () => createElement("button", { type: "button", "aria-label": "Switch to dark mode" }),
}));
vi.mock("next/image", () => ({
  default: (props: { alt?: string }) => createElement("img", { alt: props.alt ?? "" }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

async function renderLogin(email?: string) {
  render(await LoginPage({ searchParams: Promise.resolve(email === undefined ? {} : { email }) }));
  return screen.getByLabelText("Email") as HTMLInputElement;
}

describe("sign-in email prefill from the homepage", () => {
  it("fills in the email typed into the homepage box", async () => {
    expect((await renderLogin("ada@example.com")).value).toBe("ada@example.com");
  });

  it("trims it", async () => {
    expect((await renderLogin("  ada@example.com ")).value).toBe("ada@example.com");
  });

  it("ignores anything that isn't email-shaped", async () => {
    expect((await renderLogin("<script>alert(1)</script>")).value).toBe("");
    expect((await renderLogin("not an email")).value).toBe("");
  });

  it("starts empty without the parameter", async () => {
    expect((await renderLogin()).value).toBe("");
  });
});
