import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback } from 'react';

// ── 产品详情数据（摘要搜索用） ──
interface ProductDetail {
  id: string;
  name: string;
  description?: string;
  /** 搜索用全文：description + specs 展平 */
  fullText?: string;
}

const productDetails: ProductDetail[] = [
  { id: 'a1', name: '思必驰MC10吸顶麦克风', description: 'MC10是思必驰推出的一款高端吸顶会议麦克风，其集成了多达128单元的全向麦克风阵列，提供了16个独立可配拾音区，可实现精细化拾音配置。采用了Dante数字音频技术, 确保音频传输稳定和广泛兼容。MC10内置AI算法，提供高清降噪、去混响、反馈抑制、自动增益和语音转写等功能。',
    fullText: 'MC10吸顶麦克风 128单元全向MEMS麦克风阵列 16个独立可配拾音区 Dante数字音频 AI降噪 AI去混响 AI反馈抑制 AI自动增益 AI语音转写 基本规格: 颜色淡雅白 尺寸597mm*597mm*53.5mm 净重<5KG 供电PoE+ 安装吊装 音频性能: 拾音区16个 采样率48kHz 拾音区类型可配 最大背景噪声抑制35dB AI降噪支持 AI混响抑制支持 AI啸叫抑制支持 AI回声消除支持 AI全双工支持 混音通道支持 智能混音支持 延迟25ms 麦克风规格: 128单元MEMS麦克风阵列 灵敏度-38dBv 信噪比65dBv Dante音频: Dante音频支持 远程会议通道1路 本地扩声通道1个 功能特性: 级联数量无限制 级联方式Dante音频/PoE网线级联 接口: Dante/PoE网口1个 RESET按键1个' },
  { id: 'a2', name: '思必驰MA600D 矩阵麦克风', description: '无感扩声新标杆，3m 拾音半径，>18dB 增益，AI 降噪 + 反馈抑制双算法。48kHz 采样率，低于 15ms 延迟。',
    fullText: 'MA600D矩阵麦克风 无感扩声 3m拾音半径 18dB扩声增益 AI降噪 反馈抑制双算法 48kHz采样率 15ms延迟 64单元MEMS麦克风阵列 24个可配拾音区 基本规格: 颜色雅致灰 尺寸505mm*90mm*32.5mm 净重约3kg 供电PoE+ 安装桌面布放/落地支架/吊杆/缆绳吊装/壁挂 音频性能: 拾音区24个形状大小角度可调位置可拖拽 采样率48kHz 拾音区类型可配通话拾音区扩声拾音区静音区 波束类型4种 拾音区隔离度>20dB 最大背景噪声抑制35dB AI降噪可调节 AI混响支持 AI回声消除支持 AI全双工支持 混音通道支持 智能混音支持 延迟<15ms 扩声增益>18dB 麦克风规格: 64单元MEMS麦克风阵列 灵敏度-38dBv 频响20Hz~20000Hz 动态范围84dB 最大声压级104dB SPL 信噪比73.9dBA 传感器: 光感传感器1个 陀螺仪6轴1个 Dante音频: Dante支持 远程会议通道1路 本地扩声通道1路 功能特性: 级联数量无限制 级联方式Dante音频/PoE网线级联 接口: Dante/PoE网口1个 Type-C1个 模拟输入2个 模拟输出2个 按键: RESET按键1个 FAQ: MA600D拾音半径现场扩声3米远程通话6米 安装方式桌面放置壁挂吊顶落地支架 6轴陀螺仪智能感知 现场扩声延迟≤15ms 有效扩声增益≥18dB MK300嵌入套件配合安装 360度全向拾音 24个拾音区 B100系列静音优先按钮 无限制台数级联 预埋线缆Cat6以上' },
  { id: 'a3', name: '思必驰MCS06 拾扩一体吸顶麦克风', description: '32 单元全向阵列，4 个拾音区，支持 Dante，集拾音扩声于一体。PoE+ 供电。',
    fullText: 'MCS06拾扩一体吸顶麦克风 32单元全向麦克风阵列 4个独立可配拾音区 Dante数字音频 AI降噪 AI去混响 AI回声抑制 AI双讲通话 AI自动增益 AI语音转写 2个15W高性能扬声器 基本规格: 颜色淡雅白 尺寸597mm*597mm*72.5mm 净重<6KG 供电PoE+ 安装吊装 音频性能: 拾音区4个形状大小角度可调位置可拖拽 采样率48kHz 拾音区类型可配通话拾音区静音区 拾音区隔离度>20dB 最大背景噪声抑制35dB AI降噪可调节 AI混响抑制支持 AI回声消除支持 AI全双工支持5m以内 麦克风规格: 32单元MEMS麦克风阵列 灵敏度-38dBv 频响20Hz~20000Hz 动态范围84dB 最大声压级104dB SPL 信噪比73.9dBA 扬声器规格: 中低音喇叭15W1个 高音喇叭15W1个 频响80Hz~20KHz 最大输出电平90dB SPL Dante音频: Dante支持 功能特性: 级联数量无限制 级联方式Dante音频/PoE网线级联 接口: Dante/PoE网口1个 RESET按键1个 其他: 工作温度0~40℃ 存放温度-20~70℃ 湿度20-95%RH 整机功耗20W' },
  { id: 'a4', name: '思必驰C40T 视频会议摄像机', description: '4K 超高清，12 倍光学 + 16 倍数字变焦，适配各类企业会议室。支持 HDMI/SDI/USB 输出。',
    fullText: 'C40T视频会议室摄像机 4K超高清 12倍光学变焦 16倍数字变焦 水平260度平移 72.5度广角 视频叠加字幕 AI实时字幕 智能麦摄联动 画面人物自动居中 基本规格: 图像传感器1/2.8英寸CMOS 846万像素 焦距f=3.9mm-46.8mm 光圈F1.6-F3.0 光学变焦12倍 数字变焦16倍 视场角水平72.5度-6.3度 聚焦系统自动手动一键触发PTZ触发 快门速度1/60-1/10000秒 增益自动手动 白平衡自动手动一键触发自动跟踪 宽动态支持 信噪比≥50dB 功能特性: 智能麦摄联动支持搭配MT100和吸顶麦 画面人物自动居中 AI实时字幕支持接入AI麦克风 云台参数: 水平范围-130度~+130度 垂直范围-30度~+90度 水平转动速度0.2-90度/秒 垂直转动速度0.2-60度/秒 预置点256个 接口: HDMI1路 3G-SDI1路 USB3.0 1路 USB2.0 Host1路 网络10/100M RJ-45 POE 音频接口LINE IN 3.5mm REF Audio 3.5mm 控制接口RS-485 RS-232 电源DC12V 其他: 功耗<20W 尺寸245*145*164mm 重量≈2kg 颜色雅致灰' },
  { id: 'a5', name: '思必驰MT100 AI 声像追踪主机', description: '音视频融合追踪引擎，多种追踪模式（声源追踪、人脸追踪、区域追踪），适配企业与教育演讲场景。',
    fullText: 'MT100 AI智能声像追踪主机 音视频融合追踪 实时追踪发言人 4K@30fps PIP PBP多画面模式 PoE供电 基本规格: 产品型号AIVIS-MT100 分辨率最大4K@30fps 重量0.2KG 工作温度0~40℃ 存放温度-20~40℃ 电源DC12V 尺寸119mm*104mm*29mm 视频规格: 视频压缩H.265/H.264/MJPEG 视频输入最高4KP30 视频切换AI算法自动切换 预置位冻结支持 视频模式PIP PBP最多同时四路显示 HDMI: 输入1路预留 输出1路 分辨率4KP30 1080P 720P USB: USB2.0 Host1路预留 USB3.0 Device1路 UVC1.1协议 视频格式H.265/H.264/MJPEG 视频4K30 1080P 720P 网络: RJ-45 1路 10M/100M POE 视频输入多路4KP30 视频输出单路最高4KP30 解码能力4路画面解码为1路1080P30输出 音频接口: LINE IN 3.5mm 1路 LINE OUT 3.5mm 1路 其他: WEB UI配置 TF卡最大256G POE IEEE 802.3af' },
  { id: 'a6', name: '思必驰AISPK-DC20 PoE 吸顶音箱', description: '全频同轴天花扬声器，PoE 供电，适用商店、会议室、酒店多场景。Dante 数字音频。',
    fullText: 'AISPK-DC20PoE全频同轴有源吸顶音箱 Dante音频协议 高保真音频输出 PoE供电 嵌入式和吊挂安装 基本规格: 电源输入802.3af/at/bt兼容 音频传输协议Dante 音频输入端口RJ45 重量3.3KG 附加配件安全绳 音频性能: 低音单元6.5寸聚丙烯复合盆+NBR丁腈橡胶悬边 高音单元1寸蚕丝膜钕磁360度可旋转 频率响应65Hz-20kHz±3dB 系统阻抗8Ohms 输出声压89dB 1M/1W 最大声压111dB 额定输出功率30W RMS 峰值输出功率60W 安装参数: 安装开孔尺寸246mm圆孔 安装深度197mm 箱体材料铁质网罩+铁质工程箱体 安装方式嵌入式和吊挂安装' },
  { id: 'a7', name: '思必驰MC08 高端吸顶麦克风', description: '32 单元阵列，8 个独立配置拾音区，专为教学场景精心设计。支持 Dante，AI 降噪。',
    fullText: 'MC08高端吸顶麦克风 教学场景 32单元全向麦克风阵列 8个独立可配置拾音区 4扩声+4通话 Dante数字音频 模拟音频接口 教室扩声 远程教学 课程录播三合一 AI降噪 混响抑制 啸叫抑制 自动增益 语音转写 基本规格: 颜色淡雅白 尺寸445mm*445mm*57.5mm 净重<3KG 供电PoE+ 安装吊装 音频性能: 拾音区8个4个扩声拾音区4个通话拾音区 采样率48kHz 拾音区类型可配 最大背景噪声抑制35dB AI降噪支持 AI混响支持 AI啸叫支持 AI回声消除支持 AI全双工支持 混音通道支持 智能混音支持 麦克风规格: 32单元MEMS麦克风阵列 灵敏度-38dBv 信噪比65dBv Dante音频: Dante支持 远程会议通道1路 本地扩声通道1路 功能特性: MC08间不支持级联 接口: Dante/PoE网口1个 卡侬公头1个 卡侬母头2个 RESET按键1个' },
  { id: 'a8', name: '思必驰AIMIC-M12 企业级会议麦克风音箱', description: '集拾音、扩音、语音转写、字幕同传于一体，多台级联，覆盖大中小型会议室。',
    fullText: 'M12企业级会议麦克风音箱 拾音+扩音+语音转写+字幕同传 12个模拟全向麦克风 5米拾音半径 8W全频+8W高音喇叭 PoE级联最多5台 麦耳会记实时转写 基本规格: 尺寸250mm*119mm*39mm 重量500g左右 材质ABS 配色雅致灰 按键: 音量+触摸键 音量-触摸键 麦克风Mute触摸键 转写触摸键一键拉起麦耳会记 指示灯: 按键指示灯支持 状态灯带红色绿色蓝色 接口: USB Type-C USB2.0连接电脑 USB Type-A USB2.0调试口 DC电源接口 RJ45网络接口有线级联POE供电 声学: 麦克风12个模拟全向麦克风 频响100Hz-8kHz 喇叭1个8W全频+1个8W高音+1个无源辐射器 音乐模式频响80Hz-20kHz 通话模式频响150Hz-7.5kHz 电源: DC适配器12V/2A POE供电802.3at 30W 其他: 工作温度0~40℃ 存储温度-20~70℃ Kensington安全锁孔 CCC认证 RoHS认证' },
  { id: 'a9', name: '思必驰C60 AI 追踪双目摄像头', description: '多种 AI 追踪模式，实时字幕，音视频融合，适配会议讨论、演讲、板书。',
    fullText: 'C60 AI追踪双目语音摄像头 双目镜头 特写镜头+全景镜头 AI追踪模式 声源追踪 人脸追踪 白板跟拍 自动取景 AI会议助理 AI实时字幕 音视频融合 12倍光学变焦+16倍数字变焦 基本规格: 尺寸245mm*145mm*165mm 净重2KG左右 机身雅致灰 特写镜头: 图像传感器1/2.8英寸CMOS 214万像素 变焦12倍光学+16倍数字 水平视场角72.5度 全景镜头: 图像传感器1/2.8英寸CMOS 214万像素 水平视场角110度 视频性能: 增益支持 白平衡支持 曝光控制支持 云台规格: 水平+/-130度 垂直-30~+90度 水平速度0.1-100度/秒 垂直速度0.1-80度/秒 预置位64个 接口: RJ45 10/100M PoE USB2.0 Type-A Host USB3.0 Type-B 3G-SDI HDMI-OUT Line in 3.5mm REF Audio 3.5mm RS485 RS232 电源: DC12V/1.5A PoE 802.3af 8单元阵列线麦 DOA精度<5度' },
  { id: 'a10', name: '思必驰AIMIC-B100 桌面控制器', description: '智能控制 + 精准拾音 + 便捷部署，现代高效会议的得力助手。触控操作，PoE 供电。',
    fullText: 'AIMIC-B100桌面控制器 智能控制 精准拾音 便捷部署 全局静音 音量调节 VIP模式切换 有线版无线版 主席单元静音单元 基本规格: 尺寸R=40mm H=20.5mm 颜色淡雅黑 按键类型: 触控 安装方式: 有线版魔术贴固定/桌面挖孔 无线版魔术贴固定 按键配置: 有线静音版静音键音量加减键RESET按键 有线主席版VIP键静音键RESET按键 无线静音版静音键音量加减键RESET按键 接口: 有线版PoE网口1个 无线版Type-C1个 音频性能: 有线版内置全向麦克风人声检测支持 无线版无 供电方式: 有线版PoE供电 无线版1500mAh锂电池 通信方式: 有线版RJ45 PoE蓝牙 无线版蓝牙 核心功能: 有线静音版全局静音扩音音量调节 有线主席版VIP模式切换全局静音 无线主席版VIP模式切换全局静音 无线静音版全局静音扩音音量调节 兼容型号: 有线静音版MA600系列MCS06MC10系列MC08系列 有线主席版MA600系列 无线静音版MA600系列MCS06MC10系列MC08系列' },
  { id: 'a11', name: '思必驰MC04 高端吸顶麦克风-教育款', description: '24单元MEMS阵列，2m精准扩声覆盖，ClearSpeakAI算法，专为教室教学打造。',
    fullText: 'MC04高端吸顶麦克风教育款 24单元全向MEMS麦克风阵列 2米精准扩声覆盖半径 远程拾音3.5米 ClearSpeakAI专利算法 抑制板书声翻书声风扇声 混响抑制 啸叫抑制AFC 自动增益AGC 模拟音频接口 凤凰端子 基本规格: 颜色淡雅白 尺寸250mm*250mm*54mm 净重<2kg 供电PoE+ 安装吊装 麦克风规格: 24单元MEMS麦克风阵列 灵敏度-38dBv 频响20Hz~20000Hz 动态范围84dB 最大声压级104dB SPL 信噪比73.9dBA 音频特性: 拾音区4个形状大小可调位置可拖拽 扩声拾音半径2m推荐 远程拾音半径3.5m推荐 采样率48kHz 最大背景噪声抑制35dB AI降噪支持 AI混响支持 AI啸叫支持 AI回声消除支持 智能混音支持 音频通道: 远程会议通道1个 本地扩声通道1个 级联功能: 级联限制2台 接口: 网口1个10/100/1000M RJ-45 PoE 凤凰端子输入4个 凤凰端子输出2个 RESET按键1个 其他: 工作温度0~40℃ 存放温度-20~70℃ 湿度20-95%RH 整机功耗12W' },
  { id: 'a12', name: '思必驰MK300 桌面安装套件', description: '专为MA600D矩阵麦克风桌面部署定制，安装更美观整洁，适配高端会议空间。',
    fullText: 'MK300桌面安装套件 专为MA600D矩阵麦克风桌面部署定制 深空灰 安装更美观 部署更整洁 结构更贴合 产品信息: 产品型号MK300 颜色深空灰 适配设备矩阵麦克风MA600D系列 安装方式桌面固定安装 核心价值: 定制化结构设计与设备外观更协调 优化桌面安装形态让会议桌面更简洁有序 与矩阵麦克风匹配设计安装配合度更高 适用于会议桌接待桌报告桌等桌面部署场景 适用场景: 高端会议室 会客室 报告空间 指挥中心 安装步骤: 固定底座将底座安装至桌面预定位置 放置设备将矩阵麦克风与配件配合安装 完成部署完成安装后桌面呈现更简洁美观' },
  { id: 'a18', name: '思必驰会议办公大模型信创一体机D1', description: 'D1是思必驰基于自主创新技术推出的一款专为党政企客户会议办公效率提升的大模型信创一体机，内置"DFM+DeepSeek"双大语言模型加持，采用从底层芯片到上层应用的全国产化技术架构，基于自研的全链路智能语音语言技术，提供离线语音识别、声纹区分发言人、AI纪要生成等多种功能，可满足对数据安全性要求较高的政企客户会议研讨、演讲培训、知识库搭建等多场景会议纪要整理及结构化知识管理需求，帮助解决会议记录难、会议纪要整理费时费力等问题。'},
  { id: 'a19', name: '思必驰BYOM投屏套装（SW10+SD10）', description: '集无线投屏、BYOM会议、HDMI矩阵切换、会议室中控于一体，4K@60Hz超清画质，双网物理隔离，USB-C一线通60W供电，支持四画面同屏。',
    fullText: 'BYOM投屏套装 无线投屏 BYOM会议 HDMI矩阵切换 会议室中控 AIMATE-SW10投屏会议主机 AIMATE-SD10无线投屏器 4K@60Hz AirPlay Miracast 四画面同屏 双网物理隔离 USB-C 60W供电 10-100㎡会议室 政企会议室 教育研讨室 报告厅 音视频协作中枢 无需安装驱动 即连即投 无线BYOM双流传输 音频矩阵切换 双屏异显 RS232中控 CEC控制 2个千兆网口 Web UI Telnet API 集中运维 多会议室统一管理 批量配置 远程升级 自动休眠 唤醒 基本规格: 主机尺寸277.6×142×29.1mm 净重1.0kg 供电DC 20V 6A 最大功耗93W 视频输入1×HDMI 1路+1×USB-C 视频输出HDMI Out1最高4K@60Hz HDMI Out2最高4K@30Hz 音频输出2×HDMI+1×3.5mm模拟音频 USB接口1×USB 3.0 Type-B 3×USB 3.0 Type-A 1×USB-C 网络2×RJ45千兆 WiFi5双频 控制RS232+LAN+CEC 工作温度0~45℃ 无线投屏器SD10 USB-C接口 最高4K@30fps 5GHz/2.4GHz频段 触控回传 支持Windows/Mac' },
  ];

