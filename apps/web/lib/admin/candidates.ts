import { db } from "@chofex/db";
import { clerkClient } from "@clerk/nextjs/server";
import {
  and,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  type SQL,
} from "@chofex/db/orm";
import {
  acceptanceDetails,
  applications,
  participants,
} from "@chofex/db/schema";

import { HttpError } from "@/lib/registration/http";
import { candidateAvatarUrl } from "./avatars";
import { type ApplicationDecision, buildDecisionEmail } from "./decision-email";
import {
  type Candidate,
  type CandidateCounts,
  type CandidatePage,
  candidateStatuses,
  type CandidateStatus,
  reviewableCandidateStatuses,
} from "./types";

const pageSize = 10;
const decisionEmailFrom = "hackathons@crafterstation.com";
const decisionEmailReplyTo = "anthony@crafterstation.com";

const optional = <A>(value: A | null | undefined): A | undefined =>
  value ?? undefined;

const dateString = (value: Date | string): string => {
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
};

const instantString = (value: Date | null | undefined): string | undefined => {
  if (!value) return undefined;
  return value.toISOString();
};

type CandidateRecord = {
  readonly application: typeof applications.$inferSelect;
  readonly details: typeof acceptanceDetails.$inferSelect | null;
  readonly clerkUserId: string;
};

const toCandidate = (
  { application, details }: CandidateRecord,
  clerkPictureUrl: string | undefined,
): Candidate => {
  let dateOfBirth: string | undefined;
  if (details?.dateOfBirth) dateOfBirth = dateString(details.dateOfBirth);

  return {
    id: application.id,
    participantId: application.participantId,
    firstName: application.firstName ?? "Unknown",
    lastName: application.lastName ?? "participant",
    email: application.email ?? "",
    avatarUrl: candidateAvatarUrl(
      optional(application.pictureUrl),
      clerkPictureUrl,
      application.githubUrl,
    ),
    pronouns: optional(application.pronouns),
    countryCode: optional(application.countryCode),
    city: optional(application.city),
    participationMode: optional(application.participationMode),
    organization: optional(application.organization),
    role: optional(application.role),
    fieldOfStudy: optional(application.fieldOfStudy),
    graduationYear: optional(application.graduationYear),
    shippedProject: optional(application.shippedProject),
    hackathonProject: optional(application.hackathonProject),
    bio: optional(application.bio),
    githubUrl: optional(application.githubUrl),
    linkedInUrl: optional(application.linkedInUrl),
    portfolioUrl: optional(application.portfolioUrl),
    teamPreference: optional(application.teamPreference),
    teamName: optional(application.teamName),
    status: application.status,
    mediaConsent: details?.mediaConsent ?? application.mediaConsent,
    submittedAt: (
      application.submittedAt ?? application.createdAt
    ).toISOString(),
    decidedAt: instantString(application.decidedAt),
    rejectionReason: optional(application.rejectionReason),
    documentFullName: optional(details?.fullName),
    phone: optional(details?.phone),
    dateOfBirth,
    shirtSize: optional(details?.shirtSize),
    dietaryRestrictions: optional(details?.dietaryRestrictions),
    accessibilityNeeds: optional(details?.accessibilityNeeds),
    emergencyContactName: optional(details?.emergencyContactName),
    emergencyContactPhone: optional(details?.emergencyContactPhone),
    attendanceCompletedAt: instantString(details?.completedAt),
    checkedInAt: instantString(details?.checkedInAt),
    nationalIdProvided: Boolean(details?.nationalIdNumber),
  };
};

const toCandidates = async (
  records: ReadonlyArray<CandidateRecord>,
): Promise<ReadonlyArray<Candidate>> => {
  const clerk = await clerkClient();
  const clerkUserIds = [...new Set(records.map((record) => record.clerkUserId))];
  const clerkPictures = new Map<string, string>();

  await Promise.all(
    clerkUserIds.map(async (clerkUserId) => {
      try {
        const user = await clerk.users.getUser(clerkUserId);
        if (user.hasImage) clerkPictures.set(clerkUserId, user.imageUrl);
      } catch {
        // A missing Clerk user should not prevent admins from reviewing applications.
      }
    }),
  );

  return records.map((record) =>
    toCandidate(record, clerkPictures.get(record.clerkUserId)),
  );
};

const candidateRecordById = async (
  applicationId: string,
): Promise<CandidateRecord | undefined> => {
  const [record] = await db
    .select({
      application: applications,
      details: acceptanceDetails,
      clerkUserId: participants.clerkUserId,
    })
    .from(applications)
    .innerJoin(participants, eq(participants.id, applications.participantId))
    .leftJoin(
      acceptanceDetails,
      eq(acceptanceDetails.applicationId, applications.id),
    )
    .where(eq(applications.id, applicationId))
    .limit(1);
  return record;
};

type MutableCandidateCounts = {
  -readonly [Key in keyof CandidateCounts]: number;
};

const emptyCounts = (): MutableCandidateCounts => ({
  all: 0,
  draft: 0,
  submitted: 0,
  under_review: 0,
  waitlisted: 0,
  accepted: 0,
  rejected: 0,
  withdrawn: 0,
});

export interface CandidateListInput {
  readonly page?: number;
  readonly query?: string;
  readonly status?: CandidateStatus;
}

