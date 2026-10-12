import type { RefObject } from "react";

import { AssessmentBadge } from "~/components/overview/assessment-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import type { CreatorOverviewRow } from "~/lib/types";

interface AssessmentDetailDialogProps {
  row: CreatorOverviewRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finalFocus?: RefObject<HTMLElement | null>;
}

export function AssessmentDetailDialog({
  row,
  open,
  onOpenChange,
  finalFocus,
}: AssessmentDetailDialogProps) {
  const assessment = row?.assessment ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" finalFocus={finalFocus}>
        {row && (
          <>
            <DialogHeader>
              <DialogTitle>{row.creator.name}</DialogTitle>
              <DialogDescription>@{row.creator.handle} · {row.creator.id}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <AssessmentBadge category={assessment?.category ?? null} />
              {assessment ? (
                <>
                  <section>
                    <h3 className="mb-1 font-medium">Evidence</h3>
                    <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                      {assessment.evidenceItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h3 className="mb-1 font-medium">Recommended next action</h3>
                    <p className="text-muted-foreground">{assessment.nextAction}</p>
                  </section>
                </>
              ) : (
                <p className="text-muted-foreground">
                  None of the three documented assessment categories applies to this
                  creator&apos;s data.
                </p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
