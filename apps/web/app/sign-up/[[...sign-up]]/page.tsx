import { BrandAuthPage } from "@chofex/ui/components/brand";
import { SignUp } from "@clerk/nextjs";
import { brandName } from "@/components/landing/content";

export default function SignUpPage() {
  return (
    <BrandAuthPage brandName={brandName}>
      <SignUp />
    </BrandAuthPage>
  );
}
