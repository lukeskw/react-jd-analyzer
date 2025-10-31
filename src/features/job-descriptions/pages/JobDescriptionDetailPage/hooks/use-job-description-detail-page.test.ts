import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useJobDescriptionDetailPage } from "@/features/job-descriptions/pages/JobDescriptionDetailPage/hooks/use-job-description-detail-page";

function noop() {}

const toast = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));
const useCandidatesMock = vi.hoisted(() => vi.fn());
function mockedDebounceEffect(callback: () => void) {
  callback();
  return noop;
}
let parametersMock: Record<string, string | undefined>;
let locationStateMock: unknown;
let searchParameters: URLSearchParams;
const setSearchParametersMock = vi.fn();

vi.mock("sonner", () => ({
  toast,
}));

vi.mock("@/features/job-descriptions/hooks/use-candidates", () => ({
  useCandidates: () => useCandidatesMock(),
}));

vi.mock("@/features/job-descriptions/utils", async () => {
  const actual = await vi.importActual<
    typeof import("@/features/job-descriptions/utils")
  >("@/features/job-descriptions/utils");
  return {
    ...actual,
    debounceEffect: mockedDebounceEffect,
  };
});

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useParams: () => parametersMock,
    useLocation: () => ({ state: locationStateMock }),
    useSearchParams: () => [searchParameters, setSearchParametersMock] as const,
  };
});

describe("useJobDescriptionDetailPage", () => {
  beforeEach(() => {
    toast.error.mockReset();
    toast.success.mockReset();
    useCandidatesMock.mockReset();
    setSearchParametersMock.mockReset();
    parametersMock = { jdId: "JD-1" };
    locationStateMock = {
      job: {
        jd_id: "JD-1",
        title: "Frontend Engineer",
        candidate_count: 2,
      },
    };
    searchParameters = new URLSearchParams();
    useCandidatesMock.mockReturnValue({
      status: "success",
      list: [],
      error: undefined,
      fetch: vi.fn(),
      getOne: vi.fn(),
    });
  });

  it("fetches candidates on mount", () => {
    const fetch = vi.fn();
    useCandidatesMock.mockReturnValue({
      status: "loading",
      list: [],
      error: undefined,
      fetch,
      getOne: vi.fn(),
    });

    renderHook(() => useJobDescriptionDetailPage());

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.title).toBe("Opening details - Frontend Engineer");
  });

  it("filters candidates by the search parameter", () => {
    searchParameters = new URLSearchParams("candidateId=cand");
    useCandidatesMock.mockReturnValue({
      status: "success",
      list: [
        {
          id: "cand-1",
          candidate_name: "One",
          fit_score: 80,
          candidate_email: undefined,
          summary: "",
          strengths: [],
          weaknesses: [],
          evidence: "",
        },
        {
          id: "other",
          candidate_name: "Other",
          fit_score: 70,
          candidate_email: undefined,
          summary: "",
          strengths: [],
          weaknesses: [],
          evidence: "",
        },
      ],
      error: undefined,
      fetch: vi.fn(),
      getOne: vi.fn(),
    });

    const { result } = renderHook(() => useJobDescriptionDetailPage());

    expect(result.current.filteredCandidates).toHaveLength(1);
    expect(result.current.filteredCandidates[0]?.id).toBe("cand-1");
    expect(result.current.hasSearchFilter).toBe(true);
  });

  it("handles search changes by updating the query string", () => {
    searchParameters = new URLSearchParams();
    const { result } = renderHook(() => useJobDescriptionDetailPage());

    act(() => {
      result.current.handleCandidateIdSearchChange("1234");
    });

    expect(setSearchParametersMock).toHaveBeenCalledTimes(1);
    const nextSearchParameters = setSearchParametersMock.mock
      .calls[0][0] as URLSearchParams;
    expect(nextSearchParameters.get("candidateId")).toBe("1234");
  });

  it("loads a single candidate and opens the detail sheet", async () => {
    const candidate = {
      id: "cand-1",
      candidate_name: "Alice",
      candidate_email: "alice@example.com",
      fit_score: 90,
      summary: "Summary",
      strengths: [],
      weaknesses: [],
      evidence: "",
    };
    const getOne = vi.fn().mockResolvedValue(candidate);
    useCandidatesMock.mockReturnValue({
      status: "success",
      list: [candidate],
      error: undefined,
      fetch: vi.fn(),
      getOne,
    });

    const { result } = renderHook(() => useJobDescriptionDetailPage());

    await act(async () => {
      await result.current.handleOpenCandidate("cand-1");
    });

    expect(getOne).toHaveBeenCalledWith("cand-1");
    expect(result.current.selectedCandidate).toEqual(candidate);
    expect(result.current.detailOpen).toBe(true);

    act(() => {
      result.current.handleDetailOpenChange(false);
    });

    expect(result.current.selectedCandidate).toBeUndefined();
    expect(result.current.detailOpen).toBe(false);
  });

  it("shows an error toast when the candidate list fails to load", () => {
    useCandidatesMock.mockReturnValue({
      status: "error",
      list: [],
      error: "Request timed out",
      fetch: vi.fn(),
      getOne: vi.fn(),
    });

    renderHook(() => useJobDescriptionDetailPage());

    expect(toast.error).toHaveBeenCalledWith("Failed to load results", {
      description: "Request timed out",
    });
  });
});
