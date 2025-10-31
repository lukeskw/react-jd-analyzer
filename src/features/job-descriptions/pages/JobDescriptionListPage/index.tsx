import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddJobDescriptionDialog } from "@/features/job-descriptions/components/add-job-description-dialog";
import { useJobDescriptionListPage } from "@/features/job-descriptions/pages/JobDescriptionListPage/hooks/use-job-description-list-page";
import { Loader2 } from "lucide-react";

export const JobDescriptionListPage = () => {
  const {
    status,
    data,
    error,
    isCreating,
    handleCreateJobDescription,
    isEmpty,
  } = useJobDescriptionListPage();

  let content: ReactNode;

  if (status === "loading") {
    content = (
      <div className="flex items-end justify-center gap-2">
        <Loader2 className="size-4 animate-spin" />
      </div>
    );
  } else if (isEmpty) {
    content = (
      <Alert>
        <AlertTitle>No openings yet</AlertTitle>
        <AlertDescription>
          Click "Add opening" to create the first job description.
        </AlertDescription>
      </Alert>
    );
  } else {
    content = (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Candidates</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((job) => (
            <TableRow key={job.jd_id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{job.title}</span>
                  <Badge variant="secondary">{job.jd_id}</Badge>
                </div>
              </TableCell>
              <TableCell>{job.candidate_count}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link
                      to={`/app/job-descriptions/${job.jd_id}/add`}
                      state={{ job }}
                    >
                      Add candidates
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link
                      to={`/app/job-descriptions/${job.jd_id}`}
                      state={{ job }}
                    >
                      Show
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg xl:text-2xl font-semibold">
            Job Descriptions
          </h1>
          <p className="text-sm xl:text-base text-muted-foreground">
            Create new openings and track candidate results.
          </p>
        </div>
        <AddJobDescriptionDialog
          onSubmit={handleCreateJobDescription}
          isSubmitting={isCreating}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">
          Unable to load job openings. Try again in a moment.
        </p>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Openings</CardTitle>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    </div>
  );
};
