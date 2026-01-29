import { Header } from '../components/Header';
import { Link } from 'react-router-dom';

// 导入AISPEECH产品图片
import a1Image from '../assets/images/a1-1.jpg';
import a2Image from '../assets/images/a2-1.png';
import a3Image from '../assets/images/a3-1.jpg';
import a4Image from '../assets/images/a4-1.png';
import a5Image from '../assets/images/a5-1.jpg';
import a6Image from '../assets/images/a6-1.png';
import a7Image from '../assets/images/a7-1.png';
import a8Image from '../assets/images/a8-2.png';
import a9Image from '../assets/images/a9-1.png';

// 定义产品数据类型
interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  brand: 'HRAVC' | 'AISPEECH';
}

export default function Home() {
  
  // HRAVC品牌产品数据
  const hravcProducts: Product[] = [
  {
    id: 'h1',
    name: '高清视频矩阵切换器',
    description: '支持不同输入分辨率间的无缝切换，完善的大屏拼接显示功能',
    image: 'https://lf-code-agent.coze.cn/obj/x-ai-cn/355308075266/attachment/VMM88正面_20260117114958.jpg',
    brand: 'HRAVC'
  },
     {
      id: 'h2',
      name: '超薄HDBaseT传输器',
      description: '支持4K60Hz传输，超薄设计，长寿命，适用于智慧教学、安防监控、企事业会议室等场所',
      image: 'https://lf-code-agent.coze.cn/obj/x-ai-cn/355308075266/attachment/SSH70-TX-FrontSide_20260117165100.jpg',
      brand: 'HRAVC'
    },
    {
      id: 'h3',
      name: '4K固化高清矩阵',
      description: '集中控制各种视听设备，简化操作流程，提高工作效率',
       image: 'https://lf-code-agent.coze.cn/obj/x-ai-cn/355308075266/attachment/固化矩阵1_20260119101640.jpg',
      brand: 'HRAVC'
    },
    {
      id: 'h4',
      name: '分布式音视频系统',
      description: '基于网络的分布式架构，实现音视频信号的灵活传输和处理',
      image: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Distributed%20audio%20video%20system&sign=f734b1e202b29468fc8db2ae7426531d',
      brand: 'HRAVC'
    },
     {
      id: 'h5',
      name: '按键式控制面板',
       description: 'WP6是一款具有6个按钮和1个音量控制旋钮的壁板控制面板，实心拉丝铝面板，支持PoE供电',
       image: 'https://lf-code-agent.coze.cn/obj/x-ai-cn/355308075266/attachment/WP6-1_20260119122226.jpg',
      brand: 'HRAVC'
    },
      {
       id: 'h6',
       name: '中控系统',
       description: 'TP-10C可编程控制触摸面板与TP-EX44N接口扩展器组成的智能化中央控制系统，适用于智能家居、会议室、培训中心等多种场景',
      image: 'https://lf-code-agent.coze.cn/obj/x-ai-cn/355308075266/attachment/TP-10C-1_20260119140146.jpg',
      brand: 'HRAVC'
    },
    {
      id: 'h7',
      name: '智能会议系统',
      description: '集成多种会议功能，提供高效便捷的会议体验',
      image: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Smart%20meeting%20room%20system&sign=009a3041b561b413e529c3b4993d9301',
      brand: 'HRAVC'
    },
    {
      id: 'h8',
      name: '专业音响系统',
      description: '高品质音频解决方案，适用于各类场所的扩声需求',
      image: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Professional%20sound%20system&sign=4215d2749deb07fd7d812e23d2fcd25b',
      brand: 'HRAVC'
    },
    {
      id: 'h9',
      name: '视频会议终端',
      description: '高清视频会议设备，支持多方视频通话，远程协作',
      image: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Video%20conference%20terminal&sign=db6998e52a5a940d8bd2b8f401dffb12',
      brand: 'HRAVC'
    }
  ];

  // AISPEECH品牌产品数据
  const aispeechProducts: Product[] = [
    {
      id: 'a1',
      name: 'MC10吸顶麦克风',
      description: 'MC10是思必驰推出的一款高端吸顶会议麦克风，其集成了多达128单元的全向麦克风阵列，提供了16个独立可配拾音区，可实现精细化拾音配置',
      image: a1Image,
      brand: 'AISPEECH'
    },
     {
      id: 'a2',
      name: 'MA600D矩阵麦克风',
      description: '无感扩声新标杆，更广覆盖范围(3m拾音半径)x更大扩声增益(>18dB)x更清晰音质(48kHz采样率)x更低延迟(<15ms)，AI降噪+反馈抑制双算法加持',
      image: a2Image,
      brand: 'AISPEECH'
    },
    {
      id: 'a3',
      name: 'MCS06拾扩一体吸顶麦克风',
      description: 'MCS06是思必驰推出的一款高端拾扩一体吸顶麦，集成32单元全向麦克风阵列，提供4个独立可配拾音区，支持Dante数字音频技术',
      image: a3Image,
      brand: 'AISPEECH'
    },
    {
      id: 'a4',
      name: 'C40T视频会议室摄像机',
      description: 'C40T超高清摄像机是思必驰专为现代企业会议室设计的重量级产品，提供4K超高清会议体验。它具备16倍数字变焦和12倍光学变焦，确保每个细节都清晰可见',
      image: a4Image,
      brand: 'AISPEECH'
    },
    {
      id: 'a5',
      name: 'AI智能声像追踪主机MT100',
      description: '在数字化时代，音视频技术的融合与创新已成为企业、教育和个人沟通的重要趋势。思必驰凭借其深厚的技术积淀与创新精神，推出了高品质的AI智能声像追踪主机MT100',
      image: a5Image,
      brand: 'AISPEECH'
    },
    {
      id: 'a6',
      name: 'AISPK-DC20PoE吸顶音箱',
      description: '全频同轴天花扬声器是对商店，会议室，酒店，游轮，等多种场所适用的定阻有源吸顶音箱',
      image: a6Image,
      brand: 'AISPEECH'
    },
    {
      id: 'a7',
      name: '高端吸顶麦克风MC08',
      description: 'MC08是思必驰推出的一款适用教学场景的高端吸顶麦克风， 集成了多达32单元的全向麦克风阵列，提供了8个独立可配置拾音区，可实现通话拾音区、扩声拾音区、静音区等精细化拾音配置。',
      image: a7Image,
      brand: 'AISPEECH'
    },
    {
      id: 'a8',
      name: '企业级会议麦克风音箱 M12',
      description: 'M12是一款集拾音、扩音、语音转写、字幕同传于一体的企业级会议麦克风音箱，可通过多台级联，满足大中小型多类会议室需求。',
      image: a8Image,
      brand: 'AISPEECH'
    },
    {
      id: 'a9',
      name: 'AI追踪双目语音摄像头C60',
      description: 'C60是思必驰推出的一款集多种AI追踪模式，AI会议助理，AI实时字幕，音视频融合等特色能力的AI追踪双目语音摄像头，适用于会议场景中的讨论、演讲、板书等各类视频图像要求。',
      image: a9Image,
      brand: 'AISPEECH'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header section with company name and logos */}
        <Header />
        
        {/* AISPEECH Brand Products */}
        <div id="aispeech-products" className="mb-8 sm:mb-12">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-600">
            思必驰AISPEECH
            <br />
            <span className="text-red-600">样品、预约体验垂询：18814845538</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {aispeechProducts.map((product) => (
              <div 
                key={product.id} 
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <Link to={`/product/${product.id}`} className="block">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 mb-3 rounded-md overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-contain"
                      />
                  </div>
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </div>
        
        {/* HRAVC Brand Products */}
        <div id="hravc-products" className="mb-8 sm:mb-12">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900">HRAVC</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {hravcProducts.map((product) => (
              <div 
                key={product.id} 
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <Link to={`/product/${product.id}`} className="block">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 mb-3 rounded-md overflow-hidden">
                     <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-contain"
                      />
                  </div>
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="mt-8 sm:mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-1">联系方式：guo@techhdi.com | 18814845538</p>
          <p className="mb-1">地址：杭州市余杭区七彩汇商业中心2-305室</p>
          <p className="text-xs mt-2">ICP备案号：浙ICP备XXXXXXXX号 | 公安备案号：浙公网安备XXXXXXXX号</p>
        </div>
      </div>
    </div>
  );
}