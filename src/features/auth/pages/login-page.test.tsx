import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { LoginPage } from "@/features/auth/pages/login-page";
import { renderWithRouter } from "@/test-utilities";

const navigateMock = vi.fn();
const useAuthMock = vi.fn();

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

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => useAuthMock(),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    useAuthMock.mockReset();
  });

  it("renders the sign-in form and sets the document title", () => {
    useAuthMock.mockReturnValue({
      login: vi.fn(),
      status: "idle",
      token: undefined,
    });

    renderWithRouter(<LoginPage />);

    expect(
      screen.getByRole("heading", { name: /sign in/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(document.title).toBe("Sign in - JD Analyzer");
  });

  it("submits the form and navigates to the job descriptions list", async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockResolvedValue();
    useAuthMock.mockReturnValue({
      login,
      status: "idle",
      token: undefined,
    });

    renderWithRouter(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "password123",
      });
    });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/app/job-descriptions", {
        replace: true,
      });
    });
  });

  it("redirects immediately when a token is already available", () => {
    useAuthMock.mockReturnValue({
      login: vi.fn(),
      status: "idle",
      token: "existing-token",
    });

    renderWithRouter(<LoginPage />);

    expect(navigateMock).toHaveBeenCalledWith("/app/job-descriptions", {
      replace: true,
    });
  });
});
