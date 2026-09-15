import { challengeBySlug } from "@chofex/challenges-contract";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChallengesShell } from "@/components/challenges/challenges-shell";
import { ChallengeRankingView } from "@/components/challenges/ranking-view";
import { getChallengeRanking } from "@/lib/challenges/ranking";
import { HttpError } from "@/lib/registration/http";

export const dynamic = "force-dynamic";

interface ChallengeRankingPageProps {
  readonly params: Promise<{ slug: string }>;
}

export const generateMetadata = async ({
  params,
}: ChallengeRankingPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const challenge = challengeBySlug(slug);
  if (!challenge) return { title: "Challenge ranking | Hack the Andes" };
  return {
    title: `${challenge.title} ranking | Hack the Andes`,
    description: challenge.summary,
  };
};

export default async function ChallengeRankingPage({
  params,
}: ChallengeRankingPageProps) {
  const { slug } = await params;
  try {
    const ranking = await getChallengeRanking(slug);
    return (
      <ChallengesShell>
        <ChallengeRankingView ranking={ranking} />
      </ChallengesShell>
    );
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) notFound();
    throw error;
  }
}
