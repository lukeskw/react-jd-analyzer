import { Suspense, lazy } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

const AppLayout = lazy(() =>
  import("@/components/layout/app-layout").then((module) => ({
    default: module.AppLayout,
  })),
);

const LoginPage = lazy(() =>
  import("@/features/auth/pages/login-page").then((module) => ({
    default: module.LoginPage,
  })),
);

const AddCandidatesPage = lazy(() =>
  import("@/features/job-descriptions/pages/AddCandidatesPage").then(
    (module) => ({
      default: module.AddCandidatesPage,
    }),
  ),
);

const JobDescriptionDetailPageComponent = lazy(() =>
  import("@/features/job-descriptions/pages/JobDescriptionDetailPage").then(
    (module) => ({
      default: module.JobDescriptionDetailPage,
    }),
  ),
);

const JobDescriptionListPage = lazy(() =>
  import("@/features/job-descriptions/pages/JobDescriptionListPage").then(
    (module) => ({
      default: module.JobDescriptionListPage,
    }),
  ),
);

const FullscreenLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="flex items-end justify-center gap-2">
      <Loader2 className="size-8 animate-spin" />
    </div>
  </div>
);

const ProtectedRoute = () => {
  const { token, status } = useAuth();

  if (status === "loading") {
    return <FullscreenLoader />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<FullscreenLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<AppLayout />}>
                <Route
                  index
                  element={<Navigate to="job-descriptions" replace />}
                />
                <Route
                  path="job-descriptions"
                  element={<JobDescriptionListPage />}
                />
                <Route
                  path="job-descriptions/:jdId"
                  element={<JobDescriptionDetailPageComponent />}
                />
                <Route
                  path="job-descriptions/:jdId/add"
                  element={<AddCandidatesPage />}
                />
              </Route>
            </Route>
            <Route
              path="*"
              element={<Navigate to="/app/job-descriptions" replace />}
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster richColors closeButton duration={10_000} />
    </AuthProvider>
  );
}

export default App;
