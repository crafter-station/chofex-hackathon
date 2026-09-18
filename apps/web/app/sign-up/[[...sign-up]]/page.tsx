import { BrandAuthPage } from "@chofex/ui/components/brand";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { brandName } from "@/components/landing/content";

export default function SignUpPage() {
  return (
    <BrandAuthPage
      brand={
        <Link className="text-inherit" href="/">
          {brandName}
        </Link>
      }
    >
      <SignUp />
    </BrandAuthPage>
  );
}
