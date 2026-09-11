import { db } from "@chofex/db";
import { desc, eq } from "@chofex/db/orm";
import {
  acceptanceDetails,
  applications,
  participants,
} from "@chofex/db/schema";
import {
  AcceptedDetailsInput,
  ApplicationInput,
  acceptedDetailsSemanticRequirements,
  applicationRequirementsFor,
  applicationSemanticRequirements,
  type CreatedRegistration,
  hackathonCountryCode,
  hackathonParticipationMode,
  type RegistrationResult,
  type RegistrationView,
} from "@chofex/registration-contract";
import { DateTime, Predicate, Schema } from "effect";

import { HttpError } from "./http";
import { confirmedPictureUrl } from "./pictures";
import { encryptSensitiveValue } from "./sensitive";

type ApplicationRecord = typeof applications.$inferSelect;
type AcceptanceDetailsRecord = typeof acceptanceDetails.$inferSelect;

interface RegistrationIdentity {
  readonly clerkUserId: string;
  readonly email: string;
  readonly clerkPictureUrl?: string;
}

const optional = <A>(value: A | null | undefined): A | undefined =>
  value ?? undefined;
const instantString = (value: Date): string => value.toISOString();
const dateString = (value: Date | string): string => {
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
};

const optionalDateString = (
  value: Date | string | null | undefined,
): string | undefined => {
  if (!value) return undefined;
  return dateString(value);
};

const optionalInstantString = (
  value: Date | null | undefined,
): string | undefined => {
  if (!value) return undefined;
  return instantString(value);
};

const parseInput = <S extends Schema.ConstraintDecoder<unknown>>(
  schema: S,
  input: unknown,
): S["Type"] => {
  try {
    return Schema.decodeUnknownSync(schema, { onExcessProperty: "error" })(
      input,
    );
  } catch (error) {
    throw new HttpError(
      422,
      "VALIDATION_ERROR",
      "Input validation failed",
      false,
      {
        issues: String(error),
      },
    );
  }
};

const assertNoRequirements = (
  requirements: ReadonlyArray<{
    readonly field: string;
    readonly reason: string;
  }>,
): void => {
  if (requirements.length > 0) {
    throw new HttpError(
      422,
      "VALIDATION_ERROR",
      "Input validation failed",
      false,
      { issues: requirements },
    );
  }
};

const isUniqueViolation = (error: unknown): boolean => {
  if (Predicate.hasProperty(error, "code") && error.code === "23505") {
    return true;
  }
  if (Predicate.hasProperty(error, "cause")) {
    return isUniqueViolation(error.cause);
  }
  return false;
};

const encryptNationalId = (value: string): string => {
  const encryptionKey = process.env.PARTICIPANT_DATA_ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new HttpError(
      500,
      "ENCRYPTION_NOT_CONFIGURED",
      "Sensitive participant data encryption is not configured",
    );
  }
  try {
    return encryptSensitiveValue(value, encryptionKey);
  } catch {
    throw new HttpError(
      500,
      "ENCRYPTION_NOT_CONFIGURED",
      "Sensitive participant data encryption is not configured correctly",
    );
  }
};

const toView = (
  application: ApplicationRecord,
  details?: AcceptanceDetailsRecord,
): RegistrationView => ({
  id: application.id,
  status: application.status,
  firstName: application.firstName ?? "",
  lastName: application.lastName ?? "",
  email: application.email ?? "",
  fullName: optional(details?.fullName),
  phone: optional(details?.phone),
  dateOfBirth: optionalDateString(details?.dateOfBirth),
  pronouns: optional(application.pronouns),
  countryCode: optional(application.countryCode),
  city: optional(application.city),
  participationMode: application.participationMode ?? "in_person",
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
  shirtSize: optional(details?.shirtSize),
  nationalIdProvided: Boolean(details?.nationalIdNumber),
  dietaryRestrictions: optional(details?.dietaryRestrictions),
  accessibilityNeeds: optional(details?.accessibilityNeeds),
  emergencyContactName: optional(details?.emergencyContactName),
  emergencyContactPhone: optional(details?.emergencyContactPhone),
  mediaConsent: details?.mediaConsent ?? application.mediaConsent,
  pictureSource: optional(application.pictureSource),
  pictureUrl: optional(application.pictureUrl),
  rejectionReason: optional(application.rejectionReason),
  submittedAt: instantString(application.submittedAt ?? application.createdAt),
  acceptanceDetailsCompletedAt: optionalInstantString(details?.completedAt),
  createdAt: instantString(application.createdAt),
  updatedAt: instantString(details?.updatedAt ?? application.updatedAt),
});

const resultFor = (
  application: ApplicationRecord,
  details?: AcceptanceDetailsRecord,
): RegistrationResult => {
  const registration = toView(application, details);
  return {
    registration,
    requirements: applicationRequirementsFor(registration),
  };
};

const participantFor = async (clerkUserId: string): Promise<string> => {
  const [existing] = await db
    .select({ id: participants.id })
    .from(participants)
    .where(eq(participants.clerkUserId, clerkUserId))
    .limit(1);
  if (existing) return existing.id;

  const [created] = await db
    .insert(participants)
    .values({ clerkUserId })
    .onConflictDoNothing()
    .returning({ id: participants.id });
  if (created) return created.id;

  const [concurrent] = await db
    .select({ id: participants.id })
    .from(participants)
    .where(eq(participants.clerkUserId, clerkUserId))
    .limit(1);
  if (!concurrent) throw new Error("Participant creation returned no row");
  return concurrent.id;
};

