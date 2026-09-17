"use client";

import { Button } from "@chofex/ui/components/button";
import { Input } from "@chofex/ui/components/input";
import { CheckIcon, CopyIcon, TriangleAlertIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { buildUtmLink, type UtmSource, utmSources } from "@/lib/utm";

type CopyStatus = "idle" | "copied" | "failed";

function labelForStatus(status: CopyStatus): string {
  if (status === "copied") return "Copied";
  if (status === "failed") return "Copy failed";
  return "Copy link";
}

function iconForStatus(status: CopyStatus) {
  if (status === "copied") return <CheckIcon data-icon="inline-start" />;
  if (status === "failed") {
    return <TriangleAlertIcon data-icon="inline-start" />;
  }
  return <CopyIcon data-icon="inline-start" />;
}

export function UtmBuilder() {
  const [source, setSource] = useState<UtmSource>("instagram");
  const [postId, setPostId] = useState("");
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

  const link = buildUtmLink({ source, postId });

  const copyLink = async () => {
    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }

    if (resetTimer.current !== undefined) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setStatus("idle"), 3_000);
  };

  const selectSource = (next: UtmSource) => {
    setSource(next);
    setStatus("idle");
  };

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Source</legend>
        <div className="flex flex-wrap gap-2">
          {utmSources.map((option) => (
            <Button
              key={option.id}
              type="button"
              size="lg"
              variant={option.id === source ? "default" : "outline"}
              aria-pressed={option.id === source}
              onClick={() => selectSource(option.id)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="utm-post-id">
          Post id
        </label>
        <Input
          id="utm-post-id"
          size="lg"
          autoComplete="off"
          placeholder="launch-reel"
          value={postId}
          onChange={(event) => {
            setPostId(event.target.value);
            setStatus("idle");
          }}
        />
        <p className="text-sm text-muted-foreground">
          Anything that identifies the post. Spaces and symbols become dashes.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">Link</span>
        <code className="block overflow-x-auto rounded-lg bg-muted px-3 py-2 font-mono text-sm break-all">
          {link ?? "Enter a post id to generate the link."}
        </code>
        <div className="flex items-center gap-3">
          <Button type="button" size="lg" disabled={!link} onClick={copyLink}>
            {iconForStatus(status)}
            {labelForStatus(status)}
          </Button>
          <span className="text-sm text-muted-foreground" aria-live="polite">
            {status === "failed" ? "Copy it manually from the box above." : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
