import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Home from "@/pages/Home";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CaseDetailPage from "@/pages/CaseDetailPage";
import FaqPage from "@/pages/FaqPage";
import NotFoundPage from "@/pages/NotFoundPage";
import AiChatWidget from "@/components/AiChatWidget/AiChatWidget";

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
      <TrailingSlashRedirect />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/case/:id" element={<CaseDetailPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {/* AI 知识助手浮窗 - 全局可用 */}
      <AiChatWidget />
    </>
  );
}
