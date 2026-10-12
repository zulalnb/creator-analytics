import { MISSING_VALUE } from "~/lib/format";

export function MissingValue() {
  return (
    <>
      <span aria-hidden="true" className="text-muted-foreground">
        {MISSING_VALUE}
      </span>
      <span className="sr-only">Unavailable</span>
    </>
  );
}
