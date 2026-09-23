import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { MotionConfig } from "framer-motion";
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

/**
 * 跳到主内容。
 * 键盘/读屏用户此前必须先 Tab 过整个导航栏才能到达正文 ——
 * 首页导航项 + 搜索按钮 + 聊天浮窗按钮有近十个可聚焦元素。
 * 平时视觉隐藏，获得焦点时才出现。
 */
function SkipToContent() {
  return (
    <a
      href="#main-content"
      style={{
        position: 'absolute',
        left: 12,
        top: -60,
        zIndex: 10000,
        padding: '10px 16px',
        background: 'var(--warm-primary)',
        color: '#fff',
        borderRadius: 8,
        fontSize: 14,
        textDecoration: 'none',
        transition: 'top 0.15s',
      }}
      onFocus={(e) => {
        e.currentTarget.style.top = '12px';
      }}
      onBlur={(e) => {
        e.currentTarget.style.top = '-60px';
      }}
    >
      跳到主要内容
    </a>
  );
}

export default function App() {
  return (
    /**
     * reducedMotion="user"：全站所有 framer-motion 声明式动画统一遵守
     * 系统的「减弱动态效果」偏好 —— 自动跳过位移/缩放等 transform 动画，
     * 只保留透明度过渡。
     *
     * 注意：以下三类**不受此配置管控**，各自做了显式降级：
     *   · 命令式动画（animate()）—— CountUp、LoadingScreen 进度条
     *   · 直接绑定的 motion value（useScroll/useTransform）—— 首页 hero 与 CTA 视差
     *   · Canvas 绘制 —— SoundField 声场、Ma600dCurtain 拾音场帷幕
     * 另有纯 CSS 动画与过渡，由 src/index.css 的 prefers-reduced-motion 兜底。
     */
    <MotionConfig reducedMotion="user">
      <SkipToContent />
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
    </MotionConfig>
  );
}
