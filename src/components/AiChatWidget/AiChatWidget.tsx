import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from './aiService';
import { sendMessageToSiliconFlow } from './aiService';

// ============ 配置 ============
const CONFIG = {
  /** SiliconFlow API Key */
  apiKey: import.meta.env.VITE_AI_API_KEY || '',
  model: import.meta.env.VITE_AI_MODEL || 'deepseek-ai/DeepSeek-V3',
};

// ============ 组件 ============

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  // 发送消息
  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    // 添加用户消息
    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setStreamingText('');

    try {
      const reply = await sendMessageToSiliconFlow(
        [...messages, userMsg],
        CONFIG.apiKey,
        CONFIG.model,
        (chunk) => setStreamingText(chunk)
      );

      setStreamingText('');
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: reply, timestamp: Date.now() },
      ]);
    } catch (err) {
      console.error('AI 聊天错误:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setStreamingText('');
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `[调试] 请求失败，原因：${errMsg}\n\n如有紧急需求请联系：18814845538`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 回车发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 清空对话
  const handleClear = () => {
    setMessages([]);
    setStreamingText('');
  };

  return (
    <>
      {/* 浮动按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #378ADD 0%, #185FA5 100%)',
          border: 'none',
          cursor: 'pointer',
        }}
        aria-label={isOpen ? '关闭助手' : '打开知识助手'}
      >
        {/* 图标：聊天 / 关闭切换 */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: 'transform 0.3s', transform: isOpen ? 'rotate(90deg)' : 'rotate(0)' }}
        >
          {isOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <circle cx="9" cy="10" r="1" fill="white" stroke="none" />
              <circle cx="12" cy="10" r="1" fill="white" stroke="none" />
              <circle cx="15" cy="10" r="1" fill="white" stroke="none" />
            </>
          )}
        </svg>
      </button>

      {/* 聊天窗口 */}
      {isOpen && (
        <div
          className="fixed z-40 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
          style={{
            bottom: '88px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 48px)',
            height: '540px',
            maxHeight: 'calc(100vh - 120px)',
            background: '#fff',
            border: '1px solid #e5e7eb',
          }}
        >
          {/* 头部 */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ background: 'linear-gradient(135deg, #378ADD 0%, #185FA5 100%)' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium leading-tight">恒迪知识助手</p>
                <p className="text-white/70 text-xs">基于 DeepSeek · AI 驱动</p>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="text-white/70 hover:text-white text-xs px-2 py-1 rounded transition-colors"
              title="清空对话"
            >
              清空
            </button>
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: '#f9fafb' }}>
            {messages.length === 0 && !isLoading && (
              /* 欢迎提示 */
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center"
                  style={{ background: '#E6F1FB' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#185FA5">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                </div>
                <div
                  className="rounded-lg rounded-tl-none px-3 py-2.5 max-w-[85%] text-sm leading-relaxed"
                  style={{ background: '#fff', border: '1px solid #e5e7eb', color: '#374151' }}
                >
                  你好！我是恒迪视讯的 AI 知识助手，可以帮你了解产品信息、方案咨询等问题。
                  <br /><br />
                  例如你可以问我：
                  <ul className="mt-1.5 space-y-1 text-gray-600">
                    <li>• MC10 吸顶麦克风有什么特点？</li>
                    <li>• MA600D矩阵麦克风用在哪些场景？</li>
                    <li>• 哪款产品适合大型会议室？</li>
                    <li>• 思必驰有哪些产品系列？</li>
                  </ul>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={`${i}-${msg.timestamp}`} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'user' ? (
                  /* 用户头像 */
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-blue-500 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                ) : (
                  /* 助手头像 */
                  <div className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center" style={{ background: '#E6F1FB' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#185FA5">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                    </svg>
                  </div>
                )}

                {/* 消息气泡 */}
                <div
                  className={`rounded-lg px-3 py-2.5 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'rounded-tr-none text-white'
                      : 'rounded-tl-none'
                  }`}
                  style={
                    msg.role === 'user'
                      ? { background: '#378ADD' }
                      : { background: '#fff', border: '1px solid #e5e7eb', color: '#374151' }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* 流式输出中 */}
            {streamingText && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center" style={{ background: '#E6F1FB' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#185FA5">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                </div>
                <div
                  className="rounded-lg rounded-tl-none px-3 py-2.5 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ background: '#fff', border: '1px solid #e5e7eb', color: '#374151' }}
                >
                  {streamingText}
                  <span className="inline-block w-1.5 h-4 bg-blue-400 ml-0.5 align-middle animate-pulse" />
                </div>
              </div>
            )}

            {/* 加载动画 */}
            {!streamingText && isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center" style={{ background: '#E6F1FB' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#185FA5">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                </div>
                <div
                  className="rounded-lg rounded-tl-none px-4 py-3"
                  style={{ background: '#fff', border: '1px solid #e5e7eb' }}
                >
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="shrink-0 px-3 py-3 border-t border-gray-100 bg-white">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入问题..."
                rows={1}
                disabled={isLoading}
                className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
                style={{ maxHeight: '80px' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-600 active:scale-95"
                style={{ background: input.trim() && !isLoading ? '#378ADD' : '#d1d5db' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" fill="white" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 text-center">Powered by DeepSeek · 恒迪视讯技术支持</p>
          </div>
        </div>
      )}
    </>
  );
}
