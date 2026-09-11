"use client";

import { UserButton } from "@clerk/nextjs";
import { Badge } from "@chofex/ui/components/badge";
import {
  Button,
  ButtonLink,
  buttonVariants,
} from "@chofex/ui/components/button";
import { Card, CardContent, CardHeader } from "@chofex/ui/components/card";
import { Checkbox } from "@chofex/ui/components/checkbox";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@chofex/ui/components/drawer";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@chofex/ui/components/input-group";
import { Textarea } from "@chofex/ui/components/textarea";
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
import { type FormEvent, useEffect, useMemo, useState } from "react";

import {
  type CandidateFilters,
  candidateKeys,
  candidateListOptions,
  submitCandidateDecision,
} from "@/lib/admin/candidate-queries";
import type {
  Candidate,
  CandidateCounts,
  CandidatePage,
  CandidateStatus,
} from "@/lib/admin/types";
import {
  candidateStatuses,
  reviewableCandidateStatuses,
} from "@/lib/admin/types";

interface CandidateDashboardProps {
  readonly data: CandidatePage;
  readonly initialQuery: string;
  readonly initialStatus?: CandidateStatus;
  readonly initialSelection?: "first" | "last";
}

interface StatusStyle {
  readonly label: string;
  readonly variant:
    | "statusDraft"
    | "statusSubmitted"
    | "statusUnderReview"
    | "statusWaitlisted"
    | "statusAccepted"
    | "statusRejected"
    | "statusWithdrawn";
}

const statusStyles: Record<CandidateStatus, StatusStyle> = {
  draft: {
    label: "Draft",
    variant: "statusDraft",
  },
  submitted: {
    label: "Submitted",
    variant: "statusSubmitted",
  },
  under_review: {
    label: "In review",
    variant: "statusUnderReview",
  },
  waitlisted: {
    label: "Waitlisted",
    variant: "statusWaitlisted",
  },
  accepted: {
    label: "Accepted",
    variant: "statusAccepted",
  },
  rejected: {
    label: "Declined",
    variant: "statusRejected",
  },
  withdrawn: {
    label: "Withdrawn",
    variant: "statusWithdrawn",
  },
};

const reviewableStatuses = new Set<CandidateStatus>(
  reviewableCandidateStatuses,
);

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

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Lima",
  }).format(new Date(value));

const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Lima",
  }).format(new Date(value));

const formatCalendarDate = (value: string): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));

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
    <Badge variant={style.variant}>
      <span className="size-1.5 rounded-full bg-current opacity-60" />
      {style.label}
    </Badge>
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
    <ButtonLink
      variant="outline"
      size="sm"
      href={safeHref}
      target="_blank"
      rel="noreferrer"
    >
      {icon}
      {label}
      <ExternalLinkIcon className="text-muted-foreground" />
    </ButtonLink>
  );
};

