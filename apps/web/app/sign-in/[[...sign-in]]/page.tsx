import {
  BrandCenteredPage,
  BrandKicker,
  BrandTitle,
  BrandWordmark,
} from "@chofex/ui/components/brand";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { brandName } from "@/components/landing/content";

export default function SignInPage() {
  return (
    <BrandCenteredPage contentClassName="flex max-w-md flex-col items-center">
      <BrandWordmark className="mb-8 text-2xl">
        <Link className="text-inherit" href="/">
          {brandName}
        </Link>
      </BrandWordmark>
      <div className="mb-6 w-full text-center">
        <BrandKicker className="text-primary">Participant access</BrandKicker>
        <BrandTitle as="h1" className="mt-3" size="card">
          Sign in
        </BrandTitle>
      </div>
      <SignIn />
    </BrandCenteredPage>
  );
}
