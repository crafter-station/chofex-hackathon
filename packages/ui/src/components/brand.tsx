import { cn } from "cn";
import type { ComponentProps, ReactNode } from "react";

export const brandPageClassName =
  "brand-page min-h-svh bg-background font-sans text-foreground antialiased selection:bg-[var(--hud-accent)] selection:text-[var(--hud-paper)]";

export const brandSectionClassName = "py-14 sm:py-20";

export const brandFrameClassName =
  "brand-frame border border-foreground/10 bg-card text-card-foreground";

export const brandWordmarkClassName =
  "font-brand text-xl leading-none font-medium tracking-[0.012em] text-foreground";

export function BrandPage({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn(brandPageClassName, className)} {...props} />;
}

export function BrandContainer({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10",
        className,
      )}
      {...props}
    />
  );
}

export function BrandHeader({
  className,
  children,
  ...props
}: ComponentProps<"header">) {
  return (
    <header
      className={cn(
        "border-border border-b bg-background/92 backdrop-blur-xl",
        className,
      )}
      {...props}
    >
      <BrandContainer className="flex min-h-16 flex-wrap items-center justify-between gap-x-4 gap-y-3 py-3 [&>*]:min-w-0">
        {children}
      </BrandContainer>
    </header>
  );
}

export function BrandFooter({
  className,
  children,
  ...props
}: ComponentProps<"footer">) {
  return (
    <footer
      className={cn(
        "border-border border-t bg-[var(--hud-footer)] text-foreground",
        className,
      )}
      {...props}
    >
      <BrandContainer className="flex flex-col gap-6 py-8">
        {children}
      </BrandContainer>
    </footer>
  );
}

export function BrandWordmark({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn(brandWordmarkClassName, className)} {...props} />;
}

export function BrandWordmarkLink({
  className,
  ...props
}: ComponentProps<"a">) {
  return <a className={cn(brandWordmarkClassName, className)} {...props} />;
}

export function BrandKicker({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("brand-kicker", className)} {...props} />;
}

export function BrandTitle({
  as: Heading = "h2",
  className,
  ...props
}: ComponentProps<"h2"> & {
  readonly as?: "h1" | "h2";
}) {
  return (
    <Heading
      className={cn(
        "text-balance font-display leading-[0.88] tracking-[-0.025em] uppercase",
        "text-5xl sm:text-7xl",
        className,
      )}
      {...props}
    />
  );
}

export function BrandSectionHeader({
  title,
  subtitle,
  titleId,
  children,
  headingLevel = "h2",
  className,
}: {
  readonly title: string;
  readonly subtitle?: string;
  readonly titleId?: string;
  readonly children?: ReactNode;
  readonly headingLevel?: "h1" | "h2";
  readonly className?: string;
}) {
  return (
    <div className={cn("mb-10 flex max-w-3xl flex-col gap-3", className)}>
      <BrandTitle as={headingLevel} id={titleId}>
        <span className="block">{title}</span>
        {subtitle ? <span className="block">{subtitle}</span> : null}
      </BrandTitle>
      {children}
    </div>
  );
}

export function BrandFrame({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn(brandFrameClassName, className)} {...props} />;
}

export function BrandProse({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("brand-prose", className)} {...props} />;
}

export function BrandCenteredPage({
  children,
  className,
  contentClassName,
  ...props
}: ComponentProps<"main"> & { readonly contentClassName?: string }) {
  return (
    <main
      className={cn(
        brandPageClassName,
        "brand-topography grid place-items-center px-5 py-12 sm:px-8",
        className,
      )}
      {...props}
    >
      <div className={cn("w-full max-w-lg", contentClassName)}>{children}</div>
    </main>
  );
}

export function BrandAuthPage({
  brandName,
  children,
  className,
  ...props
}: ComponentProps<"main"> & { readonly brandName: string }) {
  return (
    <BrandCenteredPage
      className={className}
      contentClassName="flex max-w-md flex-col items-center"
      {...props}
    >
      <BrandWordmarkLink className="mb-8 text-2xl" href="/">
        {brandName}
      </BrandWordmarkLink>
      {children}
    </BrandCenteredPage>
  );
}
