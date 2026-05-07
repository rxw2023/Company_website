import * as React from 'react';
const { useState, useEffect } = React;
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { motion } from 'framer-motion';
import e1Image from '../assets/images/e1.webp';
import e1Video from '../assets/videos/e1.mp4';
import e2Image from '../assets/images/e2.webp';
import e2Video from '../assets/videos/e2.mp4';
import e3Image1 from '../assets/images/e3-1.webp';
import e3Image2 from '../assets/images/e3-2.webp';
import e4Image1 from '../assets/images/e4-1.webp';
import e4Image2 from '../assets/images/e4-2.webp';
import e5Image1 from '../assets/images/e5-1.webp';
import e5Image2 from '../assets/images/e5-2.webp';
import e6Image1 from '../assets/images/e6-1.webp';
import e6Image2 from '../assets/images/e6-2.webp';
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
  onPlay 
}: { 
  url: string; 
  onPlay?: () => void;
}) {
  return (
    <div className="relative aspect-video bg-white rounded-lg overflow-hidden group shadow-sm border border-gray-200">
      <video
        controls
        className="w-full h-full object-contain"
        onPlay={onPlay}
      >
        <source src={url} type="video/mp4" />
        <source src={url} type="video/webm" />
        <source src={url} type="video/ogg" />
        您的浏览器不支持视频播放
      </video>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-black/5">
        <i className="fa-solid fa-play text-white text-4xl drop-shadow-lg"></i>
      </div>
    </div>
  );
}
interface CaseSection {
  label: string;
  content: string;
}
interface VideoItem {
  url: string;
}
interface Case {
  id: string;
  name: string;
  tag?: string;
  tagColor?: 'red' | 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'indigo' | 'gray' | 'yellow';
  images: string[];
  videos?: VideoItem[];
  sections: CaseSection[];
}
const caseData: Record<string, Case> = {
  'e1': {
    id: 'e1',
    name: '教育行业案例分享 - 香港科技大学',
    tag: '声像追踪案例',
    tagColor:'red',// 可选颜色: red, blue, green, purple, orange, pink, indigo
    images: [
      e1Image,
    ],
    videos: [
      {
        url: e1Video,
      },
    ],
    sections: [
      {
        label: '学校简介',
        content: '香港科技大学，简称科大、港科大，为环太平洋大学联盟、全球大学校长论坛、东亚研究型大学协会、亚洲大学联盟、中国大学校长联谊会重要成员，并获AACSB和EQUIS双重认证，是一所世界知名研究型大学。'
      },
      {
        label: '项目背景',
        content: '该客户为世界知名大学，面向国际，对能实时中英翻译有需求；同时教室空间较大，常用于授课、开大会，坐在后排听讲很难听清。'
      },
      {
        label: '产品方案',
        content: '吸顶麦+MC10+Dante扬声器DC20+Dante数字音频处理器DP88+C60AI追踪双目摄像头， 声像追踪解决方案'
      },
      {
        label: '案例效果',
        content: '吸顶麦克风MC10无限级联，实现大空间全向拾音，无感扩声，搭配C60和麦耳会记，实现实时翻译投屏，为国际学生带来更好的学习体验。'
      },
    ],
  },
  'e2':{
    id: 'e2',
    name: '教育行业案例分享 - 上海交通大学',
    tag: '会议扩声案例',
    tagColor:'indigo', 
    images:[
      e2Image
    ],
    videos:[
      {
        url:e2Video,
      },
    ],
    sections:[
      {
        label: '学校简介',
        content: '上海交通大学是我国历史最悠久、享誉海内外的高等学府之一，是教育部直属并与上海市共建的全国重点大学。经过120多年的不懈努力，上海交通大学已经建设成为一所“综合性、创新型、国际化”的国内一流、国际知名大学。'
      },
      {
        label: '项目背景',
        content: '教室面积较大，常要用于授课、多人线下会议、远程会议等，一侧为玻璃，隔音效果不好，多人进行会议或授课时声音较为嘈杂，现有扩声设备扩声效果差，听讲者容易听不清。'
      },
      {
        label: '产品方案',
        content: '吸顶麦克风MC10+Dante扬声器DC20'
      },
      {
        label: '案例效果',
        content: '该方案有效的解决了教室扩音差、拾音难等问题。MC10有效降噪拾音，即使在多人会议的情况下也能清晰拾音，为客户带来高质量的拾音体验，真正实现无感扩声。'
      },
    ]
  },
  'e3':{
    id: 'e3',
    name: '教育行业案例分享 - 上海虹口艺术幼儿园',
    tag: '舞台场景案例',
    tagColor: 'pink',  
    images:[
      e3Image1,
      e3Image2
    ],
    sections:[
      {
        label: '学校简介',
        content: '虹口区艺术幼儿园始创于1992年3月，是一所以艺术教育和家庭教育指导为特色的全日制幼儿园。幼儿园占地面积2813平方米，建筑面积2282平方米。目前有教职工三十多人，小班、中班、大班三个年龄段的幼儿共二百多人。'
      },
      {
        label: '项目背景',
        content:'教室面积很大，扩声设备仅为无线手持麦和领夹麦，教室后面观众发言需要传递话筒，非常不方便，经常没有声音，或频繁啸叫声。表演时体验效果差，影响互动。'
      },
      {
        label: '产品方案',
        content:'思必驰吸顶麦MC10+DP88音频处理器'
      },
      {
        label:'案例效果',
        content:'实现了高音质效果的本地扩声，有效提升了教室观众区域的互动体验，同时减少了旧有设备的浪费，节约了成本，打造了降本增效的经典方案'
      },
    ]
  },
  'e4':{
    id:'e4',
    name: '教育行业案例分享 - 华东师范大学',
    tag:'MC08',
    tagColor:'green',
    images:[
      e4Image1,
      e4Image2
    ],
    sections:[
      {
        label: '学校简介',
        content: '华东师范大学位于中国上海市的一所综合性研究型大学。该校由教育部主管，教育部与上海市人民政府重点共建。1996年被列入“211工程”国家重点建设大学行列。2006年，学校进入国家“985工程”高校行列。2017年学校进入国家“世界一流大学”建设高校A类行列。'
      },
      {
        label: '项目背景',
        content:'教师培训室，华师大学术交流中心1间面向全国中学校长的培训教室，希望改造成无感扩声教室。'
      },
      {
        label: '产品方案',
        content:'1*MC08+交换机+利旧原有的模拟功放、音箱'
      },
      {
        label:'案例效果',
        content:'MC08覆盖讲台区域，设置了拾音屏蔽区，屏蔽学员方向传来的人声；AI降噪下仅保留讲师清晰的人声，过滤走步声、板书声、敲击黑板和讲台的声音等。轻松实现10dB的有效扩声增益。'
      },
    ]
  },
  'e5':{
    id:'e5',
    name: '教育行业案例分享 - 北京理工大学',
    tag:'扇形教室案例',
    tagColor:'blue',
    images:[
      e5Image1,
      e5Image2
    ],
    sections:[
      {
        label: '学校简介',
        content: '北京理工大学隶属于工业和信息化部，是国家历批次重点建设大学、中央直管高校，位列国家首批“211工程”、“985工程”、“世界一流大学”建设高校A类，第二轮“双一流”建设高校。4个学科领域进入世界一流前列，12个学科领域进入世界一流行列，学校在世界大学排名近5年跃升366位。'
      },
      {
        label: '项目背景',
        content:'学校大阶梯教室音频设备效果不好，有啸叫和混响，教师需长时间手持麦克风，消耗教师体力，影响师生互动'
      },
      {
        label: '产品方案',
        content:'MC10吸顶麦'
      },
      {
        label:'案例效果',
         content:'MC10能覆盖讲台区域和学生区域，可自定义拾音区，实现教学和互动不受影响，吸顶麦的设计使教师彻底告别手持麦'
      },
    ]
  },
  'e6':{
    id:'e6',
    name: '教育行业案例分享 - 成都大学',
    tag: '接待室案例',
    tagColor: 'gray',
    images:[
      e6Image1,
      e6Image2
    ],
    sections:[
      {
        label:'学校简介',
        content:'成都大学（Chengdu University）， 简称“成大”， 是一所由四川省主管，实行的是省市共建的全日制普通高等本科院校； 是教育部“卓越工程师教育培养计划”高校、教育部国防教育特色高校、教育部“双万计划”一流本科专业建设点立项单位、四川省博士建设单位递进培育计划“优先培育”类建设单位。'
      },
      {
        label:'项目背景',
        content:'120平米的会见室，先使用传统扩声设备繁多，维护困难，受设备限制，无法做到全场景扩声'
      },
      {
        label:'产品方案',
        content:'2片MC10吸顶麦+7台DC20喇叭'
      },
      {
        label:'案例效果',
        content:'MC10级联能够实现大空间轻松扩音，即使座位距离相隔较远，也能轻松听清楚，由于会议室没有会议桌，无法放置鹅颈麦，手持麦传递在正式会议时不雅观，使用不便捷，用吸顶麦效果解决了所有难题。'
      },
    ]
  }
};
// 标签颜色映射
const tagColorClasses = {
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
  const caseItem = caseData[id as keyof typeof caseData];
  if (!caseItem) {
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
      prevIndex === 0 ? caseItem.images.length - 1 : prevIndex - 1
    );
  };
  const goToNextImage = () => {
    setCurrentLightboxIndex(prevIndex => 
      prevIndex === caseItem.images.length - 1 ? 0 : prevIndex + 1
    );
  };
  return (
    <>
      <ImageLightbox 
        isOpen={showLightbox} 
        images={caseItem.images}
        currentIndex={currentLightboxIndex}
        onClose={closeLightbox}
        onPrev={goToPrevImage}
        onNext={goToNextImage}
      />
      <div className="min-h-screen bg-white text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* 返回按钮 */}
          <button 
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="返回上一页"
          >
            <i className="fa-solid fa-arrow-left mr-1"></i> 返回
          </button>
          <Header 
            showAiSpeechLogo={true}
            isProductDetailPage={true}
          />
          <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* 图片展示区域 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-images text-blue-600"></i>
                案例图片
              </h3>
              <div 
                className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => openLightbox(selectedImageIndex)}
              >
                <img 
                  src={caseItem.images[selectedImageIndex]} 
                  alt={caseItem.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                  <i className="fa-solid fa-expand text-white text-3xl"></i>
                </div>
              </div>
              {caseItem.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {caseItem.images.map((image, index) => (
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
                        src={image} 
                        alt={`缩略图 ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}             
              {/* 视频展示区域 */}
              {caseItem.videos && caseItem.videos.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <i className="fa-solid fa-video text-blue-600"></i>
                    案例视频
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {caseItem.videos.map((video, index) => (
                      <VideoPlayer 
                        key={index}
                        url={video.url}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* 案例信息区域 */}
            <div>
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold">{caseItem.name}</h1>
                {caseItem.tag && (
                  <span className={`${tagColorClasses[caseItem.tagColor || 'red']} text-white text-sm px-3 py-1 rounded transition-colors`}>
                    {caseItem.tag}
                  </span>
                )}
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-6">
                {caseItem.sections?.map((section, index) => (
                  <div key={index}>
                    <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">{section.label}：</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>
              {/* 联系方式 */}
              <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                <p>了解更多案例信息，请联系我们：</p>
                <p className="mt-1">guo@techhdi.com | 18814845538</p>
                <p className="mt-1">地址：杭州市余杭区七彩汇商业中心2-305室</p>
                <p className="text-xs mt-2 flex items-center gap-4" style={{color: '#9ca3af'}}>
                  <a href="https://beian.miit.gov.cn/" target="_blank" rel="nofollow noopener" style={{color: '#9ca3af', textDecoration: 'none'}} className="hover:text-gray-700 dark:hover:text-gray-300">
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
