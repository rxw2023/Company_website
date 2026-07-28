import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatMessage } from './aiService';
import { sendMessageToSiliconFlow } from './aiService';

// ============ 配置 ============
const CONFIG = {
  /** SiliconFlow API Key */
  apiKey: import.meta.env.VITE_AI_API_KEY,
  model: import.meta.env.VITE_AI_MODEL,
};

// ============ 主题色（与全站暖色统一） ============
const C = {
  primary: '#cc785c',
  primaryActive: '#a9583e',
  ink: '#141413',
  body: '#3d3d3a',
  muted: '#6c6a64',
  hairline: '#e6dfd8',
  surface: '#efe9de',
  canvas: '#faf9f5',
  cardHover: '#f4efe6',
};

// ============ 组件 ============

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setStreamingText('');
  };

  // 助手头像 SVG
  const AssistantAvatar = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={C.primary}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  );

  const UserAvatar = ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );

  return (
    <>
      {/* 浮动按钮 + 呼吸光晕 */}
      <div className="fixed bottom-6 right-6 z-50" style={{ pointerEvents: 'none' }}>
        {/* 光晕环 */}
        {!isOpen && (
          <span
            aria-hidden
            style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%',
              background: C.primary,
              opacity: 0.18,
              animation: 'hd-pulse-ring 2.4s cubic-bezier(0.22,1,0.36,1) infinite',
              pointerEvents: 'none',
            }}
          />
        )}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          initial={false}
          whileHover={{ scale: 1.08, y: -1 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          aria-label={isOpen ? '关闭助手' : '打开知识助手'}
          style={{
            position: 'relative',
            width: 56, height: 56, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryActive} 100%)`,
            border: 'none', cursor: 'pointer',
            boxShadow: '0 10px 28px -8px rgba(169,88,62,0.55), 0 2px 6px -2px rgba(20,20,19,0.18)',
            pointerEvents: 'auto',
          }}
        >
          <svg
            width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
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
        </motion.button>
      </div>

      {/* 呼吸光晕关键帧 */}
      <style>{`
        @keyframes hd-pulse-ring {
          0%   { transform: scale(1);   opacity: 0.22; }
          70%  { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>

      {/* 聊天窗口 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-40 rounded-2xl flex flex-col overflow-hidden"
            style={{
              bottom: '88px',
              right: '24px',
              width: '380px',
              maxWidth: 'calc(100vw - 48px)',
              height: '540px',
              maxHeight: 'calc(100vh - 120px)',
              background: C.canvas,
              border: `1px solid ${C.hairline}`,
              boxShadow: '0 24px 60px -20px rgba(20,20,19,0.28), 0 4px 12px -4px rgba(20,20,19,0.10)',
            }}
          >
            {/* 头部 */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{
                background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryActive} 100%)`,
                borderBottom: `1px solid ${C.hairline}`,
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.18)' }}
                >
                  <AssistantAvatar size={16} />
                </div>
                <div>
                  <p style={{
                    color: '#fff', fontSize: 15, fontWeight: 500, lineHeight: 1.2,
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    letterSpacing: '-0.01em',
                  }}>
                    恒迪知识助手
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11.5, marginTop: 2 }}>
                    基于 DeepSeek · AI 驱动
                  </p>
                </div>
              </div>
              <button
                onClick={handleClear}
                style={{
                  color: 'rgba(255,255,255,0.75)', fontSize: 12,
                  padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                  background: 'transparent', border: 'none', fontFamily: 'inherit',
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; e.currentTarget.style.background = 'transparent'; }}
                title="清空对话"
              >
                清空
              </button>
            </div>

            {/* 消息列表 */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4"
              style={{ background: C.surface }}
            >
              {messages.length === 0 && !isLoading && (
                /* 欢迎提示 */
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-start gap-3"
                >
                  <div
                    className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center"
                    style={{ background: C.canvas, border: `1px solid ${C.hairline}` }}
                  >
                    <AssistantAvatar size={16} />
                  </div>
                  <div
                    className="rounded-lg rounded-tl-none px-3.5 py-2.5 max-w-[85%] text-sm leading-relaxed"
                    style={{ background: C.canvas, border: `1px solid ${C.hairline}`, color: C.body }}
                  >
                    你好！我是恒迪视讯的 AI 知识助手，可以帮你了解产品信息、方案咨询等问题。
                    <br /><br />
                    例如你可以问我：
                    <ul style={{ marginTop: 6, marginBottom: 0, paddingLeft: 0, listStyle: 'none', color: C.muted, fontSize: 13, lineHeight: 1.7 }}>
                      <li>· MC10 吸顶麦克风有什么特点？</li>
                      <li>· MA600D 矩阵麦克风用在哪些场景？</li>
                      <li>· 介绍一下 MC04 新产品</li>
                      <li>· 哪款产品适合大型会议室？</li>
                      <li>· 思必驰有哪些产品系列？</li>
                    </ul>
                  </div>
                </motion.div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={`${i}-${msg.timestamp}`}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {msg.role === 'user' ? (
                    <div
                      className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center"
                      style={{ background: C.primary }}
                    >
                      <UserAvatar size={14} />
                    </div>
                  ) : (
                    <div
                      className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center"
                      style={{ background: C.canvas, border: `1px solid ${C.hairline}` }}
                    >
                      <AssistantAvatar size={16} />
                    </div>
                  )}

                  {/* 消息气泡 */}
                  <div
                    className={`rounded-lg px-3.5 py-2.5 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user' ? 'rounded-tr-none text-white' : 'rounded-tl-none'
                    }`}
                    style={
                      msg.role === 'user'
                        ? { background: C.primary, color: '#fff' }
                        : { background: C.canvas, border: `1px solid ${C.hairline}`, color: C.body }
                    }
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* 流式输出中 */}
              {streamingText && (
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center"
                    style={{ background: C.canvas, border: `1px solid ${C.hairline}` }}
                  >
                    <AssistantAvatar size={16} />
                  </div>
                  <div
                    className="rounded-lg rounded-tl-none px-3.5 py-2.5 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ background: C.canvas, border: `1px solid ${C.hairline}`, color: C.body }}
                  >
                    {streamingText}
                    <span
                      className="inline-block ml-0.5 align-middle"
                      style={{
                        width: 6, height: 16, background: C.primary, borderRadius: 1,
                        animation: 'hd-blink 1s steps(2) infinite',
                        verticalAlign: 'text-bottom',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* 加载动画 */}
              {!streamingText && isLoading && (
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center"
                    style={{ background: C.canvas, border: `1px solid ${C.hairline}` }}
                  >
                    <AssistantAvatar size={16} />
                  </div>
                  <div
                    className="rounded-lg rounded-tl-none px-4 py-3"
                    style={{ background: C.canvas, border: `1px solid ${C.hairline}` }}
                  >
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((idx) => (
                        <span
                          key={idx}
                          style={{
                            width: 7, height: 7, borderRadius: '50%',
                            background: C.primary, opacity: 0.55,
                            animation: `hd-dot-bounce 1.2s ${idx * 0.16}s ease-in-out infinite`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 输入区域 */}
            <div
              className="shrink-0 px-3 py-3"
              style={{ background: C.canvas, borderTop: `1px solid ${C.hairline}` }}
            >
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入问题..."
                  rows={1}
                  disabled={isLoading}
                  className="flex-1 resize-none rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none disabled:opacity-60"
                  style={{
                    maxHeight: '80px',
                    background: C.surface,
                    border: `1px solid ${C.hairline}`,
                    color: C.ink,
                    fontFamily: 'inherit',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = C.primary; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = C.hairline; }}
                />
                <motion.button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  whileHover={input.trim() && !isLoading ? { scale: 1.05 } : undefined}
                  whileTap={input.trim() && !isLoading ? { scale: 0.92 } : undefined}
                  className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: input.trim() && !isLoading ? C.primary : C.hairline,
                    border: 'none', cursor: 'pointer',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" fill="white" />
                  </svg>
                </motion.button>
              </div>
              <p style={{ fontSize: 10, color: C.muted, marginTop: 6, textAlign: 'center', opacity: 0.8 }}>
                Powered by DeepSeek · 恒迪视讯技术支持
              </p>
            </div>

            {/* 光标和加载点关键帧 */}
            <style>{`
              @keyframes hd-blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
              @keyframes hd-dot-bounce {
                0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
                40% { transform: translateY(-4px); opacity: 1; }
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
