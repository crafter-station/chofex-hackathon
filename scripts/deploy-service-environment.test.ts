import { describe, expect, test } from "bun:test";

import type { ApplicationEnvironment } from "./deploy-environment";
import { reconcileServiceEnvironment } from "./deploy-service-environment";

const website: ApplicationEnvironment = {
  name: "Website",
  domain: "hacktheandes.com",
  environmentVariables: ["DATABASE_URL"],
  optionalEnvironmentVariables: [],
  serviceEnvironmentVariables: {
    CHALLENGE_ENGINE_URL: "Challenge Engine",
  },
};

const applications: ApplicationEnvironment[] = [
  website,
  {
    name: "Challenge Engine",
    domain: "engine.hacktheandes.com",
    environmentVariables: ["CHALLENGE_ENGINE_API_SECRET"],
    optionalEnvironmentVariables: [],
  },
];

describe("Dokploy service environment reconciliation", () => {
  test("replaces a stale service URL without changing secrets", async () => {
    const requests: Array<{ url: string; init: RequestInit }> = [];
    const fetch = async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      const request = { url, init: init ?? {} };
      requests.push(request);
      if (url.includes("application.one")) {
        return Response.json({
          env: [
            'CHALLENGE_ENGINE_API_SECRET="private-secret"',
            'CHALLENGE_ENGINE_URL="https://andes-engine.cueva.io"',
            'DATABASE_URL="postgresql://database.example/chofex"',
          ].join("\n"),
          buildArgs: "NODE_ENV=production",
          buildSecrets: null,
          createEnvFile: false,
        });
      }
      return Response.json(true);
    };

    const result = await reconcileServiceEnvironment({
      serverUrl: "https://vps.example",
      apiKey: "dokploy-secret",
      applicationId: "website-id",
      application: website,
      applications,
      fetch,
    });

    expect(result).toEqual({
      changedNames: ["CHALLENGE_ENGINE_URL"],
    });
    expect(requests).toHaveLength(2);
    expect(requests[0]?.url).toBe(
      "https://vps.example/api/application.one?applicationId=website-id",
    );
    expect(requests[0]?.init.headers).toEqual({
      "x-api-key": "dokploy-secret",
    });

    const saveRequest = requests[1];
    expect(saveRequest?.url).toBe(
      "https://vps.example/api/application.saveEnvironment",
    );
    const body = JSON.parse(String(saveRequest?.init.body));
    expect(body).toEqual({
      applicationId: "website-id",
      env: [
        'CHALLENGE_ENGINE_API_SECRET="private-secret"',
        'CHALLENGE_ENGINE_URL="https://engine.hacktheandes.com"',
        'DATABASE_URL="postgresql://database.example/chofex"',
      ].join("\n"),
      buildArgs: "NODE_ENV=production",
      buildSecrets: null,
      createEnvFile: false,
    });
  });

  test("does not save an environment that already matches", async () => {
    let requests = 0;
    const fetch = async () => {
      requests += 1;
      return Response.json({
        env: 'CHALLENGE_ENGINE_URL="https://engine.hacktheandes.com"',
        buildArgs: null,
        buildSecrets: null,
        createEnvFile: false,
      });
    };

    const result = await reconcileServiceEnvironment({
      serverUrl: "https://vps.example",
      apiKey: "dokploy-secret",
      applicationId: "website-id",
      application: website,
      applications,
      fetch,
    });

    expect(result).toEqual({ changedNames: [] });
    expect(requests).toBe(1);
  });
});
