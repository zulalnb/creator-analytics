import { CompletionRateChart } from "~/components/overview/completion-rate-chart";
import { CreatorTable } from "~/components/overview/creator-table";
import { SummaryCards } from "~/components/overview/summary-cards";
import { Card, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { creators, streams } from "~/data";
import { buildOverview } from "~/lib/overview";

import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Overview | Creator Analytics" }];
}

export function loader() {
  return buildOverview(creators, streams);
}

export default function Home({ loaderData: overview }: Route.ComponentProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Stream consistency, watch duration and published clips across two consecutive weeks.
        </p>
      </div>
      {overview.totalCreators === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No creator data available</CardTitle>
            <CardDescription>
              There are no creators in the dataset, so there is nothing to summarize yet.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <SummaryCards overview={overview} />
          <CompletionRateChart overview={overview} />
          <CreatorTable rows={overview.rows} />
        </>
      )}
    </div>
  );
}
