// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import Homepage from "@/components/homepage/homepage";

const applyTheme = vi.hoisted(() => vi.fn());
const useTheme = vi.hoisted(() => vi.fn(() => ["light", vi.fn(), false] as const));
vi.mock("@/components/theme-toggle", () => ({ useTheme, applyThemeClient: applyTheme }));
vi.mock("next/image", () => ({ default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => React.createElement("img", props) }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    React.createElement("a", { href, ...props }, children),
}));

beforeEach(() => {
  useTheme.mockReturnValue(["light", vi.fn(), false]);
  vi.stubGlobal("React", React);
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
});
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.unstubAllGlobals(); });

describe("Public homepage", () => {
  it("explains the complete workflow and labels sample activity", () => {
    render(<Homepage />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "AI-Powered Issue Tracker built for Teams and their Agents",
    );
    for (const name of ["Report", "Confirm", "Authorize", "Deliver", "Prove", "Merge"]) {
      expect(screen.getByRole("heading", { name })).toBeTruthy();
    }
    expect(screen.getByRole("img", { name: /^Illustrative owner consultation/ })).toBeTruthy();
    expect(screen.getByText(/Illustrative · project rules vary/)).toBeTruthy();
  });
  it("keeps conversion links on the existing sign-in route", () => {
    render(<Homepage />);
    expect(screen.getByRole("link", { name: "Get started" }).getAttribute("href")).toBe("/login");
    expect(screen.getByRole("link", { name: /Start contributing/ }).getAttribute("href")).toBe("/login");
    expect(screen.getByRole("link", { name: "Skip to content" }).getAttribute("href")).toBe("#main-content");
  });
  it("sends the work email boxes to sign-in with the email prefilled", () => {
    const { container } = render(<Homepage />);
    const forms = container.querySelectorAll("form.email-start");
    expect(forms).toHaveLength(2);
    for (const form of forms) {
      expect(form.getAttribute("action")).toBe("/login");
      expect(form.getAttribute("method")).toBe("get");
      expect(within(form as HTMLElement).getByRole("textbox", { name: "Work email" }).getAttribute("name")).toBe("email");
      expect(within(form as HTMLElement).getByRole("button", { name: "Get started" })).toBeTruthy();
    }
  });
  it("opens the mobile menu and closes it on Escape or section selection", () => {
    render(<Homepage />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("button", { name: "Close menu" }).getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByRole("button", { name: "Open menu" }).getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    fireEvent.click(screen.getAllByRole("link", { name: "AI agents" })[0]);
    expect(screen.getByRole("button", { name: "Open menu" })).toBeTruthy();
  });
  it("uses the existing browser preference without a sign-in action", () => {
    render(<Homepage />);
    fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    expect(applyTheme).toHaveBeenCalledWith("dark");
  });
  it("offers Sign in and Get started in the header, both on the sign-in route", () => {
    render(<Homepage />);
    const banner = screen.getByRole("banner");
    expect(within(banner).getByRole("link", { name: "Sign in" }).getAttribute("href")).toBe("/login");
    expect(within(banner).getByRole("link", { name: "Get started" }).getAttribute("href")).toBe("/login");
    // The menu holds the page sections; the auth buttons stay visible beside it.
    const navigation = screen.getByRole("navigation", { name: "Main navigation" });
    expect(within(navigation).queryByRole("link", { name: "Get started" })).toBeNull();
  });
  it("keeps the hero's side cards decorative and its headline readable as text", () => {
    const { container } = render(<Homepage />);
    const sides = container.querySelectorAll(".hero-side");
    expect(sides).toHaveLength(2);
    for (const side of sides) expect(side.getAttribute("aria-hidden")).toBe("true");
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.getAttribute("aria-label")).toBeNull();
    expect(heading.textContent).toContain("built for Teams and their Agents");
  });
  it("swaps the email boxes for a way into the app when signed in", () => {
    const { container } = render(<Homepage signedIn />);
    expect(container.querySelector("form.email-start")).toBeNull();
    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
    expect(screen.getByRole("link", { name: "Go to issues" }).getAttribute("href")).toBe("/issues");
  });
  it("saves a signed-in theme through the account preference", () => {
    const setTheme = vi.fn();
    useTheme.mockReturnValue(["light", setTheme, false]);
    render(<Homepage signedIn />);
    fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    expect(setTheme).toHaveBeenCalledWith("dark");
    expect(applyTheme).not.toHaveBeenCalled();
  });
});
