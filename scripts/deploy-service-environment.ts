import {
  type ApplicationEnvironment,
  parseEnvironment,
  serializeEnvironment,
  serviceEnvironment,
} from "./deploy-environment";

type Fetch = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

interface DokployApplicationEnvironment {
  readonly env?: string | null;
  readonly buildArgs?: string | null;
  readonly buildSecrets?: string | null;
  readonly createEnvFile?: boolean;
}

interface ReconcileServiceEnvironmentOptions {
  readonly serverUrl: string;
  readonly apiKey: string;
  readonly applicationId: string;
  readonly application: ApplicationEnvironment;
  readonly applications: ApplicationEnvironment[];
  readonly fetch: Fetch;
}

interface ReconcileServiceEnvironmentResult {
  readonly changedNames: string[];
}

const request = async (
  fetch: Fetch,
  url: URL,
  apiKey: string,
  init: RequestInit,
): Promise<unknown> => {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...init.headers,
      "x-api-key": apiKey,
    },
  });
  if (!response.ok) {
    throw new Error(
      `${init.method} ${url.pathname} failed with HTTP ${response.status}. Inspect Dokploy for redacted details.`,
    );
  }
  const body = await response.text();
  if (!body) return;
  return JSON.parse(body);
};

export const reconcileServiceEnvironment = async (
  options: ReconcileServiceEnvironmentOptions,
): Promise<ReconcileServiceEnvironmentResult> => {
  const baseUrl = options.serverUrl.replace(/\/+$/, "");
  const applicationUrl = new URL("/api/application.one", `${baseUrl}/`);
  applicationUrl.searchParams.set("applicationId", options.applicationId);
  const applicationState = (await request(
    options.fetch,
    applicationUrl,
    options.apiKey,
    { method: "GET" },
  )) as DokployApplicationEnvironment;
  const current = parseEnvironment(applicationState.env ?? "");
  const desired = serviceEnvironment(options.application, options.applications);
  const changedNames = Object.entries(desired)
    .filter(([name, value]) => current[name] !== value)
    .map(([name]) => name);
  if (changedNames.length === 0) return { changedNames };

  const saveUrl = new URL("/api/application.saveEnvironment", `${baseUrl}/`);
  await request(options.fetch, saveUrl, options.apiKey, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      applicationId: options.applicationId,
      env: serializeEnvironment({ ...current, ...desired }),
      buildArgs: applicationState.buildArgs ?? null,
      buildSecrets: applicationState.buildSecrets ?? null,
      createEnvFile: applicationState.createEnvFile ?? false,
    }),
  });
  return { changedNames };
};
