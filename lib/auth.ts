import { cookies } from "next/headers";

export function isAuthenticated(): boolean {
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "authenticated";
}
