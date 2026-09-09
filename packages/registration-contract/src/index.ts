import { DateTime, Option, Schema, SchemaGetter } from "effect";

const nonBlank = (maximum: number) =>
  Schema.Trim.pipe(
    Schema.check(Schema.isMinLength(1), Schema.isMaxLength(maximum)),
  );

const optionalText = (maximum: number) => Schema.optional(nonBlank(maximum));

const normalizedString = (normalize: (value: string) => string) =>
  Schema.String.pipe(
    Schema.decode({
      decode: SchemaGetter.transform(normalize),
      encode: SchemaGetter.transform((value) => value),
    }),
  );

const url = Schema.String.pipe(
  Schema.check(
    Schema.isPattern(/^https?:\/\/[^\s]+$/i, {
      message: "Must be an http or https URL",
    }),
    Schema.isMaxLength(2_048),
  ),
);

export const RegistrationStatus = Schema.Literals([
  "draft",
  "submitted",
  "under_review",
  "waitlisted",
  "accepted",
  "rejected",
  "withdrawn",
]);

export const ParticipationMode = Schema.Literals(["in_person", "remote"]);
export const ExperienceLevel = Schema.Literals([
  "beginner",
  "intermediate",
  "advanced",
]);
export const TeamPreference = Schema.Literals([
  "have_team",
  "looking_for_team",
  "solo",
]);
export const ShirtSize = Schema.Literals([
  "xs",
  "s",
  "m",
  "l",
  "xl",
  "2xl",
  "3xl",
  "prefer_not_to_say",
]);

export const ApplicationInput = Schema.Struct({
  firstName: nonBlank(100),
  lastName: nonBlank(100),
  email: normalizedString((value) => value.trim().toLowerCase()).pipe(
    Schema.check(
      Schema.isPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
        message: "Must be a valid email address",
      }),
      Schema.isMaxLength(320),
    ),
  ),
  pronouns: optionalText(50),
  countryCode: normalizedString((value) => value.trim().toUpperCase()).pipe(
    Schema.check(
      Schema.isPattern(/^[A-Z]{2}$/, {
        message: "Must be a two-letter ISO country code",
      }),
    ),
  ),
  city: nonBlank(120),
  participationMode: ParticipationMode,
  organization: optionalText(200),
  role: optionalText(120),
  fieldOfStudy: optionalText(160),
  graduationYear: Schema.optional(
    Schema.Int.pipe(
      Schema.check(Schema.isBetween({ minimum: 1950, maximum: 2100 })),
    ),
  ),
  experienceLevel: ExperienceLevel,
  skills: Schema.Array(nonBlank(60)).pipe(
    Schema.check(Schema.isMinLength(1), Schema.isMaxLength(30)),
  ),
  bio: nonBlank(2_000),
  githubUrl: Schema.optional(url),
  linkedInUrl: Schema.optional(url),
  portfolioUrl: Schema.optional(url),
  teamPreference: TeamPreference,
  teamName: optionalText(120),
  codeOfConductAccepted: Schema.Literal(true),
  privacyPolicyAccepted: Schema.Literal(true),
  mediaConsent: Schema.optional(Schema.Boolean),
});

export type ApplicationInput = typeof ApplicationInput.Type;

export const AcceptedDetailsInput = Schema.Struct({
  phone: nonBlank(32),
  dateOfBirth: Schema.String.pipe(
    Schema.check(
      Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Must use YYYY-MM-DD format",
      }),
    ),
  ),
  nationalIdNumber: nonBlank(100),
  shirtSize: Schema.optional(ShirtSize),
  dietaryRestrictions: optionalText(1_000),
  accessibilityNeeds: optionalText(1_000),
  emergencyContactName: nonBlank(200),
  emergencyContactPhone: nonBlank(32),
  mediaConsent: Schema.optional(Schema.Boolean),
});

export type AcceptedDetailsInput = typeof AcceptedDetailsInput.Type;

export const initialRequiredFields = [
  "firstName",
  "lastName",
  "email",
  "countryCode",
  "city",
  "participationMode",
  "experienceLevel",
  "skills",
  "bio",
  "teamPreference",
  "codeOfConductAccepted",
  "privacyPolicyAccepted",
] as const;

export const acceptedRequiredFields = [
  "phone",
  "dateOfBirth",
  "nationalIdNumber",
  "emergencyContactName",
  "emergencyContactPhone",
] as const;

export const RequirementSchema = Schema.Struct({
  field: Schema.String,
  reason: Schema.String,
});

export type Requirement = typeof RequirementSchema.Type;

