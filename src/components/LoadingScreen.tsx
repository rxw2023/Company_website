import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';

const STORAGE_KEY = 'hd-loading-shown';
const DURATION = 1.8; // 进度条动画时长 s

/**
 * 首屏加载仪式动画（Son Daven 风格）。
 * 仅在首次会话显示一次（sessionStorage），完成后淡出。
 * 背景与首页一致 #faf9f5，避免 prerender 空白到内容的跳变。
 */
export default function LoadingScreen() {
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const mv = useMotionValue(0);

  useEffect(() => {
    // 会话内已显示过则直接跳过
    if (sessionStorage.getItem(STORAGE_KEY)) {
      setDone(true);
      setProgress(100);
      return;
    }

    let exitTimer = 0;
    const controls = animate(mv, 100, {
      duration: DURATION,
      ease: [0.65, 0, 0.35, 1], // easeInOutCubic
      onUpdate: (v) => setProgress(Math.round(v)),
      onComplete: () => {
        // 短暂停留后淡出
        exitTimer = window.setTimeout(() => {
          setDone(true);
          sessionStorage.setItem(STORAGE_KEY, '1');
        }, 280);
      },
    });

    return () => {
      controls.stop();
      clearTimeout(exitTimer);
    };
  }, [mv]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#faf9f5',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            pointerEvents: 'none', // 不阻断下方交互准备
          }}
        >
          {/* Logo */}
          <motion.img
            src="/hd-logo.webp"
            alt="恒迪视讯"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{
              height: 60,
              width: 'auto',
              marginBottom: 28,
              mixBlendMode: 'multiply',
            }}
          />

          {/* 衬线斜体标语 */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontStyle: 'italic',
              fontSize: 22,
              fontWeight: 400,
              color: '#141413',
              letterSpacing: '-0.01em',
              marginBottom: 56,
              textAlign: 'center',
            }}
          >
            Redefining Meeting Experience
          </motion.p>

          {/* 进度区 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ width: 260, maxWidth: '78vw' }}
          >
            {/* 上行：标签 + 数字 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  color: '#6c6a64',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  fontFamily: '"Inter", -apple-system, sans-serif',
                  fontWeight: 500,
                }}
              >
                Loading
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: '#141413',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '0.02em',
                }}
              >
                {String(progress).padStart(3, '0')}
              </span>
            </div>

            {/* 进度条 */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: 1,
                background: '#e6dfd8',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${progress}%`,
                  background: '#cc785c',
                  transition: 'none',
                }}
              />
            </div>

            {/* 底部小字 */}
            <div
              style={{
                marginTop: 14,
                textAlign: 'center',
                fontSize: 10,
                color: '#a09d96',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontFamily: '"Inter", -apple-system, sans-serif',
              }}
            >
              恒迪视讯 · Please wait
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
