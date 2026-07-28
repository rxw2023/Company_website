import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import Home from "@/pages/Home";
import NotFoundPage from "@/pages/NotFoundPage";
import AiChatWidget from "@/components/AiChatWidget/AiChatWidget";
import LoadingScreen from "@/components/LoadingScreen";

// 页面懒加载 - 按需加载减少初始包体积
const ProductDetailPage = lazy(() => import("@/pages/ProductDetailPage"));
const CaseDetailPage = lazy(() => import("@/pages/CaseDetailPage"));
const FaqPage = lazy(() => import("@/pages/FaqPage"));

function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/**
 * 自动去掉 URL 尾部斜杠，确保路由匹配一致
 * /product/a1/ -> /product/a1
 */
function TrailingSlashRedirect() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (location.pathname !== "/" && location.pathname.endsWith("/")) {
      navigate(
        location.pathname.slice(0, -1) + location.search + location.hash,
        { replace: true }
      );
    }
  }, [location, navigate]);
  return null;
}

export default function App() {
  return (
    <>
      <LoadingScreen />
      <TrailingSlashRedirect />
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/case/:id" element={<CaseDetailPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      {/* AI 知识助手浮窗 - 全局可用 */}
      <AiChatWidget />
    </>
  );
}
