import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CaseDetailPage from "@/pages/CaseDetailPage";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/case/:id" element={<CaseDetailPage />} />
    </Routes>
  );
}
