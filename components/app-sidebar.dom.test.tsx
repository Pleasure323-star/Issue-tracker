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
    workspaces: [{ id: "t1", name: "Ziki", slug: "ziki" }],
    activeTenantId: "t1",
    ...props,
  };
  return render(<AppSidebar {...shared} />);
}

describe("AppSidebar escalations (#763)", () => {
  it("renders an Escalations link to /escalations", () => {
    renderSidebar();
    const link = screen.getByRole("link", { name: /escalations/i });
    expect(link.getAttribute("href")).toBe("/escalations");
  });

  it("shows the pending count badge on the Escalations link", () => {
    renderSidebar({ pendingEscalationsCount: 5 });
    const escalations = screen.getByRole("link", { name: /escalations/i });
    expect(escalations.textContent).toContain("5");
  });

  it("omits the pending badge when there are no pending escalations", () => {
    renderSidebar({ pendingEscalationsCount: 0 });
    const escalations = screen.getByRole("link", { name: /escalations/i });
    expect(escalations.textContent).toBe("Escalations");
  });

  it("marks the Escalations link active on the escalations page", () => {
    navigation.pathname = "/escalations";
    renderSidebar();
    const link = screen.getByRole("link", { name: /escalations/i });
    expect(link.getAttribute("aria-current")).toBe("page");
  });
});
