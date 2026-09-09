import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { BlocksIcon, PackageCheckIcon, PaletteIcon } from "lucide-react";

import { CopyAgentPrompt } from "@/components/copy-agent-prompt";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@chofex/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@chofex/ui/components/card";

export default function Home() {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2 font-semibold">
            <BlocksIcon className="size-5" />
            <span>Workspace UI</span>
          </div>
          <div className="flex items-center gap-2">
            <Show when="signed-out">
              <SignInButton>
                <Button variant="ghost">Sign in</Button>
              </SignInButton>
              <SignUpButton>
                <Button>Sign up</Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-20">
        <section className="max-w-3xl space-y-6">
          <div className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-sm text-muted-foreground">
            shadcn/ui + Turborepo
          </div>
          <div className="space-y-4">
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
              One UI package, ready for every app.
            </h1>
            <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
              Components are generated into the shared package and consumed by
              this Next.js app with system-aware light and dark themes.
            </p>
          </div>
          <CopyAgentPrompt />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <PackageCheckIcon className="mb-2 size-5 text-muted-foreground" />
              <CardTitle>Shared package</CardTitle>
              <CardDescription>
                Import typed components from <code>@chofex/ui</code> in any app.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Run the shadcn CLI from an app workspace and new UI primitives are
              routed into <code>packages/ui</code> automatically.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <PaletteIcon className="mb-2 size-5 text-muted-foreground" />
              <CardTitle>Theme included</CardTitle>
              <CardDescription>
                Light, dark, and system preferences work across the app.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Use the toggle in the header to switch modes. Your preference is
              persisted automatically by <code>next-themes</code>.
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
