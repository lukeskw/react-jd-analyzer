import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ChangeEvent,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { useUploadResumes } from "@/features/job-descriptions/hooks/use-upload-resumes";
import {
  formatFileSize,
  getRemainingSlots,
  isUploadLimitReached,
} from "@/features/job-descriptions/utils";
import type { JobSummary } from "@/lib/api/types";

type LocationState = {
  job?: JobSummary;
};

export const useAddCandidatesPage = () => {
  const parameters = useParams<{ jdId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;
  const jobFromState = state.job;
  const candidateCount = jobFromState?.candidate_count;
  const remainingSlots = getRemainingSlots(candidateCount);
  const isLimitReached = isUploadLimitReached(candidateCount);
  const { files, errors, status, addFiles, removeAt, clear, submit } =
    useUploadResumes(parameters.jdId, remainingSlots);

  const fileInputReference = useRef<HTMLInputElement | null>(null);
  const jobTitle = useMemo(
    () => jobFromState?.title ?? "Job opening",
    [jobFromState?.title],
  );

  useEffect(() => {
    document.title = `Upload resumes • ${jobTitle}`;
  }, [jobTitle]);

  useEffect(() => {
    if (errors.length === 0) return;

    const message = errors.join(" ");
    toast.error("Unable to process the selected files", {
      description: message,
    });
  }, [errors]);

  useEffect(() => {
    if (parameters.jdId) return;
    toast.error("Job opening not found");
  }, [parameters.jdId]);

  const handleSelectFiles = useCallback(() => {
    fileInputReference.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { files: selected } = event.target;
      if (!selected) return;
      addFiles(selected);
      event.target.value = "";
    },
    [addFiles],
  );

  const handleSubmit = useCallback(async () => {
    try {
      const response = await submit();
      toast.success("Resumes uploaded", {
        description: `${response.queued_count} resume(s) queued.`,
        action: {
          label: "View candidates",
          onClick: () => navigate(`/app/job-descriptions/${response.jd_id}`),
        },
      });
    } catch {
      // Errors already surfaced through toasts by the hook state
    }
  }, [navigate, submit]);

  const isJobMissing = !parameters.jdId;

  return {
    params: parameters,
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
    fileInputRef: fileInputReference,
    isJobMissing,
  };
};

export { RESUME_UPLOAD_LIMIT as ADD_CANDIDATES_LIMIT } from "@/features/job-descriptions/utils";
