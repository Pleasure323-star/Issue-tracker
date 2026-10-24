/** What the Escalations queue calls each type (#433): redesign proposals read as a design decision. */
export function escalationTypeLabel(type: string): string {
  return type === "Redesign" ? "Design decision needed" : type;
}
