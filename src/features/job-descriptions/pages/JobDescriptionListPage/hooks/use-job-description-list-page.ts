import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useJobDescriptionList } from "@/features/job-descriptions/hooks/use-job-description-list";

export const useJobDescriptionListPage = () => {
  const navigate = useNavigate();
  const { status, data, error, isCreating, fetch, createJobDescription } =
    useJobDescriptionList();

  useEffect(() => {
    document.title = "JobDescriptions • JobDescription Analyzer";
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    if (!error) return;

    toast.error("Unable to load job openings", {
      description: error,
    });
  }, [error]);

  const handleCreateJobDescription = useCallback(
    async ({ title, file }: { title: string; file: File }) => {
      const created = await createJobDescription({ title, file });
      const jobSummary = {
        jd_id: created.jd_id,
        title: created.title,
        candidate_count: 0,
      };

      toast.success("Job opening created successfully", {
        description: "You can add resumes now.",
        action: {
          label: "Add resumes",
          onClick: () =>
            navigate(`/app/job-descriptions/${created.jd_id}/add`, {
              state: { job: jobSummary },
            }),
        },
      });
      navigate(`/app/job-descriptions/${created.jd_id}/add`, {
        state: { job: jobSummary },
      });
    },
    [createJobDescription, navigate],
  );

  const isEmpty = status === "success" && data.length === 0;

  return {
    status,
    data,
    error,
    isCreating,
    handleCreateJobDescription,
    isEmpty,
  };
};
