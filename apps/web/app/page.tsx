import { ArrowDownIcon, MountainIcon, TerminalIcon } from "lucide-react";

import { CopyAgentPrompt } from "@/components/copy-agent-prompt";

const cliCommands = [
  "npm install --global chofex-cli@latest",
  "chofex login",
  "chofex register",
];

export default function Home() {
  return (
    <div className="min-h-svh bg-[#f4f1e9] text-[#171713] dark:bg-[#171713] dark:text-[#f4f1e9]">
      <header className="border-current/15 border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <a className="flex items-center gap-2.5 font-semibold" href="#top">
            <span className="grid size-8 place-items-center rounded-full bg-[#171713] text-[#f4f1e9] dark:bg-[#f4f1e9] dark:text-[#171713]">
              <MountainIcon className="size-4" aria-hidden="true" />
            </span>
            Hack the Andes
          </a>
        </div>
      </header>

      <main id="top">
        <section className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col justify-between px-5 py-10 sm:px-8 sm:py-14">
          <div className="py-20 sm:py-28">
            <h1 className="max-w-5xl text-[clamp(4.25rem,14vw,10rem)] leading-[0.78] font-semibold tracking-[-0.075em]">
              Hack the
              <span className="block pl-[0.32em] italic">Andes.</span>
            </h1>
            <p className="mt-12 max-w-md text-lg leading-relaxed opacity-65 sm:ml-[34%] sm:text-xl">
              Here we will have the landing. Wait for it.
            </p>
          </div>

          <a
            href="#apply"
            className="flex w-fit items-center gap-3 text-sm font-medium"
          >
            Apply below
            <span className="grid size-9 place-items-center rounded-full border border-current/30">
              <ArrowDownIcon className="size-4" aria-hidden="true" />
            </span>
          </a>
        </section>

        <section
          id="apply"
          className="border-current/15 border-t bg-[#171713] text-[#f4f1e9] dark:bg-[#f4f1e9] dark:text-[#171713]"
        >
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
            <div className="grid gap-8 border-current/20 border-b pb-12 md:grid-cols-[1fr_1.5fr]">
              <p className="font-mono text-xs uppercase tracking-[0.2em] opacity-55">
                Apply now
              </p>
              <div>
                <h2 className="max-w-2xl text-4xl leading-tight font-medium tracking-[-0.04em] sm:text-6xl">
                  Apply via the CLI or just tell your agent.
                </h2>
              </div>
            </div>

            <div className="grid md:grid-cols-2">
              <article className="border-current/20 py-10 md:border-r md:pr-10">
                <div className="mb-10 flex items-center justify-between">
                  <span className="font-mono text-xs opacity-50">01</span>
                  <TerminalIcon
                    className="size-5 opacity-50"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-2xl font-medium tracking-tight">
                  Apply with the CLI
                </h3>
                <div className="mt-6 overflow-x-auto rounded-lg border border-white/15 bg-black/20 p-5 font-mono text-sm leading-8 dark:border-black/15 dark:bg-black/5">
                  {cliCommands.map((command) => (
                    <div className="whitespace-nowrap" key={command}>
                      <span className="mr-3 text-[#b7dc63] dark:text-[#537a1d]">
                        $
                      </span>
                      {command}
                    </div>
                  ))}
                </div>
              </article>

              <article className="border-current/20 border-t py-10 md:border-t-0 md:pl-10">
                <div className="mb-10 flex items-center justify-between">
                  <span className="font-mono text-xs opacity-50">02</span>
                  <span className="font-mono text-xs uppercase tracking-[0.16em] opacity-50">
                    Agent
                  </span>
                </div>
                <h3 className="text-2xl font-medium tracking-tight">
                  Or tell your agent
                </h3>
                <CopyAgentPrompt />
              </article>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
