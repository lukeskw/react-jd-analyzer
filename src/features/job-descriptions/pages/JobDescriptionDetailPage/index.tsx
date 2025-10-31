import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BackToOpeningsButton } from "@/features/job-descriptions/components/back-to-openings-button";
import { CandidateDetailSheet } from "@/features/job-descriptions/components/candidate-detail-sheet";
import { useJobDescriptionDetailPage } from "@/features/job-descriptions/pages/JobDescriptionDetailPage/hooks/use-job-description-detail-page";
import { getFitBadgeClass } from "@/features/job-descriptions/utils";

export const JobDescriptionDetailPage = () => {
  const {
    job,
    jobTitle,
    status,
    error,
    filteredCandidates,
    hasSearchFilter,
    handleRefresh,
    handleOpenCandidate,
    detailOpen,
    handleDetailOpenChange,
    selectedCandidate,
    loadingCandidateId,
    candidateIdSearch,
    handleCandidateIdSearchChange,
    showEmptyState,
    isInitialLoading,
  } = useJobDescriptionDetailPage();

  let candidatesContent: ReactNode;
  if (isInitialLoading) {
    candidatesContent = (
      <p className="text-muted-foreground text-sm">Fetching candidates...</p>
    );
  } else if (showEmptyState) {
    candidatesContent = (
      <Alert>
        <AlertTitle>No candidates available</AlertTitle>
        <AlertDescription>
          Processing in the background. Try "Refresh results" later.
        </AlertDescription>
      </Alert>
    );
  } else if (filteredCandidates.length === 0 && hasSearchFilter) {
    candidatesContent = (
      <Alert>
        <AlertTitle>No candidates found</AlertTitle>
        <AlertDescription>
          No candidate matches this id. Try a different search.
        </AlertDescription>
      </Alert>
    );
  } else {
    candidatesContent = (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Candidate</TableHead>
            <TableHead>Fit score</TableHead>
            <TableHead>Summary</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCandidates.map((candidate) => (
            <TableRow key={candidate.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {candidate.candidate_name ?? "Candidate"}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {candidate.id}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={getFitBadgeClass(candidate.fit_score ?? undefined)}
                >
                  {candidate.fit_score ?? ""}
                </Badge>
              </TableCell>
              <TableCell className="max-w-md">
                {candidate.summary ? (
                  <p className="truncate text-muted-foreground">
                    {candidate.summary}
                  </p>
                ) : (
                  <span
                    className="inline-block h-1.5 w-10 rounded bg-gray-300 text-transparent animate-pulse"
                    aria-hidden
                  >
                    &nbsp;
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenCandidate(candidate.id)}
                  disabled={loadingCandidateId === candidate.id}
                >
                  {loadingCandidateId === candidate.id
                    ? "Loading..."
                    : "View details"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            Opening details
          </p>
          <h1 className="text-2xl font-semibold">{jobTitle}</h1>
          <div className="flex gap-2">
            {job && (
              <Badge variant="secondary" className="w-fit">
                {job.jd_id}
              </Badge>
            )}
            {job?.candidate_count && (
              <Badge variant="outline">
                {job.candidate_count} candidate(s) at last refresh
              </Badge>
            )}
          </div>
        </div>
        <div className="flex justify-center items-center">
          <BackToOpeningsButton />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">
          Failed to load results. Try refreshing the page.
        </p>
      )}

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Results</CardTitle>
              <CardDescription>
                Review the scores of processed candidates.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Refreshing..." : "Refresh results"}
            </Button>
          </div>

          <div className="w-full sm:max-w-sm">
            <Input
              value={candidateIdSearch}
              placeholder="Search for Candidate ID"
              onChange={(event) =>
                handleCandidateIdSearchChange(event.target.value)
              }
            />
          </div>
        </CardHeader>
        <CardContent>{candidatesContent}</CardContent>
      </Card>
      <CandidateDetailSheet
        open={detailOpen}
        candidate={selectedCandidate}
        onOpenChange={handleDetailOpenChange}
      />
    </div>
  );
};