const CandidateDrawer = ({
  candidate,
  open,
  onOpenChange,
  onPrevious,
  onNext,
  onCandidateUpdated,
  hasPrevious,
  hasNext,
}: {
  readonly candidate?: Candidate;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
  readonly onCandidateUpdated: (
    previousStatus: CandidateStatus,
    candidate: Candidate,
  ) => void;
  readonly hasPrevious: boolean;
  readonly hasNext: boolean;
}) => {
  const [message, setMessage] = useState("");
  const [notify, setNotify] = useState(true);
  const decisionMutation = useMutation({
    mutationFn: submitCandidateDecision,
    onSuccess: (result) => {
      const previousStatus = candidate?.status ?? result.candidate.status;
      onCandidateUpdated(previousStatus, result.candidate);
    },
  });

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

  const submitDecision = (decision: "accepted" | "rejected") => {
    decisionMutation.mutate({
      candidateId: candidate.id,
      decision,
      message,
      notify,
    });
  };

  let failedDecision: "accepted" | "rejected" | undefined;
  if (decisionMutation.data?.emailStatus === "failed") {
    failedDecision = decisionMutation.variables?.decision;
  }
  let feedback: string | undefined;
  if (decisionMutation.isError) {
    feedback = decisionMutation.error.message;
  } else if (decisionMutation.data?.emailStatus === "failed") {
    feedback =
      decisionMutation.data.emailError ??
      "Decision saved, but the notification email failed.";
  } else if (decisionMutation.data?.emailStatus === "sent") {
    feedback = "Decision saved and email sent.";
  } else if (decisionMutation.data?.emailStatus === "not_requested") {
    feedback = "Decision saved.";
  }
  const isReviewable = reviewableStatuses.has(candidate.status);
  const showDecisionPanel = isReviewable || Boolean(failedDecision);
  let decisionPanelMessage = "This application is ready for your decision.";
  if (!isReviewable) {
    decisionPanelMessage =
      "The decision was saved, but the email needs attention.";
  }
  const participation =
    candidate.participationMode && titleCase(candidate.participationMode);
  const teamPreference =
    candidate.teamPreference && titleCase(candidate.teamPreference);
  let attendanceStatus = "Awaiting details";
  if (candidate.attendanceCompletedAt) attendanceStatus = "Complete";
  const checkedIn =
    candidate.checkedInAt && formatDateTime(candidate.checkedInAt);
  const dateOfBirth =
    candidate.dateOfBirth && formatCalendarDate(candidate.dateOfBirth);
  const idDocument = candidate.nationalIdProvided && "Provided securely";

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
      }}
      swipeDirection="right"
    >
      <DrawerContent size="wide" className="shadow-2xl sm:rounded-l-2xl">
        <DrawerHeader className="border-b bg-background/95 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <DrawerClose
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Close candidate details"
                  />
                }
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
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-muted text-sm font-semibold text-muted-foreground">
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

          {showDecisionPanel && (
            <section className="border-b bg-background px-5 py-5 sm:px-7">
              <Card size="sm" className="gap-0 py-0">
                <CardHeader className="border-b py-3 text-sm font-medium">
                  {decisionPanelMessage}
                </CardHeader>
                <CardContent className="space-y-3 py-4">
                  <label
                    htmlFor="notify-candidate"
                    className="flex cursor-pointer items-center gap-2 text-sm font-medium"
                  >
                    <Checkbox
                      id="notify-candidate"
                      checked={notify}
                      onCheckedChange={setNotify}
                      disabled={Boolean(failedDecision)}
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
                    <Textarea
                      id="candidate-message"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      disabled={!notify}
                      maxLength={2000}
                      rows={4}
                      placeholder="Add a personal note to the decision email…"
                      resize="none"
                    />
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>
                        The standard decision copy is always included.
                      </span>
                      <span>{message.length}/2,000</span>
                    </div>
                  </div>
                  {isReviewable && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => submitDecision("accepted")}
                        disabled={decisionMutation.isPending}
                      >
                        <CheckIcon />
                        Admit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => submitDecision("rejected")}
                        disabled={decisionMutation.isPending}
                      >
                        <XIcon />
                        Decline
                      </Button>
                    </div>
                  )}
                  {failedDecision && (
                    <Button
                      className="w-full"
                      onClick={() => submitDecision(failedDecision)}
                      disabled={decisionMutation.isPending}
                    >
                      <MailIcon />
                      Retry notification email
                    </Button>
                  )}
                  {feedback && (
                    <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                      {feedback}
                    </p>
                  )}
                </CardContent>
              </Card>
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
              <h3 className="text-sm font-semibold">Projects & story</h3>
              <dl className="mt-4 space-y-5">
                <Detail label="What they have shipped">
                  {candidate.shippedProject}
                </Detail>
                <Detail label="What they want to ship">
                  {candidate.hackathonProject}
                </Detail>
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
  selection?: "first" | "last",
): string => {
  const parameters = new URLSearchParams();
  if (page > 1) parameters.set("page", page.toString());
  if (query) parameters.set("q", query);
  if (status) parameters.set("status", status);
  if (selection) parameters.set("candidate", selection);
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

const filtersFromUrl = (url: string): CandidateFilters => {
  const parameters = new URL(url).searchParams;
  const parsedPage = Number.parseInt(parameters.get("page") ?? "1", 10);
  let page = 1;
  if (Number.isFinite(parsedPage)) page = Math.max(1, parsedPage);
  const query = parameters.get("q")?.trim().slice(0, 200) ?? "";
  const requestedStatus = parameters.get("status");
  const status = candidateStatuses.find((value) => value === requestedStatus);
  return { page, query, status };
};

export function CandidateDashboard({
  data,
  initialQuery,
  initialStatus,
  initialSelection,
}: CandidateDashboardProps) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<CandidateFilters>({
    page: data.page,
    query: initialQuery,
    status: initialStatus,
  });
  let initiallySelectedId: string | undefined;
  if (initialSelection === "first") {
    initiallySelectedId = data.candidates[0]?.id;
  }
  if (initialSelection === "last") {
    initiallySelectedId = data.candidates.at(-1)?.id;
  }
  const [selectedId, setSelectedId] = useState<string | undefined>(
    initiallySelectedId,
  );
  const [pendingPageSelection, setPendingPageSelection] = useState<
    "first" | "last"
  >();
  const isInitialList =
    filters.page === data.page &&
    filters.query === initialQuery &&
    filters.status === initialStatus;
  const candidateQuery = useQuery({
    ...candidateListOptions(filters),
    initialData: isInitialList ? data : undefined,
    placeholderData: keepPreviousData,
  });
  const currentData = candidateQuery.data ?? data;
  const selectedIndex = currentData.candidates.findIndex(
    (candidate) => candidate.id === selectedId,
  );
  const selectedCandidate = currentData.candidates[selectedIndex];

  useEffect(() => {
    const handlePopState = () => {
      const nextFilters = filtersFromUrl(window.location.href);
      setFilters(nextFilters);
      setQuery(nextFilters.query);
      setSelectedId(undefined);
      setPendingPageSelection(undefined);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!pendingPageSelection || candidateQuery.isPlaceholderData) return;
    let candidate = currentData.candidates[0];
    if (pendingPageSelection === "last") {
      candidate = currentData.candidates.at(-1);
    }
    setSelectedId(candidate?.id);
    setPendingPageSelection(undefined);
  }, [candidateQuery.isPlaceholderData, currentData, pendingPageSelection]);

  const navigateTo = (
    nextFilters: CandidateFilters,
    selection?: "first" | "last",
  ) => {
    window.history.pushState(
      null,
      "",
      pageHref(nextFilters.page, nextFilters.query, nextFilters.status),
    );
    setFilters(nextFilters);
    setPendingPageSelection(selection);
    if (!selection) setSelectedId(undefined);
  };

  const navigateFromClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    nextFilters: CandidateFilters,
  ) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    navigateTo(nextFilters);
  };

  const goToCandidate = (index: number) => {
    const candidate = currentData.candidates[index];
    if (candidate) setSelectedId(candidate.id);
  };

  const goToPreviousCandidate = () => {
    if (selectedIndex > 0) {
      goToCandidate(selectedIndex - 1);
      return;
    }
    if (currentData.page > 1) {
      navigateTo({ ...filters, page: currentData.page - 1 }, "last");
    }
  };

  const goToNextCandidate = () => {
    if (selectedIndex < currentData.candidates.length - 1) {
      goToCandidate(selectedIndex + 1);
      return;
    }
    if (currentData.page < currentData.totalPages) {
      navigateTo({ ...filters, page: currentData.page + 1 }, "first");
    }
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigateTo({ page: 1, query: query.trim(), status: filters.status });
  };

  const handleCandidateUpdated = (
    previousStatus: CandidateStatus,
    updatedCandidate: Candidate,
  ) => {
    queryClient.setQueriesData<CandidatePage>(
      { queryKey: candidateKeys.all },
      (cachedPage) => {
        if (!cachedPage) return cachedPage;
        let counts = cachedPage.counts;
        if (previousStatus !== updatedCandidate.status) {
          counts = {
            ...counts,
            [previousStatus]: Math.max(0, counts[previousStatus] - 1),
            [updatedCandidate.status]: counts[updatedCandidate.status] + 1,
          };
        }
        const candidates = cachedPage.candidates.map((candidate) => {
          if (candidate.id === updatedCandidate.id) return updatedCandidate;
          return candidate;
        });
        return { ...cachedPage, candidates, counts };
      },
    );
    void queryClient.invalidateQueries({
      queryKey: candidateKeys.all,
      refetchType: "none",
    });
  };

  const pageNumbers = useMemo(
    () => visiblePages(currentData.page, currentData.totalPages),
    [currentData.page, currentData.totalPages],
  );
  const reviewCount =
    currentData.counts.submitted +
    currentData.counts.under_review +
    currentData.counts.waitlisted;
  let firstResult = 0;
  if (currentData.total > 0) {
    firstResult = (currentData.page - 1) * currentData.pageSize + 1;
  }
  const lastResult = Math.min(
    currentData.page * currentData.pageSize,
    currentData.total,
  );

  return (
    <div className="min-h-svh overflow-hidden bg-background">
      <header className="border-b bg-background">
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
            <Badge variant="outline" className="hidden sm:inline-flex">
              Admin workspace
            </Badge>
            <UserButton
              appearance={{
                elements: {
                  userButtonTrigger: buttonVariants({
                    variant: "ghost",
                    size: "icon",
                  }),
                },
              }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
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
          <Badge variant="outline">
            <CalendarDaysIcon className="size-4" />
            On-site · Lima, Peru
          </Badge>
        </section>

        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Total applications"
            value={currentData.counts.all}
            icon={<UsersIcon className="size-4 text-muted-foreground" />}
          />
          <StatCard
            label="Needs review"
            value={reviewCount}
            icon={
              <CircleUserRoundIcon className="size-4 text-muted-foreground" />
            }
          />
          <StatCard
            label="Accepted"
            value={currentData.counts.accepted}
            icon={<CheckIcon className="size-4 text-muted-foreground" />}
          />
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <form onSubmit={handleSearch} className="w-full lg:max-w-sm">
              <InputGroup>
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupInput
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search name, email, or organization"
                />
              </InputGroup>
            </form>
            <div className="flex gap-1 overflow-x-auto rounded-xl border bg-background p-1">
              {filterStatuses.map((filter) => {
                const active = filter.value === filters.status;
                const variant = active ? "default" : "ghost";
                return (
                  <ButtonLink
                    key={filter.label}
                    variant={variant}
                    size="sm"
                    className="shrink-0"
                    href={pageHref(1, filters.query, filter.value)}
                    onClick={(event) =>
                      navigateFromClick(event, {
                        page: 1,
                        query: filters.query,
                        status: filter.value,
                      })
                    }
                  >
                    {filter.label}
                    <span className="ml-1.5 opacity-65">
                      {currentData.counts[filter.countKey]}
                    </span>
                  </ButtonLink>
                );
              })}
            </div>
          </div>

          {candidateQuery.isError && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {candidateQuery.error.message}
            </p>
          )}
          <div
            className="mt-4 overflow-hidden rounded-2xl border bg-card"
            aria-busy={candidateQuery.isFetching}
          >
            <div className="hidden grid-cols-[minmax(0,1.7fr)_minmax(9rem,1fr)_9rem_7rem] gap-4 border-b bg-muted/35 px-5 py-3 text-[11px] font-medium tracking-wide text-muted-foreground uppercase sm:grid">
              <span>Candidate</span>
              <span>Background</span>
              <span>Status</span>
              <span className="text-right">Submitted</span>
            </div>
            {currentData.candidates.length === 0 && <EmptyCandidates />}
            {currentData.candidates.length > 0 && (
              <CandidateRows
                candidates={currentData.candidates}
                onSelect={setSelectedId}
              />
            )}
          </div>

          <div className="mt-4 flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
            <span>
              Showing {firstResult}–{lastResult} of {currentData.total}
            </span>
            <nav
              aria-label="Candidate pagination"
              className="flex items-center gap-1"
            >
              <PaginationArrow
                href={pageHref(
                  Math.max(1, currentData.page - 1),
                  filters.query,
                  filters.status,
                )}
                onClick={(event) =>
                  navigateFromClick(event, {
                    ...filters,
                    page: Math.max(1, currentData.page - 1),
                  })
                }
                disabled={currentData.page === 1}
                label="Previous page"
                icon={<ArrowLeftIcon className="size-3.5" />}
              />
              {pageNumbers.map((page) => (
                <ButtonLink
                  key={page}
                  variant={page === currentData.page ? "default" : "outline"}
                  size="icon"
                  href={pageHref(page, filters.query, filters.status)}
                  onClick={(event) =>
                    navigateFromClick(event, { ...filters, page })
                  }
                  aria-current={page === currentData.page ? "page" : undefined}
                >
                  {page}
                </ButtonLink>
              ))}
              <PaginationArrow
                href={pageHref(
                  Math.min(currentData.totalPages, currentData.page + 1),
                  filters.query,
                  filters.status,
                )}
                onClick={(event) =>
                  navigateFromClick(event, {
                    ...filters,
                    page: Math.min(
                      currentData.totalPages,
                      currentData.page + 1,
                    ),
                  })
                }
                disabled={currentData.page === currentData.totalPages}
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
          if (isOpen) return;
          setSelectedId(undefined);
          if (initialSelection) {
            window.history.replaceState(
              null,
              "",
              pageHref(filters.page, filters.query, filters.status),
            );
          }
          if (
            selectedCandidate &&
            filters.status &&
            selectedCandidate.status !== filters.status
          ) {
            void queryClient.invalidateQueries({
              queryKey: candidateKeys.list(filters),
            });
          }
        }}
        onPrevious={goToPreviousCandidate}
        onNext={goToNextCandidate}
        onCandidateUpdated={handleCandidateUpdated}
        hasPrevious={selectedIndex > 0 || currentData.page > 1}
        hasNext={
          selectedIndex >= 0 &&
          (selectedIndex < currentData.candidates.length - 1 ||
            currentData.page < currentData.totalPages)
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
  <Card size="sm" className="gap-3">
    <CardHeader className="flex flex-row items-center justify-between">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {icon}
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
    </CardContent>
  </Card>
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
      <Button
        type="button"
        variant="ghost"
        size="table-row"
        key={candidate.id}
        onClick={() => onSelect(candidate.id)}
        className="group sm:grid-cols-[minmax(0,1.7fr)_minmax(9rem,1fr)_9rem_7rem]"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-[11px] font-semibold text-muted-foreground">
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
      </Button>
    ))}
  </div>
);

const PaginationArrow = ({
  href,
  onClick,
  disabled,
  label,
  icon,
}: {
  readonly href: string;
  readonly onClick: React.MouseEventHandler<HTMLAnchorElement>;
  readonly disabled: boolean;
  readonly label: string;
  readonly icon: React.ReactNode;
}) => {
  if (disabled) {
    return (
      <Button variant="outline" size="icon" disabled aria-label={label}>
        {icon}
      </Button>
    );
  }

  return (
    <ButtonLink
      variant="outline"
      size="icon"
      href={href}
      onClick={onClick}
      aria-label={label}
    >
      {icon}
    </ButtonLink>
  );
};

export const AdminAccessDenied = () => (
  <main className="grid min-h-svh place-items-center bg-muted/30 px-6">
    <Card className="w-full max-w-md p-4 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted">
        <ShieldAlertIcon className="size-5 text-muted-foreground" />
      </div>
      <h1 className="mt-5 text-xl font-semibold">Admin access required</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        This workspace contains private participant information. Ask an
        organizer to add the admin role to your Clerk account.
      </p>
      <ButtonLink
        className="mt-2"
        href="/sign-in?redirect_url=/admin/participants"
      >
        Use another account
      </ButtonLink>
    </Card>
  </main>
);
