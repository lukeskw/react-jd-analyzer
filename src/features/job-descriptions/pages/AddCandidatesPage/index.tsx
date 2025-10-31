import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackToOpeningsButton } from "@/features/job-descriptions/components/back-to-openings-button";
import {
  ADD_CANDIDATES_LIMIT,
  useAddCandidatesPage,
} from "@/features/job-descriptions/pages/AddCandidatesPage/hooks/use-add-candidates-page";

export const AddCandidatesPage = () => {
  const {
    jobFromState,
    candidateCount,
    jobTitle,
    remainingSlots,
    isLimitReached,
    files,
    status,
    removeAt,
    clear,
    formatFileSize,
    handleSelectFiles,
    handleFileChange,
    handleSubmit,
    fileInputRef,
    isJobMissing,
  } = useAddCandidatesPage();

  if (isJobMissing) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Upload resumes</h1>
          <p className="text-sm text-destructive">
            Job opening not found. Go back to the job list and try again.
          </p>
        </div>
        <BackToOpeningsButton variant="outline" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            Resume upload
          </p>
          <h1 className="text-2xl font-semibold">{jobTitle}</h1>
          {jobFromState && (
            <Badge variant="secondary" className="w-fit">
              {jobFromState.jd_id}
            </Badge>
          )}
          <p className="text-sm text-muted-foreground">
            {candidateCount == undefined ? (
              `Each opening accepts up to ${ADD_CANDIDATES_LIMIT} resumes.`
            ) : isLimitReached ? (
              `This opening already has ${ADD_CANDIDATES_LIMIT} resumes. Remove a resume before uploading new resumes.`
            ) : (
              <>
                This opening currently has {candidateCount} candidate
                {candidateCount === 1 ? "" : "s"}. You can upload up to{" "}
                {remainingSlots} more resume
                {remainingSlots === 1 ? "" : "s"} (limit: {ADD_CANDIDATES_LIMIT}
                ).
              </>
            )}
          </p>
        </div>
        <div className="flex justify-center items-center">
          <BackToOpeningsButton />
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <CardTitle>Upload resumes</CardTitle>
            <Button
              type="button"
              onClick={handleSelectFiles}
              disabled={isLimitReached}
            >
              {isLimitReached ? "Limit reached" : "Add resumes"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          {files.length === 0 ? (
            <Alert>
              <AlertTitle>No files selected</AlertTitle>
              <AlertDescription>
                {isLimitReached
                  ? `This opening already reached the limit of ${ADD_CANDIDATES_LIMIT} resumes.`
                  : `Select between 1 and ${remainingSlots} PDF ${
                      remainingSlots === 1 ? "resume" : "resumes"
                    } (max 5MB each).`}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {files.length} file(s) selected
                </div>
              </div>
              <ul className="divide-border rounded-md border">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="flex items-center justify-between gap-3 border-b px-3 py-2 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{file.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeAt(index)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={clear}
              disabled={files.length === 0}
            >
              Clear
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
