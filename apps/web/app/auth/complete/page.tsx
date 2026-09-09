import { redirect } from "next/navigation";

import { getAdminIdentity } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function AuthenticationCompletePage() {
  const admin = await getAdminIdentity();
  if (admin) redirect("/admin/participants");

  redirect("/welcome");
}
