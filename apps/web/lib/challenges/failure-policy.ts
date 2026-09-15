import { ChallengeEngineError } from "./engine";

export const isConfirmedSolutionExecutionFailure = (
  error: unknown,
): error is ChallengeEngineError =>
  error instanceof ChallengeEngineError &&
  error.status === 422 &&
  error.code === "SOLUTION_EXECUTION_FAILED";
