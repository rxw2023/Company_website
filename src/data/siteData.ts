/** 网站全局数据 - 供 Home 页展示和 Navigation 搜索共用 */

export interface Product {
  id: string;
  name: string;
  desc: string;
}

export interface Case {
  id: string;
  tag: string;
  name: string;
}

export const products: Product[] = [
  { id: 'a2',  name: 'MA600D 矩阵麦克风',          desc: '无感扩声新标杆，3m 拾音半径，>18dB 增益，AI 降噪 + 反馈抑制双算法。' },
  { id: 'a12', name: 'MK300 桌面安装套件',            desc: '专为MA600D矩阵麦克风桌面部署定制，安装更美观整洁，适配高端会议空间。' },
  { id: 'a10', name: 'AIMIC-B100 桌面控制器',        desc: '智能控制 + 精准拾音 + 便捷部署，现代高效会议的得力助手。' },
  { id: 'a7',  name: 'MC08 高端吸顶麦克风',          desc: '32 单元阵列，8 个独立配置拾音区，专为教学场景精心设计。' },
  { id: 'a1',  name: 'MC10 吸顶麦克风',             desc: '128 单元全向麦克风阵列，16 个独立可配拾音区，精细化拾音配置。' },
  { id: 'a11', name: 'MC04 高端吸顶麦克风-教育款',    desc: '24单元MEMS阵列，2m精准扩声覆盖，ClearSpeakAI算法，专为教室教学打造。' },
  { id: 'a3',  name: 'MCS06 拾扩一体吸顶麦克风',     desc: '32 单元全向阵列，4 个拾音区，支持 Dante，集拾音扩声于一体。' },
  { id: 'a6',  name: 'AISPK-DC20 PoE 吸顶音箱',    desc: '全频同轴天花扬声器，PoE 供电，适用商店、会议室、酒店多场景。' },
  { id: 'a8',  name: 'AIMIC-M12 企业级会议麦克风音箱', desc: '集拾音、扩音、语音转写、字幕同传于一体，多台级联，覆盖大中小型会议室。' },
  { id: 'a9',  name: 'C60 AI 追踪双目摄像头',        desc: '多种 AI 追踪模式，实时字幕，音视频融合，适配会议讨论、演讲、板书。' },
  { id: 'a4',  name: 'C40T 视频会议摄像机',          desc: '4K 超高清，12 倍光学 + 16 倍数字变焦，适配各类企业会议室。' },
  { id: 'a5',  name: 'MT100 AI 声像追踪主机',        desc: '音视频融合追踪引擎，多种追踪模式，适配企业与教育演讲场景。' },
];

export const cases: Case[] = [
  { id: 'e1',  tag: '高等教育', name: '中国香港科技大学' },
  { id: 'e2',  tag: '高等教育', name: '上海交通大学' },
  { id: 'e3',  tag: '学前教育', name: '上海虹口艺术幼儿园' },
  { id: 'e4',  tag: '高等教育', name: '华东师范大学' },
  { id: 'e5',  tag: '高等教育', name: '北京理工大学' },
  { id: 'e6',  tag: '高等教育', name: '成都大学' },
  { id: 'e7',  tag: '大型活动', name: '苏州广电跨年演讲晚会' },
  { id: 'e8',  tag: '酒店会场', name: '苏州独墅湖世尊酒店' },
  { id: 'e9',  tag: '金融机构', name: '国泰基金' },
  { id: 'e10', tag: '医疗机构', name: '上海仁济医院' },
  { id: 'e11', tag: '物流企业', name: '国际陆港集团' },
  { id: 'e12', tag: '金融科技', name: '成都新希望金融科技' },
];
