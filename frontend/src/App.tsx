import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@/pages/login-page";
import { MetaCallbackPage } from "@/pages/meta-callback-page";
import { ShopifyCallbackPage } from "@/pages/shopify-callback-page";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { AuthGuard } from "@/components/auth-guard";
import { HomePage } from "@/pages/home/home-page";
import { AiAdsPage } from "@/pages/ai-ads/ai-ads-page";
import { AnalyticsPage } from "@/pages/analytics/analytics-page";
import { AiChatPage } from "@/pages/ai-chat";
import { WorkStationPage } from "@/pages/work-station-page";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/meta/callback" element={<MetaCallbackPage />} />
      <Route path="/shopify/callback" element={<ShopifyCallbackPage />} />
      <Route element={<AuthGuard />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/ai-ads" element={<AiAdsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/ai-chat" element={<AiChatPage />} />
          <Route path="/work-station" element={<WorkStationPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
