import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { JobDescriptionDetailPage } from "@/features/job-descriptions/pages/JobDescriptionDetailPage";
import { renderWithRouter } from "@/test-utilities";

const useJobDescriptionDetailPageMock = vi.fn();

vi.mock(
  "@/features/job-descriptions/pages/JobDescriptionDetailPage/hooks/use-job-description-detail-page",
  () => ({
    useJobDescriptionDetailPage: () => useJobDescriptionDetailPageMock(),
  }),
);

vi.mock(
  "@/features/job-descriptions/components/candidate-detail-sheet",
  () => ({
    CandidateDetailSheet: () => <div data-testid="candidate-detail-sheet" />,
  }),
);

describe("JobDescriptionDetailPage", () => {
  const baseHookResult = {
    job: undefined,
    jobTitle: "Job opening",
    status: "success" as const,
    error: undefined as string | undefined,
    filteredCandidates: [],
    hasSearchFilter: false,
    handleRefresh: vi.fn(),
    handleOpenCandidate: vi.fn(),
    detailOpen: false,
    handleDetailOpenChange: vi.fn(),
    selectedCandidate: undefined,
    loadingCandidateId: undefined,
    candidateIdSearch: "",
    handleCandidateIdSearchChange: vi.fn(),
    showEmptyState: false,
    isInitialLoading: false,
  };

  beforeEach(() => {
    useJobDescriptionDetailPageMock.mockReset();
  });

  it("renders the empty state when there are no candidates yet", () => {
    useJobDescriptionDetailPageMock.mockReturnValue({
      ...baseHookResult,
      showEmptyState: true,
      filteredCandidates: [],
    });

    renderWithRouter(<JobDescriptionDetailPage />);

    expect(screen.getByText(/No candidates available/i)).toBeInTheDocument();
  });

  it("shows a not-found message when filtering yields no candidates", () => {
    useJobDescriptionDetailPageMock.mockReturnValue({
      ...baseHookResult,
      hasSearchFilter: true,
      filteredCandidates: [],
    });

    renderWithRouter(<JobDescriptionDetailPage />);

    expect(screen.getByText(/No candidates found/i)).toBeInTheDocument();
  });

  it("renders candidate rows and triggers refresh and open handlers", async () => {
    const user = userEvent.setup();
    const handleRefresh = vi.fn();
    const handleOpenCandidate = vi.fn();

    useJobDescriptionDetailPageMock.mockReturnValue({
      ...baseHookResult,
      filteredCandidates: [
        {
          id: "candidate-1",
          candidate_name: "Alice Applicant",
          candidate_email: "alice@example.com",
          fit_score: 87,
          summary: "Skilled frontend engineer.",
          strengths: [],
          weaknesses: [],
          evidence: "",
        },
      ],
      handleRefresh,
      handleOpenCandidate,
    });

    renderWithRouter(<JobDescriptionDetailPage />);

    expect(screen.getByText("Alice Applicant")).toBeInTheDocument();
    expect(screen.getByText("candidate-1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Refresh results/i }));
    expect(handleRefresh).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /View details/i }));
    expect(handleOpenCandidate).toHaveBeenCalledWith("candidate-1");
  });
});
