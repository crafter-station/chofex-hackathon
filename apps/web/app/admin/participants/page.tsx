import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { CandidateDashboard } from "@/components/candidate-dashboard";
import { getAdminIdentity } from "@/lib/admin/auth";
import { listCandidates, parseCandidateStatus } from "@/lib/admin/candidates";

export const dynamic = "force-dynamic";

interface HomeProps {
  readonly searchParams: Promise<{
    readonly page?: string;
    readonly q?: string;
    readonly status?: string;
    readonly candidate?: string;
  }>;
}

export default async function ParticipantsAdminPage({
  searchParams,
}: HomeProps) {
  const authentication = await auth();
  if (!authentication.userId) {
    redirect("/sign-in?redirect_url=/admin/participants");
  }

  const admin = await getAdminIdentity();
  if (!admin) redirect("/welcome");

  const parameters = await searchParams;
  const parsedPage = Number.parseInt(parameters.page ?? "1", 10);
  const page = Number.isFinite(parsedPage) ? parsedPage : 1;
  const query = parameters.q?.trim().slice(0, 200) ?? "";
  const status = parseCandidateStatus(parameters.status);
  const data = await listCandidates({ page, query, status });
  let selection: "first" | "last" | undefined;
  if (parameters.candidate === "first" || parameters.candidate === "last") {
    selection = parameters.candidate;
  }

  return (
    <CandidateDashboard
      key={`${data.page}:${selection ?? "none"}`}
      data={data}
      initialQuery={query}
      initialStatus={status}
      initialSelection={selection}
    />
  );
}