export const listCandidates = async (
  input: CandidateListInput,
): Promise<CandidatePage> => {
  const requestedPage = Math.max(1, Math.floor(input.page ?? 1));
  const search = input.query?.trim();
  let searchCondition: SQL | undefined;
  if (search) {
    searchCondition = or(
      ilike(applications.firstName, `%${search}%`),
      ilike(applications.lastName, `%${search}%`),
      ilike(applications.email, `%${search}%`),
      ilike(applications.organization, `%${search}%`),
    );
  }
  let statusCondition: SQL | undefined;
  if (input.status) {
    statusCondition = eq(applications.status, input.status);
  }
  const whereCondition = and(searchCondition, statusCondition);

  const [totalResult, statusResults] = await Promise.all([
    db.select({ value: count() }).from(applications).where(whereCondition),
    db
      .select({ status: applications.status, value: count() })
      .from(applications)
      .groupBy(applications.status),
  ]);

  const total = totalResult[0]?.value ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const records = await db
    .select({
      application: applications,
      details: acceptanceDetails,
      clerkUserId: participants.clerkUserId,
    })
    .from(applications)
    .innerJoin(participants, eq(participants.id, applications.participantId))
    .leftJoin(
      acceptanceDetails,
      eq(acceptanceDetails.applicationId, applications.id),
    )
    .where(whereCondition)
    .orderBy(desc(applications.createdAt))
    .limit(pageSize)
    .offset((currentPage - 1) * pageSize);

  const counts = emptyCounts();
  for (const result of statusResults) {
    counts[result.status] = result.value;
    counts.all += result.value;
  }

  const candidates = await toCandidates(records);

  return {
    candidates,
    counts,
    page: currentPage,
    pageSize,
    total,
    totalPages,
  };
};

export interface CandidateDecisionInput {
  readonly applicationId: string;
  readonly decision: ApplicationDecision;
  readonly message?: string;
  readonly notify: boolean;
  readonly decidedByClerkUserId: string;
}

export interface CandidateDecisionResult {
  readonly candidate: Candidate;
  readonly emailStatus: "not_requested" | "sent" | "failed";
  readonly emailError?: string;
}

const sendDecisionEmail = async (
  candidate: Candidate,
  decision: CandidateDecisionInput["decision"],
  message: string | undefined,
): Promise<
  { readonly ok: true } | { readonly ok: false; readonly error: string }
> => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "Resend is not configured" };
  }
  if (!candidate.email) {
    return { ok: false, error: "Candidate does not have an email address" };
  }

  const email = buildDecisionEmail({
    decision,
    firstName: candidate.firstName,
    message,
  });
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      "idempotency-key": `application-decision/${candidate.id}/${decision}`,
    },
    body: JSON.stringify({
      from: decisionEmailFrom,
      to: [candidate.email],
      reply_to: decisionEmailReplyTo,
      subject: email.subject,
      text: email.text,
      html: email.html,
    }),
  });
  if (!response.ok) {
    const error = (await response.json().catch(() => undefined)) as
      | { readonly message?: string }
      | undefined;
    return {
      ok: false,
      error: error?.message ?? `Resend returned HTTP ${response.status}`,
    };
  }
  return { ok: true };
};

export const decideCandidate = async (
  input: CandidateDecisionInput,
): Promise<CandidateDecisionResult> => {
  const message = input.message?.trim() || undefined;
  if (message && message.length > 2_000) {
    throw new HttpError(
      422,
      "MESSAGE_TOO_LONG",
      "The optional message must be 2,000 characters or fewer",
    );
  }

  const [updatedApplication] = await db
    .update(applications)
    .set({
      status: input.decision,
      decidedAt: new Date(),
      decidedByClerkUserId: input.decidedByClerkUserId,
      rejectionReason: input.decision === "rejected" ? message : null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(applications.id, input.applicationId),
        inArray(applications.status, [...reviewableCandidateStatuses]),
      ),
    )
    .returning();

  const record = await candidateRecordById(input.applicationId);
  if (!record) {
    throw new HttpError(404, "APPLICATION_NOT_FOUND", "Application not found");
  }
  if (!updatedApplication) {
    const isSameDecision = record.application.status === input.decision;
    const isSameReviewer =
      record.application.decidedByClerkUserId === input.decidedByClerkUserId;
    if (!isSameDecision || !isSameReviewer) {
      throw new HttpError(
        409,
        "APPLICATION_NOT_REVIEWABLE",
        "This application has already been decided or is not ready for review",
      );
    }
  }
  const [candidate] = await toCandidates([record]);
  if (!candidate) throw new Error("Candidate conversion returned no result");

  if (!input.notify) {
    return { candidate, emailStatus: "not_requested" };
  }

  try {
    const email = await sendDecisionEmail(candidate, input.decision, message);
    if (email.ok) return { candidate, emailStatus: "sent" };
    return { candidate, emailStatus: "failed", emailError: email.error };
  } catch (error) {
    console.error("Decision email failed", error);
    return {
      candidate,
      emailStatus: "failed",
      emailError: "The decision was saved, but the email could not be sent",
    };
  }
};

export const parseCandidateStatus = (
  value: string | undefined,
): CandidateStatus | undefined => {
  if (!value) return undefined;
  return candidateStatuses.find((candidate) => candidate === value);
};
