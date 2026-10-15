import { describe, expect, it } from "vitest";
import { formatUserLabel, isAdminRole } from "./roles";

describe("isAdminRole", () => {
  it("returns true for admin and super_admin", () => {
    expect(isAdminRole("admin")).toBe(true);
    expect(isAdminRole("super_admin")).toBe(true);
  });

  it("returns false for user and missing roles", () => {
    expect(isAdminRole("user")).toBe(false);
    expect(isAdminRole(null)).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
  });
});

describe("formatUserLabel", () => {
  it("appends Admin for privileged roles", () => {
    expect(formatUserLabel("Alice", "admin")).toBe("Alice (Admin)");
    expect(formatUserLabel("Bob", "super_admin")).toBe("Bob (Admin)");
  });

  it("leaves regular users unchanged", () => {
    expect(formatUserLabel("Cara", "user")).toBe("Cara");
  });
});
