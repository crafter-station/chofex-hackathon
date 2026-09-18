import { BrandAuthPage } from "@chofex/ui/components/brand";
import { SignIn } from "@clerk/nextjs";
import { brandName } from "@/components/landing/content";

export default function SignInPage() {
  return (
    <BrandAuthPage brandName={brandName}>
      <SignIn />
    </BrandAuthPage>
  );
}
