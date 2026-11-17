import { CoachShell } from "@/components/coach-shell";

export const dynamic = "force-dynamic";

export default function Home() {
  const demo = process.env.COACH_PROVIDER === "fixtures" && process.env.NODE_ENV !== "production";
  return <CoachShell demo={demo} />;
}
