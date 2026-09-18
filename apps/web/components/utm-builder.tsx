"use client";

import { Badge } from "@chofex/ui/components/badge";
import { Button } from "@chofex/ui/components/button";
import { Input } from "@chofex/ui/components/input";
import { CheckIcon, CopyIcon, TriangleAlertIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  detectPostUrl,
  type PostUrlMatch,
  postUrlKindLabels,
} from "@/lib/post-url";
import {
  buildUtmLink,
  defaultUtmCampaign,
  type UtmMedium,
  type UtmSource,
  utmMediums,
  utmSources,
} from "@/lib/utm";

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

function labelForSource(source: UtmSource): string {
  return utmSources.find((option) => option.id === source)?.label ?? source;
}

/** Explains why a pasted link gave us nothing, so the fix is obvious. */
function hintForInput(detected: PostUrlMatch | null): string {
  if (!detected) {
    return "Paste the post link and we read its id, or type an id yourself. Spaces and symbols become dashes.";
  }
  if (!detected.network) {
    return "That link is not from Instagram, LinkedIn, X or Facebook.";
  }
  if (detected.kind === "share") {
    return `${labelForSource(detected.network)} share links hide the post id. Open the link and copy the url from the address bar.`;
  }
  if (!detected.id) {
    return `We found no post id in that ${labelForSource(detected.network)} link. It may point at a profile instead of a post.`;
  }
  return "";
}

export function UtmBuilder() {
  const [source, setSource] = useState<UtmSource>("instagram");
  const [medium, setMedium] = useState<UtmMedium>("organic_social");
  const [campaign, setCampaign] = useState(defaultUtmCampaign);
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

  const detected = detectPostUrl(postId);
  // A recognised link speaks for itself; anything else is taken as a typed id.
  const resolvedPostId = detected ? (detected.id ?? "") : postId;
  const link = buildUtmLink({
    source,
    medium,
    campaign,
    postId: resolvedPostId,
  });
  const hint = hintForInput(detected);

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

  const selectMedium = (next: UtmMedium) => {
    setMedium(next);
    setStatus("idle");
  };

  const changePostId = (next: string) => {
    setPostId(next);
    setStatus("idle");

    // A link tells us its own network, so the source follows the paste.
    const match = detectPostUrl(next);
    if (match?.network && match.id) setSource(match.network);
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

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Medium</legend>
        <div className="flex flex-wrap gap-2">
          {utmMediums.map((option) => (
            <Button
              key={option.id}
              type="button"
              size="lg"
              variant={option.id === medium ? "default" : "outline"}
              aria-pressed={option.id === medium}
              onClick={() => selectMedium(option.id)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="utm-campaign">
          Campaign
        </label>
        <Input
          id="utm-campaign"
          size="lg"
          autoComplete="off"
          placeholder={defaultUtmCampaign}
          value={campaign}
          onChange={(event) => {
            setCampaign(event.target.value);
            setStatus("idle");
          }}
        />
        <p className="text-sm text-muted-foreground">
          Keep one campaign name across every post you want to compare.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="utm-post-id">
          Post link or id
        </label>
        <Input
          id="utm-post-id"
          size="lg"
          autoComplete="off"
          placeholder="https://instagram.com/p/C7_Hlo8y9aP/"
          value={postId}
          onChange={(event) => changePostId(event.target.value)}
        />
        <div aria-live="polite">
          {detected?.network && detected.id && detected.kind ? (
            <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">
                {labelForSource(detected.network)}{" "}
                {postUrlKindLabels[detected.kind]}
              </Badge>
              <span>
                Post id{" "}
                <code className="font-mono break-all">{detected.id}</code>
              </span>
            </p>
          ) : null}
          {hint ? (
            <p className="text-sm text-muted-foreground">{hint}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">Link</span>
        <code className="block overflow-x-auto border border-border bg-muted px-3 py-3 font-mono text-sm break-all">
          {link ?? "Enter a post link or id to generate the link."}
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
