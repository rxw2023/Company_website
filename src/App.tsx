import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CaseDetailPage from "@/pages/CaseDetailPage";
import FaqPage from "@/pages/FaqPage";
import AiChatWidget from "@/components/AiChatWidget/AiChatWidget";
export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/case/:id" element={<CaseDetailPage />} />
        <Route path="/faq" element={<FaqPage />} />
      </Routes>
      {/* AI 知识助手浮窗 - 全局可用 */}
      <AiChatWidget />
    </>
  );
}
