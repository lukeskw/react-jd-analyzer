import { useCallback, useMemo, useState } from "react";

import { extractErrorMessage, isValidationError } from "@/lib/api/errors";
import * as jobDescriptionsAPI from "@/lib/api/job-descriptions";
import type { JobSummary } from "@/lib/api/types";

type JobDescriptionListStatus = "idle" | "loading" | "success" | "error";

export const useJobDescriptionList = () => {
  const [status, setStatus] = useState<JobDescriptionListStatus>("idle");
  const [data, setData] = useState<JobSummary[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [isCreating, setIsCreating] = useState(false);

  const fetch = useCallback(async () => {
    setStatus("loading");
    setError(undefined);
    try {
      const list = await jobDescriptionsAPI.list();
      setData(list);
      setStatus("success");
    } catch (error_) {
      console.error("Failed to load job descriptions", error_);
      setError(extractErrorMessage(error_));
      setStatus("error");
    }
  }, []);

  const createJobDescription = useCallback(
    async ({ title, file }: { title: string; file: File }) => {
      setIsCreating(true);
      try {
        const created = await jobDescriptionsAPI.createJobDescription({
          title,
          file,
        });
        const summary: JobSummary = {
          jd_id: created.jd_id,
          title: created.title,
          candidate_count: 0,
        };
        setData((previous) => [summary, ...previous]);
        return created;
      } catch (error_) {
        console.error("Failed to create job description", error_);
        if (!isValidationError(error_)) {
          setError(extractErrorMessage(error_));
        }
        throw error_;
      } finally {
        setIsCreating(false);
      }
    },
    [],
  );

  return useMemo(
    () => ({
      status,
      data,
      error,
      isCreating,
      fetch,
      createJobDescription,
    }),
    [createJobDescription, data, error, fetch, isCreating, status],
  );
};
