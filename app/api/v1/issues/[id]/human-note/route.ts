import { createMethodNotAllowed, createOptions } from "@/lib/agent-api/http-errors";
import { NextResponse, type NextRequest } from "next/server";
import { agentIssueRequest, issueJson, issueProject } from "@/lib/agent-api/issues";
import { addHumanNote, humanNoteSchema } from "@/lib/agent-api/issues";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return agentIssueRequest(request, "issues.human_note", "contributor", id, async (agent) => {
    const input = humanNoteSchema.parse(await issueJson(request));
    const scope = await issueProject(agent, request.nextUrl.searchParams, input.projectId);
    const note = await addHumanNote(agent, id, input.note);
    return NextResponse.json({ note: note.note }, { status: 201 });
  });
}

const apiMethodNotAllowed = createMethodNotAllowed(["POST", "OPTIONS"]);
const apiOptions = createOptions(["POST", "OPTIONS"]);
export const GET = apiMethodNotAllowed;
export const PUT = apiMethodNotAllowed;
export const PATCH = apiMethodNotAllowed;
export const DELETE = apiMethodNotAllowed;
export const HEAD = apiMethodNotAllowed;
export const OPTIONS = apiOptions;