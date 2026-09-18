import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Metadata } from "next";
import { brandName } from "@/components/landing/content";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: `Privacy Policy | ${brandName}`,
  description: `Privacy Policy for ${brandName} registration.`,
};

export default async function PrivacyPage() {
  const markdown = await readFile(
    path.join(process.cwd(), "content/legal/privacy.md"),
    "utf8",
  );

  return (
    <LegalPage
      alternateHref="/terms"
      alternateLabel="Terms and Code of Conduct"
    >
      {markdown}
    </LegalPage>
  );
}
