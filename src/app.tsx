import { Suspense } from "react";

import { Toaster } from "sonner";

import { AuthProvider } from "@/hooks/use-auth";
import {
  AddCandidatesPage,
  AppLayout,
  JobDescriptionDetailPageComponent,
  JobDescriptionListPage,
  LoginPage,
  ProtectedRoute,
} from "@/lib/routes";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FullscreenLoader } from "./components/layout/fullscreen-loader";

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
