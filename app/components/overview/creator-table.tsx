import { useRef, useState } from "react";

import { AssessmentBadge } from "~/components/overview/assessment-badge";
import { AssessmentDetailDialog } from "~/components/overview/assessment-detail-dialog";
import { MetricChange } from "~/components/overview/metric-change";
import { MissingValue } from "~/components/overview/missing-value";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { formatMinutes, formatNumber, formatPercent } from "~/lib/format";
import type { CreatorOverviewRow } from "~/lib/types";

function MetricValue({
  value,
  format,
}: {
  value: number | null;
  format: (value: number) => string;
}) {
  return value === null ? <MissingValue /> : <span className="tabular-nums">{format(value)}</span>;
}

const numericHead = "text-right";
const numericCell = "text-right";

export function CreatorTable({ rows }: { rows: CreatorOverviewRow[] }) {
  const [selectedRow, setSelectedRow] = useState<CreatorOverviewRow | null>(null);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openDetails = (row: CreatorOverviewRow, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setSelectedRow(row);
    setOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Creator performance</CardTitle>
        <CardDescription>
          Week 2 values with change versus week 1. Completion rate changes are in percentage
          points (pp). Unavailable values are shown as an em dash.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption className="sr-only">
            Week 2 stream metrics, week-over-week changes and assessment for each creator
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className="sticky left-0 bg-card">
                Creator
              </TableHead>
              <TableHead scope="col" className={numericHead}>Planned streams</TableHead>
              <TableHead scope="col" className={numericHead}>Completed streams</TableHead>
              <TableHead scope="col" className={numericHead}>Completion rate</TableHead>
              <TableHead scope="col" className={numericHead}>Completion change</TableHead>
              <TableHead scope="col" className={numericHead}>Avg. watch duration</TableHead>
              <TableHead scope="col" className={numericHead}>Watch duration change</TableHead>
              <TableHead scope="col" className={numericHead}>Published clips</TableHead>
              <TableHead scope="col" className={numericHead}>Clips change</TableHead>
              <TableHead scope="col">Assessment</TableHead>
              <TableHead scope="col">
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const { week2, changes } = row.analytics;
              return (
                <TableRow key={row.creator.id}>
                  <TableHead scope="row" className="sticky left-0 bg-card font-medium">
                    <div>{row.creator.name}</div>
                    <div className="text-xs font-normal text-muted-foreground">
                      @{row.creator.handle}
                    </div>
                  </TableHead>
                  <TableCell className={numericCell}>
                    <span className="tabular-nums">{week2.plannedStreams}</span>
                  </TableCell>
                  <TableCell className={numericCell}>
                    <span className="tabular-nums">{week2.completedStreams}</span>
                  </TableCell>
                  <TableCell className={numericCell}>
                    <MetricValue value={week2.completionRate} format={formatPercent} />
                  </TableCell>
                  <TableCell className={numericCell}>
                    <MetricChange value={changes.completionRateChange} unit="pp" />
                  </TableCell>
                  <TableCell className={numericCell}>
                    <MetricValue value={week2.averageWatchDurationMinutes} format={formatMinutes} />
                  </TableCell>
                  <TableCell className={numericCell}>
                    <MetricChange value={changes.averageWatchDurationChange} unit="min" />
                  </TableCell>
                  <TableCell className={numericCell}>
                    <MetricValue value={week2.publishedClips} format={formatNumber} />
                  </TableCell>
                  <TableCell className={numericCell}>
                    <MetricChange value={changes.publishedClipsChange} unit="clips" />
                  </TableCell>
                  <TableCell>
                    <AssessmentBadge category={row.assessment?.category ?? null} />
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={(event) => openDetails(row, event.currentTarget)}>
                      View details
                      <span className="sr-only"> for {row.creator.name}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
      <AssessmentDetailDialog
        row={selectedRow}
        open={open}
        onOpenChange={setOpen}
        finalFocus={triggerRef}
      />
    </Card>
  );
}
