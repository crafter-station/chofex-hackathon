export interface ApplicationEnvironment {
  readonly name: string;
  readonly domain: string;
  readonly environmentVariables: string[];
  readonly optionalEnvironmentVariables: string[];
  readonly serviceEnvironmentVariables?: Record<string, string>;
}

export const environmentVariableNames = (
  application: ApplicationEnvironment,
): string[] => [
  ...application.environmentVariables,
  ...application.optionalEnvironmentVariables,
  ...Object.keys(application.serviceEnvironmentVariables ?? {}),
];

export const selectedEnvironment = (
  values: Record<string, string>,
  application: ApplicationEnvironment,
  applications: ApplicationEnvironment[],
): Record<string, string> => {
  const selected: Record<string, string> = {};
  const required = new Set(application.environmentVariables);
  const names = [
    ...application.environmentVariables,
    ...application.optionalEnvironmentVariables,
  ];
  for (const name of names) {
    const value = values[name];
    if (value) selected[name] = value;
    else if (required.has(name))
      throw new Error(
        `Missing required environment variable ${name} for ${application.name}.`,
      );
  }

  for (const [name, targetName] of Object.entries(
    application.serviceEnvironmentVariables ?? {},
  )) {
    const targets = applications.filter(
      (candidate) => candidate.name === targetName,
    );
    const target = targets[0];
    if (!target || targets.length !== 1) {
      throw new Error(
        `Expected exactly one service named ${targetName} for ${application.name}, found ${targets.length}.`,
      );
    }
    selected[name] = `https://${target.domain}`;
  }
  return selected;
};
