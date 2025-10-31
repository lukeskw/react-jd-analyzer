import { useCallback, useMemo, useState } from "react";

import { extractErrorMessage } from "@/lib/api/errors";
import * as candidatesApi from "@/lib/api/candidates";
import type { Candidate } from "@/lib/api/types";

type CandidatesStatus = "idle" | "loading" | "success" | "error";

export const useCandidates = (jdId: string | undefined) => {
  const [status, setStatus] = useState<CandidatesStatus>("idle");
  const [list, setList] = useState<Candidate[]>([]);
  const [error, setError] = useState<string | undefined>();

  const fetch = useCallback(async () => {
    if (!jdId) return;
    setStatus("loading");
    setError(undefined);
    try {
      const candidates = await candidatesApi.list(jdId);
      setList(candidates);
      setStatus("success");
    } catch (error_) {
      console.error("Failed to load candidates", error_);
      setError(extractErrorMessage(error_));
      setStatus("error");
    }
  }, [jdId]);

  const getOne = useCallback(
    async (candidateId: string) => {
      const cached = list.find((candidate) => candidate.id === candidateId);
      if (cached) return cached;
      if (!jdId) throw new Error("JD not found.");
      try {
        const candidate = await candidatesApi.getOne(jdId, candidateId);
        setList((previous) => {
          const exists = previous.some((item) => item.id === candidate.id);
          return exists ? previous : [...previous, candidate];
        });
        return candidate;
      } catch (error_) {
        console.error("Failed to load candidate detail", error_);
        throw error_;
      }
    },
    [jdId, list],
  );

  return useMemo(
    () => ({
      status,
      list,
      error,
      fetch,
      getOne,
    }),
    [error, fetch, getOne, list, status],
  );
};
