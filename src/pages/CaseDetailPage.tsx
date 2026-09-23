import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import Navigation from '../components/Navigation';
import { motion } from 'framer-motion';
import SeoHead from '../components/SeoHead';
import {
  responsiveImageByUrl,
  CASE_IMAGE_SIZES,
  THUMB_SIZES,
} from '../data/responsiveImage';
import { CASE_IMAGE_BY_KEY, CASE_VIDEO_BY_KEY } from '../data/productImages';
import { getCaseDetail } from '../data/caseDetails';
import { getCase, casePath } from '../data/cases';
import type { CaseTagColor } from '../data/caseDetails';
function ImageLightbox({ 
  isOpen, 
  images, 
  currentIndex, 
  onClose,
  onPrev,
  onNext
}: { 
  isOpen: boolean; 
  images: string[]; 
  currentIndex: number; 
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (!isOpen) return null;
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative max-w-5xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={images[currentIndex]} 
          alt="放大查看" 
          className="w-full h-full object-contain"
          loading="lazy"
        />
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
          onClick={onPrev}
        >
          <i className="fa-solid fa-chevron-left text-xl"></i>
        </button>
        
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
          onClick={onNext}
        >
          <i className="fa-solid fa-chevron-right text-xl"></i>
        </button>
        <button
          className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          onClick={onClose}
        >
          <i className="fa-solid fa-times text-xl"></i>
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-1.5 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </motion.div>
    </motion.div>
  );
}
function VideoPlayer({
  url,
  poster,
  onPlay,
}: {
  url: string;
  poster?: string;
  onPlay?: () => void;
}) {
  return (
    <div className="relative aspect-video bg-white rounded-lg overflow-hidden group shadow-sm border border-gray-200">
      {/*
        此前这里写了三份 <source> 分别标 mp4 / webm / ogg，但 src **全是同一个 mp4 文件** ——
        回退到 webm/ogg 时浏览器拿到的还是 mp4，标注意义为零、只是误导。现在只留一份。
        另加 preload="none"：e1.mp4 有 8.4 MB，不点播放就不该产生任何视频流量；
        poster 用案例首图，未播放时也有画面。
      */}
      <video
        controls
        preload="none"
        poster={poster}
        className="w-full h-full object-contain"
        onPlay={onPlay}
      >
        <source src={url} type="video/mp4" />
        您的浏览器不支持视频播放
      </video>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-black/5">
        <i className="fa-solid fa-play text-white text-4xl drop-shadow-lg"></i>
      </div>
    </div>
  );
}
// 标签颜色映射。用 Record<CaseTagColor, string> 而不是裸对象：
// cases.json 里写了一个没登记的 tagColor 时，这里会直接编译报错，
// 而不是在页面上渲染出 undefined 类名（角标静默丢失背景色）。
const tagColorClasses: Record<CaseTagColor, string> = {
  red: 'bg-red-500 hover:bg-red-600',
  blue: 'bg-blue-500 hover:bg-blue-600',
  green: 'bg-green-500 hover:bg-green-600',
  purple: 'bg-purple-500 hover:bg-purple-600',
  orange: 'bg-orange-500 hover:bg-orange-600',
  pink: 'bg-pink-500 hover:bg-pink-600',
  indigo: 'bg-indigo-500 hover:bg-indigo-600',
  gray: 'bg-gray-500 hover:bg-gray-600',
  yellow: 'bg-yellow-500 hover:bg-yellow-600',
};
export default function CaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentLightboxIndex, setCurrentLightboxIndex] = useState(0);
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [id]);
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showLightbox) {
        closeLightbox();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showLightbox]);
  /**
   * 详情级与卡片级分两个文件（见 src/data/caseDetails.ts 的说明）。
   * 页面需要两边：正文来自 detail，meta description 来自 card。
   */
  const caseItem = getCaseDetail(id);
  const card = getCase(id);
  /**
   * JSON 里只存资源 key，这里映射成打包后的 URL。
   * 映射表里查不到的 key 会得到 undefined —— 过滤掉而不是渲染出 src={undefined}，
   * doctor 会另外校验「cases.json 里的每个 key 都在映射表里」。
   */
  const images = (caseItem?.images ?? [])
    .map((key) => CASE_IMAGE_BY_KEY[key])
    .filter((url): url is string => Boolean(url));
  const videos = (caseItem?.videos ?? [])
    .map((key) => CASE_VIDEO_BY_KEY[key])
    .filter((url): url is string => Boolean(url));
  if (!caseItem || !card) {
    navigate('/');
    return null;
  }
  const openLightbox = (index: number) => {
    setCurrentLightboxIndex(index);
    setShowLightbox(true);
    document.body.style.overflow = 'hidden';
  };
  const closeLightbox = () => {
    setShowLightbox(false);
    document.body.style.overflow = 'auto';
  };
  const goToPrevImage = () => {
    setCurrentLightboxIndex(prevIndex => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };
  const goToNextImage = () => {
    setCurrentLightboxIndex(prevIndex => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };
  return (
    <>
      <SeoHead
        title={caseItem.detailTitle}
        // 用事实源里的 seoDescription，而不是 `${detailTitle} - 一段固定模板`：
        // 后者会让 12 个案例页拿到近乎重复的 meta description，且与预渲染 HTML
        // 里写的那份不一致。现在两边同源。
        description={card.seoDescription}
        url={casePath(caseItem.id)}
        image={images[0]}
        type="article"
        breadcrumbs={[
          { name: '首页', url: '/' },
          { name: '案例', url: '/' },
          { name: caseItem.detailTitle, url: casePath(caseItem.id) },
        ]}
      />
      <ImageLightbox 
        isOpen={showLightbox} 
        images={images}
        currentIndex={currentLightboxIndex}
        onClose={closeLightbox}
        onPrev={goToPrevImage}
        onNext={goToNextImage}
      />
      <Navigation />
      <div id="main-content" tabIndex={-1} className="min-h-screen text-[var(--warm-body)] pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Header 
            showAiSpeechLogo={true}
          />
          <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* 图片展示区域 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--warm-ink)] flex items-center gap-2">
                <i className="fa-solid fa-images text-[var(--warm-primary)]"></i>
                案例图片
              </h3>
              <div 
                className="relative aspect-video bg-white rounded-lg overflow-hidden cursor-pointer"
                onClick={() => openLightbox(selectedImageIndex)}
              >
                <img 
                  {...responsiveImageByUrl(images[selectedImageIndex], CASE_IMAGE_SIZES)}
                  src={images[selectedImageIndex]} 
                  alt={caseItem.detailTitle}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                  <i className="fa-solid fa-expand text-white text-3xl"></i>
                </div>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-14 rounded-md overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index 
                          ? 'border-blue-600 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img 
                        {...responsiveImageByUrl(image, THUMB_SIZES)}
                        src={image} 
                        alt={`缩略图 ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  ))}
                </div>
              )}             
              {/* 视频展示区域 */}
              {videos.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-[var(--warm-ink)] flex items-center gap-2">
                    <i className="fa-solid fa-video text-[var(--warm-primary)]"></i>
                    案例视频
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {videos.map((url, index) => (
                      <VideoPlayer 
                        key={index}
                        url={url}
                        poster={images[0]}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* 案例信息区域 */}
            <div>
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold">{caseItem.detailTitle}</h1>
                {caseItem.detailTag && (
                  <span className={`${tagColorClasses[caseItem.tagColor || 'red']} text-white text-sm px-3 py-1 rounded transition-colors`}>
                    {caseItem.detailTag}
                  </span>
                )}
              </div>
              <div className="bg-[var(--warm-surface)] rounded-xl p-6 space-y-6">
                {caseItem.sections.map((section, index) => (
                  <div key={index}>
                    <h3 className="text-xl font-bold text-[var(--warm-primary)] mb-3">{section.label}：</h3>
                    <p className="text-[var(--warm-body)] text-base leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>
              {/* 联系方式 */}
              <div className="mt-6 text-sm text-[var(--warm-muted)]">
                <p>了解更多案例信息，请联系我们：</p>
                <p className="mt-1">guo@techhdi.com | 18814845538</p>
                <p className="mt-1">地址：杭州市余杭区七彩汇商业中心2-305室</p>
                <p className="text-xs mt-2 flex items-center gap-4" style={{color: 'var(--warm-on-dark-soft)'}}>
                  <a href="https://beian.miit.gov.cn/" target="_blank" rel="nofollow noopener" style={{color: 'var(--warm-on-dark-soft)', textDecoration: 'none'}} className="hover:text-[var(--warm-body)]">
                    ICP备案号：浙ICP备2026007647号-1
                  </a>
                  <a href="https://beian.mps.gov.cn/#/query/webSearch?code=33011002019014" rel="noreferrer" target="_blank" className="flex items-center">
                    <img src='https://beian.mps.gov.cn/img/logo01.dd7ff50e.png' alt="公安备案" className="w-4 h-4 mr-1" loading="lazy" />
                    浙公网安备33011002019014号
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
