import type { ChangeEvent } from "react";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAddCandidatesPage } from "@/features/job-descriptions/pages/AddCandidatesPage/hooks/use-add-candidates-page";

const toast = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));
const navigateMock = vi.hoisted(() => vi.fn());
const useUploadResumesMock = vi.hoisted(() => vi.fn());

let parametersMock: Record<string, string | undefined>;
let locationStateMock: unknown;

vi.mock("sonner", () => ({
  toast,
}));

vi.mock("@/features/job-descriptions/hooks/use-upload-resumes", () => ({
  useUploadResumes: useUploadResumesMock,
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => parametersMock,
    useLocation: () => ({ state: locationStateMock }),
  };
});

describe("useAddCandidatesPage", () => {
  beforeEach(() => {
    parametersMock = { jdId: "JD-1" };
    locationStateMock = {
      job: { jd_id: "JD-1", title: "Frontend Engineer", candidate_count: 2 },
    };
    navigateMock.mockReset();
    toast.error.mockReset();
    toast.success.mockReset();
    useUploadResumesMock.mockReset();
    useUploadResumesMock.mockReturnValue({
      files: [],
      errors: [],
      status: "idle",
      addFiles: vi.fn(),
      removeAt: vi.fn(),
      clear: vi.fn(),
      submit: vi.fn().mockResolvedValue({
        queued_count: 2,
        jd_id: "JD-1",
      }),
    });
  });

  it("derives job details from the router state and updates the document title", () => {
    renderHook(() => useAddCandidatesPage());

    expect(document.title).toBe("Upload resumes • Frontend Engineer");
  });

  it("adds selected files when the change handler is triggered", () => {
    const addFiles = vi.fn();
    useUploadResumesMock.mockReturnValue({
      files: [],
      errors: [],
      status: "idle",
      addFiles,
      removeAt: vi.fn(),
      clear: vi.fn(),
      submit: vi.fn(),
    });

    const { result } = renderHook(() => useAddCandidatesPage());
    const file = new File(["content"], "resume.pdf", {
      type: "application/pdf",
    });
    const fileList = {
      0: file,
      length: 1,
      item: () => file,
    } as unknown as FileList;
    const event = {
      target: { files: fileList, value: "stale" },
    } as unknown as ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleFileChange(event);
    });

    expect(addFiles).toHaveBeenCalledWith(fileList);
    expect(event.target.value).toBe("");
  });

  it("submits uploads and shows a success toast", async () => {
    const submit = vi.fn().mockResolvedValue({
      queued_count: 3,
      jd_id: "JD-2",
    });
    useUploadResumesMock.mockReturnValue({
      files: [],
      errors: [],
      status: "idle",
      addFiles: vi.fn(),
      removeAt: vi.fn(),
      clear: vi.fn(),
      submit,
    });
    parametersMock = { jdId: "JD-2" };
    locationStateMock = {
      job: { jd_id: "JD-2", title: "Backend Engineer", candidate_count: 1 },
    };

    const { result } = renderHook(() => useAddCandidatesPage());

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(submit).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith("Resumes uploaded", {
      description: "3 resume(s) queued.",
      action: expect.objectContaining({
        label: "View candidates",
      }),
    });

    const successToast = vi.mocked(toast.success);
    const action = successToast.mock.calls[0]?.[1]?.action as
      | { label: string; onClick: () => void }
      | undefined;
    expect(action).toBeDefined();
    action?.onClick();
    expect(navigateMock).toHaveBeenCalledWith("/app/job-descriptions/JD-2");
  });

  it("shows a toast when upload errors are present", () => {
    useUploadResumesMock.mockReturnValue({
      files: [],
      errors: ["File too large", "Invalid format"],
      status: "idle",
      addFiles: vi.fn(),
      removeAt: vi.fn(),
      clear: vi.fn(),
      submit: vi.fn(),
    });

    renderHook(() => useAddCandidatesPage());

    expect(toast.error).toHaveBeenCalledWith(
      "Unable to process the selected files",
      expect.objectContaining({
        description: "File too large Invalid format",
      }),
    );
  });

  it("marks the job as missing when the identifier is absent", () => {
    parametersMock = {};
    locationStateMock = {};

    const { result } = renderHook(() => useAddCandidatesPage());

    expect(result.current.isJobMissing).toBe(true);
    expect(toast.error).toHaveBeenCalledWith("Job opening not found");
  });
});
