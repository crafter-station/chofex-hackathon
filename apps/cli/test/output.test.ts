import { describe, expect, test } from "bun:test";
import type { RegistrationResult } from "@repo/registration-contract";

import { registrationText, requirementsOnlyText } from "../src/output.js";

const withdrawnResult: RegistrationResult = {
  registration: {
    id: "application_123",
    status: "withdrawn",
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    participationMode: "in_person",
    skills: ["TypeScript"],
    nationalIdProvided: false,
    mediaConsent: false,
    submittedAt: "2026-09-01T12:00:00.000Z",
    createdAt: "2026-09-01T12:00:00.000Z",
    updatedAt: "2026-09-02T12:00:00.000Z",
  },
  requirements: {
    stage: "review",
    canSubmitNewApplication: true,
    canSubmitAcceptedDetails: false,
    missing: [],
  },
};

describe("registration output", () => {
  test("shows that a withdrawn participant may apply again", () => {
    const expected = "Application withdrawn. You may submit a new application.";

    expect(requirementsOnlyText(withdrawnResult)).toBe(expected);
    expect(registrationText(withdrawnResult)).toContain(expected);
  });
});
