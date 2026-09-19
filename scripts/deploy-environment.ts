interface ApplicationEnvironment {
  readonly name: string;
  readonly environmentVariables: string[];
  readonly optionalEnvironmentVariables: string[];
}

export const selectedEnvironment = (
  values: Record<string, string>,
  application: ApplicationEnvironment,
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
  return selected;
};
