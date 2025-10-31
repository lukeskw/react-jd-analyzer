import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useJobDescriptionListPage } from "@/features/job-descriptions/pages/JobDescriptionListPage/hooks/use-job-description-list-page";

const toast = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));
const navigateMock = vi.hoisted(() => vi.fn());
const useJobDescriptionListMock = vi.hoisted(() => vi.fn());

vi.mock("sonner", () => ({
  toast,
}));

vi.mock("@/features/job-descriptions/hooks/use-job-description-list", () => ({
  useJobDescriptionList: () => useJobDescriptionListMock(),
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe("useJobDescriptionListPage", () => {
  beforeEach(() => {
    toast.error.mockReset();
    toast.success.mockReset();
    navigateMock.mockReset();
    useJobDescriptionListMock.mockReset();
    useJobDescriptionListMock.mockReturnValue({
      status: "idle",
      data: [],
      error: undefined,
      isCreating: false,
      fetch: vi.fn(),
      createJobDescription: vi.fn(),
    });
  });

  it("fetches job descriptions on mount", () => {
    const fetch = vi.fn();
    useJobDescriptionListMock.mockReturnValue({
      status: "idle",
      data: [],
      error: undefined,
      isCreating: false,
      fetch,
      createJobDescription: vi.fn(),
    });

    renderHook(() => useJobDescriptionListPage());

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.title).toBe("JobDescriptions • JobDescription Analyzer");
  });

  it("marks the list as empty when there are no openings", () => {
    useJobDescriptionListMock.mockReturnValue({
      status: "success",
      data: [],
      error: undefined,
      isCreating: false,
      fetch: vi.fn(),
      createJobDescription: vi.fn(),
    });

    const { result } = renderHook(() => useJobDescriptionListPage());

    expect(result.current.isEmpty).toBe(true);
  });

  it("shows an error toast when fetching fails", () => {
    useJobDescriptionListMock.mockReturnValue({
      status: "error",
      data: [],
      error: "Server unavailable",
      isCreating: false,
      fetch: vi.fn(),
      createJobDescription: vi.fn(),
    });

    renderHook(() => useJobDescriptionListPage());

    expect(toast.error).toHaveBeenCalledWith(
      "Unable to load job openings",
      expect.objectContaining({
        description: "Server unavailable",
      }),
    );
  });

  it("creates a new job description and navigates to the add page", async () => {
    const createJobDescription = vi.fn().mockResolvedValue({
      jd_id: "JD-100",
      title: "New opening",
    });
    useJobDescriptionListMock.mockReturnValue({
      status: "success",
      data: [],
      error: undefined,
      isCreating: false,
      fetch: vi.fn(),
      createJobDescription,
    });

    const { result } = renderHook(() => useJobDescriptionListPage());
    const payload = {
      title: "New opening",
      file: new File(["content"], "job.pdf", {
        type: "application/pdf",
      }),
    };

    await act(async () => {
      await result.current.handleCreateJobDescription(payload);
    });

    expect(createJobDescription).toHaveBeenCalledWith(payload);
    expect(toast.success).toHaveBeenCalledWith(
      "Job opening created successfully",
      expect.objectContaining({
        description: "You can add resumes now.",
      }),
    );
    expect(navigateMock).toHaveBeenCalledWith(
      "/app/job-descriptions/JD-100/add",
      expect.objectContaining({
        state: {
          job: {
            candidate_count: 0,
            jd_id: "JD-100",
            title: "New opening",
          },
        },
      }),
    );

    const successToast = vi.mocked(toast.success);
    const action = successToast.mock.calls[0]?.[1]?.action as
      | { label: string; onClick: () => void }
      | undefined;
    expect(action).toBeDefined();
    action?.onClick();
    expect(navigateMock).toHaveBeenCalledWith(
      "/app/job-descriptions/JD-100/add",
      expect.objectContaining({
        state: {
          job: {
            candidate_count: 0,
            jd_id: "JD-100",
            title: "New opening",
          },
        },
      }),
    );
  });
});
