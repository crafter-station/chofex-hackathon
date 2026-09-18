import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Metadata } from "next";
import { brandName } from "@/components/landing/content";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: `Terms and Code of Conduct | ${brandName}`,
  description: `Participation terms and Code of Conduct for ${brandName}.`,
};

export default async function TermsPage() {
  const markdown = await readFile(
    path.join(process.cwd(), "content/legal/terms.md"),
    "utf8",
  );

  return (
    <LegalPage alternateHref="/privacy" alternateLabel="Privacy Policy">
      {markdown}
    </LegalPage>
  );
}
