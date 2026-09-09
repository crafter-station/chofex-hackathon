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
    <div className="flex flex-col items-start gap-2">
      <Button type="button" size="lg" onClick={copyPrompt}>
        {iconForStatus(status)}
        {labelForStatus(status)}
      </Button>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Paste it into your coding agent. It will apply for you and pause for
        your answers, login, and final approval.
      </p>
    </div>
  );
}
