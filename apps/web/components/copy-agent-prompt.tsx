"use client";

import { Button } from "@chofex/ui/components/button";
import { CheckIcon, CopyIcon, TriangleAlertIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { agentApplicationPrompt } from "@/lib/agent-prompt";

type CopyStatus = "idle" | "copied" | "failed";

const labelForStatus = (status: CopyStatus): string => {
  if (status === "copied") return "Prompt copied";
  if (status === "failed") return "Copy failed — try again";
  return "Copy prompt for your agent";
};

const iconForStatus = (status: CopyStatus) => {
  if (status === "copied") return <CheckIcon data-icon="inline-start" />;
  if (status === "failed") {
    return <TriangleAlertIcon data-icon="inline-start" />;
  }
  return <CopyIcon data-icon="inline-start" />;
};

export function CopyAgentPrompt() {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(
    () => () => {
      if (resetTimer.current !== undefined) clearTimeout(resetTimer.current);
    },
    [],
  );

  const copyPrompt = async () => {
    try {
      const prompt = agentApplicationPrompt(window.location.origin);
      await navigator.clipboard.writeText(prompt);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }

    if (resetTimer.current !== undefined) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setStatus("idle"), 3_000);
  };

  return (
    <div className="mt-6">
      <blockquote className="mb-5 border-current/25 border-l pl-5 text-base leading-relaxed opacity-70">
        “Help me apply to Hack the Andes using the Chofex CLI. Ask me for every
        answer and get my approval before submitting.”
      </blockquote>
      <Button
        type="button"
        size="lg"
        variant="outline"
        className="h-11 border-white/20 bg-transparent px-4 text-[#f4f1e9] hover:bg-white/10 hover:text-[#f4f1e9] dark:border-black/20 dark:text-[#171713] dark:hover:bg-black/10 dark:hover:text-[#171713]"
        onClick={copyPrompt}
      >
        {iconForStatus(status)}
        {labelForStatus(status)}
      </Button>
      <p className="mt-3 text-xs leading-relaxed opacity-50" aria-live="polite">
        Paste it into your coding agent. You’ll handle login and final approval.
      </p>
    </div>
  );
}
