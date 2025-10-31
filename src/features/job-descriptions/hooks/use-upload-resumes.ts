import { useCallback, useMemo, useState } from "react";

import { extractErrorMessage, isValidationError } from "@/lib/api/errors";
import * as jdsApi from "@/lib/api/job-descriptions";
import type { UploadResumesResponse } from "@/lib/api/types";

const DEFAULT_MAX_FILES = 20;
const MAX_FILE_SIZE_MB = 5;
const ALLOWED_MIME_TYPES = new Set(["application/pdf"]);

const bytesFromMB = (mb: number) => mb * 1024 * 1024;

type UploadStatus = "idle" | "submitting";

export const useUploadResumes = (
  jdId: string | undefined,
  maxAllowedFiles: number = DEFAULT_MAX_FILES,
) => {
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<UploadStatus>("idle");

  const clearErrors = useCallback(() => setErrors([]), []);
  const maxFiles = useMemo(
    () => Math.max(0, maxAllowedFiles ?? DEFAULT_MAX_FILES),
    [maxAllowedFiles],
  );

  const addFiles = useCallback(
    (input: FileList | File[]) => {
      clearErrors();
      const incoming = [...input];
      const newErrors: string[] = [];

      if (maxFiles === 0) {
        newErrors.push("This opening already reached the resume limit.");
        setErrors(newErrors);
        return;
      }

      const filtered = incoming.filter((file) => {
        if (
          !ALLOWED_MIME_TYPES.has(file.type) &&
          !file.name.toLowerCase().endsWith(".pdf")
        ) {
          newErrors.push(`${file.name}: only PDFs are accepted.`);
          return false;
        }
        if (file.size > bytesFromMB(MAX_FILE_SIZE_MB)) {
          newErrors.push(
            `${file.name}: maximum size is ${MAX_FILE_SIZE_MB}MB.`,
          );
          return false;
        }
        return true;
      });

      const next = [...files, ...filtered];
      if (next.length > maxFiles) {
        newErrors.push(
          `Select at most ${maxFiles} ${maxFiles === 1 ? "resume" : "resumes"}.`,
        );
        setErrors(newErrors);
        return;
      }

      setFiles(next);
      setErrors(newErrors);
    },
    [clearErrors, files, maxFiles],
  );

  const removeAt = useCallback(
    (index: number) => {
      clearErrors();
      setFiles((previous) => previous.filter((_, index_) => index_ !== index));
    },
    [clearErrors],
  );

  const clear = useCallback(() => {
    clearErrors();
    setFiles([]);
  }, [clearErrors]);

  const submit = useCallback(async (): Promise<UploadResumesResponse> => {
    clearErrors();
    if (!jdId) {
      throw new Error("JD not found.");
    }
    if (files.length === 0) {
      if (maxFiles === 0) {
        setErrors([
          "This opening already reached the resume limit of 20 resumes.",
        ]);
      } else {
        setErrors([
          `Select between 1 and ${maxFiles} PDF ${maxFiles === 1 ? "resume" : "resumes"}.`,
        ]);
      }
      throw new Error("No file selected.");
    }

    setStatus("submitting");
    try {
      const response = await jdsApi.uploadResumes({ jdId, files });
      clear();
      return response;
    } catch (error) {
      console.error("Error uploading resumes", error);
      if (isValidationError(error)) {
        const messages = Object.values(
          error.response?.data?.errors ?? {},
        ).flat();
        setErrors(messages);
      } else {
        setErrors([extractErrorMessage(error)]);
      }
      throw error;
    } finally {
      setStatus("idle");
    }
  }, [clear, clearErrors, files, jdId, maxFiles]);

  return useMemo(
    () => ({
      files,
      errors,
      status,
      addFiles,
      removeAt,
      clear,
      submit,
    }),
    [addFiles, clear, errors, files, removeAt, status, submit],
  );
};
