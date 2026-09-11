export const candidateStatuses = [
  "draft",
  "submitted",
  "under_review",
  "waitlisted",
  "accepted",
  "rejected",
  "withdrawn",
] as const;

export type CandidateStatus = (typeof candidateStatuses)[number];

export const candidateFilters = [...candidateStatuses, "reattempt"] as const;

export type CandidateFilter = (typeof candidateFilters)[number];

export const parseCandidateFilter = (
  value: string | undefined,
): CandidateFilter | undefined =>
  candidateFilters.find((candidate) => candidate === value);

export const reviewableCandidateStatuses: ReadonlyArray<CandidateStatus> = [
  "submitted",
  "under_review",
  "waitlisted",
];

export interface Candidate {
  readonly id: string;
  readonly participantId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly avatarUrl?: string;
  readonly pronouns?: string;
  readonly countryCode?: string;
  readonly city?: string;
  readonly participationMode?: "in_person" | "remote";
  readonly organization?: string;
  readonly role?: string;
  readonly fieldOfStudy?: string;
  readonly graduationYear?: number;
  readonly shippedProject?: string;
  readonly hackathonProject?: string;
  readonly bio?: string;
  readonly githubUrl?: string;
  readonly linkedInUrl?: string;
  readonly portfolioUrl?: string;
  readonly teamPreference?: "have_team" | "looking_for_team" | "solo";
  readonly teamName?: string;
  readonly status: CandidateStatus;
  readonly mediaConsent: boolean;
  readonly submittedAt: string;
  readonly decidedAt?: string;
  readonly approvedBy?: string;
  readonly attemptNumber: number;
  readonly decisionHistory: ReadonlyArray<{
    readonly applicationId: string;
    readonly attemptNumber: number;
    readonly decision: "accepted" | "rejected";
    readonly at: string;
    readonly decidedBy?: string;
    readonly message?: string;
  }>;
  readonly documentFullName?: string;
  readonly phone?: string;
  readonly dateOfBirth?: string;
  readonly shirtSize?: string;
  readonly dietaryRestrictions?: string;
  readonly accessibilityNeeds?: string;
  readonly emergencyContactName?: string;
  readonly emergencyContactPhone?: string;
  readonly attendanceCompletedAt?: string;
  readonly checkedInAt?: string;
  readonly nationalIdProvided: boolean;
}

export interface CandidateCounts {
  readonly all: number;
  readonly draft: number;
  readonly submitted: number;
  readonly under_review: number;
  readonly waitlisted: number;
  readonly accepted: number;
  readonly rejected: number;
  readonly withdrawn: number;
  readonly reattempt: number;
}

export interface CandidatePage {
  readonly candidates: ReadonlyArray<Candidate>;
  readonly counts: CandidateCounts;
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly totalPages: number;
}