// ── 案例摘要数据 ──
interface CaseSummary {
  id: string;
  name: string;
  tag: string;
  snippet: string;
  /** 搜索用全文：snippet + sections 内容 */
  fullText?: string;
}

const caseSummaries: CaseSummary[] = [
  { id: 'e1', name: '香港科技大学', tag: '声像追踪案例', snippet: '教室空间较大，面向国际对实时中英翻译有需求。采用吸顶麦MC10+C60摄像头声像追踪方案，实现全向拾音和实时翻译投屏。',
    fullText: '香港科技大学 声像追踪案例 学校简介: 香港科技大学简称科大港科大，环太平洋大学联盟全球大学校长论坛东亚研究型大学协会亚洲大学联盟中国大学校长联谊会重要成员，AACSB和EQUIS双重认证世界知名研究型大学。 项目背景: 世界知名大学面向国际对实时中英翻译有需求，教室空间较大常用于授课开大会坐在后排听讲很难听清。 产品方案: 吸顶麦MC10+Dante扬声器DC20+Dante数字音频处理器DP88+C60AI追踪双目摄像头声像追踪解决方案。 案例效果: MC10无限级联实现大空间全向拾音无感扩声搭配C60和麦耳会记实现实时翻译投屏为国际学生带来更好的学习体验。' },
  { id: 'e2', name: '上海交通大学', tag: '会议扩声案例', snippet: '教室隔音不好，现有扩声设备效果差。采用MC10+DC20，有效降噪拾音，实现无感扩声。',
    fullText: '上海交通大学 会议扩声案例 学校简介: 上海交通大学是我国历史最悠久享誉海内外的高等学府之一，教育部直属并与上海市共建的全国重点大学，综合性创新型国际化国内一流国际知名大学。 项目背景: 教室面积较大常用于授课多人线下会议远程会议一侧为玻璃隔音效果不好多人会议或授课时声音较为嘈杂现有扩声设备扩声效果差听讲者容易听不清。 产品方案: 吸顶麦克风MC10+Dante扬声器DC20。 案例效果: 有效解决了教室扩音差拾音难等问题MC10有效降噪拾音即使多人会议也能清晰拾音真正实现无感扩声。' },
  { id: 'e3', name: '上海虹口艺术幼儿园', tag: '舞台场景案例', snippet: '教室面积大，手持麦频繁啸叫。采用MC10+DP88，实现高音质本地扩声，降本增效。',
    fullText: '上海虹口艺术幼儿园 舞台场景案例 学校简介: 虹口区艺术幼儿园始创于1992年3月以艺术教育和家庭教育指导为特色的全日制幼儿园占地面积2813平方米建筑面积2282平方米。 项目背景: 教室面积很大扩声设备仅为无线手持麦和领夹麦教室后面观众发言需要传递话筒非常不方便经常没有声音或频繁啸叫声表演时体验效果差影响互动。 产品方案: 思必驰吸顶麦MC10+DP88音频处理器。 案例效果: 实现了高音质效果的本地扩声有效提升了教室观众区域的互动体验同时减少了旧有设备的浪费节约了成本打造了降本增效的经典方案。' },
  { id: 'e4', name: '华东师范大学', tag: '教育案例', snippet: '培训教室希望改造成无感扩声教室。采用MC08+利旧设备，设置拾音屏蔽区，过滤走步声板书声。',
    fullText: '华东师范大学 MC08案例 学校简介: 华东师范大学位于上海市综合性研究型大学教育部主管211工程985工程世界一流大学建设高校A类。 项目背景: 教师培训室华师大学术交流中心1间面向全国中学校长的培训教室希望改造成无感扩声教室。 产品方案: 1台MC08+交换机+利旧原有的模拟功放音箱。 案例效果: MC08覆盖讲台区域设置了拾音屏蔽区屏蔽学员方向传来的人声AI降噪下仅保留讲师清晰的人声过滤走步声板书声敲击黑板和讲台的声音等轻松实现10dB的有效扩声增益。' },
  { id: 'e5', name: '北京理工大学', tag: '教育案例', snippet: '大阶梯教室有啸叫和混响。采用MC10吸顶麦，覆盖讲台和学生区域，教师彻底告别手持麦。',
    fullText: '北京理工大学 扇形教室案例 学校简介: 北京理工大学隶属于工业和信息化部国家历批次重点建设大学211工程985工程世界一流大学建设高校A类双一流建设高校。 项目背景: 学校大阶梯教室音频设备效果不好有啸叫和混响教师需长时间手持麦克风消耗教师体力影响师生互动。 产品方案: MC10吸顶麦。 案例效果: MC10能覆盖讲台区域和学生区域可自定义拾音区实现教学和互动不受影响吸顶麦的设计使教师彻底告别手持麦。' },
  { id: 'e6', name: '成都大学', tag: '教育案例', snippet: '120平米会见室传统扩声设备繁多。采用2片MC10+7台DC20级联，实现大空间轻松扩音。',
    fullText: '成都大学 接待室案例 学校简介: 成都大学四川省主管省市共建全日制普通高等本科院校教育部卓越工程师教育培养计划高校双万计划一流本科专业建设点。 项目背景: 120平米的会见室传统扩声设备繁多维护困难受设备限制无法做到全场景扩声。 产品方案: 2片MC10吸顶麦+7台DC20喇叭。 案例效果: MC10级联能够实现大空间轻松扩音即使座位距离相隔较远也能轻松听清楚由于会议室没有会议桌无法放置鹅颈麦手持麦传递在正式会议时不雅观使用不便捷用吸顶麦效果解决了所有难题。' },
  { id: 'e7', name: '苏州广电跨年演讲晚会', tag: '大型活动案例', snippet: '传统舞台圆桌论坛麦克风传递打乱节奏。采用3台矩阵麦，智能拾音区定制，15ms超低延迟无感扩声。',
    fullText: '苏州广电跨年演讲晚会 MA600D大型活动案例 公司简介: 2025年12月31日苏州名片相约12点跨年演讲活动迎来了科技与人文交融的高光时刻。 项目背景: 传统舞台圆桌论坛常受限于麦克风的物理限制麦克风的传递打乱交流节奏拾音死角导致发言遗漏环境噪音干扰声音清晰度与扩声系统兼容复杂等挑战。 产品方案: 矩阵麦3台。 案例效果: 通过智能拾音区的定制化设置精准定位每位嘉宾的发言位置同时智能屏蔽环境噪音与干扰音超低15ms延迟特性和洪亮清晰的无感扩声效果为现场嘉宾和观众创造了无感扩声的沉浸式体验矩阵麦的稳定拾音能力克服了传统麦克风的局限无论嘉宾坐姿如何变化与麦克风距离远近声音都能保持稳定清晰。' },
  { id: 'e8', name: '苏州独墅湖世尊酒店', tag: '酒店案例', snippet: '每日密集会议排期，手持麦反复充电调试。采用MC10吸顶麦一次部署无需重复调试，翻台效率大幅提升。',
    fullText: '苏州独墅湖世尊酒店 酒店案例 公司简介: 苏州独墅湖世尊酒店位于苏州城市副中心苏州地区高端商务会议型酒店拥有20余个功能各异的宴会厅与会议室每日承接多场高端商务会议国际论坛与大型宴会。 项目背景: 酒店会议厅每日多达3-4场的密集会议排期给设备维护团队带来巨大的工作量手持麦克风需要反复充电调试鹅颈麦克风每次会议都要重新部署定位不同会议对音频设备的需求各异。 产品方案: 吸顶麦MC10*2 DP88*1 DC20*9 DU11*1。 案例效果: 吊顶式安装与智能声学处理实现了一次部署无需重复调试让会议室翻台效率提升彻底告别传统话筒反复调试的繁琐全年减少部署调试次数上万次系统7×24小时稳定运行有效杜绝设备突发故障每年可为酒店节省大量运维人力成本。' },
  { id: 'e9', name: '国泰基金', tag: '金融案例', snippet: '会议室面积大，原有拾音设备不理想。采用MC10+DP88，实现大空间无感扩声，吸顶设计美观便利。',
    fullText: '国泰基金 金融案例 公司简介: 国泰基金管理有限公司成立于1998年3月国内首批规范成立的基金管理公司之一具有公募基金社保基金投资管理人企业年金投资管理人特定客户资产管理业务和合格境内机构投资人资格全牌照基金管理公司。 项目背景: 会议室面积较大原有的拾音设备无法达到用户理想效果需求室内装修已经成型想要解决拾音设备美观性问题。 产品方案: 吸顶麦克风MC10+Dante数字音频处理器DP88。 案例效果: MC10实现大空间会议无感扩声为客户带来了清晰的拾音体验吸顶的设计满足了客户对灵活空间处理的需求使拾音设备在高效拾音的同时实现了便利美观。' },
  { id: 'e10', name: '上海仁济医院', tag: '医疗案例', snippet: '传统视频会诊系统单台摄像机角度受限。采用MC10+C60声像追踪方案，实现全场景智能拾音和多角度发言人追踪。',
    fullText: '上海交通大学医学院附属仁济医院 声像追踪案例医疗案例 公司简介: 仁济医院拥有180年历史的顶级三甲医院年门急诊量超500万人次手术量逾10万台次国家级重点学科和临床医学研究中心。 项目背景: 传统视频会诊系统面临严峻挑战当多位专家同时参与会诊讨论或学术交流时现有远程会议终端因仅配置了单台摄像机存在拍摄角度受限无法自动追踪发言人等问题同时手持麦音质效果不好。 产品方案: 吸顶麦MC10+AI摄像头声像追踪解决方案。 案例效果: 实现了全场景智能拾音多角度发言人追踪和高质量音视频传输显著提升了远程医疗协作效率和会诊质量。' },
  { id: 'e11', name: '国际陆港集团', tag: '企业案例', snippet: '跨部门跨地区沟通协作需求高。采用MC10+MT100+C40T声像追踪方案，会议效率提升30%。',
    fullText: '国际陆港集团 声像追踪案例企业案例 公司简介: 河北陆港集团是以内陆港建设为主海港空港等多式联运运营管理为辅的现代化国际化物流企业。 项目背景: 陆港集团的业务覆盖多个领域项目团队需要频繁进行跨部门跨地区的沟通协作集团对办公设备会议系统远程协作的高效性灵活性提出了更高要求。 产品方案: 吸顶麦MC10*2 声像追踪主机MT100*1 摄像头C40T*2。 案例效果: AI声像追踪让远程会议参与者能够获得身临其境的会议体验自新系统上线以来集团的会议效率提升了30%项目协同时间缩短了20%。' },
  { id: 'e12', name: '成都新希望金融科技', tag: '金融科技案例', snippet: '300平展厅对接语音数字人，需屏蔽周边噪音。采用4台MC10+DP88，构建全域高质量语音覆盖。',
    fullText: '成都新希望金融科技 展厅案例 公司简介: 成都新希望金融科技有限公司一家为全国银行零售数字化转型提供整车交付服务的公司。 项目背景: 300平的展厅用于对接语音数字人需要屏蔽窃窃私语开放式展厅需要屏蔽过道走廊隔壁会议室的声音干扰保证展厅任意位置都能和数字人顺畅对话。 产品方案: 4台吸顶麦MC10+一台DP88+DU11。 案例效果: 成功为展厅构建了一个高效清晰稳定的语音采集前端有效解决了周边环境噪音和混响的干扰问题确保了展厅内全域的高质量语音覆盖为数字人应用提供了坚实的听觉保障使每一位访客都能享受到无缝流畅自然的沉浸式语音交互体验。' },
];

