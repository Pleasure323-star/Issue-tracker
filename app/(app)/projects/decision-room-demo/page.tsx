import Link from "next/link";
import { DecisionRoomDemo } from "./decision-room-demo";

export const metadata = { title: "Goal decision room concept" };

export default function DecisionRoomDemoPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Link href="/projects" className="inline-block text-sm font-semibold text-zk-accent hover:underline">
        ← Projects
      </Link>
      <DecisionRoomDemo />
    </div>
  );
}
