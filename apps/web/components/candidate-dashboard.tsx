"use client";

import { UserButton } from "@clerk/nextjs";
import { Button } from "@repo/ui/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/components/drawer";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleUserRoundIcon,
  ExternalLinkIcon,
  MailIcon,
  SearchIcon,
  ShieldAlertIcon,
  SparklesIcon,
  SquareCodeIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type CSSProperties,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  Candidate,
  CandidateCounts,
  CandidatePage,
  CandidateStatus,
} from "@/lib/admin/types";

interface CandidateDashboardProps {
  readonly data: CandidatePage;
  readonly initialQuery: string;
  readonly initialStatus?: CandidateStatus;
}

interface StatusStyle {
  readonly label: string;
  readonly className: string;
  readonly dotClassName: string;
}

const statusStyles: Record<CandidateStatus, StatusStyle> = {
  draft: {
    label: "Draft",
    className:
      "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300",
    dotClassName: "bg-stone-400",
  },
  submitted: {
    label: "Submitted",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    dotClassName: "bg-amber-500",
  },
  under_review: {
    label: "In review",
    className:
      "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    dotClassName: "bg-violet-500",
  },
  waitlisted: {
    label: "Waitlisted",
    className: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    dotClassName: "bg-sky-500",
  },
  accepted: {
    label: "Accepted",
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    dotClassName: "bg-emerald-500",
  },
  rejected: {
    label: "Declined",
    className: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    dotClassName: "bg-rose-500",
  },
  withdrawn: {
    label: "Withdrawn",
    className:
      "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400",
    dotClassName: "bg-stone-400",
  },
};

const reviewableStatuses = new Set<CandidateStatus>([
  "submitted",
  "under_review",
  "waitlisted",
]);

const filterStatuses: ReadonlyArray<{
  readonly value?: CandidateStatus;
  readonly label: string;
  readonly countKey: keyof CandidateCounts;
}> = [
  { label: "All", countKey: "all" },
  { value: "submitted", label: "Submitted", countKey: "submitted" },
  { value: "under_review", label: "In review", countKey: "under_review" },
  { value: "waitlisted", label: "Waitlisted", countKey: "waitlisted" },
  { value: "accepted", label: "Accepted", countKey: "accepted" },
  { value: "rejected", label: "Declined", countKey: "rejected" },
];

const displayName = (candidate: Candidate): string =>
  `${candidate.firstName} ${candidate.lastName}`.trim();

const initials = (candidate: Candidate): string =>
  `${candidate.firstName.charAt(0)}${candidate.lastName.charAt(0)}`.toUpperCase();

const avatarHue = (candidate: Candidate): number => {
  let value = 0;
  for (const character of candidate.id) {
    value = (value * 31 + character.charCodeAt(0)) % 360;
  }
  return value;
};

const avatarStyle = (candidate: Candidate): CSSProperties => ({
  background: `linear-gradient(145deg, hsl(${avatarHue(candidate)} 78% 93%), hsl(${(avatarHue(candidate) + 34) % 360} 68% 82%))`,
  color: `hsl(${avatarHue(candidate)} 48% 32%)`,
});

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const titleCase = (value: string): string =>
  value
    .split("_")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");

const safeUrl = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") return url.href;
  } catch {
    return undefined;
  }
  return undefined;
};

