import { MissingValue } from "~/components/overview/missing-value";
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { formatPercent } from "~/lib/format";
import type { Overview } from "~/lib/types";

export function SummaryCards({ overview }: { overview: Overview }) {
  const { week2CompletionRate, totalCreators } = overview;

  return (
    <div className="grid gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>Creators tracked</CardDescription>
          <CardTitle className="text-3xl tabular-nums">{totalCreators}</CardTitle>
          <p className="text-xs text-muted-foreground">Total creators in the dataset</p>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Avg. completion rate, week 2</CardDescription>
          <CardTitle className="text-3xl tabular-nums">
            {week2CompletionRate.average === null ? (
              <MissingValue />
            ) : (
              formatPercent(week2CompletionRate.average)
            )}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {week2CompletionRate.average === null
              ? "No creator has a week 2 completion rate"
              : `Mean of creator-level rates, ${week2CompletionRate.count} of ${totalCreators} creators included`}
          </p>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Consistent &amp; progressing</CardDescription>
          <CardTitle className="text-3xl tabular-nums">{overview.positiveCount}</CardTitle>
          <p className="text-xs text-muted-foreground">consistent_positive_progress</p>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Consistency issues</CardDescription>
          <CardTitle className="text-3xl tabular-nums">{overview.consistencyIssueCount}</CardTitle>
          <p className="text-xs text-muted-foreground">consistency_issue</p>
        </CardHeader>
      </Card>
    </div>
  );
}
