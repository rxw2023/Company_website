import * as React from 'react';
const { useState, useEffect, useRef, useCallback } = React;
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import Navigation from '../components/Navigation';
import { toast } from 'sonner';
import SeoHead from '../components/SeoHead';
import { motion, AnimatePresence } from 'framer-motion';

import a1Image1 from '../assets/images/a1-1.webp';
import a1Image2 from '../assets/images/a1-2.webp';
import a1Image3 from '../assets/images/a1-3.webp';
import a1Image4 from '../assets/images/a1-4.webp';

import a2Image1 from '../assets/images/a2-1.webp';
import a2Image2 from '../assets/images/a2-2.webp';
import a2Image3 from '../assets/images/a2-3.webp';
import a2Image4 from '../assets/images/a2-4.webp';

import a3Image1 from '../assets/images/a3-1.webp';
import a3Image2 from '../assets/images/a3-2.webp';
import a3Image3 from '../assets/images/a3-3.webp';
import a3Image4 from '../assets/images/a3-4.webp';

import a4Image1 from '../assets/images/a4-1.webp';
import a4Image2 from '../assets/images/a4-2.webp';
import a4Image3 from '../assets/images/a4-3.webp';
import a4Image4 from '../assets/images/a4-4.webp';

import a5Image1 from '../assets/images/a5-1.webp';
import a5Image2 from '../assets/images/a5-2.webp';
import a5Image3 from '../assets/images/a5-3.webp';
import a5Image4 from '../assets/images/a5-4.webp';

import a6Image1 from '../assets/images/a6-1.webp';
import a6Image2 from '../assets/images/a6-2.webp';
import a6Image3 from '../assets/images/a6-3.webp';
import a6Image4 from '../assets/images/a6-4.webp'; 

import a7Image1 from '../assets/images/a7-1.webp';
import a7Image2 from '../assets/images/a7-2.webp';
import a7Image3 from '../assets/images/a7-3.webp';
import a7Image4 from '../assets/images/a7-4.webp';

import a8Image1 from '../assets/images/a8-1.webp';
import a8Image2 from '../assets/images/a8-2.webp';
import a8Image3 from '../assets/images/a8-3.webp';
import a8Image4 from '../assets/images/a8-4.webp';

import a9Image1 from '../assets/images/a9-1.webp';
import a9Image2 from '../assets/images/a9-2.webp';
import a9Image3 from '../assets/images/a9-3.webp';
import a9Image4 from '../assets/images/a9-4.webp';

import a10Image1 from '../assets/images/a10-2.webp';
import a10Image2 from '../assets/images/a10-3.webp';
import a10Image3 from '../assets/images/a10-4.webp';
import a10Image4 from '../assets/images/a10-5.webp';

import a11Image1 from '../assets/images/a11-1.webp';
import a11Image2 from '../assets/images/a11-2.webp';
import a11Image3 from '../assets/images/a11-3.webp';
import a11Image4 from '../assets/images/a11-4.webp';

import a12Image1 from '../assets/images/a12-1.webp';
import a12Image2 from '../assets/images/a12-2.webp';

import a18Image1 from '../assets/images/a18-1.webp';
import a18Image2 from '../assets/images/a18-2.webp';

import a19Image1 from '../assets/images/a19-1.webp';
import a19Image2 from '../assets/images/a19-2.webp';
import a19Image3 from '../assets/images/a19-3.webp';
import a19Image4 from '../assets/images/a19-4.webp';



import a1Pdf from '../assets/pdf/MC10吸顶麦克风.pdf';
import a2Pdf from '../assets/pdf/MA600D矩阵麦克风.pdf';
import a3Pdf from '../assets/pdf/MCS06拾扩一体吸顶麦克风.pdf';
import a4Pdf from '../assets/pdf/C40T视频会议室摄像机.pdf';
import a5Pdf from '../assets/pdf/AI智能声像追踪主机MT100.pdf';
import a6Pdf from '../assets/pdf/AISPK-DC20PoE吸顶音箱.pdf';
import a7Pdf from '../assets/pdf/高端吸顶麦克风-MC08.pdf';
import a8Pdf from '../assets/pdf/企业级会议麦克风音箱M12.pdf';
import a9Pdf from '../assets/pdf/AI追踪双目语音摄像头C60.pdf';
import a10Pdf from '../assets/pdf/B100_DM0403.pdf';
import a11Pdf from '../assets/pdf/MC04.pdf';
import a12Pdf from '../assets/pdf/MK300-结构尺寸六视图.pdf';
import a18Pdf from '../assets/pdf/AI智能声像追踪主机MT100.pdf';
import a19Pdf from '../assets/pdf/BYOM投屏套装.pdf';


