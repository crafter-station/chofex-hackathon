import ReactMarkdown from "react-markdown";

interface LegalDocumentProps {
  readonly children: string;
}

export function LegalDocument({ children }: LegalDocumentProps) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mt-10 text-2xl font-semibold tracking-tight">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-8 text-xl font-semibold tracking-tight">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mt-4 leading-7 text-muted-foreground">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-muted-foreground">
            {children}
          </ol>
        ),
        a: ({ children, href }) => (
          <a className="font-medium text-foreground underline" href={href}>
            {children}
          </a>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