// ── FAQ 数据 ──
interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FaqItem[] = [
  { category: '公司与服务', question: '恒迪视讯是做什么的？', answer: '恒迪视讯（杭州）科技有限公司是一家专注于专业音视频解决方案的技术公司，是思必驰（AISPEECH）的授权代理商，为企业、高校、政府机构、酒店等提供智能会议室音视频系统集成与技术支持服务。' },
  { category: '公司与服务', question: '恒迪视讯代理哪些品牌？', answer: '目前主要代理思必驰（AISPEECH）品牌的智能会议音视频产品，包括吸顶麦克风、矩阵麦克风、拾扩一体设备、会议摄像机、AI声像追踪主机、吸顶音箱、桌面控制器等全系产品。' },
  { category: '公司与服务', question: '如何联系恒迪视讯咨询或采购？', answer: '可通过电话 18814845538 联系我们的销售顾问，我们提供样品体验、技术方案设计、现场勘测等服务，支持全国交付。' },
  { category: '产品相关', question: '思必驰AISPEECH MC10吸顶麦克风有什么特点？', answer: 'MC10是一款高端吸顶会议麦克风，集成128单元全向麦克风阵列，提供16个独立可配拾音区，支持精细化拾音配置，适用于大型会议室、报告厅等场景，可实现通话区、扩声区、静音区灵活划分。' },
  { category: '产品相关', question: 'MA600D矩阵麦克风适合什么场景？', answer: 'MA600D是无感扩声新标杆，拥有3米拾音半径、18dB以上扩声增益、48kHz采样率及低于15ms的延迟，配备AI降噪和反馈抑制双算法，适合中大型会议室、报告厅、多功能厅等对音质要求较高的场合。' },
  { category: '产品相关', question: 'C40T会议摄像机支持多大分辨率？', answer: 'C40T支持4K超高清分辨率，具备12倍光学变焦和16倍数字变焦，专为现代企业会议室设计，确保视频会议中的每个细节都清晰可见。' },
  { category: '产品相关', question: 'AISPEECH产品支持Dante数字音频协议吗？', answer: '是的，MCS06拾扩一体吸顶麦克风等部分产品支持Dante数字音频技术，可通过标准以太网传输高质量数字音频，便于大型系统集成和扩展。' },
  { category: '产品相关', question: 'AI追踪双目语音摄像头C60有哪些AI功能？', answer: 'C60集成了多种AI追踪模式（声源追踪、人脸追踪、区域追踪）、AI会议助理、AI实时字幕、音视频融合等特色能力，适用于会议讨论、演讲、板书等各类视频场景。' },
  { category: '安装与技术', question: '吸顶麦克风的安装难度大吗？', answer: '思必驰吸顶麦克风采用标准吊装设计，支持PoE供电（网线供电），无需独立电源，布线简洁。专业安装人员通常可在1-2天内完成中型会议室的全套安装调试。' },
  { category: '安装与技术', question: '多套设备可以级联使用吗？', answer: '可以。例如企业级会议麦克风音箱M12支持多台级联，满足大、中、小型会议室的不同需求；部分吸顶麦克风也支持多设备组网覆盖大空间。' },
  { category: '安装与技术', question: '产品是否提供技术培训和售后支持？', answer: '恒迪视讯提供完整的售前咨询、方案设计、现场安装指导以及售后技术支持服务，并可协助对接思必驰原厂技术团队，保障系统稳定运行。' },
  { category: '应用场景', question: '思必驰AISPEECH产品适合哪些应用场景？', answer: '主要适用于：企业会议室（大、中、小型）、高校多媒体教室和报告厅、政府机关会议室、医院远程会诊室、酒店宴会厅和会议中心、广播电视演播室等对音视频质量有较高要求的专业场所。' },
  { category: '应用场景', question: '已有哪些知名客户案例？', answer: '恒迪视讯已服务香港科技大学、上海交通大学、华东师范大学、北京理工大学、成都大学、上海交通大学医学院附属仁济医院、国泰基金、苏州独墅湖世尊酒店、国际陆港集团等多家知名机构。' },
];

