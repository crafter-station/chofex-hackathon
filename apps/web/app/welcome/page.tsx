import { buttonVariants } from "@chofex/ui/components/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Welcome | Chofex Hackathon",
};

export default function WelcomePage() {
  return (
    <main className="grid min-h-svh place-items-center bg-gradient-to-b from-amber-50 to-background px-6 text-center dark:from-amber-950/30">
      <div className="flex max-w-lg flex-col items-center">
        <div
          aria-hidden="true"
          className="text-8xl leading-none drop-shadow-sm sm:text-9xl"
        >
          😊
        </div>
        <h1 className="mt-8 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Happy to have you here
        </h1>
        <Link
          className={buttonVariants({ size: "lg", className: "mt-8" })}
          href="/"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
