import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@/pages/login-page";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { AuthGuard } from "@/components/auth-guard";
import { HomePage } from "@/pages/home/home-page";
import { AiAdsPage } from "@/pages/ai-ads-page";
import { AnalyticsPage } from "@/pages/analytics-page";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AuthGuard />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/ai-ads" element={<AiAdsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
