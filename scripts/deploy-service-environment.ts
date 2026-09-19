import {
  type ApplicationEnvironment,
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
  readonly expectedServerUrl: string;
  readonly apiKey: string;
  readonly applicationId: string;
  readonly application: ApplicationEnvironment;
  readonly applications: ApplicationEnvironment[];
  readonly fetch: Fetch;
}

interface ReconcileServiceEnvironmentResult {
  readonly changedNames: string[];
}

const normalizeUrl = (value: string): string => value.replace(/\/+$/, "");

const escapedRegularExpression = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const reconciledEnvironment = (
  source: string,
  desired: Record<string, string>,
): { environment: string; changedNames: string[] } => {
  let environment = source;
  const changedNames: string[] = [];
  for (const [name, value] of Object.entries(desired)) {
    const assignment = `${name}=${JSON.stringify(value)}`;
    const pattern = new RegExp(
      `^${escapedRegularExpression(name)}=[^\\r\\n]*(?:\\r?$)`,
      "gm",
    );
    const matches = [...environment.matchAll(pattern)];
    const currentAssignment = matches[0]?.[0].replace(/\r$/, "");
    if (matches.length === 1 && currentAssignment === assignment) continue;

    changedNames.push(name);
    if (matches.length === 0) {
      let separator = "";
      if (environment && !environment.endsWith("\n")) {
        separator = environment.includes("\r\n") ? "\r\n" : "\n";
      }
      environment = `${environment}${separator}${assignment}`;
      continue;
    }

    let replaced = false;
    environment = environment.replace(pattern, (current) => {
      if (replaced) return "";
      replaced = true;
      const carriageReturn = current.endsWith("\r") ? "\r" : "";
      return `${assignment}${carriageReturn}`;
    });
  }
  return { environment, changedNames };
};

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
  const baseUrl = normalizeUrl(options.serverUrl);
  const expectedServerUrl = normalizeUrl(options.expectedServerUrl);
  if (baseUrl !== expectedServerUrl) {
    throw new Error(
      `Refusing to use ${baseUrl}. This manifest targets ${expectedServerUrl}.`,
    );
  }
  const applicationUrl = new URL("/api/application.one", `${baseUrl}/`);
  applicationUrl.searchParams.set("applicationId", options.applicationId);
  const applicationState = (await request(
    options.fetch,
    applicationUrl,
    options.apiKey,
    { method: "GET" },
  )) as DokployApplicationEnvironment;
  const desired = serviceEnvironment(options.application, options.applications);
  const { environment, changedNames } = reconciledEnvironment(
    applicationState.env ?? "",
    desired,
  );
  if (changedNames.length === 0) return { changedNames };

  const saveUrl = new URL("/api/application.saveEnvironment", `${baseUrl}/`);
  await request(options.fetch, saveUrl, options.apiKey, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      applicationId: options.applicationId,
      env: environment,
      buildArgs: applicationState.buildArgs ?? null,
      buildSecrets: applicationState.buildSecrets ?? null,
      createEnvFile: applicationState.createEnvFile ?? false,
    }),
  });
  return { changedNames };
};