const StatusBadge = ({ status }: { readonly status: CandidateStatus }) => {
  const style = statusStyles[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.className}`}
    >
      <span className={`size-1.5 rounded-full ${style.dotClassName}`} />
      {style.label}
    </span>
  );
};

const EmptyValue = () => (
  <span className="text-muted-foreground/60">Not provided</span>
);

const Detail = ({
  label,
  children,
}: {
  readonly label: string;
  readonly children?: React.ReactNode;
}) => (
  <div className="space-y-1">
    <dt className="text-xs font-medium tracking-wide text-muted-foreground">
      {label}
    </dt>
    <dd className="text-sm leading-6 text-foreground">
      {children || <EmptyValue />}
    </dd>
  </div>
);

const CandidateLink = ({
  href,
  label,
  icon,
}: {
  readonly href?: string;
  readonly label: string;
  readonly icon: React.ReactNode;
}) => {
  const safeHref = safeUrl(href);
  if (!safeHref) return null;
  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
    >
      {icon}
      {label}
      <ExternalLinkIcon className="size-3 text-muted-foreground" />
    </a>
  );
};

interface DecisionResponse {
  readonly ok: boolean;
  readonly data?: {
    readonly emailStatus: "not_requested" | "sent" | "failed";
    readonly emailError?: string;
  };
  readonly error?: { readonly message?: string };
}

const CandidateDrawer = ({
  candidate,
  open,
  onOpenChange,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: {
  readonly candidate?: Candidate;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
  readonly hasPrevious: boolean;
  readonly hasNext: boolean;
}) => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [notify, setNotify] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string>();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }
      if ((event.key === "ArrowLeft" || event.key === "k") && hasPrevious) {
        event.preventDefault();
        onPrevious();
      }
      if ((event.key === "ArrowRight" || event.key === "j") && hasNext) {
        event.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasNext, hasPrevious, onNext, onPrevious, open]);

  if (!candidate) return null;

  const submitDecision = async (decision: "accepted" | "rejected") => {
    setSaving(true);
    setFeedback(undefined);
    try {
      const response = await fetch(
        `/api/admin/applications/${candidate.id}/decision`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ decision, message, notify }),
        },
      );
      const result = (await response.json()) as DecisionResponse;
      if (!response.ok || !result.ok) {
        throw new Error(
          result.error?.message ?? "The decision could not be saved",
        );
      }
      if (result.data?.emailStatus === "failed") {
        setFeedback(
          result.data.emailError ??
            "Decision saved, but the notification email failed.",
        );
      } else if (result.data?.emailStatus === "sent") {
        setFeedback("Decision saved and email sent.");
      } else {
        setFeedback("Decision saved.");
      }
      if (result.data?.emailStatus !== "failed") router.refresh();
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "Please try again.";
      setFeedback(reason);
    } finally {
      setSaving(false);
    }
  };

  const isReviewable = reviewableStatuses.has(candidate.status);
  const experience =
    candidate.experienceLevel && titleCase(candidate.experienceLevel);
  const participation =
    candidate.participationMode && titleCase(candidate.participationMode);
  const teamPreference =
    candidate.teamPreference && titleCase(candidate.teamPreference);
  let attendanceStatus = "Awaiting details";
  if (candidate.attendanceCompletedAt) attendanceStatus = "Complete";
  const checkedIn =
    candidate.checkedInAt && formatDateTime(candidate.checkedInAt);
  const dateOfBirth =
    candidate.dateOfBirth && formatDate(candidate.dateOfBirth);
  const idDocument = candidate.nationalIdProvided && "Provided securely";
  const skillTags = candidate.skills.length > 0 && (
    <span className="flex flex-wrap gap-1.5">
      {candidate.skills.map((skill) => (
        <span key={skill} className="rounded-md bg-muted px-2 py-0.5 text-xs">
          {skill}
        </span>
      ))}
    </span>
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent
        className="shadow-2xl sm:rounded-l-2xl"
        style={
          {
            "--drawer-content-width": "min(42rem, calc(100vw - 1rem))",
          } as CSSProperties
        }
      >
        <DrawerHeader className="border-b bg-background/95 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <DrawerClose
                className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close candidate details"
              >
                <XIcon className="size-4" />
              </DrawerClose>
              <div>
                <DrawerTitle>Candidate details</DrawerTitle>
                <DrawerDescription className="text-xs">
                  Review application and make a decision
                </DrawerDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={onPrevious}
                disabled={!hasPrevious}
                aria-label="Previous candidate (K or left arrow)"
                title="Previous · K or ←"
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={onNext}
                disabled={!hasNext}
                aria-label="Next candidate (J or right arrow)"
                title="Next · J or →"
              >
                <ChevronRightIcon />
              </Button>
            </div>
          </div>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20">
          <section className="border-b bg-background px-5 py-6 sm:px-7">
            <div className="flex items-start gap-4">
              <div
                className="grid size-14 shrink-0 place-items-center rounded-2xl text-sm font-semibold shadow-sm ring-1 ring-black/5"
                style={avatarStyle(candidate)}
              >
                {initials(candidate)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                      {displayName(candidate)}
                    </h2>
                    <a
                      className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                      href={`mailto:${candidate.email}`}
                    >
                      <MailIcon className="size-3.5" />
                      {candidate.email || "No email provided"}
                    </a>
                  </div>
                  <StatusBadge status={candidate.status} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <CandidateLink
                    href={candidate.githubUrl}
                    label="GitHub"
                    icon={<SquareCodeIcon className="size-3.5" />}
                  />
                  <CandidateLink
                    href={candidate.linkedInUrl}
                    label="LinkedIn"
                    icon={<CircleUserRoundIcon className="size-3.5" />}
                  />
                  <CandidateLink
                    href={candidate.portfolioUrl}
                    label="Portfolio"
                    icon={<SparklesIcon className="size-3.5" />}
                  />
                </div>
              </div>
            </div>
          </section>

          {isReviewable && (
            <section className="border-b bg-background px-5 py-5 sm:px-7">
              <div className="overflow-hidden rounded-xl border border-amber-200/70 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30">
                <div className="border-b border-amber-200/70 px-4 py-3 text-sm font-medium text-amber-900 dark:border-amber-900 dark:text-amber-200">
                  This application is ready for your decision.
                </div>
                <div className="space-y-3 bg-background/80 p-4">
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={notify}
                      onChange={(event) => setNotify(event.target.checked)}
                      className="size-4 rounded border-input accent-foreground"
                    />
                    Notify candidate by email
                  </label>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="candidate-message"
                      className="text-xs font-medium"
                    >
                      Optional message
                    </label>
                    <textarea
                      id="candidate-message"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      disabled={!notify}
                      maxLength={2000}
                      rows={4}
                      placeholder="Add a personal note to the decision email…"
                      className="w-full resize-none rounded-xl border bg-background px-3 py-2.5 text-sm outline-none transition-shadow placeholder:text-muted-foreground/60 focus:border-ring focus:ring-3 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>
                        The standard decision copy is always included.
                      </span>
                      <span>{message.length}/2,000</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={() => submitDecision("accepted")}
                      disabled={saving}
                    >
                      <CheckIcon />
                      Admit
                    </Button>
                    <Button
                      variant="destructive"
                      className="bg-rose-600 text-white hover:bg-rose-700"
                      onClick={() => submitDecision("rejected")}
                      disabled={saving}
                    >
                      <XIcon />
                      Decline
                    </Button>
                  </div>
                  {feedback && (
                    <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                      {feedback}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          <section className="space-y-5 px-5 py-6 sm:px-7">
            <div>
              <h3 className="text-sm font-semibold">Application</h3>
              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5">
                <Detail label="Submitted">
                  {formatDateTime(candidate.submittedAt)}
                </Detail>
                <Detail label="Location">
                  {[candidate.city, candidate.countryCode]
                    .filter(Boolean)
                    .join(", ")}
                </Detail>
                <Detail label="Role">{candidate.role}</Detail>
                <Detail label="Organization">{candidate.organization}</Detail>
                <Detail label="Pronouns">{candidate.pronouns}</Detail>
                <Detail label="Field of study">{candidate.fieldOfStudy}</Detail>
                <Detail label="Graduation year">
                  {candidate.graduationYear?.toString()}
                </Detail>
                <Detail label="Experience">{experience}</Detail>
                <Detail label="Participation">{participation}</Detail>
                <Detail label="Team preference">{teamPreference}</Detail>
                <Detail label="Team name">{candidate.teamName}</Detail>
                <Detail label="Media consent">
                  {candidate.mediaConsent ? "Granted" : "Not granted"}
                </Detail>
                <Detail label="Decision time">
                  {candidate.decidedAt && formatDateTime(candidate.decidedAt)}
                </Detail>
              </dl>
            </div>

            <div className="border-t pt-5">
              <h3 className="text-sm font-semibold">Skills & story</h3>
              <dl className="mt-4 space-y-5">
                <Detail label="Skills">{skillTags}</Detail>
                <Detail label="Bio">{candidate.bio}</Detail>
              </dl>
            </div>

            {(candidate.status === "accepted" ||
              candidate.attendanceCompletedAt) && (
              <div className="border-t pt-5">
                <h3 className="text-sm font-semibold">Attendance details</h3>
                <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5">
                  <Detail label="Details status">{attendanceStatus}</Detail>
                  <Detail label="Checked in">{checkedIn}</Detail>
                  <Detail label="Phone">{candidate.phone}</Detail>
                  <Detail label="Date of birth">{dateOfBirth}</Detail>
                  <Detail label="Shirt size">
                    {candidate.shirtSize?.toUpperCase()}
                  </Detail>
                  <Detail label="ID document">{idDocument}</Detail>
                  <Detail label="Emergency contact">
                    {candidate.emergencyContactName}
                  </Detail>
                  <Detail label="Emergency phone">
                    {candidate.emergencyContactPhone}
                  </Detail>
                  <Detail label="Dietary restrictions">
                    {candidate.dietaryRestrictions}
                  </Detail>
                  <Detail label="Accessibility needs">
                    {candidate.accessibilityNeeds}
                  </Detail>
                </dl>
              </div>
            )}

            {candidate.rejectionReason && (
              <div className="border-t pt-5">
                <Detail label="Decline note">
                  {candidate.rejectionReason}
                </Detail>
              </div>
            )}
          </section>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

const pageHref = (
  page: number,
  query: string,
  status: CandidateStatus | undefined,
): string => {
  const parameters = new URLSearchParams();
  if (page > 1) parameters.set("page", page.toString());
  if (query) parameters.set("q", query);
  if (status) parameters.set("status", status);
  const suffix = parameters.toString();
  if (suffix) return `/admin/participants?${suffix}`;
  return "/admin/participants";
};

const visiblePages = (
  page: number,
  totalPages: number,
): ReadonlyArray<number> => {
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

export function CandidateDashboard({
  data,
  initialQuery,
  initialStatus,
}: CandidateDashboardProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [selectedId, setSelectedId] = useState<string>();
  const selectedIndex = data.candidates.findIndex(
    (candidate) => candidate.id === selectedId,
  );
  const selectedCandidate = data.candidates[selectedIndex];

  const goToCandidate = (index: number) => {
    const candidate = data.candidates[index];
    if (candidate) setSelectedId(candidate.id);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(pageHref(1, query.trim(), initialStatus));
  };

  const pageNumbers = useMemo(
    () => visiblePages(data.page, data.totalPages),
    [data.page, data.totalPages],
  );
  const reviewCount =
    data.counts.submitted + data.counts.under_review + data.counts.waitlisted;
  let firstResult = 0;
  if (data.total > 0) firstResult = (data.page - 1) * data.pageSize + 1;
  const lastResult = Math.min(data.page * data.pageSize, data.total);

  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_22%_0%,rgba(196,181,253,0.26),transparent_34%),radial-gradient(circle_at_64%_0%,rgba(167,243,208,0.23),transparent_33%),radial-gradient(circle_at_88%_4%,rgba(253,186,116,0.18),transparent_28%)]" />
      <header className="relative border-b border-border/70 bg-background/65 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-foreground text-background shadow-sm">
              <SparklesIcon className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">
                Chofex Hackathon
              </p>
              <p className="text-[11px] text-muted-foreground">
                Lima · Participant operations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border bg-background/70 px-3 py-1 text-xs text-muted-foreground sm:block">
              Admin workspace
            </span>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span>CHOFEX 2026</span>
              <span>·</span>
              <span>Applications</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Meet the candidates
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Review every application, keep decisions moving, and make each
              response feel personal.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border bg-background/80 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur">
            <CalendarDaysIcon className="size-4" />
            On-site · Lima, Peru
          </div>
        </section>

        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Total applications"
            value={data.counts.all}
            icon={<UsersIcon className="size-4 text-muted-foreground" />}
          />
          <StatCard
            label="Needs review"
            value={reviewCount}
            icon={
              <span className="size-2 rounded-full bg-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,0.12)]" />
            }
          />
          <StatCard
            label="Accepted"
            value={data.counts.accepted}
            icon={
              <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
            }
          />
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <form
              onSubmit={handleSearch}
              className="relative w-full lg:max-w-sm"
            >
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, email, or organization"
                className="h-10 w-full rounded-xl border bg-background/85 pr-3 pl-9 text-sm shadow-sm outline-none backdrop-blur transition-shadow placeholder:text-muted-foreground/70 focus:border-ring focus:ring-3 focus:ring-ring/20"
              />
            </form>
            <div className="flex gap-1 overflow-x-auto rounded-xl border bg-background/70 p-1 shadow-sm backdrop-blur">
              {filterStatuses.map((filter) => {
                const active = filter.value === initialStatus;
                let className =
                  "shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors";
                if (active) {
                  className += " bg-foreground text-background shadow-sm";
                } else {
                  className +=
                    " text-muted-foreground hover:bg-muted hover:text-foreground";
                }
                return (
                  <a
                    key={filter.label}
                    href={pageHref(1, initialQuery, filter.value)}
                    className={className}
                  >
                    {filter.label}
                    <span className="ml-1.5 opacity-65">
                      {data.counts[filter.countKey]}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border bg-card/90 shadow-sm backdrop-blur">
            <div className="hidden grid-cols-[minmax(0,1.7fr)_minmax(9rem,1fr)_9rem_7rem] gap-4 border-b bg-muted/35 px-5 py-3 text-[11px] font-medium tracking-wide text-muted-foreground uppercase sm:grid">
              <span>Candidate</span>
              <span>Background</span>
              <span>Status</span>
              <span className="text-right">Submitted</span>
            </div>
            {data.candidates.length === 0 && <EmptyCandidates />}
            {data.candidates.length > 0 && (
              <CandidateRows
                candidates={data.candidates}
                onSelect={setSelectedId}
              />
            )}
          </div>

          <div className="mt-4 flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
            <span>
              Showing {firstResult}–{lastResult} of {data.total}
            </span>
            <nav
              aria-label="Candidate pagination"
              className="flex items-center gap-1"
            >
              <PaginationArrow
                href={pageHref(
                  Math.max(1, data.page - 1),
                  initialQuery,
                  initialStatus,
                )}
                disabled={data.page === 1}
                label="Previous page"
                icon={<ArrowLeftIcon className="size-3.5" />}
              />
              {pageNumbers.map((page) => (
                <a
                  key={page}
                  href={pageHref(page, initialQuery, initialStatus)}
                  aria-current={page === data.page ? "page" : undefined}
                  className="grid size-8 place-items-center rounded-lg border bg-background font-medium transition-colors hover:bg-muted aria-current:bg-foreground aria-current:text-background"
                >
                  {page}
                </a>
              ))}
              <PaginationArrow
                href={pageHref(
                  Math.min(data.totalPages, data.page + 1),
                  initialQuery,
                  initialStatus,
                )}
                disabled={data.page === data.totalPages}
                label="Next page"
                icon={<ArrowRightIcon className="size-3.5" />}
              />
            </nav>
          </div>
        </section>
      </main>

      <CandidateDrawer
        key={selectedCandidate?.id}
        candidate={selectedCandidate}
        open={Boolean(selectedCandidate)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedId(undefined);
        }}
        onPrevious={() => goToCandidate(selectedIndex - 1)}
        onNext={() => goToCandidate(selectedIndex + 1)}
        hasPrevious={selectedIndex > 0}
        hasNext={
          selectedIndex >= 0 && selectedIndex < data.candidates.length - 1
        }
      />
    </div>
  );
}

const StatCard = ({
  label,
  value,
  icon,
}: {
  readonly label: string;
  readonly value: number;
  readonly icon: React.ReactNode;
}) => (
  <div className="rounded-2xl border bg-card/80 p-4 shadow-sm backdrop-blur">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {icon}
    </div>
    <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
  </div>
);

const EmptyCandidates = () => (
  <div className="grid min-h-64 place-items-center px-6 text-center">
    <div>
      <div className="mx-auto grid size-11 place-items-center rounded-2xl bg-muted">
        <SearchIcon className="size-5 text-muted-foreground" />
      </div>
      <p className="mt-3 text-sm font-medium">No candidates found</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Try a different search or status filter.
      </p>
    </div>
  </div>
);

const CandidateRows = ({
  candidates,
  onSelect,
}: {
  readonly candidates: ReadonlyArray<Candidate>;
  readonly onSelect: (candidateId: string) => void;
}) => (
  <div className="divide-y">
    {candidates.map((candidate) => (
      <button
        type="button"
        key={candidate.id}
        onClick={() => onSelect(candidate.id)}
        className="group grid w-full gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/45 focus-visible:bg-muted/45 focus-visible:outline-none sm:grid-cols-[minmax(0,1.7fr)_minmax(9rem,1fr)_9rem_7rem] sm:items-center sm:gap-4 sm:px-5"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-xl text-[11px] font-semibold ring-1 ring-black/5"
            style={avatarStyle(candidate)}
          >
            {initials(candidate)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">
              {displayName(candidate)}
            </span>
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              {candidate.email || "No email provided"}
            </span>
          </span>
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block truncate text-sm">
            {candidate.role || candidate.fieldOfStudy || "—"}
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {candidate.organization || candidate.city || "No organization"}
          </span>
        </span>
        <span className="ml-12 sm:ml-0">
          <StatusBadge status={candidate.status} />
        </span>
        <span className="hidden items-center justify-end gap-2 text-xs text-muted-foreground sm:flex">
          {formatDate(candidate.submittedAt)}
          <ChevronRightIcon className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
      </button>
    ))}
  </div>
);

const PaginationArrow = ({
  href,
  disabled,
  label,
  icon,
}: {
  readonly href: string;
  readonly disabled: boolean;
  readonly label: string;
  readonly icon: React.ReactNode;
}) => (
  <a
    href={href}
    aria-disabled={disabled}
    aria-label={label}
    className="grid size-8 place-items-center rounded-lg border bg-background transition-colors hover:bg-muted aria-disabled:pointer-events-none aria-disabled:opacity-40"
  >
    {icon}
  </a>
);

export const AdminAccessDenied = () => (
  <main className="grid min-h-svh place-items-center bg-muted/30 px-6">
    <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted">
        <ShieldAlertIcon className="size-5 text-muted-foreground" />
      </div>
      <h1 className="mt-5 text-xl font-semibold">Admin access required</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        This workspace contains private participant information. Ask an
        organizer to add the admin role to your Clerk account.
      </p>
      <a
        href="/sign-in?redirect_url=/admin/participants"
        className="mt-6 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
      >
        Use another account
      </a>
    </div>
  </main>
);
