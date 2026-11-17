import { createCoachHandler, methodNotAllowed } from "@/lib/server/coach-handler";

export const runtime = "nodejs";
export const POST = createCoachHandler();
export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
export const OPTIONS = methodNotAllowed;
export const HEAD = methodNotAllowed;
