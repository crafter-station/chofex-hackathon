import {
  BrandContainer,
  BrandFrame,
  BrandHeader,
  BrandKicker,
  BrandPage,
  BrandTitle,
  BrandWordmark,
} from "@chofex/ui/components/brand";
import { buttonVariants } from "@chofex/ui/components/button";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { brandName } from "@/components/landing/content";
import { UtmBuilder } from "@/components/utm-builder";
import { getAdminIdentity } from "@/lib/admin/auth";

export const metadata = {
  title: "UTM builder",
};

export default async function UtmBuilderPage() {
  const authentication = await auth();
  if (!authentication.userId) {
    redirect("/sign-in?redirect_url=/admin/utm");
  }

  const admin = await getAdminIdentity();
  if (!admin) redirect("/welcome");

  return (
    <BrandPage>
      <BrandHeader>
        <BrandWordmark>
          <Link className="text-inherit" href="/">
            {brandName}
          </Link>
        </BrandWordmark>
        <Link
          className={buttonVariants({ variant: "outline", size: "sm" })}
          href="/admin/participants"
        >
          Participants
        </Link>
      </BrandHeader>
      <main>
        <BrandContainer className="max-w-3xl py-14 sm:py-20">
          <BrandKicker className="text-primary">
            Admin / campaign ops
          </BrandKicker>
          <BrandTitle as="h1" className="mt-3" size="page">
            UTM builder
          </BrandTitle>
          <p className="mt-5 mb-10 max-w-xl text-base leading-relaxed text-muted-foreground">
            Pick the network and the post, then paste the generated link in the
            post itself.
          </p>
          <BrandFrame className="p-5 sm:p-8">
            <UtmBuilder />
          </BrandFrame>
        </BrandContainer>
      </main>
    </BrandPage>
  );
}
