// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppSidebar } from "./app-sidebar";

vi.mock("next/image", () => ({
  default: (props: { alt?: string }) => <span data-testid="img" aria-hidden={props.alt === ""} />,
}));

const navigation = vi.hoisted(() => ({ pathname: "/issues" }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));

vi.mock("@/app/(app)/tenants/actions", () => ({
  selectTenantAction: vi.fn(),
}));

afterEach(() => cleanup());

beforeEach(() => {
  navigation.pathname = "/issues";
});

function renderSidebar(props?: Partial<Parameters<typeof AppSidebar>[0]>) {
  const shared = {
    issueCount: 4,
    ...props,
  };
  return render(<AppSidebar {...shared} />);
}

describe("AppSidebar rail", () => {
  it("renders the 60 px plum rail tiles", () => {
    const { container } = renderSidebar();
    const aside = container.querySelector("aside");
    expect(aside?.className).toContain("bg-[#311916]");
    expect(aside?.className).toContain("lg:w-[60px]");
    expect(screen.getByRole("link", { name: "Overview" }).getAttribute("href")).toBe("/dashboard");
    expect(screen.getByRole("link", { name: "Issues" }).getAttribute("href")).toBe("/issues");
    expect(screen.getByRole("link", { name: "Team" }).getAttribute("href")).toBe("/settings/team");
  });

  it("renders an Escalations link to /escalations", () => {
    renderSidebar();
    const link = screen.getByRole("link", { name: "Escalations" });
    expect(link.getAttribute("href")).toBe("/escalations");
  });

  it("shows the pending count badge on the Escalations tile", () => {
    renderSidebar({ pendingEscalationsCount: 5 });
    const escalations = screen.getByRole("link", { name: "Escalations" });
    expect(escalations.textContent).toContain("5");
  });

  it("omits the pending badge when there are no pending escalations", () => {
    renderSidebar({ pendingEscalationsCount: 0 });
    const escalations = screen.getByRole("link", { name: "Escalations" });
    expect(escalations.textContent).toBe("");
  });

  it("marks the Escalations tile active on the escalations page", () => {
    navigation.pathname = "/escalations";
    renderSidebar();
    const link = screen.getByRole("link", { name: "Escalations" });
    expect(link.getAttribute("aria-current")).toBe("page");
  });
});
