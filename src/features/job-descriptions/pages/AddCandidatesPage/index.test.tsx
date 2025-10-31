import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, beforeEach, expect, it, vi } from "vitest";

import { AddCandidatesPage } from "@/features/job-descriptions/pages/AddCandidatesPage";
import { renderWithRouter } from "@/test-utilities";

const useAddCandidatesPageMock = vi.fn();

vi.mock(
  "@/features/job-descriptions/pages/AddCandidatesPage/hooks/use-add-candidates-page",
  () => ({
    useAddCandidatesPage: () => useAddCandidatesPageMock(),
    ADD_CANDIDATES_LIMIT: 10,
  }),
);

describe("AddCandidatesPage", () => {
  const baseHookResult = {
    jobFromState: undefined,
    candidateCount: undefined,
    jobTitle: "Job opening",
    remainingSlots: 3,
    isLimitReached: false,
    files: [] as File[],
    status: "idle" as const,
    removeAt: vi.fn(),
    clear: vi.fn(),
    formatFileSize: (size: number) => `${size}B`,
    handleSelectFiles: vi.fn(),
    handleFileChange: vi.fn(),
    handleSubmit: vi.fn(),
    fileInputRef: { current: undefined },
    isJobMissing: false,
  };

  beforeEach(() => {
    useAddCandidatesPageMock.mockReset();
  });

  it("shows a warning when the job is missing", () => {
    useAddCandidatesPageMock.mockReturnValue({
      ...baseHookResult,
      isJobMissing: true,
    });

    renderWithRouter(<AddCandidatesPage />);

    expect(screen.getByText(/Job opening not found/i)).toBeInTheDocument();
  });

  it("renders the file upload card with the empty state message", () => {
    useAddCandidatesPageMock.mockReturnValue({
      ...baseHookResult,
      files: [],
      isLimitReached: false,
    });

    renderWithRouter(<AddCandidatesPage />);

    expect(screen.getByText(/upload resumes/i)).toBeInTheDocument();
    expect(screen.getByText(/no files selected/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add resumes/i })).toBeEnabled();
  });

  it("allows selecting files and submitting uploads", async () => {
    const user = userEvent.setup();
    const handleSelectFiles = vi.fn();
    const handleSubmit = vi.fn();
    const clear = vi.fn();

    useAddCandidatesPageMock.mockReturnValue({
      ...baseHookResult,
      files: [new File(["resume"], "resume.pdf", { type: "application/pdf" })],
      handleSelectFiles,
      handleSubmit,
      clear,
    });

    renderWithRouter(<AddCandidatesPage />);

    await user.click(screen.getByRole("button", { name: /add resumes/i }));
    expect(handleSelectFiles).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /clear/i }));
    expect(clear).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /upload/i }));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
