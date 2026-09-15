import { Predicate } from "effect";

export const isUniqueViolation = (error: unknown): boolean => {
  if (Predicate.hasProperty(error, "code") && error.code === "23505") {
    return true;
  }
  if (Predicate.hasProperty(error, "cause")) {
    return isUniqueViolation(error.cause);
  }
  return false;
};
