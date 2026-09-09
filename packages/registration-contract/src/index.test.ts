import { describe, expect, test } from "bun:test";
import { Schema } from "effect";

import {
  AcceptedDetailsInput,
  ApplicationInput,
  acceptedDetailsSemanticRequirements,
  applicationRequirementsFor,
  applicationSemanticRequirements,
  CurrentUserSchema,
  type RegistrationView,
} from "./index.js";

const application = {
  firstName: " Ada ",
  lastName: "Lovelace",
  city: "Lima",
  experienceLevel: "advanced",
  skills: ["TypeScript"],
  bio: "I build analytical engines.",
  teamPreference: "solo",
  codeOfConductAccepted: true,
  privacyPolicyAccepted: true,
} as const;

const registrationView = (
  overrides: Partial<RegistrationView> = {},
): RegistrationView => ({
  id: "application_123",
  status: "submitted",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  participationMode: "in_person",
  skills: ["TypeScript"],
  nationalIdProvided: false,
  mediaConsent: false,
  submittedAt: "2026-09-01T12:00:00.000Z",
  createdAt: "2026-09-01T12:00:00.000Z",
  updatedAt: "2026-09-01T12:00:00.000Z",
  ...overrides,
});

describe("registration contract", () => {
  test("decodes an authenticated CLI identity", () => {
    expect(
      Schema.decodeUnknownSync(CurrentUserSchema)({
        authenticated: true,
        userId: "user_123",
        email: "ada@example.com",
        tokenType: "oauth_token",
      }),
    ).toEqual({
      authenticated: true,
      userId: "user_123",
      email: "ada@example.com",
      tokenType: "oauth_token",
    });
  });

  test("accepts only applicant-provided fields for the on-site Peru event", () => {
    const decoded = Schema.decodeUnknownSync(ApplicationInput)({
      ...application,
      githubUrl: "github.com/cuevaio",
    });
    expect(decoded.firstName).toBe("Ada");
    expect(decoded.city).toBe("Lima");
    expect(decoded.githubUrl).toBe("https://github.com/cuevaio");
    expect(decoded).not.toHaveProperty("email");
    expect(decoded).not.toHaveProperty("countryCode");
    expect(decoded).not.toHaveProperty("participationMode");
  });

  test("rejects identity and event constants supplied by clients", () => {
    expect(() =>
      Schema.decodeUnknownSync(ApplicationInput, {
        onExcessProperty: "error",
      })({
        ...application,
        email: "other@example.com",
        countryCode: "US",
        participationMode: "remote",
      }),
    ).toThrow();
  });

  test("requires a team name for existing teams", () => {
    const decoded = Schema.decodeUnknownSync(ApplicationInput)({
      ...application,
      teamPreference: "have_team",
    });
    expect(applicationSemanticRequirements(decoded)).toEqual([
      {
        field: "teamName",
        reason: "Required when you already have a team",
      },
    ]);
  });

  test("does not require a team name without an existing team", () => {
    for (const teamPreference of ["looking_for_team", "solo"] as const) {
      const decoded = Schema.decodeUnknownSync(ApplicationInput)({
        ...application,
        teamPreference,
      });
      expect(applicationSemanticRequirements(decoded)).toEqual([]);
    }
  });

  test("requires shirt size only for in-person attendance", () => {
    const details = Schema.decodeUnknownSync(AcceptedDetailsInput)({
      phone: "+44 20 0000 0000",
      dateOfBirth: "1990-01-01",
      nationalIdNumber: "AB123456",
      emergencyContactName: "Charles Babbage",
      emergencyContactPhone: "+44 20 0000 0001",
    });
    expect(acceptedDetailsSemanticRequirements(details, "in_person")).toEqual([
      {
        field: "shirtSize",
        reason: "Required for in-person participants",
      },
    ]);
    expect(acceptedDetailsSemanticRequirements(details, "remote")).toEqual([]);
  });

  test("requires a national ID after acceptance", () => {
    expect(() =>
      Schema.decodeUnknownSync(AcceptedDetailsInput)({
        phone: "+44 20 0000 0000",
        dateOfBirth: "1990-01-01",
        emergencyContactName: "Charles Babbage",
        emergencyContactPhone: "+44 20 0000 0001",
      }),
    ).toThrow();
  });

  test("rejects impossible and future birth dates", () => {
    const details = Schema.decodeUnknownSync(AcceptedDetailsInput)({
      phone: "+44 20 0000 0000",
      dateOfBirth: "2024-02-30",
      nationalIdNumber: "AB123456",
      emergencyContactName: "Charles Babbage",
      emergencyContactPhone: "+44 20 0000 0001",
    });
    expect(acceptedDetailsSemanticRequirements(details, "remote")).toEqual([
      {
        field: "dateOfBirth",
        reason: "Must be a valid date in the past",
      },
    ]);

    const future = {
      ...details,
      dateOfBirth: "2100-01-01",
    };
    expect(acceptedDetailsSemanticRequirements(future, "remote")).toEqual([
      {
        field: "dateOfBirth",
        reason: "Must be a valid date in the past",
      },
    ]);
  });

  test("keeps every active application in review", () => {
    for (const status of [
      "draft",
      "submitted",
      "under_review",
      "waitlisted",
    ] as const) {
      expect(applicationRequirementsFor(registrationView({ status }))).toEqual({
        stage: "review",
        canSubmitNewApplication: false,
        canSubmitAcceptedDetails: false,
        missing: [],
      });
    }
  });

  test("allows a new application after rejection or withdrawal", () => {
    expect(
      applicationRequirementsFor(
        registrationView({
          status: "rejected",
          rejectionReason: "At capacity",
        }),
      ),
    ).toEqual({
      stage: "rejected",
      canSubmitNewApplication: true,
      canSubmitAcceptedDetails: false,
      missing: [],
      rejectionReason: "At capacity",
    });
    expect(
      applicationRequirementsFor(registrationView({ status: "withdrawn" })),
    ).toEqual({
      stage: "review",
      canSubmitNewApplication: true,
      canSubmitAcceptedDetails: false,
      missing: [],
    });
  });

  test("requires a completion marker and every acceptance field", () => {
    const completed = registrationView({
      status: "accepted",
      phone: "+51 999 999 999",
      dateOfBirth: "1990-01-01",
      nationalIdProvided: true,
      shirtSize: "m",
      emergencyContactName: "Grace Hopper",
      emergencyContactPhone: "+1 555 0100",
      acceptanceDetailsCompletedAt: "2026-09-02T12:00:00.000Z",
    });

    expect(applicationRequirementsFor(completed)).toEqual({
      stage: "complete",
      canSubmitNewApplication: false,
      canSubmitAcceptedDetails: true,
      missing: [],
    });

    const withoutMarker = {
      ...completed,
      acceptanceDetailsCompletedAt: undefined,
    };
    expect(applicationRequirementsFor(withoutMarker).stage).toBe("accepted");

    const malformedCompletion = {
      ...completed,
      shirtSize: undefined,
    };
    expect(applicationRequirementsFor(malformedCompletion)).toEqual({
      stage: "accepted",
      canSubmitNewApplication: false,
      canSubmitAcceptedDetails: true,
      missing: [
        {
          field: "shirtSize",
          reason: "Required for in-person participants",
        },
      ],
    });
  });

  test("does not require a shirt size for remote acceptance", () => {
    const completed = registrationView({
      status: "accepted",
      participationMode: "remote",
      phone: "+51 999 999 999",
      dateOfBirth: "1990-01-01",
      nationalIdProvided: true,
      emergencyContactName: "Grace Hopper",
      emergencyContactPhone: "+1 555 0100",
      acceptanceDetailsCompletedAt: "2026-09-02T12:00:00.000Z",
    });

    expect(applicationRequirementsFor(completed).stage).toBe("complete");
  });
});
