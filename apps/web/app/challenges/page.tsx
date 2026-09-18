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
    "Cinco challenges técnicos para demostrar tu nivel y competir por un pase directo a Hack the Andes.",
};

export default function ChallengesPage() {
  return (
    <ChallengesShell>
      <ChallengesIndex challenges={scheduledChallengeItems()} />
    </ChallengesShell>
  );
}
