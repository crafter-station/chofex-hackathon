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

const url = normalizedString((value) => {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}).pipe(
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
export const hackathonCountryCode = "PE" as const;
export const hackathonParticipationMode = "in_person" as const;
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

export const PictureSource = Schema.Literals(["clerk", "github", "upload"]);

export const PictureContentType = Schema.Literals([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export type PictureContentType = typeof PictureContentType.Type;
export const maximumPictureBytes = 5 * 1024 * 1024;

const bytesStartWith = (
  bytes: Uint8Array,
  signature: ReadonlyArray<number>,
): boolean => signature.every((value, index) => bytes[index] === value);

export const detectPictureContentType = (
  bytes: Uint8Array,
): PictureContentType | undefined => {
  if (bytesStartWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (bytesStartWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }
  const isWebp =
    bytesStartWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    bytesStartWith(bytes.slice(8), [0x57, 0x45, 0x42, 0x50]);
  if (isWebp) return "image/webp";
};

export const applicationInputFields = {
  firstName: nonBlank(100),
  lastName: nonBlank(100),
  pronouns: optionalText(50),
  city: nonBlank(120),
  organization: optionalText(200),
  role: optionalText(120),
  fieldOfStudy: optionalText(160),
  graduationYear: Schema.optional(
    Schema.Int.pipe(
      Schema.check(Schema.isBetween({ minimum: 1950, maximum: 2100 })),
    ),
  ),
  shippedProject: nonBlank(2_000),
  hackathonProject: nonBlank(2_000),
  bio: nonBlank(2_000),
  githubUrl: Schema.optional(url),
  linkedInUrl: Schema.optional(url),
  portfolioUrl: Schema.optional(url),
  teamPreference: TeamPreference,
  teamName: optionalText(120),
  codeOfConductAccepted: Schema.Literal(true),
  privacyPolicyAccepted: Schema.Literal(true),
  mediaConsent: Schema.optional(Schema.Boolean),
};

export const applicationInputFieldNames = Object.keys(applicationInputFields);

export const ApplicationInput = Schema.Struct(applicationInputFields);

export type ApplicationInput = typeof ApplicationInput.Type;

export const acceptedDetailsInputFields = {
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
  pictureSource: PictureSource,
};

export const acceptedDetailsInputFieldNames = Object.keys(
  acceptedDetailsInputFields,
);

export const AcceptedDetailsInput = Schema.Struct(acceptedDetailsInputFields);

export type AcceptedDetailsInput = typeof AcceptedDetailsInput.Type;

export const initialRequiredFields = [
  "firstName",
  "lastName",
  "city",
  "shippedProject",
  "hackathonProject",
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
  "pictureSource",
] as const;

export const RequirementSchema = Schema.Struct({
  field: Schema.String,
  reason: Schema.String,
});

export type Requirement = typeof RequirementSchema.Type;

const inPersonShirtSizeRequirement: Requirement = {
  field: "shirtSize",
  reason: "Required for in-person participants",
};

const addShirtSizeRequirement = (
  requirements: Array<Requirement>,
  participationMode: typeof ParticipationMode.Type,
  shirtSize: typeof ShirtSize.Type | undefined,
): void => {
  if (participationMode === "in_person" && !shirtSize) {
    requirements.push(inPersonShirtSizeRequirement);
  }
};

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

export const dateOfBirthRequirement = (
  dateOfBirth: string,
): Requirement | undefined => {
  const birthDate = DateTime.make(`${dateOfBirth}T00:00:00.000Z`);
  if (
    Option.isNone(birthDate) ||
    DateTime.formatIsoDateUtc(birthDate.value) !== dateOfBirth ||
    !DateTime.isPastUnsafe(birthDate.value)
  ) {
    return {
      field: "dateOfBirth",
      reason: "Must be a valid date in the past",
    };
  }
};

export const acceptedDetailsSemanticRequirements = (
  input: AcceptedDetailsInput,
  participationMode: typeof ParticipationMode.Type,
): ReadonlyArray<Requirement> => {
  const requirements: Array<Requirement> = [];
  addShirtSizeRequirement(requirements, participationMode, input.shirtSize);

  const invalidDateOfBirth = dateOfBirthRequirement(input.dateOfBirth);
  if (invalidDateOfBirth) requirements.push(invalidDateOfBirth);
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
  shippedProject: Schema.optional(Schema.String),
  hackathonProject: Schema.optional(Schema.String),
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
  pictureSource: Schema.optional(PictureSource),
  pictureUrl: Schema.optional(Schema.String),
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

const addMissingRequirement = (
  missing: Array<Requirement>,
  field: string,
  reason = "Required after acceptance",
): void => {
  missing.push({ field, reason });
};

const acceptedDetailsRequirementsFor = (
  registration: RegistrationView,
): ReadonlyArray<Requirement> => {
  const missing: Array<Requirement> = [];

  if (!registration.phone) addMissingRequirement(missing, "phone");
  if (!registration.dateOfBirth) {
    addMissingRequirement(missing, "dateOfBirth");
  }
  if (!registration.nationalIdProvided) {
    addMissingRequirement(missing, "nationalIdNumber");
  }
  if (!registration.emergencyContactName) {
    addMissingRequirement(missing, "emergencyContactName");
  }
  if (!registration.emergencyContactPhone) {
    addMissingRequirement(missing, "emergencyContactPhone");
  }
  if (!registration.pictureUrl) {
    addMissingRequirement(
      missing,
      "pictureSource",
      "Confirm a Clerk, GitHub, or uploaded picture",
    );
  }
  addShirtSizeRequirement(
    missing,
    registration.participationMode,
    registration.shirtSize,
  );

  return missing;
};

export const applicationRequirementsFor = (
  registration: RegistrationView,
): RegistrationRequirements => {
  switch (registration.status) {
    case "rejected":
      return {
        stage: "rejected",
        canSubmitNewApplication: true,
        canSubmitAcceptedDetails: false,
        missing: [],
        rejectionReason: registration.rejectionReason,
      };
    case "withdrawn":
      return {
        stage: "review",
        canSubmitNewApplication: true,
        canSubmitAcceptedDetails: false,
        missing: [],
      };
    case "accepted": {
      const missing = acceptedDetailsRequirementsFor(registration);
      const isComplete =
        Boolean(registration.acceptanceDetailsCompletedAt) &&
        missing.length === 0;
      return {
        stage: isComplete ? "complete" : "accepted",
        canSubmitNewApplication: false,
        canSubmitAcceptedDetails: true,
        missing,
      };
    }
    case "draft":
    case "submitted":
    case "under_review":
    case "waitlisted":
      return {
        stage: "review",
        canSubmitNewApplication: false,
        canSubmitAcceptedDetails: false,
        missing: [],
      };
  }
};

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

export const CurrentUserSchema = Schema.Struct({
  authenticated: Schema.Literal(true),
  userId: Schema.String,
  email: Schema.String,
  tokenType: Schema.Literals(["oauth_token", "session_token"]),
  clerkPictureUrl: Schema.optional(Schema.String),
});

export type CurrentUser = typeof CurrentUserSchema.Type;

export const PictureUploadSchema = Schema.Struct({
  url: Schema.String,
  contentType: PictureContentType,
  size: Schema.Number,
});

export type PictureUpload = typeof PictureUploadSchema.Type;

export const PictureUploadRequestSchema = Schema.Struct({
  contentType: PictureContentType,
  size: Schema.Number.pipe(
    Schema.check(Schema.isBetween({ minimum: 1, maximum: maximumPictureBytes })),
  ),
});

export type PictureUploadRequest = typeof PictureUploadRequestSchema.Type;

export const PictureUploadGrantSchema = Schema.Struct({
  pathname: Schema.String,
  clientToken: Schema.String,
});

export type PictureUploadGrant = typeof PictureUploadGrantSchema.Type;

export const PictureUploadCompletionSchema = Schema.Struct({
  pathname: Schema.String,
  url: Schema.String,
});

export type PictureUploadCompletion = typeof PictureUploadCompletionSchema.Type;

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
