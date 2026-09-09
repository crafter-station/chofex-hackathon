import { db } from "@repo/db";
import {
  and,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  type SQL,
} from "@repo/db/orm";
import { acceptanceDetails, applications } from "@repo/db/schema";

import { HttpError } from "@/lib/registration/http";
import {
  type Candidate,
  type CandidateCounts,
  type CandidatePage,
  candidateStatuses,
  type CandidateStatus,
} from "./types";

const pageSize = 10;
const reviewableStatuses: ReadonlyArray<CandidateStatus> = [
  "submitted",
  "under_review",
  "waitlisted",
];

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
};

const toCandidate = ({ application, details }: CandidateRecord): Candidate => {
  let dateOfBirth: string | undefined;
  if (details?.dateOfBirth) dateOfBirth = dateString(details.dateOfBirth);

  return {
    id: application.id,
    participantId: application.participantId,
    firstName: application.firstName ?? "Unknown",
    lastName: application.lastName ?? "participant",
    email: application.email ?? "",
    pronouns: optional(application.pronouns),
    countryCode: optional(application.countryCode),
    city: optional(application.city),
    participationMode: optional(application.participationMode),
    organization: optional(application.organization),
    role: optional(application.role),
    fieldOfStudy: optional(application.fieldOfStudy),
    graduationYear: optional(application.graduationYear),
    experienceLevel: optional(application.experienceLevel),
    skills: application.skills ?? [],
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

const candidateRecordById = async (
  applicationId: string,
): Promise<CandidateRecord | undefined> => {
  const [record] = await db
    .select({ application: applications, details: acceptanceDetails })
    .from(applications)
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
    .select({ application: applications, details: acceptanceDetails })
    .from(applications)
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

  return {
    candidates: records.map(toCandidate),
    counts,
    page: currentPage,
    pageSize,
    total,
    totalPages,
  };
};

export interface CandidateDecisionInput {
  readonly applicationId: string;
  readonly decision: "accepted" | "rejected";
  readonly message?: string;
  readonly notify: boolean;
  readonly decidedByClerkUserId: string;
}

export interface CandidateDecisionResult {
  readonly candidate: Candidate;
  readonly emailStatus: "not_requested" | "sent" | "failed";
  readonly emailError?: string;
}

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const emailCopy = (
  decision: CandidateDecisionInput["decision"],
): {
  readonly subject: string;
  readonly heading: string;
  readonly body: string;
} => {
  if (decision === "accepted") {
    return {
      subject: "You’re in — welcome to Chofex Hackathon",
      heading: "Your application was accepted",
      body: "We’re excited to have you join us in Lima. Sign in to complete your attendance details.",
    };
  }
  return {
    subject: "An update on your Chofex Hackathon application",
    heading: "Your application has been reviewed",
    body: "We’re sorry that we can’t offer you a place at this Chofex Hackathon.",
  };
};

const sendDecisionEmail = async (
  candidate: Candidate,
  decision: CandidateDecisionInput["decision"],
  message: string | undefined,
): Promise<
  { readonly ok: true } | { readonly ok: false; readonly error: string }
> => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    return { ok: false, error: "Resend is not configured" };
  }
  if (!candidate.email) {
    return { ok: false, error: "Candidate does not have an email address" };
  }

  const copy = emailCopy(decision);
  let customMessage = "";
  if (message) {
    customMessage = `<div style="margin:24px 0;padding:16px 18px;background:#f5f5f4;border-radius:12px;white-space:pre-wrap">${escapeHtml(message)}</div>`;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      "idempotency-key": `application-decision/${candidate.id}/${decision}`,
    },
    body: JSON.stringify({
      from,
      to: [candidate.email],
      reply_to: process.env.RESEND_REPLY_TO,
      subject: copy.subject,
      text: [
        `Hi ${candidate.firstName},`,
        "",
        copy.body,
        message ? `\n${message}` : "",
        "",
        "— The Chofex team",
      ].join("\n"),
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#171717;max-width:560px;margin:0 auto;padding:32px"><p>Hi ${escapeHtml(candidate.firstName)},</p><h1 style="font-size:24px;line-height:1.2">${copy.heading}</h1><p>${copy.body}</p>${customMessage}<p>— The Chofex team</p></div>`,
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
        inArray(applications.status, [...reviewableStatuses]),
      ),
    )
    .returning();

  const record = await candidateRecordById(input.applicationId);
  if (!record) throw new Error("Updated application could not be loaded");
  if (!updatedApplication && record.application.status !== input.decision) {
    throw new HttpError(
      409,
      "APPLICATION_NOT_REVIEWABLE",
      "This application has already been decided or is not ready for review",
    );
  }
  const candidate = toCandidate(record);

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
