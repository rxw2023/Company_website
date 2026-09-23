/**
 * AI 聊天服务层
 *
 * 安全设计（重要）：浏览器端**不持有**任何 API Key。
 * 请求打到本站同源的 /api-ai/，由服务端补上 Authorization 头：
 *   - 开发环境：vite.config.ts 的 dev proxy 注入（读取 .env.local 的 SILICONFLOW_API_KEY）
 *   - 生产环境：nginx 反代注入（见 DEPLOYMENT_GUIDE.md）
 * 因此密钥永远不会出现在打包产物里。请勿改回 VITE_ 前缀的变量。
 *
 * 知识库：system prompt 由 src/data/products.json 单一事实源生成，
 * 不再手写，避免官网参数与 AI 口径漂移。
 */
import { buildSystemPrompt } from '../../data/products';

// ============ 类型定义 ============

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface SendOptions {
  model?: string;
  onStream?: (text: string) => void;
}

/** 附带用户可读文案的聊天错误 */
export class AiChatError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'AiChatError';
  }
}

// ============ 配置 ============

/** 开发走 Vite 代理，生产走 nginx 反代；两者都会在服务端注入鉴权头 */
const AI_ENDPOINT = '/api-ai/v1/chat/completions';

const DEFAULT_MODEL = 'tencent/Hy4-preview';

/**
 * 模型 id → 面向访客的展示名。
 *
 * 此前 UI 里把 "DeepSeek" 写死在两个地方，换模型就会对外露出错误品牌。
 * 改为从模型 id 派生，换模型只需改 VITE_AI_MODEL 一处。
 */
export function getModelDisplayName(modelId?: string): string {
  const id = String(modelId || DEFAULT_MODEL).toLowerCase();
  if (id.includes('deepseek')) return 'DeepSeek';
  if (id.includes('hunyuan') || /(^|\/)hy\d/.test(id)) return '腾讯混元';
  if (id.includes('qwen')) return '通义千问';
  if (id.includes('glm')) return '智谱 GLM';
  if (id.includes('moonshot') || id.includes('kimi')) return 'Kimi';
  if (id.includes('minimax')) return 'MiniMax';
  return 'AI 大模型';
}

/**
 * 上下文预算：只保留最近 N 轮消息。
 * 之前把完整历史无限追加，长对话会撑爆模型上下文窗口导致请求失败。
 */
const MAX_HISTORY_MESSAGES = 20;

/** 单条用户输入长度上限，防止误粘贴超长文本打爆 token */
export const MAX_INPUT_LENGTH = 1000;

// ============ 内部工具 ============

function buildPayloadMessages(messages: ChatMessage[]) {
  const recent = messages.slice(-MAX_HISTORY_MESSAGES);
  return [
    { role: 'system', content: buildSystemPrompt() },
    ...recent.map((m) => ({ role: m.role, content: m.content })),
  ];
}

/** 把上游错误翻译成访客能看懂的话，且不泄露上游响应体 */
function toUserFacingError(status: number): AiChatError {
  if (status === 401 || status === 403) {
    return new AiChatError('智能助手暂时不可用，请稍后再试或直接联系销售。', status);
  }
  if (status === 429) {
    return new AiChatError('当前咨询人数较多，请稍等片刻再试，或直接联系销售。', status);
  }
  if (status >= 500) {
    return new AiChatError('智能助手服务暂时不稳定，请稍后再试。', status);
  }
  return new AiChatError('请求失败，请稍后再试或直接联系销售。', status);
}

interface SfChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

// ============ 主入口 ============

export async function sendMessageToSiliconFlow(
  messages: ChatMessage[],
  options: SendOptions = {}
): Promise<string> {
  const { model = DEFAULT_MODEL, onStream } = options;
  const payloadMessages = buildPayloadMessages(messages);

  // 注意：这里不设置 Authorization —— 由服务端注入
  const response = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: payloadMessages,
      stream: Boolean(onStream),
      /**
       * 关闭「思考」（推理）模式。
       *
       * 为什么必须关：`tencent/Hy4-preview` 是推理模型，会先逐字生成一大段
       * reasoning_content 再给正文。而下面的流式解析只读 delta.content，
       * 于是整段思考时间对访客就是空转 —— 界面只有三个跳动的点。
       *
       * 实测（同一提示词、问 MA600D 拾音半径）：
       *   默认            首正文 7.94s，推理 1058 字
       *   本参数关掉思考   首正文 0.63s，推理    0 字   ← 约 12 倍
       * 提示词里没有任何可依据的事实时（例如裸问一个型号），默认设置甚至会
       * 先推理 4151 字、首正文 48.7s。
       *
       * 关掉后答案质量没有下降，三项目标均仍然成立：区分「现场扩声 3m /
       * 纯录音·远程通话 6m」的前提、主动把价格与交期引给销售、对提示词里
       * 没有的参数明确拒答而不推测。
       *
       * 参数兼容性：已实测把它发给非推理模型（Qwen2.5-14B-Instruct）
       * 返回 HTTP 200 且被忽略，不会 400 —— 所以以后换模型不必删掉这行。
       */
      enable_thinking: false,
    }),
  });

  if (!response.ok) {
    throw toUserFacingError(response.status);
  }

  // ── 非流式 ──
  if (!onStream) {
    const data: SfChatResponse = await response.json();
    return data.choices?.[0]?.message?.content || '抱歉，我暂时无法回答这个问题。';
  }

  // ── 流式 ──
  const reader = response.body?.getReader();
  if (!reader) throw new AiChatError('无法获取响应流，请稍后再试。');

  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') continue;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          fullText += delta;
          onStream(fullText);
        }
      } catch {
        // 忽略不完整的 SSE 分片
      }
    }
  }

  return fullText || '抱歉，我暂时无法回答这个问题。';
}
