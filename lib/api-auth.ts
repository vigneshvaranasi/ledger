import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, checkLogToken, verifySessionToken } from "@/lib/auth";

export async function authorizeRequest(req: Request): Promise<boolean> {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ") && checkLogToken(auth.slice(7).trim())) {
    return true;
  }
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}
