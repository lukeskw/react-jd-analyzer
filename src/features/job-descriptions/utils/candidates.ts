import type { Candidate } from "@/lib/api/types";

export const getFitBadgeClass = (score: number | undefined) => {
  if (score === undefined) {
    return "border-transparent bg-gray-300 text-muted-foreground animate-pulse";
  }

  if (score >= 80) {
    return "border-transparent bg-emerald-500 text-white";
  }

  if (score >= 50) {
    return "border-transparent bg-amber-500 text-black";
  }

  if (score >= 0) {
    return "border-transparent bg-gray-300 text-muted-foreground";
  }

  return "border-transparent bg-gray-300 text-muted-foreground";
};

export const filterCandidatesById = (
  candidates: Candidate[],
  searchValue: string,
) => {
  const compareValue = searchValue.trim().toLowerCase();
  if (!compareValue) {
    return candidates;
  }

  return candidates.filter((candidate) =>
    candidate.id.toLowerCase().includes(compareValue),
  );
};

export const hasCandidateIdFilter = (searchValue: string) =>
  searchValue.trim().length > 0;
