import { useNavigate } from 'react-router-dom';
import aispeechLogo from '../assets/images/aispeech-logo.png';
export function Header({ showAiSpeechLogo = true }: { showAiSpeechLogo?: boolean }) {
  const navigate = useNavigate();
  return (
    <div className="mb-6 sm:mb-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* AISPEECH Logo - 放大 */}
        {showAiSpeechLogo && (
          <div className="flex justify-center cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src={aispeechLogo} 
              alt="AISPEECH" 
              className="w-[360px] sm:w-[480px] h-auto object-contain opacity-80 hover:opacity-30 transition-opacity"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </div>
  );
}