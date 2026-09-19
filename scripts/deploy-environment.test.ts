import { describe, expect, test } from "bun:test";

import { selectedEnvironment } from "./deploy-environment";

interface TestApplication {
  readonly name: string;
  readonly domain: string;
  readonly environmentVariables: string[];
  readonly optionalEnvironmentVariables: string[];
  readonly serviceEnvironmentVariables?: Record<string, string>;
}

describe("deployment environment selection", () => {
  test("derives service URLs from the target application's domain", () => {
    const applications: TestApplication[] = [
      {
        name: "Website",
        domain: "hacktheandes.com",
        environmentVariables: ["DATABASE_URL"],
        optionalEnvironmentVariables: [],
        serviceEnvironmentVariables: {
          CHALLENGE_ENGINE_URL: "Challenge Engine",
        },
      },
      {
        name: "Challenge Engine",
        domain: "engine.hacktheandes.com",
        environmentVariables: ["CHALLENGE_ENGINE_API_SECRET"],
        optionalEnvironmentVariables: [],
      },
    ];
    const select = selectedEnvironment as unknown as (
      values: Record<string, string>,
      application: TestApplication,
      allApplications: TestApplication[],
    ) => Record<string, string>;

    expect(
      select(
        {
          DATABASE_URL: "postgresql://database.example/chofex",
          CHALLENGE_ENGINE_URL: "https://andes-engine.cueva.io",
        },
        applications[0]!,
        applications,
      ),
    ).toEqual({
      DATABASE_URL: "postgresql://database.example/chofex",
      CHALLENGE_ENGINE_URL: "https://engine.hacktheandes.com",
    });
  });
});
