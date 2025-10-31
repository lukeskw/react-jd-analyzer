import { useAuth } from "@/hooks/use-auth";
import { lazy } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { FullscreenLoader } from "@/components/layout/fullscreen-loader";

export const AppLayout = lazy(() =>
  import("@/components/layout/app-layout").then((module) => ({
    default: module.AppLayout,
  })),
);

export const LoginPage = lazy(() =>
  import("@/features/auth/pages/login-page").then((module) => ({
    default: module.LoginPage,
  })),
);

export const AddCandidatesPage = lazy(() =>
  import("@/features/job-descriptions/pages/AddCandidatesPage").then(
    (module) => ({
      default: module.AddCandidatesPage,
    }),
  ),
);

export const JobDescriptionDetailPageComponent = lazy(() =>
  import("@/features/job-descriptions/pages/JobDescriptionDetailPage").then(
    (module) => ({
      default: module.JobDescriptionDetailPage,
    }),
  ),
);

export const JobDescriptionListPage = lazy(() =>
  import("@/features/job-descriptions/pages/JobDescriptionListPage").then(
    (module) => ({
      default: module.JobDescriptionListPage,
    }),
  ),
);

export const ProtectedRoute = () => {
  const { token, status } = useAuth();

  if (status === "loading") {
    return <FullscreenLoader />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
