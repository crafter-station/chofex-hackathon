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
  email: "ADA@EXAMPLE.COM",
  countryCode: "gb",
  city: "London",
  participationMode: "in_person",
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

  test("normalizes identity fields", () => {
    const decoded = Schema.decodeUnknownSync(ApplicationInput)(application);
    expect(decoded.firstName).toBe("Ada");
    expect(decoded.email).toBe("ada@example.com");
    expect(decoded.countryCode).toBe("GB");
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
