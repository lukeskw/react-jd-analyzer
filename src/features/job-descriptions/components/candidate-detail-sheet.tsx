import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Candidate } from "@/lib/api/types";

type CandidateDetailSheetProperties = {
  open: boolean;
  candidate: Candidate | undefined;
  onOpenChange: (open: boolean) => void;
};

export const CandidateDetailSheet = ({
  open,
  candidate,
  onOpenChange,
}: CandidateDetailSheetProperties) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {candidate?.candidate_name ?? "Candidate details"}
          </SheetTitle>
          <div className="flex gap-2 items-center text-muted-foreground text-sm">
            <p className="font-semibold">Email:</p>
            {candidate?.candidate_email ? (
              <a
                className="underline"
                href={`mailto:${candidate.candidate_email}`}
              >
                {candidate?.candidate_email}
              </a>
            ) : (
              "-"
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            Fit score: <strong>{candidate?.fit_score ?? "-"}</strong>
          </p>
        </SheetHeader>
        <div className="space-y-4 overflow-y-auto p-4 pt-0 text-sm">
          <section>
            <h3 className="text-sm font-semibold">Summary</h3>
            <p className="text-muted-foreground">
              {candidate?.summary ?? "No summary available."}
            </p>
          </section>
          <section>
            <h3 className="text-sm font-semibold">Strengths</h3>
            {candidate?.strengths?.length ? (
              <ul className="list-disc pl-5 text-muted-foreground">
                {candidate.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No strengths provided.</p>
            )}
          </section>
          <section>
            <h3 className="text-sm font-semibold">Areas for improvement</h3>
            {candidate?.weaknesses?.length ? (
              <ul className="list-disc pl-5 text-muted-foreground">
                {candidate.weaknesses.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                No areas for improvement provided.
              </p>
            )}
          </section>
          <section>
            <h3 className="text-sm font-semibold">Evidence</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {candidate?.evidence ?? "No evidence recorded."}
            </p>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
};
