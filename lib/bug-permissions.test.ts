import { describe, expect, it } from "vitest";
import { canChangeBugStatus } from "@/lib/bug-permissions";

describe("canChangeBugStatus", () => {
  it("allows the assignee to change status", () => {
    expect(canChangeBugStatus("user-1", "user-1", false)).toBe(true);
  });

  it("allows the assignee even when they are not an admin", () => {
    expect(canChangeBugStatus("user-1", "user-1", false)).toBe(true);
  });

  it("denies an admin who is neither assignee nor triager of an unassigned bug", () => {
    expect(canChangeBugStatus("user-1", "user-2", true)).toBe(false);
  });

  it("denies a non-admin who is not the assignee", () => {
    expect(canChangeBugStatus("user-1", "user-2", false)).toBe(false);
  });

  it("allows an admin to triage an unassigned bug", () => {
    expect(canChangeBugStatus("user-1", null, true)).toBe(true);
  });

  it("denies a non-admin triaging an unassigned bug", () => {
    expect(canChangeBugStatus("user-1", null, false)).toBe(false);
  });
});