export const applicationSemanticRequirements = (
  input: ApplicationInput,
): ReadonlyArray<Requirement> => {
  if (input.teamPreference === "have_team" && !input.teamName) {
    return [
      { field: "teamName", reason: "Required when you already have a team" },
    ];
  }
  return [];
};

export const acceptedDetailsSemanticRequirements = (
  input: AcceptedDetailsInput,
  participationMode: typeof ParticipationMode.Type,
): ReadonlyArray<Requirement> => {
  const requirements: Array<Requirement> = [];
  if (participationMode === "in_person" && !input.shirtSize) {
    requirements.push({
      field: "shirtSize",
      reason: "Required for in-person participants",
    });
  }

  const birthDate = DateTime.make(`${input.dateOfBirth}T00:00:00.000Z`);
  if (
    Option.isNone(birthDate) ||
    DateTime.formatIsoDateUtc(birthDate.value) !== input.dateOfBirth ||
    !DateTime.isPastUnsafe(birthDate.value)
  ) {
    requirements.push({
      field: "dateOfBirth",
      reason: "Must be a valid date in the past",
    });
  }
  return requirements;
};

export const RegistrationViewSchema = Schema.Struct({
  id: Schema.String,
  status: RegistrationStatus,
  firstName: Schema.String,
  lastName: Schema.String,
  email: Schema.String,
  phone: Schema.optional(Schema.String),
  dateOfBirth: Schema.optional(Schema.String),
  pronouns: Schema.optional(Schema.String),
  countryCode: Schema.optional(Schema.String),
  city: Schema.optional(Schema.String),
  participationMode: ParticipationMode,
  organization: Schema.optional(Schema.String),
  role: Schema.optional(Schema.String),
  fieldOfStudy: Schema.optional(Schema.String),
  graduationYear: Schema.optional(Schema.Number),
  experienceLevel: Schema.optional(ExperienceLevel),
  skills: Schema.Array(Schema.String),
  bio: Schema.optional(Schema.String),
  githubUrl: Schema.optional(Schema.String),
  linkedInUrl: Schema.optional(Schema.String),
  portfolioUrl: Schema.optional(Schema.String),
  teamPreference: Schema.optional(TeamPreference),
  teamName: Schema.optional(Schema.String),
  shirtSize: Schema.optional(ShirtSize),
  nationalIdProvided: Schema.Boolean,
  dietaryRestrictions: Schema.optional(Schema.String),
  accessibilityNeeds: Schema.optional(Schema.String),
  emergencyContactName: Schema.optional(Schema.String),
  emergencyContactPhone: Schema.optional(Schema.String),
  mediaConsent: Schema.Boolean,
  rejectionReason: Schema.optional(Schema.String),
  submittedAt: Schema.String,
  acceptanceDetailsCompletedAt: Schema.optional(Schema.String),
  createdAt: Schema.String,
  updatedAt: Schema.String,
});

export type RegistrationView = typeof RegistrationViewSchema.Type;

export const RegistrationRequirementsSchema = Schema.Struct({
  stage: Schema.Literals(["review", "rejected", "accepted", "complete"]),
  canSubmitNewApplication: Schema.Boolean,
  canSubmitAcceptedDetails: Schema.Boolean,
  missing: Schema.Array(RequirementSchema),
  rejectionReason: Schema.optional(Schema.String),
});

export type RegistrationRequirements =
  typeof RegistrationRequirementsSchema.Type;

export interface ApiSuccess<A> {
  readonly version: 1;
  readonly ok: true;
  readonly requestId: string;
  readonly data: A;
}

export const ApiFailureSchema = Schema.Struct({
  version: Schema.Literal(1),
  ok: Schema.Literal(false),
  requestId: Schema.String,
  error: Schema.Struct({
    code: Schema.String,
    message: Schema.String,
    retryable: Schema.Boolean,
    details: Schema.optional(Schema.Unknown),
  }),
});

export type ApiFailure = typeof ApiFailureSchema.Type;

export type ApiResponse<A> = ApiSuccess<A> | ApiFailure;

export const RegistrationResultSchema = Schema.Struct({
  registration: RegistrationViewSchema,
  requirements: RegistrationRequirementsSchema,
});

export type RegistrationResult = typeof RegistrationResultSchema.Type;

export const CreatedRegistrationSchema = RegistrationResultSchema;

export type CreatedRegistration = typeof CreatedRegistrationSchema.Type;

export const ApiSuccessSchema = <S extends Schema.Constraint>(data: S) =>
  Schema.Struct({
    version: Schema.Literal(1),
    ok: Schema.Literal(true),
    requestId: Schema.String,
    data,
  });
