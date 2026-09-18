import { BrandProse } from "@chofex/ui/components/brand";
import ReactMarkdown from "react-markdown";

interface LegalDocumentProps {
  readonly children: string;
}

export function LegalDocument({ children }: LegalDocumentProps) {
  return (
    <BrandProse>
      <ReactMarkdown>{children}</ReactMarkdown>
    </BrandProse>
  );
}