export const createRegistration = async (
  identity: RegistrationIdentity,
  rawInput: unknown,
): Promise<CreatedRegistration> => {
  const input = parseInput(ApplicationInput, rawInput);
  assertNoRequirements(applicationSemanticRequirements(input));
  const participantId = await participantFor(identity.clerkUserId);
  const now = new Date();

  try {
    const [application] = await db
      .insert(applications)
      .values({
        participantId,
        status: "submitted",
        firstName: input.firstName,
        lastName: input.lastName,
        email: identity.email,
        pronouns: optional(input.pronouns),
        countryCode: hackathonCountryCode,
        city: input.city,
        participationMode: hackathonParticipationMode,
        organization: optional(input.organization),
        role: optional(input.role),
        fieldOfStudy: optional(input.fieldOfStudy),
        graduationYear: optional(input.graduationYear),
        shippedProject: input.shippedProject,
        hackathonProject: input.hackathonProject,
        bio: input.bio,
        githubUrl: optional(input.githubUrl),
        linkedInUrl: optional(input.linkedInUrl),
        portfolioUrl: optional(input.portfolioUrl),
        teamPreference: input.teamPreference,
        teamName: optional(input.teamName),
        codeOfConductAcceptedAt: now,
        privacyPolicyAcceptedAt: now,
        mediaConsent: input.mediaConsent ?? false,
        submittedAt: now,
      })
      .returning();
    if (!application) throw new Error("Application insert returned no row");
    return resultFor(application);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new HttpError(
        409,
        "ACTIVE_APPLICATION_EXISTS",
        "You already have an active hackathon application",
      );
    }
    throw error;
  }
};

const latestApplicationFor = async (
  clerkUserId: string,
): Promise<{
  application: ApplicationRecord;
  details?: AcceptanceDetailsRecord;
}> => {
  const [record] = await db
    .select({ application: applications, details: acceptanceDetails })
    .from(participants)
    .innerJoin(applications, eq(applications.participantId, participants.id))
    .leftJoin(
      acceptanceDetails,
      eq(acceptanceDetails.applicationId, applications.id),
    )
    .where(eq(participants.clerkUserId, clerkUserId))
    .orderBy(desc(applications.createdAt))
    .limit(1);
  if (!record) {
    throw new HttpError(
      404,
      "REGISTRATION_NOT_FOUND",
      "Registration not found",
    );
  }
  return {
    application: record.application,
    details: record.details ?? undefined,
  };
};

export const getRegistration = async (
  clerkUserId: string,
): Promise<RegistrationResult> => {
  const current = await latestApplicationFor(clerkUserId);
  return resultFor(current.application, current.details);
};

export const submitAcceptedDetails = async (
  identity: RegistrationIdentity,
  rawInput: unknown,
): Promise<RegistrationResult> => {
  const input = parseInput(AcceptedDetailsInput, rawInput);
  const current = await latestApplicationFor(identity.clerkUserId);
  if (current.application.status !== "accepted") {
    throw new HttpError(
      409,
      "INVALID_APPLICATION_STATE",
      "Acceptance details can only be submitted after acceptance",
      false,
      { currentStatus: current.application.status },
    );
  }
  if (!current.application.participationMode) {
    throw new HttpError(
      409,
      "INCOMPLETE_APPLICATION",
      "Participation mode is missing",
    );
  }
  assertNoRequirements(
    acceptedDetailsSemanticRequirements(
      input,
      current.application.participationMode,
    ),
  );

  const pictureUrl = confirmedPictureUrl(input.pictureSource, {
    clerkPictureUrl: identity.clerkPictureUrl,
    githubUrl: current.application.githubUrl,
    uploadedPictureUrl: current.application.customPictureUrl,
  });
  const applicationUpdate = db
    .update(applications)
    .set({
      pictureSource: input.pictureSource,
      pictureUrl,
      updatedAt: new Date(),
    })
    .where(eq(applications.id, current.application.id))
    .returning();

  const values = {
    fullName: input.fullName,
    phone: input.phone,
    dateOfBirth: DateTime.toDateUtc(
      DateTime.makeUnsafe(`${input.dateOfBirth}T00:00:00.000Z`),
    ),
    nationalIdNumber: encryptNationalId(input.nationalIdNumber),
    shirtSize: optional(input.shirtSize),
    dietaryRestrictions: optional(input.dietaryRestrictions),
    accessibilityNeeds: optional(input.accessibilityNeeds),
    emergencyContactName: input.emergencyContactName,
    emergencyContactPhone: input.emergencyContactPhone,
    mediaConsent: input.mediaConsent ?? current.application.mediaConsent,
    completedAt: new Date(),
  };
  const detailsUpdate = db
    .insert(acceptanceDetails)
    .values({ applicationId: current.application.id, ...values })
    .onConflictDoUpdate({
      target: acceptanceDetails.applicationId,
      set: values,
    })
    .returning();
  const [applicationRows, detailsRows] = await db.batch([
    applicationUpdate,
    detailsUpdate,
  ]);
  const [application] = applicationRows;
  const [details] = detailsRows;
  if (!application)
    throw new Error("Application picture update returned no row");
  if (!details) throw new Error("Acceptance details update returned no row");
  return resultFor(application, details);
};
