import { useNavigate } from 'react-router-dom';

// 导入logo图片
import aispeechLogo from '../assets/images/aispeech-logo.jpg';
import hravcLogo from '../assets/images/hravc-logo.png';

interface HeaderProps {
  showHrAvcLogo?: boolean;
  showAiSpeechLogo?: boolean;
  isProductDetailPage?: boolean;
}

export function Header({ showHrAvcLogo = true, showAiSpeechLogo = true, isProductDetailPage = false }: HeaderProps) {
  const navigate = useNavigate();
  
  const handleLogoClick = (target: string) => {
    if (isProductDetailPage) {
      // 在产品详情页面，点击商标跳转到首页
      navigate('/');
    } else {
      // 在首页，点击商标滚动到对应产品系列
      const element = document.getElementById(target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="mb-6 sm:mb-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Company Name - 点击公司名称也跳转到首页 */}
        <div className="text-center mb-6">
          <h1 
            className="text-lg sm:text-2xl md:text-3xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          >
            杭州恒迪视讯技术有限公司
          </h1>
        </div>
        
        {/* Company Logos */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16">
          {showAiSpeechLogo && (
            <div className="flex items-center justify-center cursor-pointer" onClick={() => handleLogoClick('aispeech-products')}>
              <img 
                src={aispeechLogo} 
                alt="AISPEECH Logo" 
                className="w-[150px] sm:w-[200px] h-auto object-contain hover:opacity-80 transition-opacity"
              />
            </div>
          )}
          {showHrAvcLogo && (
            <div className="h-10 sm:h-12 flex items-center justify-center cursor-pointer" onClick={() => handleLogoClick('hravc-products')}>
              <img 
                src={hravcLogo} 
                alt="HRAVC Logo" 
                className="h-full object-contain hover:opacity-80 transition-opacity"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}