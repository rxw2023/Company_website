import { Header } from '../components/Header';
import { Link } from 'react-router-dom'
// 导入AISPEECH产品图片
import a1Image from '../assets/images/a1-1.webp';
import a2Image from '../assets/images/a2-1.webp';
import a3Image from '../assets/images/a3-1.webp';
import a4Image from '../assets/images/a4-1.webp';
import a5Image from '../assets/images/a5-1.webp';
import a6Image from '../assets/images/a6-1.webp';
import a7Image from '../assets/images/a7-1.webp';
import a8Image from '../assets/images/a8-2.webp';
import a9Image from '../assets/images/a9-1.webp';
import a10Image from '../assets/images/a10-1.webp';
import quickImage from '../assets/images/aispeech-logo.webp';
import e1Image from '../assets/images/e1.webp';
import e2Image from '../assets/images/e2.webp';
import e3Image from '../assets/images/e3-1.webp';
import e4Image from '../assets/images/e4-1.webp';
import e5Image from '../assets/images/e5-1.webp';
import e6Image from '../assets/images/e6-1.webp';
import e7Image from '../assets/images/e7-1.webp';
import e8Image from '../assets/images/e8-1.webp';
import e9Image from '../assets/images/e9-1.webp';
import e10Image from '../assets/images/e10-1.webp';
import e11Image from '../assets/images/e11-1.webp';
import e12Image from '../assets/images/e12-1.webp';
// 定义产品数据类型
interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  brand: 'AISPEECH';
}
// 案例产品数据类型
interface CaseProduct {
  id: string;
  name: string;
  image: string;
  brand: 'AISPEECH';
}
export default function Home() {
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
    },
    {
      id: 'a10',
      name: '桌面控制器AIMIC-B100系列',
      description: 'AIMIC-B100系列作为思必驰精心打造的智能会议桌面控制器系列产品，专为现代高效会议量身定制。产品集智能控制、精准拾音与便捷部署于一身，是会议管理者的得力助手。',
      image: a10Image,
      brand: 'AISPEECH'
    },
    {
      id: 'a11',
      name: '后续产品尽情期待',
      description: '',
      image: quickImage,
      brand: 'AISPEECH'
    }
  ];
  const exampleProducts: CaseProduct[] = [
    {
      id: 'e1',
      name: '案例分享 - 香港科技大学',
      image:  e1Image,
      brand: 'AISPEECH'
    },
    {
      id:'e2',
      name:'案例分享 - 上海交通大学',
      image: e2Image,
      brand:'AISPEECH'

    },
    {
      id:'e3',
      name:'案例分享 - 上海虹口艺术幼儿园',
      image: e3Image,
      brand:'AISPEECH'
    },
    {
      id:'e4',
      name:'案例分享 - 华东师范大学',
      image: e4Image,
      brand:'AISPEECH'
    },
    {
      id:'e5',
      name:'案例分享 - 北京理工大学',
      image: e5Image,
      brand:'AISPEECH'
    },
    {
      id:'e6',
      name:'案例分享 - 成都大学',
      image: e6Image,
      brand:'AISPEECH'
    },
    {
      id:'e7',
      name:'案例分享 - 苏州广电跨年演讲晚会',
      image: e7Image,
      brand:'AISPEECH'
    },
    {
      id:'e8',
      name:'案例分享 - 苏州独墅湖世尊酒店',
      image: e8Image,
      brand:'AISPEECH'
    },
    {
      id:'e9',
      name:'案例分享 - 国泰基金',
      image: e9Image,
      brand:'AISPEECH'
    },
    {
      id:'e10',
      name:'案例分享 - 上海交通大学医学院附属仁济医院',
      image: e10Image,
      brand:'AISPEECH'
    },
    {
      id:'e11',
      name:'案例分享 - 国际陆港集团',
      image: e11Image,
      brand:'AISPEECH'
    },
    {
      id:'e12',
      name:'案例分享 - 成都新希望金融科技',
      image: e12Image,
      brand:'AISPEECH'
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
                  <div className="aspect-video bg-gray-75 dark:bg-gray-800 mb-3 rounded-md overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-contain"
                        loading="lazy"
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
        {/* 案例展示 */}
        <div id="example-products" className="mb-8 sm:mb-12">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900">案例集锦</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {exampleProducts.map((product) => (
              <div 
                key={product.id} 
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <Link to={`/case/${product.id}`} className="block">
                  <div className="aspect-video bg-gray-75 dark:bg-gray-800 mb-3 rounded-md overflow-hidden">
                     <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                  </div>
                  <h3 className="font-medium">{product.name}</h3>
                </Link>
              </div>
            ))}
          </div>
        </div>
        {/* Contact Information */}
        <div className="mt-8 sm:mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-1">联系方式：guo@techhdi.com | 18814845538</p>
          <p className="mb-1">地址：杭州市余杭区七彩汇商业中心2-305室</p>
      <p className="text-xs mt-2 flex justify-center items-center gap-4" style={{color: '#9ca3af'}}>
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
  );
}