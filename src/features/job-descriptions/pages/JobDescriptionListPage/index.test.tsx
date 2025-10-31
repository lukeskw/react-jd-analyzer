import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { JobDescriptionListPage } from "@/features/job-descriptions/pages/JobDescriptionListPage";
import { renderWithRouter } from "@/test-utilities";

const useJobDescriptionListPageMock = vi.fn();

vi.mock(
  "@/features/job-descriptions/pages/JobDescriptionListPage/hooks/use-job-description-list-page",
  () => ({
    useJobDescriptionListPage: () => useJobDescriptionListPageMock(),
  }),
);

vi.mock(
  "@/features/job-descriptions/components/add-job-description-dialog",
  () => ({
    AddJobDescriptionDialog: ({
      onSubmit,
      isSubmitting,
    }: {
      onSubmit: (payload: { title: string; file: File }) => void;
      isSubmitting: boolean;
    }) => (
      <button
        type="button"
        data-testid="add-job-description"
        disabled={isSubmitting}
        onClick={() =>
          onSubmit({
            title: "Example opening",
            file: new File(["content"], "job.pdf", {
              type: "application/pdf",
            }),
          })
        }
      >
        Add opening
      </button>
    ),
  }),
);

describe("JobDescriptionListPage", () => {
  const baseHookResult = {
    status: "success" as const,
    data: [],
    error: undefined as string | undefined,
    isCreating: false,
    handleCreateJobDescription: vi.fn(),
    isEmpty: false,
  };

  beforeEach(() => {
    useJobDescriptionListPageMock.mockReset();
  });

  it("shows an empty state message when there are no openings", () => {
    useJobDescriptionListPageMock.mockReturnValue({
      ...baseHookResult,
      status: "success" as const,
      isEmpty: true,
    });

    renderWithRouter(<JobDescriptionListPage />);

    expect(screen.getByText(/No openings yet/i)).toBeInTheDocument();
  });

  it("renders a table row for each job description", () => {
    useJobDescriptionListPageMock.mockReturnValue({
      ...baseHookResult,
      data: [
        { jd_id: "JD-001", title: "Frontend Engineer", candidate_count: 4 },
      ],
    });

    renderWithRouter(<JobDescriptionListPage />);

    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("JD-001")).toBeInTheDocument();
  });

  it("surfaces an error message when fetching fails", () => {
    useJobDescriptionListPageMock.mockReturnValue({
      ...baseHookResult,
      error: "Request failed",
    });

    renderWithRouter(<JobDescriptionListPage />);

    expect(
      screen.getByText(/Unable to load job openings/i),
    ).toBeInTheDocument();
  });

  it("passes the submit handler to the add dialog", async () => {
    const user = userEvent.setup();
    const handleCreateJobDescription = vi.fn().mockResolvedValue(undefined);

    useJobDescriptionListPageMock.mockReturnValue({
      ...baseHookResult,
      handleCreateJobDescription,
    });

    renderWithRouter(<JobDescriptionListPage />);

    await user.click(screen.getByTestId("add-job-description"));
    expect(handleCreateJobDescription).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Example opening",
      }),
    );
  });
});