// 图片查看器组件 - 支持缩放拖拽
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
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  // 切换图片时重置
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // 关闭时重置
  useEffect(() => {
    if (!isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setScale(prev => Math.min(Math.max(0.5, prev + delta), 5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  };

  if (!isOpen) return null;
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
      >
        <div 
          className="flex items-center justify-center overflow-hidden"
          style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          <img 
            ref={imgRef}
            src={images[currentIndex]} 
            alt="放大查看" 
            className="select-none"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              maxWidth: '90vw',
              maxHeight: '85vh',
              objectFit: 'contain',
            }}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            draggable={false}
            loading="lazy"
          />
        </div>
        {/* 缩放提示 */}
        {scale === 1 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/40 text-white/60 px-3 py-1 rounded-full text-xs">
            滚轮缩放 · 双击切换
          </div>
        )}
        {/* 左右箭头按钮 */}
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
        {/* 关闭按钮 */}
        <button
          className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          onClick={onClose}
        >
          <i className="fa-solid fa-times text-xl"></i>
        </button>
        {/* 图片计数 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-1.5 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </motion.div>
    </motion.div>
  );
}
interface ProductSpec {
  category: string;
  items: { name: string; value: string }[];
}

interface Product {
  id: string;
  name: string;
  shortDesc?: string;
  description?: string;
  images: string[];
  specs?: ProductSpec[];
  brochureUrl?: string;
  faq?: { question: string; answer: string }[];
}

const productData: Record<string, Product> = {
    // AISPEECH品牌产品
  'a1': {
    id: 'a1',
    name: '思必驰MC10吸顶麦克风',
    description: 'MC10是思必驰推出的一款高端吸顶会议麦克风，其集成了多达128单元的全向麦克风阵列，提供了16个独立可配拾音区，可实现精细化拾音配置。采用了Dante数字音频技术, 确保音频传输稳定和广泛兼容。MC10内置AI算法，提供高清降噪、去混响、反馈抑制、自动增益和语音转写等功能，有效提升了会议效率。MC10适用各类吊顶安装方式，PoE+供电，可满足各类会议空间的吊装需求。',
     images: [
      a1Image1,
      a1Image2,
      a1Image3,
      a1Image4
    ],
    // 产品规格数据，按类别组织
    specs: [
      {
        category: '基本规格',
        items: [
          { name: '产品颜色', value: '淡雅白' },
          { name: '产品尺寸', value: '597mm*597mm*53.5mm' },
          { name: '包材尺寸', value: '680mm*680mm*160mm' },
          { name: '产品净重', value: '&lt;5KG' },
          { name: '供电方式', value: 'PoE+ 供电' },
          { name: '安装方式', value: '吊装' }
        ]
      },
      {
        category: '音频性能',
        items: [
          { name: '可配拾音区', value: '16 个' },
          { name: '采样率', value: '48kHz' },
          { name: '拾音区类型', value: '可配' },
          { name: '最大背景噪声抑制', value: '35dB' },
          { name: 'AI 降噪抑制', value: '支持' },
          { name: 'AI 混响抑制', value: '支持' },
          { name: 'AI 啸叫抑制', value: '支持' },
          { name: 'AI 回声消除', value: '支持' },
          { name: 'AI 全双工', value: '支持' },
          { name: '混音通道', value: '支持' },
          { name: '智能混音', value: '支持' },
          { name: '延迟', value: '25ms' }
        ]
      },
      {
        category: '麦克风规格',
        items: [
          { name: '麦克风类型', value: '128 单元 MEMS 麦克风阵列' },
          { name: '灵敏度', value: '-38dBv / 94dB SPL @1KHz' },
          { name: '信噪比', value: '65dBv / 94dB SPL @1KHz, A-weighted' }
        ]
      },
      {
        category: 'Dante音频',
        items: [
          { name: 'Dante 音频', value: '支持' },
          { name: '远程会议通道', value: '1 路' },
          { name: '本地扩声通道', value: '1个' }
        ]
      },
      {
        category: '功能特性',
        items: [
          { name: '级联数量', value: '无限制数量' },
          { name: '级联方式', value: 'Dante 音频 /PoE 网线级联' }
        ]
      },
      {
        category: '接口',
        items: [
          { name: 'Dante/PoE 网口', value: '1 个' },
          { name: 'RESET 按键', value: '1 个' }
        ]
      }
    ],
     brochureUrl: a1Pdf, // PDF链接
  },
  'a2': {
    id: 'a2',
    name: '思必驰MA600D矩阵麦克风',
    description: '无感扩声新标杆，更广覆盖范围 (3m拾音半径)x更大扩声增益(>18dB)x更清晰音质(48kHz采样率)x更低延迟(<15ms)，AI降噪+反馈抑制双算法加持，无缝兼顾本地会议扩声与远程视频沟通；\n通过内置AI能力及变化的拾音波束，使单只矩阵麦覆盖传统发言模式，并可为会议提供自由讨论、主席演讲、代表发言等典型应用场景；\n通过内置自研的AI算法，提供智能降噪、混响消除、啸叫抑制、自动增益和发言追踪等功能，有效提升会议音频效果及丰富应用场景。\n适用场景：大会议室、指挥大厅、报告厅和会客厅等',
    images: [
      a2Image1,
      a2Image2,
      a2Image3,
      a2Image4
    ],
    specs: [
      {
        category: '基本规格',
        items: [
          { name: '产品颜色', value: '雅致灰' },
          { name: '产品尺寸', value: '505mm*90mm*32.5mm' },
          { name: '产品净重', value: '约3kg' },
          { name: '供电方式', value: 'PoE+ 供电' },
          { name: '安装方式', value: '桌面布放，落地支架、吊杆安装，缆绳吊装、壁挂【水平地面】、壁挂【垂直地面】等多种安装方式' }
        ]
      },
      {
        category: '音频性能',
        items: [
          { name: '可配拾音区', value: '24 个（形状、大小和角度等可调，位置可拖拽）' },
          { name: '采样率', value: '48kHz' },
          { name: '拾音区类型', value: '可配（通话拾音区，扩声拾音区，静音区）' },
          { name: '波束类型', value: '4种（支持自动检测部署角度，并自动提示）' },
          { name: '拾音区隔离度', value: '>20dB' },
          { name: '最大背景噪声抑制', value: '35dB' },
          { name: 'AI 降噪', value: '可调节' },
          { name: 'AI 混响', value: '支持' },
          { name: 'AI 回声消除', value: '支持' },
          { name: 'AI 全双工', value: '支持' },
          { name: '混音通道', value: '支持' },
          { name: '智能混音', value: '支持' },
          { name: '延迟', value: '&lt;15ms' },
          { name: '扩声增益', value: '>18dB' }
        ]
      },
      {
        category: '麦克风规格',
        items: [
          { name: '麦克风类型', value: '64单元 MEMS 麦克风阵列' },
          { name: '麦克风灵敏度', value: '-38dBv/94dB SPL @1KHz' },
          { name: '麦克风频响', value: '20 Hz~20,000 Hz' },
          { name: '动态范围', value: '84dB(A)' },
          { name: '最大声压级', value: '104dB SPL' },
          { name: '设备信噪比', value: '73.9dBA' },
          { name: '设备灵敏度', value: '-10.22dBFS/Pa' },
          { name: '设备频响', value: '100 Hz to 15，000 Hz' }
        ]
      },
      {
        category: '传感器',
        items: [
          { name: '光感传感器', value: '1个' },
          { name: '陀螺仪', value: '6轴，1个' }
        ]
      },
      {
        category: 'Dante音频',
        items: [
          { name: 'Dante 音频', value: '支持' },
          { name: '远程会议通道', value: '1路' },
          { name: '本地扩声通道', value: '1路' }
        ]
      },
      {
        category: '功能特性',
        items: [
          { name: '级联数量', value: '无限制数量' },
          { name: '级联方式', value: 'Dante 音频 /PoE 网线级联' }
        ]
      },
      {
        category: '接口',
        items: [
          { name: 'Dante/PoE 网口', value: '1 个' },
          { name: 'Type-C', value: '1个' },
          { name: '模拟输入', value: '2个' },
          { name: '模拟输出', value: '2个' }
        ]
      },
      {
        category: '按键',
        items: [
          { name: 'RESET按键', value: '1个' }
        ]
      }
    ],
     brochureUrl: a2Pdf, 
    faq: [
      { question: 'MA600D矩阵麦克风拾音半径是多少？', answer: '现场扩声：3米拾音半径，纯录音或远程通话：6米拾音半径。' },
      { question: 'MA600D矩阵麦克风安装方式有哪些？', answer: '支持桌面放置、壁挂（水平或垂直）、吊顶、落地支架安装，内置空间感知6轴陀螺仪，可智能感知自身存在状态并自动调用对应的波束模型，提供更高性能的拾音覆盖。' },
      { question: 'MA600D矩阵麦克风现场扩声模式时的延时时间是多少？', answer: '≤15ms，听感同步。' },
      { question: '有效扩声增益能做到多少？', answer: '≥18dB。' },
      { question: '采用桌面放置，支持嵌入桌面安装吗？', answer: '可以使用MK300嵌入套件配合完成安装。' },
      { question: 'MA600D矩阵麦克风拾音角度怎么控制？', answer: '本身具备360°全向拾音能力，通过软件自定义拾音角度和范围（可设置24个拾音区）。' },
      { question: '主席台发言时需要屏蔽其他拾音区的声音可以吗？', answer: '可以，可配置B100系列有线或无线的静音/优先按钮或接入中控系统。' },
      { question: '单个MA600D覆盖范围有限，更大的场地怎么办？', answer: 'MA600D支持无限制台数的级联。这意味着可以将多台MA600D或与其他思必驰音频设备（如吸顶麦）组合使用，无缝覆盖超大型会议室、多功能厅，甚至构建整个楼宇的分区音频系统，并通过统一平台集中管理。' },
      { question: '提前预埋线缆有什么要求？', answer: '有两种方案可以。一是纯Dante传输，每个MA600D布置一条Cat6以上的线缆即可完成供电、音频传输以及完整的控制功能；二是采用模拟信号传输，每个MA600D布置1条Cat6网线（供电及控制）以及4条模拟音频线。' }
    ],
  },
  'a3': {
    id: 'a3',
    name: '思必驰MCS06拾扩一体吸顶麦克风',
    description: 'MCS06是思必驰推出的一款高端拾扩一体吸顶麦，其集成了多达32单元的全向麦克风阵列，提供了4个独立可配拾音区，可实现精细化拾音配置。采用了Dante数字音频技术, 确保音频传输稳定和广泛兼容。MCS06内置AI算法，提供高清降噪、去混响、回声抑制、双讲通话、自动增益和语音转写等功能，有效提升了会议效率。MCS06还搭载 2个15W 高性能扬声器，为远程会议提供高保真音质，提升会议体验。\nMCS06适用各类吊顶安装方式，PoE+供电，可满足各类会议空间的吊装需求。',
    images: [
      a3Image1,
      a3Image2,
      a3Image3,
      a3Image4
    ],
    specs: [
      {
        category: '基本规格',
        items: [
          { name: '产品颜色', value: '淡雅白' },
          { name: '产品尺寸', value: '597mm*597mm*72.5mm' },
          { name: '产品净重', value: '&lt;6KG' },
          { name: '供电方式', value: 'PoE+ 供电' },
          { name: '安装方式', value: '吊装' }
        ]
      },
      {
        category: '音频性能',
        items: [
          { name: '可配拾音区', value: '4 个（形状、大小和角度等可调，位置可拖拽）' },
          { name: '采样率', value: '48kHz' },
          { name: '拾音区类型', value: '可配（通话拾音区，静音区）' },
          { name: '拾音区隔离度', value: '>20dB' },
          { name: '最大背景噪声抑制', value: '35dB' },
          { name: 'AI 降噪', value: '可调节' },
          { name: 'AI 混响抑制', value: '支持' },
          { name: 'AI 回声消除', value: '支持' },
          { name: 'AI 全双工', value: '支持（5m以内）' }
        ]
      },
      {
        category: '麦克风规格',
        items: [
          { name: '麦克风类型', value: '32单元 MEMS 麦克风阵列' },
          { name: '麦克风灵敏度', value: '-38dBv/94dB SPL @1KHz' },
          { name: '麦克风频响', value: '20 Hz~20,000 Hz' },
          { name: '动态范围', value: '84dB(A)' },
          { name: '最大声压级', value: '104dB SPL' },
          { name: '设备信噪比', value: '73.9dBA @1KHz' },
          { name: '设备灵敏度', value: '-10.22dBFS/Pa @1KHz' },
          { name: '设备频响', value: '100 Hz to 15，000 Hz' }
        ]
      },
      {
        category: '扬声器规格',
        items: [
          { name: '中低音喇叭', value: '15W，1个' },
          { name: '高音喇叭', value: '15W，1个' },
          { name: '频响', value: '80Hz~20KHz' },
          { name: '最大输出电平', value: '90dB SPL @1KHz' }
        ]
      },
      {
        category: 'Dante音频',
        items: [
          { name: 'Dante 音频', value: '支持' }
        ]
      },
      {
        category: '功能特性',
        items: [
          { name: '级联数量', value: '无限制数量' },
          { name: '级联方式', value: 'Dante 音频 /PoE 网线级联' }
        ]
      },
      {
        category: '接口',
        items: [
          { name: 'Dante/PoE 网口', value: '1 个' }
        ]
      },
      {
        category: '按键',
        items: [
          { name: 'RESET按键', value: '1个' }
        ]
      },
      {
        category: '其他规格',
        items: [
          { name: '工作温度', value: '0℃~40℃' },
          { name: '存放温度', value: '-20℃~+70℃' },
          { name: '工作/存储湿度', value: '20 to 95% RH' },
          { name: '整机功耗', value: '20W' }
        ]
      }
    ],
     brochureUrl: a3Pdf, 
  },
  'a4': {
    id: 'a4',
    name: '思必驰C40T视频会议室摄像机',
    description: 'C40T超高清摄像机是思必驰专为现代企业会议室设计的重量级产品，提供4K超高清会议体验。它具备16倍数字变焦和12倍光学变焦，确保每个细节都清晰可 见。全方位视野设计，水平260°平移和72.5°广角，使其轻松覆盖中大型会议空间 创新的视频叠加字幕功能提升了会议的沟通效率。与智能声像追踪主机MT100和高端吸顶麦结合，C40T为大型空间提供智能声像追踪方案，确保每个会议细节都被捕捉。',
    images: [
      a4Image1,
      a4Image2,
      a4Image3,
      a4Image4
    ],
    specs: [
      {
        category: '基本规格',
        items: [
          { name: '图像传感器', value: '1/2.8英寸 CMOS, 846万像素' },
          { name: '焦距', value: 'f=3.9mm-46.8mm' },
          { name: '光圈', value: 'F1.6-F3.0' },
          { name: '光学变焦', value: '12倍' },
          { name: '数字变焦', value: '16倍' },
          { name: '视场角', value: '水平72.5°-6.3°' },
          { name: '聚焦系统', value: '自动、手动、一键触发、PTZ触发' },
          { name: '快门速度', value: '1/60-1/10,000秒' },
          { name: '增益', value: '自动/手动' },
          { name: '白平衡', value: '自动、手动、一键触发、自动跟踪、一键白平衡、静态色温' },
          { name: '曝光控制', value: '自动、手动、快门优先、光圈优先、亮度优先' },
          { name: '宽动态', value: '支持' },
          { name: '信噪比', value: '≥50dB' },
          { name: '抗闪烁', value: '支持' },
          { name: '菜单', value: '英文/中文' }
        ]
      },
      {
        category: '功能特性',
        items: [
          { name: '智能麦摄联动', value: '支持搭配MT100和吸顶麦系列产品，可为大型和超大型空间实现更灵活的图像追踪策略' },
          { name: '画面人物自动居', value: '特写镜头运算AI算法，调用预置位时将人物自动调整到中心位置' },
          { name: 'AI实时字幕', value: '支持接入思必驰AI麦克风，搭配麦冬会议记录服务，为云会议场景提供视频' }
        ]
      },
      {
        category: '云台参数',
        items: [
          { name: '水平范围', value: '-130°~+130°' },
          { name: '垂直范围', value: '-30°~+90°' },
          { name: '水平转动速度', value: '0.2°~90°/秒' },
          { name: '垂直转动速度', value: '0.2°~60°/秒' },
          { name: '预置点最大数目', value: '256' }
        ]
      },
      {
        category: '接口',
        items: [
          { name: 'HDMI', value: '1路, HDMI1.4 视频分辨率4K30/P25 1080P60/P50/P30/P25, 720P60/P50/P30/P25' },
          { name: '3G-SDI', value: '1路, 3G-SDI 视频分辨率1080P60/P50/P30/P25, 720P60/P50/P30/P25' },
          { name: 'USB 3.0', value: '1路, USB3.0 Type-B USB3.0输出格式：1、UVC支持UVC1.1协议 2、UVC 视频格式支持YUY2、NV12:视频分辨率1080P30/P25, 720P30/P25 3、H.264/H.265/MJPEG:视频分辨率支持4K30/P25 1080P60/P50/P30/P25, 720P60/P50/P30/P25 4、UAC 音频格式PCM' },
          { name: 'USB 2.0', value: '1路, USB2.0 Type-A HOST' },
          { name: '网络', value: '1路, 10/100M RJ-45 POE 1、视频分辨率4K30/P25, 1080P60/P50/P30/P25, 720P60/P50/30/P25, 360P30/P25 2、视频格式支持H.264、H.265；3、音频压缩 AAC 4、网络协议 ONVIF、RTSP、 TCP、UDP、RTMP' },
          { name: '音频接口', value: '1路, LINE IN, 3.5mm音频接口,1路, REF, 3.5mm音频接口' },
          { name: '控制接口', value: '1路RS-485¥1路RS-232 IN' },
          { name: '电源接口', value: 'DC12V' },
          { name: '电源开关', value: '船型开关' },
          { name: '无线控制', value: '红外遥控器' }
        ]
      },
      {
        category: '其他规格',
        items: [
          { name: '控制协议', value: 'VISCA' },
          { name: '功耗', value: '<20W' },
          { name: '工作环境', value: '工作温度0°~40°C, 工作湿度10%RH ~90 %RH' },
          { name: '存储环境', value: '存储温度-20°C ~+60°C, 存储湿度10%RH ~95 %RH' },
          { name: '尺寸(长×宽×高)', value: '245*145*164mm' },
          { name: '机身重量', value: '≈2kg' },
          { name: '机身颜色', value: '雅致灰' }
        ]
      }
    ],
     brochureUrl: a4Pdf, 
  },
  'a5': {
    id: 'a5',
    name: '思必驰AI智能声像追踪主机MT100',
    description: '在数字化时代，音视频技术的融合与创新已成为企业、教育和个人沟通的重要趋势。思必驰凭借其深厚的技术积淀与创新精神，推出了高品质的AI智能声像追踪主机MT100。MT100搭载了思必驰品牌的PTZ摄像机，并与思必驰高端吸顶麦克风系统完美结合，凭借卓越的性能和智能化设计，能够实时追踪发言人和动作，确保音视频信号始终聚焦于会议核心内容。这种智能追踪功能不仅提高了会议的效率和便捷性，还为各种大型会议和培训空间提供准确、高清、流畅的视听体验。',
    images: [
      a5Image1,
      a5Image2,
      a5Image3,
      a5Image4
    ],
    specs: [
      {
        category: '基本规格',
        items: [
          { name: '产品型号', value: 'AIVIS-MT100' },
          { name: '分辨率', value: '最大支持4K @ 30fps' },
          { name: '机身重量', value: '0.2KG' },
          { name: '工作温度', value: '0℃ ~ +40℃' },
          { name: '存放温度', value: '-20℃ ~ +40℃' },
          { name: '电源', value: 'DC 12V' },
          { name: '产品尺寸', value: '119 mm×104 mm×29mm' }
        ]
      },
      {
        category: '视频规格',
        items: [
          { name: '视频压缩', value: 'H.265/H.264/MJPEG' },
          { name: '视频输入', value: '最高支持4KP30输入' },
          { name: '视频切换', value: 'AI算法，支持自动切换视频画面' },
          { name: '预置位冻结', value: '支持一键开关预置位冻结功能' },
          { name: '视频模式', value: 'PIP、PBP（最多同时四路显示）' }
        ]
      },
      {
        category: 'HDMI',
        items: [
          { name: '接口', value: '一路HDMI输入（预留功能）' },
          { name: '接口', value: '一路HDMI输出' },
          { name: '分辨率', value: '4KP30; 1080P30/25; 720P30/25; 640*480P30/25)' }
        ]
      },
      {
        category: 'USB',
        items: [
          { name: '接口', value: '1路USB2.0 Host（预留）' },
          { name: '接口', value: '1路USB3.0 Device（兼容USB2.0）' },
          { name: '协议', value: '支持UVC1.1协议' },
          { name: '视频格式', value: 'UVC视频格式支持H.265/H.264/MJPEG' },
          { name: '视频分辨率', value: '4K30（不二次编码时）、1080P30/25、720P30/25、360P30/25' }
        ]
      },
      {
        category: '网络',
        items: [
          { name: '接口', value: '1路RJ-45,' },
          { name: '速率', value: '10M/100M自适应以太网口，标配POE;' },
          { name: '视频输入', value: '视频最大支持多路4KP30输入，' },
          { name: '视频输出', value: '单路输出时最高4KP30对外输出;' },
          { name: '解码能力', value: '最多支持同时4路画面解码为1路1080P30输出;' }
        ]
      },
      {
        category: '其他规格',
        items: [
          { name: '管理', value: '支持WEB UI配置' },
          { name: 'TF卡', value: 'TF卡（功能预留）: 1路外置Micor SD卡, 最大256G' },
          { name: 'POE', value: 'IEEE 802.3af' }
        ]
      },
       {
        category: '音频接口',
        items: [
          { name: '接口', value: '1路LINE IN（3.5MM）, 1路LINE OUT（3.5MM）' }
        ]
      }
    ],
     brochureUrl: a5Pdf, 
  },
  'a6': {
    id: 'a6',
    name: '思必驰AISPK-DC20PoE吸顶音箱',
    description: '全频同轴天花扬声器是对商店，会议室，酒店，游轮，等多种场所适用的定阻有源吸顶音箱，提供高保真音频输出，支持Dante音频协议，可实现多设备之间的音频传输和处理。内置功率放大器、数字信号处理功能。音响可嵌入式安装及吊装2种方式，对高低楼层安装实现了方便安装的优化设计。',
    images: [
      a6Image1,
      a6Image2,
      a6Image3,
      a6Image4
    ],
    specs: [
      {
        category: '基本规格',
        items: [
          { name: '电源输入', value: '802.3af/802.3at/802.3bt兼容' },
          { name: '音频传输协议', value: 'Dante' },
          { name: '音频输入端口', value: 'RJ45' },
          { name: '产品重量', value: '3.3KG' },
          { name: '附加配件', value: '安全绳' }
        ]
      },
      {
        category: '音频性能',
        items: [
          { name: '低音单元', value: '6.5寸（聚丙烯）复合盆阀体+NBR丁腈橡胶悬边单元' },
          { name: '高音单元', value: '1寸蚕丝膜、钕磁、360度可旋转高音单元' },
          { name: '频率响应', value: '65Hz-20kHz，(±3dB)' },
          { name: '系统阻抗', value: '8 Ohms' },
          { name: '输出声压（SPL）', value: '89dB 1M/1W' },
          { name: '输出最大声压（SPL）', value: '111 dB' },
          { name: '额定输出功率（RMS）', value: '30 watts' },
          { name: '峰值输出功率（PAK）', value: '60 watts' }
        ]
      },
      {
        category: '安装参数',
        items: [
          { name: '安装开孔尺寸', value: '246MM 圆孔' },
          { name: '安装深度', value: '197MM' },
          { name: '箱体材料', value: '铁质网罩+铁质工程箱体' },
          { name: '安装方式', value: '嵌入式和吊挂安装' }
        ]
      }
    ],
     brochureUrl: a6Pdf, 
  },
  'a7': {
    id: 'a7',
    name: '思必驰高端吸顶麦克风-MC08',
    description: 'MC08是思必驰推出的一款适用教学场景的高端吸顶麦克风， 集成了多达32单元的全向麦克风阵列，提供了8个独立可配置拾音区，可实现通话拾音区、扩声拾音区、静音区等精细化拾音配置。MC08采用Dante数字音频技术，可实现稳定的、高保真的数字音频传输，广泛兼容数字音频生态，可实现IP数字化管理。MC08还提供了模拟音频接口，兼容传统的音频系统方案，单台MC08即可覆盖整个讲台区域，可同时实现教室扩声、远程教学和课程录播的三合一能力，通过内置自研的AI算法，提供高清降噪、混响抑制、啸叫抑制、自动增益和语音转写等功能，有效提升教学效果。',
    images: [
      a7Image1,
      a7Image2,
      a7Image3,
      a7Image4
    ],
    specs: [
      {
        category: '基本规格',
        items: [
          { name: '产品颜色', value: '淡雅白' },
          { name: '产品尺寸', value: '445mm*445mm*57.5mm' },
          { name: '产品净重', value: '<3KG' },
          { name: '供电方式', value: 'PoE+ 供电' },
          { name: '安装方式', value: '吊装' }
        ]
      },
      {
        category: '音频性能',
        items: [
          { name: '可配拾音区', value: '8个(4 个扩声拾音区，4 个通话拾音区)' },
          { name: '采样率', value: '48kHz' },
          { name: '拾音区类型', value: '可配' },
          { name: '最大背景噪声抑制', value: '35dB' },
          { name: 'AI降噪抑制', value: '支持' },
          { name: 'AI混响抑制', value: '支持' },
          { name: 'AI啸叫抑制', value: '支持' },
          { name: 'AI回声消除', value: '支持' },
          { name: 'AI全双工', value: '支持' },
          { name: '混音通道', value: '支持' },
          { name: '智能混音', value: '支持' },
        ]
      },
      {
        category: '麦克风规格',
        items: [
          { name: '麦克风类型', value: '32单元MEMS麦克风阵列' },
          { name: '灵敏度', value: '-38dBv / 94dB SPL @1KHz' },
          { name: '信噪比', value: '65dBv / 94dB SPL @1KHz, A-weighted' }
        ]
      },
      {
        category: 'Dante音频',
        items: [
          { name: 'Dante音频', value: '支持' },
          { name: '远程会议通道', value: '1路' },
          { name: '本地扩声通道', value: '1路' }
        ]
      },
      {
        category: '功能特性',
        items: [
          { name: '级联限制', value: 'MC08 间不支持级联' }
        ]
      },
      {
        category: '接口',
        items: [
          { name: 'Dante/PoE 网口', value: '1 个' },
          { name: '卡侬公头', value: '1 个' },
          { name: '卡侬母头', value: '2 个' },
          { name: 'RESET 按键', value: '1 个' }
        ]
      }
    ],
    brochureUrl: a7Pdf,
  },
  'a8': {
    id: 'a8',
    name: '思必驰企业级会议麦克风音箱AIMIC-M12',
    description: 'M12是一款集拾音、扩音、语音转写、字幕同传于一体的企业级会议麦克风音箱，可通过多台级联，满足大中小型多类会议室需求。',
    images: [
      a8Image1,
      a8Image2,
      a8Image3,
      a8Image4
    ],
    specs: [
      {
        category: '基本规格',
        items: [
          { name: '产品名', value: '企级会议麦克风音箱' },
          { name: '型号', value: 'AIMIC-M12' },
          { name: '尺寸', value: '250mm*119mm*39mm' },
          { name: '重量', value: '500g左右' },
          { name: '材质', value: 'ABS' },
          { name: '配色', value: '雅致灰' }
        ]
      },
      {
        category: '按键',
        items: [
          { name: '音量+键', value: '触摸音量键' },
          { name: '音量-键', value: '触摸音量键' },
          { name: '麦克风Mute键', value: '触摸按键；开关麦克风' },
          { name: '转写键', value: '触摸按键；一键拉起或关闭"麦耳会记"软件' }
        ]
      },
      {
        category: '指示灯',
        items: [
          { name: '按键指示灯', value: '支持' },
          { name: '状态灯带', value: '支持（红色、绿色或蓝色）' }
        ]
      },
      {
        category: '接口',
        items: [
          { name: 'USB Type-C接口', value: 'USB2.0，连接电脑' },
          { name: 'USB Type-A接口', value: 'USB2.0，调试口' },
          { name: 'DC电源接口', value: 'DC电源接口' },
          { name: 'RJ45网络接口', value: '有线级联；POE供电接口' }
        ]
      },
      {
        category: '声学',
        items: [
          { name: '麦克风', value: '12个模拟全向麦克风' },
          { name: '频响', value: '100Hz - 8kHz' },
          { name: '喇叭', value: '1个8W全频喇叭,1个8W高音喇叭,1个无源辐射器' },
          { name: '喇叭频响-音乐模式', value: '80Hz - 20kHz' },
          { name: '喇叭频响-通话模式', value: '150Hz - 7.5kHz' }
        ]
      },
      {
        category: '电源',
        items: [
          { name: 'DC适配器', value: '12V/2A' },
          { name: 'POE供电', value: '支持802.3at，30W' }
        ]
      },
      {
        category: '其他',
        items: [
          { name: '工作温度', value: '0℃ ~ 40℃' },
          { name: '存储温度', value: '-20℃ ~ +70℃' },
          { name: 'Kensington安全锁孔', value: '支持' },
          { name: '认证', value: 'CCC认证,RoHS认证' },
        ]
      }
    ],
    brochureUrl: a8Pdf,
  },
  'a9': {
    id: 'a9',
    name: '思必驰AI追踪双目语音摄像头C60',
    description: 'C60是思必驰推出的一款集多种AI追踪模式，AI会议助理，AI实时字幕，音视频融合等特色能力的AI追踪双目语音摄像头，适用于会议场景中的讨论、演讲、板书等各类视频图像要求。',
    images: [
      a9Image1,
      a9Image2,
      a9Image3,
      a9Image4
    ],
    specs: [
       {
        category: '基本规格',
        items: [
          { name: '尺寸', value: '245mm×145mm×165mm' },
          { name: '净重', value: '2KG左右' },
          { name: '机身', value: '雅致灰' }
        ]
      },
      {
        category: '特写镜头',
        items: [
          { name: '图像传感器', value: '1/2.8英寸CMOS, 214万像素' },
          { name: '变焦方式', value: '12倍光学变焦+16倍数字变焦' },
          { name: '水平视场角', value: '72.5°' }
        ]
      },
      {
        category: '全景镜头',
        items: [
          { name: '图像传感器', value: '1/2.8英寸CMOS, 214万像素' },
          { name: '水平视场角', value: '110°' }
        ]
      },
      {
        category: '视频性能',
        items: [
          { name: '增益', value: '支持' },
          { name: '白平衡', value: '支持' },
          { name: '曝光控制', value: '支持' }
        ]
      },
      {
        category: '云台规格',
        items: [
          { name: '转动范围', value: '水平+/-130°, 垂直-30°~+90°' },
          { name: '转动速度', value: '水平0.1°~100°/s, 垂直0.1°~80°/s' },
          { name: '水平/垂直翻转', value: '支持' },
          { name: '预置位', value: '64个' }
        ]
      },
      {
        category: '接口',
        items: [
          { name: 'RJ45', value: '1个10/100M, 支持PoE供电, 视频分辨率(1080P30/P25, 720P30/P25, 360P30/P25)' },
          { name: 'USB 2.0', value: '1个Type-A, Host' },
          { name: 'USB 3.0', value: '1个Type-B (视频格式支持YUY2, NV12)' },
          { name: '3G-SDI', value: '1个, 视频分辨率(1080P60/P50/P30/P25, 720P60/P50)' },
          { name: 'HDMI-OUT', value: '1个, 视频分辨率(1080P60/P50/P30/P25, 720P60/P50)' },
          { name: 'Line in', value: '1个3.5mm音频接口' },
          { name: 'REF Audio', value: '1个3.5mm音频接口' },
          { name: 'RS485', value: '1个控制接口' },
          { name: 'RS232-IN', value: '1个控制接口' }
        ]
      },
      {
        category: '电源',
        items: [
          { name: 'DC', value: '12V/1.5A' },
          { name: 'PoE', value: '802.3af' }
        ]
      }
    ],
    brochureUrl: a9Pdf,
  },
  'a10': {
    id: 'a10',
    name: '思必驰桌面控制器AIMIC-B100系列',
    description: 'AIMIC-B100系列作为思必驰精心打造的智能会议桌面控制器系列产品，专为现代高效会议量身定制。产品集智能控制、精准拾音与便捷部署于一身，是会议管理者的得力助手。一键操作即可轻松掌控全场，无论是全局静音、音量调节还是发言权限切换，都能迅速响应，确保会议秩序井然。AIMIC-B100系列共四款型号，按单元角色分为主席单元与静音单元，按部署方式分为有线版与无线版，灵活适应各种会议场景，降低施工与改造成本。产品外观简约时尚，小巧纤薄，轻松融入各类会议桌面，彰显专业与品味。同时智能状态感知技术让设备能够自动适应会议节奏，会后自动休眠，节能又省心。',
    images: [
      a10Image1,
      a10Image2,
      a10Image3,
      a10Image4
    ],
    specs: [
      {
        category: '基本规格',
        items: [
          { name: '产品尺寸', value: 'R=40mm H=20.5mm' },
          { name: '产品颜色', value: '淡雅黑' }
        ]
      },
      {
        category: '按键类型',
        items: [
          { name: '按键类型', value: '触控' }
        ]
      },
      {
        category: '安装方式',
        items: [
          { name: '有线版', value: '魔术贴固定/桌面挖孔' },
          { name: '无线版', value: '魔术贴固定' }
        ]
      },
      {
        category: '按键配置',
        items: [
          { name: '有线静音版', value: '静音键、音量加减键、RESET 按键' },
          { name: '有线主席版', value: 'VIP键、静音键、RESET 按键' },
          { name: '无线静音版', value: '静音键、音量加减键、RESET 按键' }
        ]
      },
      {
        category: '接口',
        items: [
          { name: '有线版', value: 'PoE 网口：1个' },
          { name: '无线版', value: 'Type-C：1个' }
        ]
      },
      {
        category: '音频性能',
        items: [
          { name: '有线版', value: '麦克风：内置全向麦克风 人声检测：支持' },
          { name: '无线版', value: '/' }
        ]
      },
      {
        category: '供电方式',
        items: [
          { name: '有线版', value: 'PoE供电' },
          { name: '无线版', value: '1500mAh锂电池供电' }
        ]
      },
      {
        category: '通信方式',
        items: [
          { name: '有线版', value: 'RJ45 (PoE)、蓝牙' },
          { name: '无线版', value: '蓝牙' }
        ]
      },
      {
        category: '核心功能',
        items: [
          { name: '有线静音版', value: '全局静音、扩音音量调节' },
          { name: '有线主席版', value: 'VIP模式切换、全局静音' },
          { name: '无线主席版', value: 'VIP模式切换、全局静音' },
          { name: '无线静音版', value: '全局静音、扩音音量调节' }
        ]
      },
      {
        category: '兼容型号',
        items: [
          { name: '有线静音版', value: 'MA600系列、MCS06、MC10系列、MC08系列' },
          { name: '有线主席版', value: 'MA600系列' },
          { name: '无线静音版', value: 'MA600系列、MCS06、MC10系列、MC08系列' }
        ]
      }
    ],
     brochureUrl: a10Pdf, 
  },
  'a11':{
      id: 'a11',
      name: '思必驰MC04高端吸顶麦克风-教育款',
      description: 'MC04是思必驰面向教室教学场景推出的一款高端吸顶麦克风，专为常态化教室、紧凑型讲台及预算敏感型录播教室设计。产品搭载24单元全向MEMS麦克风阵列，具备2米精准扩声覆盖半径，可实现对讲台核心区域的精细化拾音。无论教师面向学生讲解还是背身板书，均能稳定捕捉饱满人声，确保教学信息无损传达。MC04内置专为教育场景训练的ClearSpeakAI专利算法，可有效抑制板书声、翻书声、风扇声等典型教学噪声，同时提供混响抑制、啸叫抑制（AFC）和自动增益（AGC）功能，为师生创造纯净清晰的教学声场。MC04 采用模拟音频接口，可兼容已有音频系统方案，也可搭配思必驰壁挂音频处理器及有源音箱，实现简单部署及便捷操控。',
      images: [
        a11Image1,
        a11Image2,
        a11Image3,
        a11Image4
      ],
      brochureUrl: a11Pdf,
      specs: [
        {
          category: '基本规格',
          items: [
            { name: '产品颜色', value: '淡雅白' },
            { name: '产品尺寸', value: '250mm x 250mm x 54mm' },
            { name: '产品净重', value: '<2kg' },
            { name: '供电方式', value: 'PoE+ 供电' },
            { name: '安装方式', value: '吊装' }
          ]
        },
        {
          category: '麦克风规格',
          items: [
            { name: '麦克风类型', value: '24单元 MEMS麦克风阵列' },
            { name: '麦克风灵敏度', value: '-38dBv/94dB SPL@1KHz' },
            { name: '麦克风频响', value: '20Hz~20000Hz' },
            { name: '动态范围', value: '84dB(A)' },
            { name: '最大声压级', value: '104dB SPL' },
            { name: '信噪比', value: '73.9dBA' },
            { name: '设备灵敏度', value: '-10.22dBFS/Pa' },
            { name: '设备频响', value: '100Hz to 15,000Hz' }
          ]
        },
        {
          category: '音频特性',
          items: [
            { name: '拾音区', value: '4个（形状、大小可调，位置可拖拽）' },
            { name: '扩声拾音半径', value: '2m（推荐）' },
            { name: '远程拾音半径', value: '3.5m（推荐）' },
            { name: '采样率', value: '48kHz' },
            { name: '最大背景噪声抑制', value: '35dB' },
            { name: 'AI降噪抑制', value: '支持' },
            { name: 'AI混响抑制', value: '支持' },
            { name: 'AI啸叫抑制', value: '支持' },
            { name: 'AI回声消除', value: '支持' },
            { name: '智能混音', value: '支持' }
          ]
        },
        {
          category: '音频通道',
          items: [
            { name: '远程会议通道', value: '1个' },
            { name: '本地扩声通道', value: '1个' }
          ]
        },
        {
          category: '级联功能',
          items: [
            { name: '级联限制', value: '2台' }
          ]
        },
        {
          category: '接口',
          items: [
            { name: '网口', value: '1个 1x10/100/1000M RJ-45 PoE' },
            { name: '凤凰端子输入', value: '4个' },
            { name: '凤凰端子输出', value: '2个' },
            { name: 'RESET按键', value: '1个' }
          ]
        },
        {
          category: '其他规格',
          items: [
            { name: '工作温度', value: '0°C~40°C' },
            { name: '存放温度', value: '-20°C~+70°C' },
            { name: '工作/存储湿度', value: '20 to 95%RH' },
            { name: '整机功耗', value: '12W' }
          ]
        }
      ],
  },

  a12: {
    id: 'a12',
    name: '思必驰MK300桌面安装套件',
    description: 'MK300 是一款面向矩阵麦克风桌面安装场景开发的定制配件。通过与设备结构贴合的外观设计，可优化桌面安装效果，使设备部署更整洁、更美观，更适合高端会议空间。',
    images: [
      a12Image1,
      a12Image2,
    ],
    brochureUrl: a12Pdf,
    specs: [
      {
        category: '产品信息',
        items: [
          { name: '产品型号', value: 'MK300' },
          { name: '产品颜色', value: '深空灰' },
          { name: '适配设备', value: '矩阵麦克风（MA600D 系列）' },
          { name: '安装方式', value: '桌面固定安装' },
        ]
      },
      {
        category: '核心价值',
        items: [
          { name: '安装更美观', value: '定制化结构设计，与设备外观更协调，提升整体视感' },
          { name: '部署更整洁', value: '优化桌面安装形态，让会议桌面更简洁有序' },
          { name: '结构更贴合', value: '与矩阵麦克风匹配配设计，安装配合度更高' },
          { name: '场景更适配', value: '适用于会议桌、接待桌、报告桌等桌面部署场景' },
        ]
      },
      {
        category: '适用场景',
        items: [
          { name: '推荐场景', value: '高端会议室 / 会客室 / 报告空间 / 指挥中心' },
        ]
      },
      {
        category: '安装步骤',
        items: [
          { name: '① 固定底座', value: '将底座安装至桌面预定位置' },
          { name: '② 放置设备', value: '将矩阵麦克风与配件配合安装' },
          { name: '③ 完成部署', value: '完成安装后，桌面呈现更简洁美观' },
        ]
      },
    ],
  },
a18:{
    id: 'a18',
    name: '思必驰会议办公大模型信创一体机D1',
    description: 'D1是思必驰基于自主创新技术推出的一款专为党政企客户会议办公效率提升的大模型信创一体机，内置“DFM+DeepSeek”双大语言模型加持，采用从底层芯片到上层应用的全国产化技术架构，基于自研的全链路智能语音语言技术，提供离线语音识别、声纹区分发言人、AI纪要生成等多种功能，可满足对数据安全性要求较高的政企客户会议研讨、演讲培训、知识库搭建等多场景会议纪要整理及结构化知识管理需求，帮助解决会议记录难、会议纪要整理费时费力等问题。',
    images: [
      a18Image2,
      a18Image1,
    ],
    brochureUrl: a18Pdf,
    specs: [
      {
        category: '产品规格',
        items: [
          {name: '产品型号', value: 'D1-S2（塔式一体机）/ D1-S3（4U机架式一体机）'},
          {name: 'CPU型号', value: '鲲鹏920'},
          {name: 'CPU核数', value: '64'},
          {name: '内存', value: '256G DDR4'},
          {name: '操作系统', value: '银河麒麟V10 SP3 服务器版'},
          {name: 'GPU型号', value: '昇腾 Atlas 300l Duo*2'},
          {name: '硬件接口', value: 'USB 2.0 * 2；USB 3.0 * 2；HDMI * 2；RJ45 * 4；BMC管理网络口 * 1。'},
          {name: '电源', value: '1路ATX单电源，国标220Vdc'},
          {name: '温度', value: '运行状态：0°C ~ 55°C（不含算力卡或GPU卡）非运行状态：-40°C ~ +85°C（不含算力卡或GPU卡）'},
          {name: '尺寸', value: 'D1-S2：390 mm×430 mm×188mm；D1-S3：430 mm×462.8 mm×176 mm'},
        ]
      },
    ],
  },
  a19: {
    id: 'a19',
    name: '思必驰BYOM投屏套装（SW10+SD10）',
    description: '思必驰BYOM投屏套装专为现代会议协作空间打造，一站式解决方案（30㎡~60㎡）。套装包含AIMATE-SW10投屏会议主机和AIMATE-SD10无线传屏器。支持AirPlay、Miracast、投屏器等多种无线投屏方式，实现无线BYOM会议。SW10具备多路音视频输入/输出，支持矩阵切换功能；SD10配合PC可无线连接USB摄像头、麦克风、扬声器等会议外设，一根USB-C线搞定视频+音频+USB数据+千兆网+60W供电。双千兆网口支持透明/隔离模式，满足政企网络安全需求。智能功耗管理，支持自动待机和远程唤醒，大幅降低运维成本。适用于10-100㎡中高端会议室。',
    images: [
      a19Image1,
      a19Image2,
      a19Image3,
      a19Image4,
    ],
    brochureUrl: a19Pdf,
    specs: [
      {
        category: '套装方案',
        items: [
          { name: '一站式解决方案', value: '30㎡~60㎡' },
          { name: 'BYOM投屏会议主机', value: 'AIMATE-SW10' },
          { name: '无线传屏器', value: 'AIMATE-SD10' },
        ]
      },
      {
        category: '基本规格',
        items: [
          { name: '产品名', value: 'BYOM投屏会议主机' },
          { name: '型号', value: 'AIMATE-SW10' },
          { name: '尺寸', value: '277.6 x 142 x 29.1 mm' },
          { name: '产品净重', value: '1.0kg' },
        ]
      },
      {
        category: '视频输入',
        items: [
          { name: 'HDMI In', value: '1 路，HDMI 1.4, HDCP 1.4' },
          { name: 'USB-C In', value: '1 路，DisplayPort 1.1, HDCP 1.4' },
          { name: '输入分辨率', value: '最高 4K@30Hz 4:4:4' },
        ]
      },
      {
        category: '视频输出',
        items: [
          { name: 'HDMI Out1', value: '1 路，HDMI 2.0, HDCP 2.2, 最高 4K@60Hz 4:4:4' },
          { name: 'HDMI Out2', value: '1 路，HDMI 1.4, HDCP 1.4, 最高 4K@30Hz 4:4:4' },
        ]
      },
      {
        category: '音频接口',
        items: [
          { name: '输入音频', value: 'HDMI/USB-C/LAN/WLAN: RAW PCM 2.0, 16-bit, 32/44.1/48KHz' },
          { name: '输出音频', value: '2×HDMI + 1×模拟音频 (AUDIO OUT), RAW PCM 2.0, 16-bit, 48KHz' },
        ]
      },
      {
        category: '接口',
        items: [
          { name: 'USB Host', value: '1×USB 3.0 Type-B' },
          { name: 'USB 3.0 Type-A', value: '3 个 (支持 USB 外设扩展，每端口 DC 5V 1A)' },
          { name: 'USB-C', value: '支持视频输入、60W PD 充电、千兆以太网、USB 3.0 传输' },
          { name: 'AUDIO OUT', value: '1×3.5mm 模拟音频输出' },
        ]
      },
      {
        category: '网络',
        items: [
          { name: 'Utility LAN', value: '2×RJ45, 10/100/1000Mbps' },
          { name: 'Secure LAN', value: '2×RJ45, 10/100/1000Mbps' },
          { name: '无线网络', value: 'WiFi 5 (802.11 a/b/g/n/ac), 双频 2.4GHz/5GHz' },
          { name: '无线协议', value: 'WEP, TKIP, AES, WPA, WPA2' },
        ]
      },
      {
        category: '无线功能',
        items: [
          { name: 'AirPlay', value: '支持 (最高 1080p60)' },
          { name: 'Miracast', value: '支持 (最高 1080p60)' },
          { name: '投屏器', value: '支持 (最高 4K@30Hz)' },
        ]
      },
      {
        category: '控制',
        items: [
          { name: 'RS232', value: '1×3 针 3.5mm 凤凰端子 (com/api 模式)' },
          { name: 'LAN 控制', value: 'Web UI & Telnet API' },
          { name: 'CEC', value: '支持' },
        ]
      },
      {
        category: '按键/指示',
        items: [
          { name: '重置按键', value: '1 个 (短按显示 OSD, 长按 5 秒恢复出厂)' },
          { name: '状态指示灯', value: '快闪 (启动/升级) / 常亮 (正常) / 慢闪 (待机) / 不亮 (未通电)' },
          { name: 'PAIRING 口', value: '1 个 (投屏器配对/固件升级)' },
        ]
      },
      {
        category: '电源',
        items: [
          { name: 'DC 供电', value: '20V 6A DC' },
          { name: '最大功耗', value: '93W' },
          { name: 'PD 充电', value: 'USB-C 端口支持最高 60W 对外充电' },
        ]
      },
      {
        category: '其他',
        items: [
          { name: '工作温度', value: '0℃～+45℃' },
          { name: '存储温度', value: '-20℃～+70℃' },
          { name: '工作湿度', value: '10%～90% 无凝结' },
          { name: '存储湿度', value: '10%～90% 无凝结' },
          { name: '静电保护', value: '人体模式：±8kV (气隙) / ±4kV (接触)' },
          { name: '认证', value: 'SRRC认证' },
        ]
      },
      {
        category: '无线投屏器 SD10',
        items: [
          { name: '产品名称', value: '无线投屏器' },
          { name: '投屏分辨率', value: 'Up to 4K@30fps' },
          { name: '接口规格', value: 'Type-C (Support DP_Alt mode)' },
          { name: '频率频带', value: '5G（默认）/ 2.4G' },
          { name: '无线投屏', value: '支持' },
          { name: '触控回传', value: '支持（Windows OS）' },
          { name: '无线会议', value: '支持（包括 USB camera 和 Speakerphone 信号回传）' },
          { name: '安装驱动', value: 'Wireless Casting 无需安装驱动；Wireless Conferencing 需安装 desktop APP' },
          { name: '系统支持', value: 'Windows 10/11, Mac OS' },
        ]
      },
    ],
  },
};

// 相关产品轮播组件（独立组件，hooks 在顶层合法调用）
function RelatedProducts({ products }: { products: { id: string; model: string; name: string; desc: string; image: string }[] }) {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    return () => el.removeEventListener('scroll', updateArrows);
  }, [updateArrows]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' });
  };

  return (
    <div className="mt-6 bg-[#efe9de] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-[#141413]">
          <i className="fa-solid fa-cubes text-[#cc785c]"></i>
          相关产品
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="w-8 h-8 rounded-md bg-[#faf9f5] border border-[#e6dfd8] flex items-center justify-center text-[#6c6a64] hover:border-[#cc785c] hover:text-[#3d3d3a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <i className="fa-solid fa-chevron-left text-xs"></i>
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="w-8 h-8 rounded-md bg-[#faf9f5] border border-[#e6dfd8] flex items-center justify-center text-[#6c6a64] hover:border-[#cc785c] hover:text-[#3d3d3a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <i className="fa-solid fa-chevron-right text-xs"></i>
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((rp) => (
          <div
            key={rp.id}
            className="bg-[#faf9f5] rounded-xl border border-[#e6dfd8] hover:border-[#cc785c] transition-all duration-300 cursor-pointer overflow-hidden flex-shrink-0"
            style={{ width: '260px' }}
            onClick={() => navigate(`/product/${rp.id}`)}
          >
            <div className="aspect-video bg-[#efe9de] flex items-center justify-center">
              <img
                src={rp.image}
                alt={rp.name}
                className="w-full h-full object-contain p-2"
                style={{ mixBlendMode: 'multiply' }}
                loading="lazy"
              />
            </div>
            <div className="p-3">
              <p className="text-xs text-[#6c6a64] uppercase tracking-wider mb-0.5">{rp.model}</p>
              <p className="text-sm font-semibold text-[#141413] mb-1">{rp.name}</p>
              <p className="text-xs text-[#6c6a64] line-clamp-2">{rp.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  // 默认选择第一张图片作为预览图
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentLightboxIndex, setCurrentLightboxIndex] = useState(0);
  // 进入页面滚动到顶部 + 重置图片索引
  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImageIndex(0);
  }, [id]);
  // 添加ESC键关闭图片查看器的功能
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showLightbox) {
        closeLightbox();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showLightbox]);
  // 获取产品数据，如果不存在则返回首页
  const product = productData[id as keyof typeof productData];
  if (!product) {
    navigate('/');
    return null;
  }
  // 处理资料下载
  const handleDownloadBrochure = () => {
    // 在实际应用中，这里会触发文件下载
    if (product.brochureUrl && product.brochureUrl !== '#') {
      // 创建一个临时链接并触发下载
      const link = document.createElement('a');
      link.href = product.brochureUrl;
      link.download = `${product.name}产品彩页.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast(`${product.name}产品彩页已开始下载`);
      console.log(`下载产品 ${product.name} 的彩页`);
    } else {
      // 如果没有PDF链接，显示提示
      toast('该产品目前暂无可用的产品彩页，敬请期待');
    }
  };
  // 打开图片查看器
  const openLightbox = (index: number) => {
    setCurrentLightboxIndex(index);
    setShowLightbox(true);
    document.body.style.overflow = 'hidden'; // 防止背景滚动
  };
  // 关闭图片查看器
  const closeLightbox = () => {
    setShowLightbox(false);
    document.body.style.overflow = 'auto'; // 恢复背景滚动
  };
  // 切换到上一张图片
  const goToPrevImage = () => {
    setCurrentLightboxIndex(prevIndex => 
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  };
  // 切换到下一张图片
  const goToNextImage = () => {
    setCurrentLightboxIndex(prevIndex => 
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
  };
  return (
    <>
      <SeoHead
        title={product.name}
        description={product.description || `${product.name} - 思必驰AISPEECH专业音视频产品，恒迪视讯代理销售。`}
        url={`/product/${product.id}`}
        image={product.images[0]}
        type="product"
        product={{
          id: product.id,
          name: product.name,
          description: product.description || product.name,
          image: product.images[0],
          brand: 'AISPEECH',
        }}
        breadcrumbs={[
          { name: '首页', url: '/' },
          { name: '产品', url: '/' },
          { name: product.name, url: `/product/${product.id}` },
        ]}
      />
      <ImageLightbox 
        isOpen={showLightbox} 
        images={product.images}
        currentIndex={currentLightboxIndex}
        onClose={closeLightbox}
        onPrev={goToPrevImage}
        onNext={goToNextImage}
      />
      <Navigation />
      <div className="min-h-screen bg-[#faf9f5] text-[#3d3d3a] pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* 头部信息 - 只显示AISPEECH的logo */}
          <Header 
            showAiSpeechLogo={true}
          />
          {/* 产品详情内容 - 在移动设备上调整为单列布局 */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* 产品图片区域 */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-[#141413] flex items-center gap-2">
                <i className="fa-solid fa-images text-[#cc785c]"></i>
                产品图片
              </h3>
              <div className="aspect-video bg-[#efe9de] rounded-md overflow-hidden cursor-pointer relative"
                   onClick={() => openLightbox(selectedImageIndex)}>
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={selectedImageIndex}
                      src={product.images[selectedImageIndex]} 
                      alt={product.name} 
                      className="w-full h-full object-contain p-4 hover:scale-[1.02] transition-transform duration-300"
                      style={{ mixBlendMode: 'multiply' }}
                      loading="lazy"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </AnimatePresence>
                    <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <i className="fa-solid fa-search-plus text-white text-4xl"></i>
                    </div>
              </div>
              {/* 缩略图导航 - 优化触摸体验 */}
              <div className="flex mt-3 gap-2 overflow-x-auto pb-2 -mx-1 px-1 hide-scrollbar">
                 {product.images.map((img, index) => (
                       <button
                        key={index}
                        className={`w-20 h-14 flex-shrink-0 overflow-hidden rounded border-2 ${selectedImageIndex === index ? 'border-[#cc785c]' : 'border-[#e6dfd8]'} hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#cc785c]/30`}
                        onClick={(e) => {
                          e.stopPropagation(); // 防止触发父级点击事件
                          setSelectedImageIndex(index);
                        }}
                        onMouseEnter={() => {
                          setSelectedImageIndex(index);
                        }}
                        aria-label={`查看图片 ${index + 1}`}
                      >
                          <img 
                            src={img} 
                            alt={`缩略图 ${index + 1}`} 
                             className="w-full h-full object-contain cursor-pointer"
                             style={{ mixBlendMode: 'multiply' }}
                             loading="lazy"
                             onClick={(e) => {
                               e.stopPropagation(); // 防止触发按钮的点击事件
                               openLightbox(index); // 直接点击缩略图也可以打开大图
                             }}
                          />
                    </button>
                 ))}
              </div>
              {/* 产品问答 - 可选部分 */}
              {(product as any).faq && ((product as any).faq as { question: string; answer: string }[]).length > 0 && (
                <div className="mt-6 bg-[#efe9de] rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#141413]">
                    <i className="fa-solid fa-circle-question text-[#cc785c]"></i>
                    关于{product.name}的常见问题
                  </h3>
                  <div className="space-y-4">
                    {((product as any).faq as { question: string; answer: string }[]).map((item: { question: string; answer: string }, index: number) => (
                      <div key={index} className="border-b border-[#e6dfd8] last:border-0 pb-3 last:pb-0">
                        <p className="font-medium text-[#141413] mb-1">
                          <span className="text-[#cc785c] mr-1">问{index + 1}、</span>
                          {item.question}
                        </p>
                        <p className="text-[#3d3d3a] pl-5">
                          <span className="text-[#cc785c] font-medium">答：</span>
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* 相关产品 - 仅 a2 页面显示 */}
              {product.id === 'a2' && (
                <RelatedProducts
                  products={[
                    { id: 'a12', model: 'MK300', name: '桌面安装套件', desc: '专为MA600D桌面控制器设计，稳固安装，简洁美观。', image: a12Image1 },
                    { id: 'a10', model: 'AIMIC-B100', name: '桌面控制器', desc: '集智能控制、精准拾音与便捷部署于一身，一键掌控全场。', image: a10Image1 },
                  ]}
                />
              )}
            </div>
             {/* 产品信息区域 */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-2">{product.name}</h1>
              {(product as any).subtitle && (
                <h2 className={`text-base sm:text-lg ${product.id.startsWith('h') ? 'text-red-600' : 'text-[#cc785c]'} mb-4`}>{(product as any).subtitle}</h2>
              )}
              {product.description && (
                <p className="text-[#6c6a64] mb-4 sm:mb-6 text-sm sm:text-base whitespace-pre-line">{product.description}</p>
              )}
                {/* 产品规格列表 */}
                <div className="mb-6">
                   <h2 className="text-base sm:text-lg font-semibold mb-3"></h2>
                    {(product as any).specs ? (
                       // 使用 specs 数组显示
                      <div className="space-y-6">
                        {(product as any).specs?.map((category: any, categoryIndex: number) => (
                          <div key={categoryIndex} className="overflow-x-auto">
                            <h3 className="font-medium mb-2 text-[#141413]">{category.category}</h3>
                            <table className="min-w-full bg-[#efe9de] rounded-xl overflow-hidden">
                              <tbody className="divide-y divide-[#e6dfd8]">
                                {category.items.map((item: any, index: number) => (
                                  <tr key={index} className={index % 2 === 0 ? 'bg-[#faf9f5]' : 'bg-[#f4efe6]'}>
                                    <td className="px-4 py-2 text-sm font-medium text-[#3d3d3a]">{item.name}</td>
                                    <td className="px-4 py-2 text-sm text-[#3d3d3a]" dangerouslySetInnerHTML={{ __html: item.value }}></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </div>
                    ) : null}
              </div>
              {/* 下载按钮 */}
              <button
                onClick={handleDownloadBrochure}
                className="bg-[#cc785c] hover:bg-[#a9583e] text-white px-6 py-3 rounded-[8px] transition-all active:scale-[0.97] flex items-center justify-center w-full sm:w-auto text-sm sm:text-base"
                aria-label="下载产品彩页"
              >
                <i className="fa-solid fa-download mr-2"></i>
                下载产品彩页
              </button>
              {/* 联系方式 */}
              <div className="mt-6 text-sm text-[#6c6a64]">
                <p>如需了解更多产品信息，请联系我们：</p>
                <p className="mt-1">guo@techhdi.com | 18814845538</p>
                <p className="mt-1">地址：杭州市余杭区七彩汇商业中心2-305室</p>
               <p className="text-xs mt-2 flex items-center gap-4" style={{color: '#a09d96'}}>
  	<a href="https://beian.miit.gov.cn/" target="_blank" rel="nofollow noopener" style={{color: '#a09d96', textDecoration: 'none'}} className="hover:text-[#3d3d3a]">
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