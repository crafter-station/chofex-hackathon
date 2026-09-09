import { describe, expect, test } from "bun:test";
import { Schema } from "effect";

import {
  AcceptedDetailsInput,
  ApplicationInput,
  acceptedDetailsSemanticRequirements,
  applicationSemanticRequirements,
  CurrentUserSchema,
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
});