// ── 搜索结果类型 ──
export interface SearchResult {
  type: 'product' | 'case' | 'faq';
  title: string;
  snippet: string;
  url: string;
}

// ── 构建全文索引 ──
function buildSearchIndex(): { title: string; text: string; result: SearchResult }[] {
  const idx: { title: string; text: string; result: SearchResult }[] = [];

  for (const p of productDetails) {
    idx.push({ title: p.name, text: p.fullText || p.description || '', result: { type: 'product', title: p.name, snippet: p.description || '', url: `/product/${p.id}` } });
  }
  for (const c of caseSummaries) {
    idx.push({ title: c.name, text: c.fullText || c.snippet, result: { type: 'case', title: `${c.name}`, snippet: c.snippet, url: `/case/${c.id}` } });
  }
  for (const f of faqData) {
    idx.push({ title: f.question, text: f.answer, result: { type: 'faq', title: f.question, snippet: f.answer, url: '/faq' } });
  }

  return idx;
}

const SEARCH_INDEX = buildSearchIndex();

function search(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const scored = SEARCH_INDEX
    .map((item) => {
      let score = 0;
      const titleL = item.title.toLowerCase();
      const textL = item.text.toLowerCase();
      for (const t of terms) {
        if (titleL.includes(t)) score += 10;
        else if (textL.includes(t)) score += 3;
      }
      return { ...item, score };
    })
    .filter((i) => i.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);
  return scored.map((s) => s.result);
}

