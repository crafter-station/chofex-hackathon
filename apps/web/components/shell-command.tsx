import { cn } from "@chofex/ui/lib/utils";
import { Fragment, type ReactNode } from "react";

function highlightCommand(command: string) {
  const nodes: ReactNode[] = [];
  let executable = true;

  for (const match of command.matchAll(/\s+|&&|\|\||[;&|]|[^\s;&|]+/g)) {
    const text = match[0];

    if (/^\s+$/.test(text)) {
      nodes.push(text);
      if (text.includes("\n")) executable = true;
      continue;
    }

    let kind = "command";
    if (/^(?:&&|\|\||[;&|])$/.test(text)) {
      kind = "muted";
      executable = true;
    } else if (executable) {
      kind = "executable";
      executable = false;
    } else if (/^--?[a-z]/i.test(text)) {
      kind = "flag";
    } else {
      const versionedPackage = text.match(
        /^((?:@[\w.-]+\/)?[\w.-]+)(@[\w.+~^-]+)$/,
      );
      if (versionedPackage) {
        nodes.push(
          <Fragment key={match.index}>
            <span data-token="package">{versionedPackage[1]}</span>
            <span data-token="muted">{versionedPackage[2]}</span>
          </Fragment>,
        );
        continue;
      }
    }

    nodes.push(
      <span data-token={kind} key={match.index}>
        {text}
      </span>,
    );
  }

  return nodes;
}

export function ShellCommand({
  command,
  prompt = false,
  className,
}: {
  readonly command: string;
  readonly prompt?: boolean;
  readonly className?: string;
}) {
  return (
    <code className={cn("shell-command", className)}>
      {prompt && (
        <span aria-hidden="true" className="mr-3" data-token="muted">
          $
        </span>
      )}
      {highlightCommand(command)}
    </code>
  );
}
