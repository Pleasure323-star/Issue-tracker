/** @vitest-environment happy-dom */

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { DecisionRoomDemo } from "./decision-room-demo";

afterEach(cleanup);

describe("DecisionRoomDemo", () => {
  it("keeps the goal unchanged until a human approves the selected trade-off", () => {
    render(<DecisionRoomDemo />);

    expect(screen.getByRole("heading", { name: /Android sign-in puts Friday's demo at risk/i })).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: /Keep Friday, trim scope/i }));
    expect(screen.getByText("Android sign-in deferred")).toBeTruthy();
    expect(screen.getByRole("heading", { name: /Android sign-in puts Friday's demo at risk/i })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Approve revised direction/i }));
    expect(screen.getAllByText("Friday demo continues with reduced scope").length).toBeGreaterThan(0);
    expect(screen.getByText("2 of 2 checks in Friday's revised demo scope")).toBeTruthy();
  });

  it("requires approval, then lets the owner edit and share the draft in the demo", () => {
    render(<DecisionRoomDemo />);

    fireEvent.click(screen.getByRole("button", { name: /Draft with agent/i }));
    expect(screen.getByRole("alert").textContent).toMatch(/Approve this direction first/i);

    fireEvent.click(screen.getByRole("button", { name: /Approve revised direction/i }));
    fireEvent.click(screen.getByRole("button", { name: /Draft with agent/i }));
    const editor = screen.getByRole("textbox", { name: /Review and edit the draft/i });
    fireEvent.change(editor, { target: { value: "We will move the demo to Monday after independent testing. Reviewed by Amina." } });
    fireEvent.click(screen.getByRole("button", { name: /Publish in demo/i }));
    expect(screen.getAllByText(/Reviewed by Amina\./i).length).toBe(2);
    expect(screen.getByText("Published in demo")).toBeTruthy();
  });
});
