import type { ValidationResult } from "../geometry/types";

type ValidationMessageProps = {
  validation: ValidationResult | null;
};

export function ValidationMessage({ validation }: ValidationMessageProps) {
  if (!validation) {
    return null;
  }

  return (
    <div className={validation.success ? "validation validation-success" : "validation validation-hint"}>
      {validation.message}
    </div>
  );
}
