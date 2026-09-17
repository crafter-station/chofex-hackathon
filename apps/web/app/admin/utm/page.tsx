import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { UtmBuilder } from "@/components/utm-builder";
import { getAdminIdentity } from "@/lib/admin/auth";

export const metadata = {
  title: "UTM builder",
};

export default async function UtmBuilderPage() {
  const authentication = await auth();
  if (!authentication.userId) {
    redirect("/sign-in?redirect_url=/admin/utm");
  }

  const admin = await getAdminIdentity();
  if (!admin) redirect("/welcome");

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-12">
      <h1 className="font-heading text-2xl font-medium">UTM builder</h1>
      <p className="mt-2 mb-8 text-sm text-muted-foreground">
        Pick the network and the post, then paste the link in the post itself.
      </p>
      <UtmBuilder />
    </main>
  );
}
