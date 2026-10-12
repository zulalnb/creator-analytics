import { AlertTriangle, CheckCircle2, CircleDashed, CircleHelp } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import type { AssessmentCategory } from "~/lib/types";
import { cn } from "~/lib/utils";

const CATEGORY_PRESENTATION: Record<
  AssessmentCategory,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  consistent_positive_progress: {
    label: "Consistent & progressing",
    icon: CheckCircle2,
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  consistency_issue: {
    label: "Consistency issue",
    icon: AlertTriangle,
    className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  },
  insufficient_data: {
    label: "Insufficient data",
    icon: CircleHelp,
    className: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
  },
};

interface AssessmentBadgeProps {
  category: AssessmentCategory | null;
}

export function AssessmentBadge({ category }: AssessmentBadgeProps) {
  if (category === null) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <CircleDashed aria-hidden="true" />
        Not categorized
      </Badge>
    );
  }

  const { label, icon: Icon, className } = CATEGORY_PRESENTATION[category];
  return (
    <Badge data-category={category} className={cn(className)}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  );
}
