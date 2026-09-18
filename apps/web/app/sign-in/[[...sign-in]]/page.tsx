import { BrandAuthPage } from "@chofex/ui/components/brand";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { brandName } from "@/components/landing/content";

export default function SignInPage() {
  return (
    <BrandAuthPage
      brand={
        <Link className="text-inherit" href="/">
          {brandName}
        </Link>
      }
    >
      <SignIn />
    </BrandAuthPage>
  );
}
