import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { formatPercent } from "~/lib/format";
import type { AverageResult, Overview } from "~/lib/types";

const Y_TICKS = [0, 25, 50, 75, 100];

interface WeekBar {
  label: string;
  result: AverageResult;
}

function describeBar({ label, result }: WeekBar, totalCreators: number): string {
  if (result.average === null) {
    return `${label}: no data. No creator has a completion rate for this week.`;
  }
  const excluded = totalCreators - result.count;
  return (
    `${label}: ${formatPercent(result.average)} average completion rate across ` +
    `${result.count} of ${totalCreators} creators.` +
    (excluded > 0 ? ` ${excluded} excluded (completion rate unavailable).` : "")
  );
}

export function CompletionRateChart({ overview }: { overview: Overview }) {
  const { totalCreators } = overview;
  const bars: WeekBar[] = [
    { label: "Week 1", result: overview.week1CompletionRate },
    { label: "Week 2", result: overview.week2CompletionRate },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Average stream completion rate: week 1 vs week 2</CardTitle>
        <CardDescription>
          Arithmetic mean of creator-level completion rates. Creators without a completion rate
          for a week are excluded from that week&apos;s average.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          role="group"
          aria-label="Average stream completion rate by week"
          className="grid grid-cols-[auto_2.5rem_1fr] grid-rows-[auto_auto] gap-x-2"
        >
          <p className="row-span-1 rotate-180 text-center text-xs text-muted-foreground [writing-mode:vertical-rl]">
            Completion rate (%)
          </p>
          <div className="relative h-56" aria-hidden="true">
            {Y_TICKS.map((tick) => (
              <span
                key={tick}
                className="absolute right-0 translate-y-1/2 text-xs tabular-nums text-muted-foreground"
                style={{ bottom: `${tick}%` }}
              >
                {tick}
              </span>
            ))}
          </div>
          <div className="relative h-56 border-b border-l">
            {Y_TICKS.slice(1).map((tick) => (
              <div
                key={tick}
                aria-hidden="true"
                className="absolute inset-x-0 border-t border-dashed border-border"
                style={{ bottom: `${tick}%` }}
              />
            ))}
            <div className="absolute inset-0 flex">
              {bars.map((bar) => (
                <div key={bar.label} className="relative flex-1">
                  {bar.result.average === null ? (
                    <p className="absolute inset-x-0 top-1/2 text-center text-sm text-muted-foreground">
                      No data
                    </p>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <div
                            tabIndex={0}
                            role="img"
                            aria-label={describeBar(bar, totalCreators)}
                            className="absolute inset-x-0 bottom-0 mx-auto flex w-3/5 max-w-28 flex-col items-center justify-end outline-none"
                            style={{ height: `${bar.result.average}%` }}
                          />
                        }
                      >
                        <span className="absolute bottom-full mb-1 text-sm font-semibold tabular-nums">
                          {formatPercent(bar.result.average)}
                        </span>
                        <span className="h-full w-full rounded-t-md bg-primary" />
                      </TooltipTrigger>
                      <TooltipContent>{describeBar(bar, totalCreators)}</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="col-start-3 row-start-2 flex pt-2">
            {bars.map((bar) => (
              <div key={bar.label} className="flex-1 text-center">
                <p className="text-sm font-medium">{bar.label}</p>
                <p className="text-xs text-muted-foreground">
                  {bar.result.count} of {totalCreators} creators included
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
