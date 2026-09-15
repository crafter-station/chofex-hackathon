import type { Metadata } from "next";

import {
  ChallengesIndex,
  scheduledChallengeItems,
} from "@/components/challenges/challenges-index";
import { ChallengesShell } from "@/components/challenges/challenges-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Challenge ranking | Hack the Andes",
  description:
    "Rankings públicos de los mini technical challenges de Hack the Andes.",
};

export default function ChallengesPage() {
  return (
    <ChallengesShell>
      <ChallengesIndex challenges={scheduledChallengeItems()} />
    </ChallengesShell>
  );
}
