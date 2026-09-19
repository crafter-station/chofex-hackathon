import type { Metadata } from "next";

import {
  ChallengesIndex,
  scheduledChallengeItems,
} from "@/components/challenges/challenges-index";
import { ChallengesShell } from "@/components/challenges/challenges-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Challenges de clasificación | Hack the Andes",
  description:
    "Envía tu postulación y compite en cinco challenges técnicos por un pase directo a Hack the Andes.",
};

export default function ChallengesPage() {
  return (
    <ChallengesShell>
      <ChallengesIndex challenges={scheduledChallengeItems()} />
    </ChallengesShell>
  );
}