// 高亮搜索词
function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const terms = query.trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return text;
  const pattern = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} style={{ background: '#FFE066', color: '#1d1d1f', borderRadius: 2, padding: '0 1px' }}>{part}</mark>
    ) : (
      part
    )
  );
}

// ── SearchModal 组件 ──
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 打开时聚焦
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
      setActiveIdx(0);
    }
  }, [isOpen]);

  // 搜索
  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    const r = search(val);
    setResults(r);
    setActiveIdx(0);
  }, []);

  // 跳转
  const goTo = useCallback((item: SearchResult) => {
    onClose();
    setTimeout(() => navigate(item.url), 50);
  }, [navigate, onClose]);

  // 键盘
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (!results.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => (i + 1) % results.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => (i - 1 + results.length) % results.length); }
    else if (e.key === 'Enter') { const t = results[activeIdx]; if (t) goTo(t); }
  }, [results, activeIdx, onClose, goTo]);

  // active 项滚动到可见
  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current.children[activeIdx] as HTMLElement | undefined;
      if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeIdx]);

  if (!isOpen) return null;

  const typeLabel: Record<string, string> = { product: '产品', case: '案例', faq: 'FAQ' };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.40)',
        backdropFilter: 'blur(4px)',
        display: 'flex', justifyContent: 'center',
        paddingTop: '15vh',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 580, maxWidth: '92vw',
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 16px 64px rgba(0,0,0,0.20), 0 0 0 1px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          maxHeight: '70vh',
          display: 'flex', flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 搜索输入行 */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: results.length > 0 ? '1px solid rgba(0,0,0,0.08)' : 'none' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginRight: 12, color: 'rgba(0,0,0,0.35)' }}>
            <circle cx="7.5" cy="7.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11.5 11.5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="搜索产品、案例、常见问题…"
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontSize: 16, color: '#1d1d1f',
              background: 'transparent',
              fontFamily: 'inherit',
              lineHeight: 1.5,
            }}
          />
          <button
            onClick={onClose}
            style={{
              flexShrink: 0, marginLeft: 8,
              width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: 'rgba(0,0,0,0.35)',
              background: 'transparent', border: 'none',
              borderRadius: 6, cursor: 'pointer',
              fontFamily: 'inherit', lineHeight: 1,
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; e.currentTarget.style.color = 'rgba(0,0,0,0.65)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(0,0,0,0.35)'; }}
          >
            ×
          </button>
        </div>

        {/* 结果列表 */}
        <div ref={listRef} style={{ overflow: 'auto', flex: 1 }}>
          {results.length > 0 ? (
            results.map((item, idx) => (
              <div
                key={`${item.type}-${idx}`}
                onClick={() => goTo(item)}
                style={{
                  display: 'flex', gap: 12, padding: '12px 20px',
                  cursor: 'pointer',
                  background: idx === activeIdx ? 'rgba(0,102,204,0.06)' : 'transparent',
                  borderBottom: idx < results.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = idx === activeIdx ? 'rgba(0,102,204,0.06)' : 'transparent'; }}
              >
                {/* 类型标记 */}
                <span style={{
                  flexShrink: 0, marginTop: 2,
                  fontSize: 10, fontWeight: 600,
                  color: item.type === 'product' ? '#0071e3' : item.type === 'case' ? '#34c759' : '#ff9500',
                  background: item.type === 'product' ? 'rgba(0,113,227,0.08)' : item.type === 'case' ? 'rgba(52,199,89,0.10)' : 'rgba(255,149,0,0.10)',
                  borderRadius: 4, padding: '2px 6px',
                  whiteSpace: 'nowrap', height: 'fit-content',
                }}>
                  {typeLabel[item.type]}
                </span>

                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#1d1d1f', marginBottom: 3, lineHeight: 1.4 }}>
                    {highlightText(item.title, query)}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.48)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {highlightText(item.snippet, query)}
                  </div>
                </div>
              </div>
            ))
          ) : query.trim() ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(0,0,0,0.40)', fontSize: 14 }}>
              未找到相关内容
            </div>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(0,0,0,0.30)', fontSize: 13 }}>
              输入关键词搜索产品、案例和常见问题
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Navigation ──
export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [searchOpen, setSearchOpen] = useState(false);

  const scrollTo = (id: string) => {
    if (isHome) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/', { state: { scrollTo: id } });
    }
  };

  const goHome = () => {
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  // CMD+K / Ctrl+K 打开搜索
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <>
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          height: 64, background: 'rgba(255,255,255,0.80)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        {/* 左：Logo */}
        <span onClick={goHome} style={{ fontSize: 20, fontWeight: 600, color: '#1d1d1f', letterSpacing: -0.3, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <img src="/hd-logo.webp" alt="" style={{ height: 36, width: 'auto', display: 'block' }} />
          恒迪视讯
        </span>

        {/* 中：菜单 */}
        <ul style={{ display: 'flex', gap: 28, listStyle: 'none', margin: 0, padding: 0 }}>
          {[
            { label: '首页', action: goHome },
            { label: '产品', action: () => scrollTo('products') },
            { label: '案例', action: () => scrollTo('cases') },
            { label: '关于我们', action: () => scrollTo('about') },
          ].map((item) => (
            <li key={item.label}>
              <span
                onClick={item.action}
                style={{ fontSize: 14, fontWeight: 400, color: 'rgba(0,0,0,0.72)', letterSpacing: -0.1, cursor: 'pointer', transition: 'color 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#1d1d1f')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(0,0,0,0.72)')}
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>

        {/* 右：搜索按钮 + 咨询热线 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          {/* 搜索按钮 */}
          <button
            onClick={() => setSearchOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 32, width: 200, padding: '0 12px',
              fontSize: 13, color: 'rgba(0,0,0,0.45)',
              background: 'rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.10)',
              borderRadius: 980, cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s, color 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.20)'; e.currentTarget.style.color = 'rgba(0,0,0,0.65)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.10)'; e.currentTarget.style.color = 'rgba(0,0,0,0.45)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>搜索</span>
          </button>

          {/* 咨询热线 */}
          <span
            onClick={() => scrollTo('footer')}
            style={{ fontSize: 14, color: '#0066cc', letterSpacing: -0.1, cursor: 'pointer', whiteSpace: 'nowrap' }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            咨询热线
          </span>
        </div>
      </nav>

      {/* 全屏搜索弹窗 */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
