import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { useCandidates } from "@/features/job-descriptions/hooks/use-candidates";
import {
  debounceEffect,
  filterCandidatesById,
  hasCandidateIdFilter,
} from "@/features/job-descriptions/utils";
import type { Candidate, JobSummary } from "@/lib/api/types";

type LocationState = {
  job?: JobSummary;
};

export const useJobDescriptionDetailPage = () => {
  const { jdId } = useParams<{ jdId: string }>();
  const location = useLocation();
  const [searchParameters, setSearchParameters] = useSearchParams();
  const state = (location.state ?? {}) as LocationState;
  const job = state.job;
  const { status, list, error, fetch, getOne } = useCandidates(jdId);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<
    Candidate | undefined
  >();
  const [loadingCandidateId, setLoadingCandidateId] = useState<
    string | undefined
  >();
  const candidateIdParameter = searchParameters.get("candidateId") ?? "";
  const [candidateIdSearch, setCandidateIdSearch] =
    useState(candidateIdParameter);

  const jobTitle = useMemo(() => job?.title ?? "Job opening", [job?.title]);

  useEffect(() => {
    document.title = `Opening details - ${jobTitle}`;
  }, [jobTitle]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    if (!error) return;

    toast.error("Failed to load results", {
      description: error,
    });
  }, [error]);

  useEffect(() => {
    setCandidateIdSearch((current) =>
      current === candidateIdParameter ? current : candidateIdParameter,
    );
  }, [candidateIdParameter]);

  useEffect(
    () =>
      debounceEffect(() => {
        if (candidateIdSearch === candidateIdParameter) return;

        const next = new URLSearchParams(searchParameters);
        if (candidateIdSearch.trim()) {
          next.set("candidateId", candidateIdSearch.trim());
        } else {
          next.delete("candidateId");
        }
        setSearchParameters(next, { replace: true });
      }, 300),
    [
      candidateIdParameter,
      candidateIdSearch,
      searchParameters,
      setSearchParameters,
    ],
  );

  const filteredCandidates = useMemo(
    () => filterCandidatesById(list, candidateIdParameter),
    [candidateIdParameter, list],
  );

  const hasSearchFilter = hasCandidateIdFilter(candidateIdParameter);

  const handleRefresh = useCallback(() => {
    fetch();
  }, [fetch]);

  const handleOpenCandidate = useCallback(
    async (candidateId: string) => {
      setLoadingCandidateId(candidateId);
      try {
        const candidate = await getOne(candidateId);
        setSelectedCandidate(candidate);
        setDetailOpen(true);
      } catch (error_) {
        console.error(error_);
        toast.error("Could not load the candidate.");
      } finally {
        setLoadingCandidateId(undefined);
      }
    },
    [getOne],
  );

  const handleDetailOpenChange = useCallback((nextOpen: boolean) => {
    setDetailOpen(nextOpen);
    if (!nextOpen) {
      setSelectedCandidate(undefined);
    }
  }, []);

  const handleCandidateIdSearchChange = useCallback((value: string) => {
    setCandidateIdSearch(value);
  }, []);

  const showEmptyState = status === "success" && list.length === 0;
  const isInitialLoading = status === "loading" && list.length === 0;

  return {
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
  };
};
