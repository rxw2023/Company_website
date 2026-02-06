import * as React from 'react';
const { useState, useEffect } = React;
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import GIcon from '../assets/images/G.png';

import a1Image1 from '../assets/images/a1-1.jpg';
import a1Image2 from '../assets/images/a1-2.jpg';
import a1Image3 from '../assets/images/a1-3.jpg';
import a1Image4 from '../assets/images/a1-4.jpg';
import a2Image1 from '../assets/images/a2-1.png';
import a2Image2 from '../assets/images/a2-2.png';
import a2Image3 from '../assets/images/a2-3.png';
import a2Image4 from '../assets/images/a2-4.png';
import a3Image1 from '../assets/images/a3-1.jpg';
import a3Image2 from '../assets/images/a3-2.jpg';
import a3Image3 from '../assets/images/a3-3.jpg';
import a3Image4 from '../assets/images/a3-4.jpg';
import a4Image1 from '../assets/images/a4-1.png';
import a4Image2 from '../assets/images/a4-2.png';
import a4Image3 from '../assets/images/a4-3.png';
import a4Image4 from '../assets/images/a4-4.png';
import a5Image1 from '../assets/images/a5-1.jpg';
import a5Image2 from '../assets/images/a5-2.jpg';
import a5Image3 from '../assets/images/a5-3.jpg';
import a5Image4 from '../assets/images/a5-4.jpg';
import a6Image1 from '../assets/images/a6-1.png';
import a6Image2 from '../assets/images/a6-2.png';
import a6Image3 from '../assets/images/a6-3.png';
import a6Image4 from '../assets/images/a6-4.png';
import a7Image1 from '../assets/images/a7-1.png';
import a7Image2 from '../assets/images/a7-2.png';
import a7Image3 from '../assets/images/a7-3.png';
import a7Image4 from '../assets/images/a7-4.png';
import a8Image1 from '../assets/images/a8-1.png';
import a8Image2 from '../assets/images/a8-2.png';
import a8Image3 from '../assets/images/a8-3.png';
import a8Image4 from '../assets/images/a8-4.png';
import a9Image1 from '../assets/images/a9-1.png';
import a9Image2 from '../assets/images/a9-2.png';
import a9Image3 from '../assets/images/a9-3.png';
import a9Image4 from '../assets/images/a9-4.png';

import h1pdf from '../assets/pdf/VMM系列高清混合矩阵切换器.pdf';
import h5pdf from '../assets/pdf/按键式控制面板.pdf';
// 导入AISPEECH产品PDF
import a1Pdf from '../assets/pdf/MC10吸顶麦克风.pdf';
import a2Pdf from '../assets/pdf/MA600D矩阵麦克风.pdf';
import a3Pdf from '../assets/pdf/MCS06拾扩一体吸顶麦克风.pdf';
import a4Pdf from '../assets/pdf/C40T视频会议室摄像机.pdf';
import a5Pdf from '../assets/pdf/AI智能声像追踪主机MT100.pdf';
import a6Pdf from '../assets/pdf/AISPK-DC20PoE吸顶音箱.pdf';
import a7Pdf from '../assets/pdf/高端吸顶麦克风-MC08.pdf';
import a8Pdf from '../assets/pdf/企业级会议麦克风音箱M12.pdf';
import a9Pdf from '../assets/pdf/AI追踪双目语音摄像头C60.pdf';

// 图片查看器组件
function ImageLightbox({ 
  isOpen, 
  images, 
  currentIndex, 
  onClose,
  onPrev,
  onNext
}: { 
  isOpen: boolean; 
  images: string[]; 
  currentIndex: number; 
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative max-w-5xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={images[currentIndex]} 
          alt="放大查看" 
          className="w-full h-full object-contain"
        />
        
        {/* 左右箭头按钮 */}
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
          onClick={onPrev}
        >
          <i className="fa-solid fa-chevron-left text-xl"></i>
        </button>
        
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
          onClick={onNext}
        >
          <i className="fa-solid fa-chevron-right text-xl"></i>
        </button>
        
        {/* 关闭按钮 */}
        <button
          className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          onClick={onClose}
        >
          <i className="fa-solid fa-times text-xl"></i>
        </button>
        
        {/* 图片计数 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-1.5 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </motion.div>
    </motion.div>
  );
}

// 模拟产品数据
const productData = {
   // HRAVC品牌产品
  'h1': {
    id: 'h1',
    name: 'VMM系列高清混合矩阵切换器',
    description: 'VMM系列混合矩阵是一款高清音视频信号交换设备。采用数字总线路由交换技术，实现了数字，模拟视频混合信号的输入输出及音频的随路切换，支持4K@60超高清视频信号采集与传输，视频图像解析度可达4K444@60Hz，同时还支持无缝切换等功能，是一款接口丰富、性能强大的高品质混合矩阵，可广泛应用与智慧教学、安防监控、企事业会议室等场所。',
    images: [
      'https://lf-code-agent.coze.cn/obj/x-ai-cn/355308075266/attachment/VMM88正面_20260117114958.jpg',
      'https://lf-code-agent.coze.cn/obj/x-ai-cn/355308075266/attachment/QVM0808-2U-Rear_20260117115009.jpg',
      'https://lf-code-agent.coze.cn/obj/x-ai-cn/355308075266/attachment/板卡选型_20260117143401.jpg'
    ],
    inputCards: [
      { type: 'HDMI2.0/DP', description: '支持4通道HDMI信号输入，最大支持分辨率3840*2160@60Hz，支持独立音频及内嵌音频' },
      { type: 'DVI/VGA', description: '支持4通道DVI/VGA信号输入，最大支持分辨率1920*1200@60Hz,支持独立音频' },
      { type: 'SDI', description: '支持4通道SDI信号输入，最大支持12G SDI分辨率3840*2160@60Hz，支持内嵌音频' },
      { type: 'HDBaseT', description: '支持4通道HDBaseT信号输入，最大3840*2160@60Hz信号最远为70米，支持独立音频' },
      { type: '单模光纤', description: '支持4通道单模光纤信号输入，SFP模块，LC接口，最大3840+2160@60Hz信号最远为10千米，支持独立音频' }
    ],
    outputCards: [
      { type: 'HDMI2.0/DP', description: '支持4通道HDMI信号输出，最大支持分辨率3840*2160@60Hz，支持独立音频及内嵌音频' },
      { type: 'DVI/VGA', description: '支持4通道DVI/VGA信号输出，最大支持分辨率1920*1200@60Hz,支持独立音频' },
      { type: 'SDI', description: '支持4通道SDI信号输出，最大支持12G SDI分辨率3840*2160@60Hz，支持内嵌音频' },
      { type: 'HDBaseT', description: '支持4通道HDBaseT信号输出，最大3840*2160@60Hz信号最远为70米，支持独立音频' },
      { type: '单模光纤', description: '支持4通道单模光纤信号输入，SFP模块，LC接口，最大3840+2160@60Hz信号最远为10千米，支持独立音频' },
      { type: '选配：音频处理器',description:'8*8音频处理器，矩阵内部2*2，并支持外部6*6输入输出'}
    ],
    chassisSpecs: [
      { model: 'VMM0808', description: '支持2输入槽位，2输出槽位，最大支持8x8;', size: '2U；483mm+89mm+365mm', power: '80W' },
      { model: 'VMM1616', description: '支持4输入槽位，4输出槽位，最大支持16x16;', size: '3U；483mm+134mm+365mm', power: '160W' },
      { model: 'VMM3232', description: '支持8输入槽位，8输出槽位，最大支持32x32:', size: '5U；483mm+223mm+365mm', power: '300W' },
      { model: 'VMM4040', description: '支持10输入槽位，10输出槽位，最大支持40x40;', size: '6U；483mm+268mm+365mm', power: '400W' },
      { model: 'VMM8080', description: '支持20输入槽位，20输出槽位，最大支持80x80;', size: '11U；483mm+489mm+365mm', power: '600W' },
      { model: 'VMM160160', description: '支持40输入槽位，40输出槽位，最大支持160x160;', size: '20U；483mm+900mm+365mm', power: '1200W' }
    ],
     brochureUrl: h1pdf, // 示例PDF链接
  },
  'h2': {
    id: 'h2',
    name: '超薄HDBaseT传输器',
      description: '1、HDMI输入支持高达18G HDMI 2.0（4K60 4:4:4）\n2、传输距离：\n  70米版本：1080p时高达70米，4K时高达40米\n  100米版本：1080p时高达100米，4K时高达70米\n3、其它功能：测试模式，4K下变换，无输入时视频保持功能，CEC控制等\n4、丰富的EDID和HDCP控制\n5、超温控制和保护\n6、音频解嵌，Mini-Toslink和3.5mm L/R输出（发送器）\n7、双向IR和两个独立的RS232端口\n8、PC工具：便于控制和故障诊断\n9、iPoC，使用单个48V适配器为两个单元安全供电',
     images: [
      'https://lf-code-agent.coze.cn/obj/x-ai-cn/355308075266/attachment/SSH70-TX-FrontSide_20260117165100.jpg',
      'https://lf-code-agent.coze.cn/obj/x-ai-cn/355308075266/attachment/SSH70-RX-TopView_20260117164612.jpg',
      'https://lf-code-agent.coze.cn/obj/x-ai-cn/355308075266/attachment/SSH70-TX-TopView_20260117164615.png',
      'https://lf-code-agent.coze.cn/obj/x-ai-cn/355308075266/attachment/SSH70-彩页_20260117164613.jpg'
    ],
     technicalSpecs: [
      'HDMI 版本：\t输入: HDMI 2.0 -支持HDR/HBR',
      '带宽：\t\t输入: 18 Gbps (4K60 4:4:4)\t输出: 10.2 Gbps (4K60 4:2:0)',
      'HDCP：\t\t输入 HDCP: 1.4 and 2.2\t输出 HDCP: Pass, 1.4, 2.2, Cascade mode',
      'RS232 (Control Commands – Tx, Rx):\t57600 baudrate, 8 data bits, 1 stop bit, no parity',
      'RS232 (Pass-Through – Tx, Rx):\t最大波特率 115200.',
      'RS232 (Pass-Through – T2, R2):\t最大波特率 57600 (或者用作 CTS, RTS)',
      'IR IN, IR OUT:\t\t\t载波25-60 KHz',
      '色空间:\t\tRGB, 4:4:4, 4:2:2, 4:2:0',
      '色深:\t\t8, 10, 12 bits',
      '图像下变换:\t1080p: All 4K inputs scaled down to 1080p',
      '\t\t4K60-420: Convert 4K50/60 4:4:4 inputs to 4K50/60 4:2:0',
      '\t\tPass-through：All others as Pass-through video',
      '音频格式:\t2.0 / 2.1 / 5.1 / 7.1 channel LPCM, Dolby, AC3, DTS',
      '音频解嵌:\tMini TosLink (光纤)\\3.5mm 模拟立体声接口 (L/R)',
      '工作温度:\t0 to +40°C (+32 to +104°F)',
      '工作湿度:\t10 to 90 % RH (non-condensing)',
      '尺寸 (L x W x H)\t: 109 x 74 x 11.5 mm (excluding connectors)',
      '重量 (Unit only)\t: Transmitter: 165g\tReceiver: 165g'
    ],
     brochureUrl: 'https://example.com/brochures/4k-matrix-brochure.pdf', // 示例PDF链接
  },
  'h3': {
    id: 'h3',
    name: '4K固化高清矩阵',
    description: '1、符合HDMI 2.0和HDCP2.2规范\n2、支持18Gbps视频带宽\n3、视频分辨率最高支持3840x2160@60\n4、带视频墙功能,支持视频无缝切换\n5、支持IR矩阵\n6、支持HDMI音频剥离\n7、支持外接模拟音频加嵌到HDMI码流\n8、支持智能EDID管理\n9、带前面板LCD显示屏\n10、可以通过前面板按键、RS-232和TCP/IP (LAN 10M/100M) 控制',
     images: [
       'https://lf-code-agent.coze.cn/obj/x-ai-cn/355308075266/attachment/固化矩阵1_20260119101640.jpg',
       'https://lf-code-agent.coze.cn/obj/x-ai-cn/355308075266/attachment/固化矩阵2_20260119101640.jpg',
       'https://lf-code-agent.coze.cn/obj/x-ai-cn/355308075266/attachment/固化矩阵3_20260119101640.jpg'
     ],
    technicalSpecs: [
      'HDMI兼容\tHDMI 2.0',
      'HDCP兼容\tHDCP 2.2',
      '视频带宽\t18Gbps',
      '',
      '输入视频分辨率\t800x600@60Hz,1024x768@60Hz,',
      '1280x768@60Hz,1280x800@60Hz,',
      '1280x1024@60Hz,1360x768@60Hz,',
      '1366x768@60Hz,1400x1050@60Hz,',
      '1440x900@60Hz,1600x1200@60Hz,',
      '1680x1050@60Hz, 1920x1200@60Hz.',
      '480p,576p,720p,1920x1080i,1920x1080p,',
      '3840x2160@24Hz/25Hz/30Hz/50Hz/60Hz,',
      '4096x2160@24Hz/25Hz/30Hz/50Hz/60Hz',
      '',
      '输出视频分辨率\t1920x1080@60Hz, 3840x2160@30Hz,',
      '3840x2160@60Hz, 1280x720@60Hz,',
      '1024x768@60Hz, 1360x768@60Hz,',
      '1600x1200@60Hz, 1920x1200@60Hz',
      'HDMI振幅\tT.M.D.s+/- 0.4Vpp',
      '差分阻抗\t100±15ohm',
      '静电保护\t人体模型:±8kV (空气放电) , ±4kV (接触放电)',
      'RS232/以太网\t',
      '波特率及协议\t波特率:9600, 数据位:8,停止位:1,无奇偶校验',
      '以太网\tIE 10.0+, HTML5',
      '机身\t',
      '外壳\t金属外壳',
      '颜色\t黑色',
      '尺寸\t430mm (长) x 220mm (宽) x 44mm (高)',
      '重量\t5kg',
      '供电电源\tAC 110~240V',
      '电源功耗\t60W (最大值)',
      '操作温度\t0 ℃~ 40  ℃ / 32 ℉ ~ 104 ℉',
      '储存温度\t-20℃ ~ 70℃ / -4 ℉ ~ 158 ℉',
      '产品选型：',
      'H44AS\t4K@30Hz，4*4无缝切换矩阵',
      'H88AS\t4K@30Hz，8*8无缝切换矩阵',
      'U44AS\t4K@60Hz，4*4无缝切换矩阵',
      'U88AS\t4K@60Hz，8*8无缝切换矩阵'
    ],
     brochureUrl: 'https://example.com/brochures/4k-matrix-brochure.pdf', // 示例PDF链接
  },
  'h4': {
    id: 'h4',
    name: '分布式音视频系统',
    description: '基于网络的分布式架构，实现音视频信号的灵活传输和处理。',
    images: [
      'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Distributed%20audio%20video%20system&sign=f734b1e202b29468fc8db2ae7426531d',
      'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Network%20video%20transmission%20equipment&sign=be92a2a1f208fd6bae6705e59a03584f'
    ],
    technicalSpecs: [
      '基于千兆网络传输',
      '支持4K超高清视频',
      '零延时切换技术',
      '分布式拼接显示', 
      '支持多用户同时操作',
      '信号预览和回显功能',
      '网络带宽自适应',
      '系统自愈能力',
      '支持H.265/H.264编码',
      '支持KVM功能'
    ],
     brochureUrl: 'https://example.com/brochures/distributed-av-brochure.pdf', // 示例PDF链接
  },
  'h5': {
    id: 'h5',
    name: '按键式控制面板',
    description: 'WP6 是⼀款具有6 个按钮和1 个⾳量控制旋钮的壁板控制⾯板，采⽤实⼼拉丝铝⾯板，⽀持PoE 供电。\nWP6控制⾯板内置 2 个可编程RS232接⼝、2 个红外线（IR）接⼝和2 个继电器接⼝，可⽤于各种不同的应⽤。它可以通过⽹络图形⽤户界⾯进⾏控制和编程，因此⽆需软件。\n⾃定义控制⾯板可完全控制兼容开关、矩阵切换器、⾳视频切换器、投影仪、投影幕等第三⽅设备，是陈列室、教室和会议室集中控制的完美选择。',
      images: [
        'https://lf-code-agent.coze.cn/obj/x-ai-cn/355308075266/attachment/WP6-1_20260119122226.jpg',
        'https://lf-code-agent.coze.cn/obj/x-ai-cn/355308075266/attachment/WP6-2_20260119122226.jpg',
        'https://lf-code-agent.coze.cn/obj/x-ai-cn/355308075266/attachment/WP6-3_20260119122226.jpg'
      ],
     technicalSpecs: [
      '6 个可⾃定义控制按键，且有扩展组合功能',
      '1 个带按键的⾳量控制旋钮',
      '⽀持通过在线的图形⽤户界⾯进⾏控制和配置',
      '⽀持继电器控制',
      '⽀持红外控制',
      '⽀持 RS232 控制',
      '⽀持 TCP/IP 控制',
      '以太⽹供电功能允许控制器通过单根以太⽹电缆获取电源',
      '双⾊、可现场贴标签的背光按键',
      '输出端口：2 × RS232, 2 × IR, 2 × Relay',
      '端口连接器：2 × 3 凤凰插头、2 × 2 凤凰插头',
      '波特率：默认 9600，支持 9600,19200,38400,57600,115200',
      '功耗：最大 2.5W',
      '输入电源：12VDC 及 PoE 供电',
      '净重：195g',
      '产品尺寸 (W*H*D)：86mm × 86mm × 50.5mm',
      '质保：2年',
      '运行温度：0-40 摄氏度',
      '运行湿度：10%-90%（无冷凝）',
      '存储温度：-10~55 摄氏度',
      '存储湿度：10%~90%'
    ],
     brochureUrl: h5pdf, // 示例PDF链接
  },
  'h6': {
    id: 'h6',
    name: '中控系统',
    description: 'TP-10C 可编程控制触摸面板是一款紧凑型墙装控制界面，专为智能建筑、多媒体系统和自动化环境设计。它配备 10 英寸电容触摸屏，分辨率为 1280*800，运行 Android 11系统，搭载 ARM Cortex-A55 处理器。\nTP-EX44N 是一款可扩展4路串口和4路继电器口的接口扩展器，支持通过RS232/422  或  IP与可编程中央控制系统或PC机通信，实现对多种设备的控制以及对不同通讯方式的设备间进行协议转换，支持多台扩展器级联，面板待状态指示灯。\n这套系统适用于智能家居、会议室、培训中心、控制室、广播工作室、展览环境以及工业自动化系统。',
    images: [
      'https://lf-code-agent.coze.cn/obj/x-ai-cn/355308075266/attachment/TP-10C-1_20260119140146.jpg',
      'https://lf-code-agent.coze.cn/obj/x-ai-cn/355308075266/attachment/TP-10C-2_20260119140146.jpg',
      'https://lf-code-agent.coze.cn/obj/x-ai-cn/355308075266/attachment/TP-10C-4_20260119140146.jpg',
      'https://lf-code-agent.coze.cn/obj/x-ai-cn/355308075266/attachment/TP-EX44N_Main_20260119140146.jpg'
    ],
    technicalSpecs: [
      'TP-10C产品规格：',
      '1、ARM Cortex-A55 架构 1.8GHz 主频',
      '2、Android 11.0 系统，4GB DDR4 内存，32GB EMMC 闪存',
      '3、10 英寸 1280*800（16:10）分辨率，壁挂设计',
      '4、一机双模，可用作触控屏中央控制器或用户终端',
      '5、支持一个 RS-485 串行通信端口，可配置 2400-115200bps 范围内的 8 种波特率',
      '6、支持通过密码访问主机系统管理网页',
      '7、通过 IDE 设计工具进行接口设计和编程',
      '8、符合行业标准网络通信协议（TCP/IP、Http、UDP、Websocket）',
      '9、配备 1 个千兆网络端口，最高速率可达 1G/bps',
      '10、双电源供电模式，支持 PoE 或 DC 电源',
      '',
      'TP-EX44N产品规格：',
      '1、4路串口扩展:2路  RS232/422/485,  2路RS232，支持硬件流控；',
      '2、4路独立开关继电器扩展，单路可承载最大24V  1A负载；',
      '3、各串口支持独立设置波特率：2400~115200；',
      '4、每个扩展串口配置大容量缓冲空间，对收发数据进行队列处理；',
      '5、每一帧数据最大可支持  512  个字节；',
      '6、支持扩展串口到TCP/IP或UDP网络的数据透传，支持多台级联；',
      '7、支持通过RS2332/422/485  或  IP/TCP/UDP与其它系统对接，支持作为结构化控制主机的端口扩展辅件；',
      '8、内置带权限的网页服务器，支持手机、Pad等设备进行WEB管理；',
      '9、前面板提供4路串口收发、4路继电器动作指示灯；'
    ],
     brochureUrl: 'https://example.com/brochures/tp-control-brochure.pdf', // 示例PDF链接
  },
  'h7': {
    id: 'h7',
    name: '智能会议系统',
    description: '集成多种会议功能，提供高效便捷的会议体验。',
    images: [
      'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Smart%20meeting%20room%20system&sign=009a3041b561b413e529c3b4993d9301',
      'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Meeting%20room%20control%20panel&sign=fd55280950eeaba8f425f114d3644b8e'
    ],
    technicalSpecs: [
      '一键式会议控制',
      '无线投屏功能',
      '音频自动混音',
      '视频自动跟踪',
      '会议预约系统集成',
      '远程会议接入',
      '电子白板功能',
      '会议内容录制',
      '多语言支持',
      '人脸识别签到'
    ],
     brochureUrl: 'https://example.com/brochures/smart-meeting-brochure.pdf', // 示例PDF链接
  },
  'h8': {
    id: 'h8',
    name: '专业音响系统',
    description: '高品质音频解决方案，适用于各类场所的扩声需求。',
    images: [
      'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Professional%20sound%20system&sign=4215d2749deb07fd7d812e23d2fcd25b',
      'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Sound%20system%20installation&sign=6363354968c2f738807ea9a7885d9726'
    ],
    technicalSpecs: [
      '线性阵列扬声器设计',
      '专业DSP音频处理',
      '全频和低频扬声器组合',
      '覆盖角度精确控制',
      '高声压级输出',
      '均匀的声场分布',
      '防水防潮设计',
      '吊挂安装系统',
      '多通道功率放大',
      '完善的保护电路'
    ],
     brochureUrl: 'https://example.com/brochures/pro-audio-brochure.pdf', // 示例PDF链接
  },
  'h9': {
    id: 'h9',
    name: '视频会议终端',
    description: '高清视频会议设备，支持多方视频通话，远程协作。',
    images: [
      'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Video%20conference%20terminal&sign=db6998e52a5a940d8bd2b8f401dffb12',
      'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Video%20conference%20call&sign=e38a0498a085a20ea7a6537fa7d6fd11'
    ],
    technicalSpecs: [
      '4K超高清视频编解码',
      '内置12倍光学变焦摄像头',
      '全向麦克风阵列',
      '支持H.323/SIP协议',
      '内置多方会议功能',
      '支持内容共享',
      '双流输出能力',
      '网络自适应调节',
      '防火墙穿透技术',
      '远程管理和升级'
    ],
     brochureUrl: 'https://example.com/brochures/video-conference-brochure.pdf', // 示例PDF链接
  },
  
  // AISPEECH品牌产品
  'a1': {
    id: 'a1',
    name: 'MC10吸顶麦克风',
    description: 'MC10是思必驰推出的一款高端吸顶会议麦克风，其集成了多达128单元的全向麦克风阵列，提供了16个独立可配拾音区，可实现精细化拾音配置。采用了Dante数字音频技术, 确保音频传输稳定和广泛兼容。MC10内置AI算法，提供高清降噪、去混响、反馈抑制、自动增益和语音转写等功能，有效提升了会议效率。MC10适用各类吊顶安装方式，PoE+供电，可满足各类会议空间的吊装需求。',
     images: [
      a1Image1,
      a1Image2,
      a1Image3,
      a1Image4
    ],
    // 产品规格数据，按类别组织
    specs: [
      {
        category: '基本规格',
        items: [
          { name: '产品颜色', value: '淡雅白' },
          { name: '产品尺寸', value: '597mm*597mm*53.5mm' },
          { name: '包材尺寸', value: '680mm*680mm*160mm' },
          { name: '产品净重', value: '&lt;5KG' },
          { name: '供电方式', value: 'PoE+ 供电' },
          { name: '安装方式', value: '吊装' }
        ]
      },
      {
        category: '音频特性',
        items: [
          { name: '可配拾音区', value: '16 个' },
          { name: '采样率', value: '48kHz' },
          { name: '拾音区类型', value: '可配' },
          { name: '最大背景噪声抑制', value: '35dB' },
          { name: 'AI 降噪抑制', value: '支持' },
          { name: 'AI 混响抑制', value: '支持' },
          { name: 'AI 啸叫抑制', value: '支持' },
          { name: 'AI 回声消除', value: '支持' },
          { name: 'AI 全双工', value: '支持' },
          { name: '混音通道', value: '支持' },
          { name: '智能混音', value: '支持' },
          { name: '延迟', value: '25ms' }
        ]
      },
      {
        category: '麦克风规格',
        items: [
          { name: '麦克风类型', value: '128 单元 MEMS 麦克风阵列' },
          { name: '灵敏度', value: '-38dBv / 94dB SPL @1KHz' },
          { name: '信噪比', value: '65dBv / 94dB SPL @1KHz, A-weighted' }
        ]
      },
      {
        category: 'Dante音频',
        items: [
          { name: 'Dante 音频', value: '支持' },
          { name: '远程会议通道', value: '1 路' },
          { name: '本地扩声通道', value: '1个' }
        ]
      },
      {
        category: '级联功能',
        items: [
          { name: '级联数量', value: '无限制数量' },
          { name: '级联方式', value: 'Dante 音频 /PoE 网线级联' }
        ]
      },
      {
        category: '接口',
        items: [
          { name: 'Dante/PoE 网口', value: '1 个' },
          { name: 'RESET 按键', value: '1 个' }
        ]
      }
    ],
     brochureUrl: a1Pdf, // PDF链接
  },
  'a2': {
    id: 'a2',
    name: 'MA600D矩阵麦克风',
    description: '无感扩声新标杆，更广覆盖范围 (3m拾音半径)x更大扩声增益(>18dB)x更清晰音质(48kHz采样率)x更低延迟(<15ms)，AI降噪+反馈抑制双算法加持，无缝兼顾本地会议扩声与远程视频沟通；\n通过内置AI能力及变化的拾音波束，使单只矩阵麦覆盖传统发言模式，并可为会议提供自由讨论、主席演讲、代表发言等典型应用场景；\n通过内置自研的AI算法，提供智能降噪、混响消除、啸叫抑制、自动增益和发言追踪等功能，有效提升会议音频效果及丰富应用场景。\n适用场景：大会议室、指挥大厅、报告厅和会客厅等',
    images: [
      a2Image1,
      a2Image2,
      a2Image3,
      a2Image4
    ],
    // 产品规格数据，按类别组织
    specs: [
      {
        category: '基本规格',
        items: [
          { name: '产品颜色', value: '雅致灰' },
          { name: '产品尺寸', value: '505mm*90mm*32.5mm' },
          { name: '产品净重', value: '约3kg' },
          { name: '供电方式', value: 'PoE+ 供电' },
          { name: '安装方式', value: '桌面布放，落地支架、吊杆安装，缆绳吊装、壁挂【水平地面】、壁挂【垂直地面】等多种安装方式' }
        ]
      },
      {
        category: '音频特性',
        items: [
          { name: '可配拾音区', value: '24 个（形状、大小和角度等可调，位置可拖拽）' },
          { name: '采样率', value: '48kHz' },
          { name: '拾音区类型', value: '可配（通话拾音区，扩声拾音区，静音区）' },
          { name: '波束类型', value: '4种（支持自动检测部署角度，并自动提示）' },
          { name: '拾音区隔离度', value: '>20dB' },
          { name: '最大背景噪声抑制', value: '35dB' },
          { name: 'AI 降噪', value: '可调节' },
          { name: 'AI 混响', value: '支持' },
          { name: 'AI 回声消除', value: '支持' },
          { name: 'AI 全双工', value: '支持' },
          { name: '混音通道', value: '支持' },
          { name: '智能混音', value: '支持' },
          { name: '延迟', value: '&lt;15ms' },
          { name: '扩声增益', value: '>18dB' }
        ]
      },
      {
        category: '麦克风规格',
        items: [
          { name: '麦克风类型', value: '64单元 MEMS 麦克风阵列' },
          { name: '麦克风灵敏度', value: '-38dBv/94dB SPL @1KHz' },
          { name: '麦克风频响', value: '20 Hz~20,000 Hz' },
          { name: '动态范围', value: '84dB(A)' },
          { name: '最大声压级', value: '104dB SPL' },
          { name: '设备信噪比', value: '73.9dBA' },
          { name: '设备灵敏度', value: '-10.22dBFS/Pa' },
          { name: '设备频响', value: '100 Hz to 15，000 Hz' }
        ]
      },
      {
        category: '传感器',
        items: [
          { name: '光感传感器', value: '1个' },
          { name: '陀螺仪', value: '6轴，1个' }
        ]
      },
      {
        category: 'Dante音频',
        items: [
          { name: 'Dante 音频', value: '支持' },
          { name: '远程会议通道', value: '1路' },
          { name: '本地扩声通道', value: '1路' }
        ]
      },
      {
        category: '级联功能',
        items: [
          { name: '级联数量', value: '无限制数量' },
          { name: '级联方式', value: 'Dante 音频 /PoE 网线级联' }
        ]
      },
      {
        category: '接口',
        items: [
          { name: 'Dante/PoE 网口', value: '1 个' },
          { name: 'Type-C', value: '1个' },
          { name: '模拟输入', value: '2个' },
          { name: '模拟输出', value: '2个' }
        ]
      },
      {
        category: '按键',
        items: [
          { name: 'RESET按键', value: '1个' }
        ]
      }
    ],
     brochureUrl: a2Pdf, // PDF链接
  },
  'a3': {
    id: 'a3',
    name: 'MCS06拾扩一体吸顶麦克风',
    description: 'MCS06是思必驰推出的一款高端拾扩一体吸顶麦，其集成了多达32单元的全向麦克风阵列，提供了4个独立可配拾音区，可实现精细化拾音配置。采用了Dante数字音频技术, 确保音频传输稳定和广泛兼容。MCS06内置AI算法，提供高清降噪、去混响、回声抑制、双讲通话、自动增益和语音转写等功能，有效提升了会议效率。MCS06还搭载 2个15W 高性能扬声器，为远程会议提供高保真音质，提升会议体验。\nMCS06适用各类吊顶安装方式，PoE+供电，可满足各类会议空间的吊装需求。',
    images: [
      a3Image1,
      a3Image2,
      a3Image3,
      a3Image4
    ],
    // 产品规格数据，按类别组织
    specs: [
      {
        category: '基本规格',
        items: [
          { name: '产品颜色', value: '淡雅白' },
          { name: '产品尺寸', value: '597mm*597mm*72.5mm' },
          { name: '产品净重', value: '&lt;6KG' },
          { name: '供电方式', value: 'PoE+ 供电' },
          { name: '安装方式', value: '吊装' }
        ]
      },
      {
        category: '音频特性',
        items: [
          { name: '可配拾音区', value: '4 个（形状、大小和角度等可调，位置可拖拽）' },
          { name: '采样率', value: '48kHz' },
          { name: '拾音区类型', value: '可配（通话拾音区，静音区）' },
          { name: '拾音区隔离度', value: '>20dB' },
          { name: '最大背景噪声抑制', value: '35dB' },
          { name: 'AI 降噪', value: '可调节' },
          { name: 'AI 混响抑制', value: '支持' },
          { name: 'AI 回声消除', value: '支持' },
          { name: 'AI 全双工', value: '支持（5m以内）' }
        ]
      },
      {
        category: '麦克风规格',
        items: [
          { name: '麦克风类型', value: '32单元 MEMS 麦克风阵列' },
          { name: '麦克风灵敏度', value: '-38dBv/94dB SPL @1KHz' },
          { name: '麦克风频响', value: '20 Hz~20,000 Hz' },
          { name: '动态范围', value: '84dB(A)' },
          { name: '最大声压级', value: '104dB SPL' },
          { name: '设备信噪比', value: '73.9dBA @1KHz' },
          { name: '设备灵敏度', value: '-10.22dBFS/Pa @1KHz' },
          { name: '设备频响', value: '100 Hz to 15，000 Hz' }
        ]
      },
      {
        category: '扬声器规格',
        items: [
          { name: '中低音喇叭', value: '15W，1个' },
          { name: '高音喇叭', value: '15W，1个' },
          { name: '频响', value: '80Hz~20KHz' },
          { name: '最大输出电平', value: '90dB SPL @1KHz' }
        ]
      },
      {
        category: 'Dante音频',
        items: [
          { name: 'Dante 音频', value: '支持' }
        ]
      },
      {
        category: '级联功能',
        items: [
          { name: '级联数量', value: '无限制数量' },
          { name: '级联方式', value: 'Dante 音频 /PoE 网线级联' }
        ]
      },
      {
        category: '接口',
        items: [
          { name: 'Dante/PoE 网口', value: '1 个' }
        ]
      },
      {
        category: '按键',
        items: [
          { name: 'RESET按键', value: '1个' }
        ]
      },
      {
        category: '其他规格',
        items: [
          { name: '工作温度', value: '0℃~40℃' },
          { name: '存放温度', value: '-20℃~+70℃' },
          { name: '工作/存储湿度', value: '20 to 95% RH' },
          { name: '整机功耗', value: '20W' }
        ]
      }
    ],
     brochureUrl: a3Pdf, // PDF链接
  },
  'a4': {
    id: 'a4',
    name: 'C40T视频会议室摄像机',
    description: 'C40T超高清摄像机是思必驰专为现代企业会议室设计的重量级产品，提供4K超高清会议体验。它具备16倍数字变焦和12倍光学变焦，确保每个细节都清晰可 见。全方位视野设计，水平260°平移和72.5°广角，使其轻松覆盖中大型会议空间 创新的视频叠加字幕功能提升了会议的沟通效率。与智能声像追踪主机MT100和高端吸顶麦结合，C40T为大型空间提供智能声像追踪方案，确保每个会议细节都被捕捉。',
    images: [
      a4Image1,
      a4Image2,
      a4Image3,
      a4Image4
    ],
    specs: [
      {
        category: '基本参数',
        items: [
          { name: '图像传感器', value: '1/2.8英寸 CMOS, 846万像素' },
          { name: '焦距', value: 'f=3.9mm-46.8mm' },
          { name: '光圈', value: 'F1.6-F3.0' },
          { name: '光学变焦', value: '12倍' },
          { name: '数字变焦', value: '16倍' },
          { name: '视场角', value: '水平72.5°-6.3°' },
          { name: '聚焦系统', value: '自动、手动、一键触发、PTZ触发' },
          { name: '快门速度', value: '1/60-1/10,000秒' },
          { name: '增益', value: '自动/手动' },
          { name: '白平衡', value: '自动、手动、一键触发、自动跟踪、一键白平衡、静态色温' },
          { name: '曝光控制', value: '自动、手动、快门优先、光圈优先、亮度优先' },
          { name: '宽动态', value: '支持' },
          { name: '信噪比', value: '≥50dB' },
          { name: '抗闪烁', value: '支持' },
          { name: '菜单', value: '英文/中文' }
        ]
      },
      {
        category: '特色功能',
        items: [
          { name: '智能麦摄联动', value: '支持搭配MT100和吸顶麦系列产品，可为大型和超大型空间实现更灵活的图像追踪策略' },
          { name: '画面人物自动居', value: '特写镜头运算AI算法，调用预置位时将人物自动调整到中心位置' },
          { name: 'AI实时字幕', value: '支持接入思必驰AI麦克风，搭配麦冬会议记录服务，为云会议场景提供视频' }
        ]
      },
      {
        category: '云台参数',
        items: [
          { name: '水平范围', value: '-130°~+130°' },
          { name: '垂直范围', value: '-30°~+90°' },
          { name: '水平转动速度', value: '0.2°~90°/秒' },
          { name: '垂直转动速度', value: '0.2°~60°/秒' },
          { name: '预置点最大数目', value: '256' }
        ]
      },
      {
        category: '接口',
        items: [
          { name: 'HDMI', value: '1路, HDMI1.4 视频分辨率4K30/P25 1080P60/P50/P30/P25, 720P60/P50/P30/P25' },
          { name: '3G-SDI', value: '1路, 3G-SDI 视频分辨率1080P60/P50/P30/P25, 720P60/P50/P30/P25' },
          { name: 'USB 3.0', value: '1路, USB3.0 Type-B USB3.0输出格式：1、UVC支持UVC1.1协议 2、UVC 视频格式支持YUY2、NV12:视频分辨率1080P30/P25, 720P30/P25 3、H.264/H.265/MJPEG:视频分辨率支持4K30/P25 1080P60/P50/P30/P25, 720P60/P50/P30/P25 4、UAC 音频格式PCM' },
          { name: 'USB 2.0', value: '1路, USB2.0 Type-A HOST' },
          { name: '网络', value: '1路, 10/100M RJ-45 POE 1、视频分辨率4K30/P25, 1080P60/P50/P30/P25, 720P60/P50/30/P25, 360P30/P25 2、视频格式支持H.264、H.265；3、音频压缩 AAC 4、网络协议 ONVIF、RTSP、 TCP、UDP、RTMP' },
          { name: '音频接口', value: '1路, LINE IN, 3.5mm音频接口,1路, REF, 3.5mm音频接口' },
          { name: '控制接口', value: '1路RS-485¥1路RS-232 IN' },
          { name: '电源接口', value: 'DC12V' },
          { name: '电源开关', value: '船型开关' },
          { name: '无线控制', value: '红外遥控器' }
        ]
      },
      {
        category: '一般规范',
        items: [
          { name: '控制协议', value: 'VISCA' },
          { name: '功耗', value: '<20W' },
          { name: '工作环境', value: '工作温度0°~40°C, 工作湿度10%RH ~90 %RH' },
          { name: '存储环境', value: '存储温度-20°C ~+60°C, 存储湿度10%RH ~95 %RH' },
          { name: '尺寸(长×宽×高)', value: '245*145*164mm' },
          { name: '机身重量', value: '≈2kg' },
          { name: '机身颜色', value: '雅致灰' }
        ]
      }
    ],
     brochureUrl: a4Pdf, // PDF链接
  },
  'a5': {
    id: 'a5',
    name: 'AI智能声像追踪主机MT100',
    description: '在数字化时代，音视频技术的融合与创新已成为企业、教育和个人沟通的重要趋势。思必驰凭借其深厚的技术积淀与创新精神，推出了高品质的AI智能声像追踪主机MT100。MT100搭载了思必驰品牌的PTZ摄像机，并与思必驰高端吸顶麦克风系统完美结合，凭借卓越的性能和智能化设计，能够实时追踪发言人和动作，确保音视频信号始终聚焦于会议核心内容。这种智能追踪功能不仅提高了会议的效率和便捷性，还为各种大型会议和培训空间提供准确、高清、流畅的视听体验。',
    images: [
      a5Image1,
      a5Image2,
      a5Image3,
      a5Image4
    ],
    specs: [
      {
        category: '基本参数',
        items: [
          { name: '产品型号', value: 'AIVIS-MT100' },
          { name: '分辨率', value: '最大支持4K @ 30fps' },
          { name: '机身重量', value: '0.2KG' },
          { name: '工作温度', value: '0℃ ~ +40℃' },
          { name: '存放温度', value: '-20℃ ~ +40℃' },
          { name: '电源', value: 'DC 12V' },
          { name: '产品尺寸', value: '119 mm×104 mm×29mm' }
        ]
      },
      {
        category: '视频规格',
        items: [
          { name: '视频压缩', value: 'H.265/H.264/MJPEG' },
          { name: '视频输入', value: '最高支持4KP30输入' },
          { name: '视频切换', value: 'AI算法，支持自动切换视频画面' },
          { name: '预置位冻结', value: '支持一键开关预置位冻结功能' },
          { name: '视频模式', value: 'PIP、PBP（最多同时四路显示）' }
        ]
      },
      {
        category: 'HDMI',
        items: [
          { name: '接口', value: '一路HDMI输入（预留功能）' },
          { name: '接口', value: '一路HDMI输出' },
          { name: '分辨率', value: '4KP30; 1080P30/25; 720P30/25; 640*480P30/25)' }
        ]
      },
      {
        category: 'USB',
        items: [
          { name: '接口', value: '1路USB2.0 Host（预留）' },
          { name: '接口', value: '1路USB3.0 Device（兼容USB2.0）' },
          { name: '协议', value: '支持UVC1.1协议' },
          { name: '视频格式', value: 'UVC视频格式支持H.265/H.264/MJPEG' },
          { name: '视频分辨率', value: '4K30（不二次编码时）、1080P30/25、720P30/25、360P30/25' }
        ]
      },
      {
        category: '网络',
        items: [
          { name: '接口', value: '1路RJ-45,' },
          { name: '速率', value: '10M/100M自适应以太网口，标配POE;' },
          { name: '视频输入', value: '视频最大支持多路4KP30输入，' },
          { name: '视频输出', value: '单路输出时最高4KP30对外输出;' },
          { name: '解码能力', value: '最多支持同时4路画面解码为1路1080P30输出;' }
        ]
      },
      {
        category: '其他',
        items: [
          { name: '管理', value: '支持WEB UI配置' },
          { name: 'TF卡', value: 'TF卡（功能预留）: 1路外置Micor SD卡, 最大256G' },
          { name: 'POE', value: 'IEEE 802.3af' }
        ]
      },
       {
        category: '音频接口',
        items: [
          { name: '接口', value: '1路LINE IN（3.5MM）, 1路LINE OUT（3.5MM）' }
        ]
      }
    ],
     brochureUrl: a5Pdf, // PDF链接
  },
  'a6': {
    id: 'a6',
    name: 'AISPK-DC20PoE吸顶音箱',
    description: '全频同轴天花扬声器是对商店，会议室，酒店，游轮，等多种场所适用的定阻有源吸顶音箱，提供高保真音频输出，支持Dante音频协议，可实现多设备之间的音频传输和处理。内置功率放大器、数字信号处理功能。音响可嵌入式安装及吊装2种方式，对高低楼层安装实现了方便安装的优化设计。',
    images: [
      a6Image1,
      a6Image2,
      a6Image3,
      a6Image4
    ],
    technicalSpecs: [
      '电源输入：\t802.3af/802.3at/802.3bt兼容',
      '音频传输协议：\tDante',
      '低音单元：\t6.5寸（聚丙烯）复合盆阀体+NBR丁腈橡胶悬边单元',
      '高音单元：\t1寸蚕丝膜、钕磁、360度可旋转高音单元',
      '频率响应：\t65Hz-20kHz，(±3dB)',
      '系统阻抗：\t8 Ohms',
      '输出声压（SPL）：\t89dB 1M/1W',
      '输出最大声压（SPL）：\t111 dB',
      '额定输出功率（RMS）：\t30 watts',
      '峰值输出功率（PAK）：\t60 watts',
      '安装开孔尺寸：\t246MM 圆孔',
      '安装深度：\t197MM',
      '箱体材料：\t铁质网罩+铁质工程箱体',
      '音频输入端口：\tRJ45',
      '产品重量：\t3.3KG',
      '安装方式：\t嵌入式和吊挂安装',
      '附加配件：\t安全绳'
    ],
     brochureUrl: a6Pdf, // PDF链接
  },
  'a7': {
    id: 'a7',
    name: '高端吸顶麦克风-MC08',
    description: 'MC08是思必驰推出的一款适用教学场景的高端吸顶麦克风， 集成了多达32单元的全向麦克风阵列，提供了8个独立可配置拾音区，可实现通话拾音区、扩声拾音区、静音区等精细化拾音配置。MC08采用Dante数字音频技术，可实现稳定的、高保真的数字音频传输，广泛兼容数字音频生态，可实现IP数字化管理。MC08还提供了模拟音频接口，兼容传统的音频系统方案，单台MC08即可覆盖整个讲台区域，可同时实现教室扩声、远程教学和课程录播的三合一能力，通过内置自研的AI算法，提供高清降噪、混响抑制、啸叫抑制、自动增益和语音转写等功能，有效提升教学效果。',
    images: [
      a7Image1,
      a7Image2,
      a7Image3,
      a7Image4
    ],
    specs: [
      {
        category: '基本参数',
        items: [
          { name: '产品颜色', value: '淡雅白' },
          { name: '产品尺寸', value: '445mm*445mm*57.5mm' },
          { name: '产品净重', value: '<3KG' },
          { name: '供电方式', value: 'PoE+ 供电' },
          { name: '安装方式', value: '吊装' }
        ]
      },
      {
        category: '音频性能',
        items: [
          { name: '可配拾音区', value: '8个(4 个扩声拾音区，4 个通话拾音区)' },
          { name: '采样率', value: '48kHz' },
          { name: '拾音区类型', value: '可配' },
          { name: '最大背景噪声抑制', value: '35dB' },
          { name: 'AI降噪抑制', value: '支持' },
          { name: 'AI混响抑制', value: '支持' },
          { name: 'AI啸叫抑制', value: '支持' },
          { name: 'AI回声消除', value: '支持' },
          { name: 'AI全双工', value: '支持' },
          { name: '混音通道', value: '支持' },
          { name: '智能混音', value: '支持' },
        ]
      },
      {
        category: '麦克风规格',
        items: [
          { name: '麦克风类型', value: '32单元MEMS麦克风阵列' },
          { name: '灵敏度', value: '-38dBv / 94dB SPL @1KHz' },
          { name: '信噪比', value: '65dBv / 94dB SPL @1KHz, A-weighted' }
        ]
      },
      {
        category: 'Dante音频',
        items: [
          { name: 'Dante音频', value: '支持' },
          { name: '远程会议通道', value: '1路' },
          { name: '本地扩声通道', value: '1路' }
        ]
      },
      {
        category: '级联功能',
        items: [
          { name: '级联限制', value: 'MC08 间不支持级联' }
        ]
      },
      {
        category: '接口',
        items: [
          { name: 'Dante/PoE 网口', value: '1 个' },
          { name: '卡侬公头', value: '1 个' },
          { name: '卡侬母头', value: '2 个' },
          { name: 'RESET 按键', value: '1 个' }
        ]
      }
    ],
    brochureUrl: a7Pdf,
  },
  'a8': {
    id: 'a8',
    name: '企业级会议麦克风音箱M12',
    description: 'M12是一款集拾音、扩音、语音转写、字幕同传于一体的企业级会议麦克风音箱，可通过多台级联，满足大中小型多类会议室需求。',
    images: [
      a8Image1,
      a8Image2,
      a8Image3,
      a8Image4
    ],
    specs: [
      {
        category: '基本规格',
        items: [
          { name: '产品名', value: '企级会议麦克风音箱' },
          { name: '型号', value: 'AIMIC-M12' },
          { name: '尺寸', value: '250mm*119mm*39mm' },
          { name: '重量', value: '500g左右' },
          { name: '材质', value: 'ABS' },
          { name: '配色', value: '雅致灰' }
        ]
      },
      {
        category: '按键',
        items: [
          { name: '音量+键', value: '触摸音量键' },
          { name: '音量-键', value: '触摸音量键' },
          { name: '麦克风Mute键', value: '触摸按键；开关麦克风' },
          { name: '转写键', value: '触摸按键；一键拉起或关闭"麦耳会记"软件' }
        ]
      },
      {
        category: '指示灯',
        items: [
          { name: '按键指示灯', value: '支持' },
          { name: '状态灯带', value: '支持（红色、绿色或蓝色）' }
        ]
      },
      {
        category: '接口',
        items: [
          { name: 'USB Type-C接口', value: 'USB2.0，连接电脑' },
          { name: 'USB Type-A接口', value: 'USB2.0，调试口' },
          { name: 'DC电源接口', value: 'DC电源接口' },
          { name: 'RJ45网络接口', value: '有线级联；POE供电接口' }
        ]
      },
      {
        category: '声学',
        items: [
          { name: '麦克风', value: '12个模拟全向麦克风' },
          { name: '频响', value: '100Hz - 8kHz' },
          { name: '喇叭', value: '1个8W全频喇叭,1个8W高音喇叭,1个无源辐射器' },
          { name: '喇叭频响-音乐模式', value: '80Hz - 20kHz' },
          { name: '喇叭频响-通话模式', value: '150Hz - 7.5kHz' }
        ]
      },
      {
        category: '电源',
        items: [
          { name: 'DC适配器', value: '12V/2A' },
          { name: 'POE供电', value: '支持802.3at，30W' }
        ]
      },
      {
        category: '其他',
        items: [
          { name: '工作温度', value: '0℃ ~ 40℃' },
          { name: '存储温度', value: '-20℃ ~ +70℃' },
          { name: 'Kensington安全锁孔', value: '支持' },
          { name: '认证', value: 'CCC认证,RoHS认证' },
        ]
      }
    ],
    brochureUrl: a8Pdf,
  },
  'a9': {
    id: 'a9',
    name: 'AI追踪双目语音摄像头C60',
    description: 'C60是思必驰推出的一款集多种AI追踪模式，AI会议助理，AI实时字幕，音视频融合等特色能力的AI追踪双目语音摄像头，适用于会议场景中的讨论、演讲、板书等各类视频图像要求。',
    images: [
      a9Image1,
      a9Image2,
      a9Image3,
      a9Image4
    ],
    specs: [
      {
        category: '特写镜头',
        items: [
          { name: '图像传感器', value: '1/2.8英寸CMOS, 214万像素' },
          { name: '变焦方式', value: '12倍光学变焦+16倍数字变焦' },
          { name: '水平视场角', value: '72.5°' }
        ]
      },
      {
        category: '全景镜头',
        items: [
          { name: '图像传感器', value: '1/2.8英寸CMOS, 214万像素' },
          { name: '水平视场角', value: '110°' }
        ]
      },
      {
        category: '视频性能',
        items: [
          { name: '增益', value: '支持' },
          { name: '白平衡', value: '支持' },
          { name: '曝光控制', value: '支持' }
        ]
      },
      {
        category: '云台规格',
        items: [
          { name: '转动范围', value: '水平+/-130°, 垂直-30°~+90°' },
          { name: '转动速度', value: '水平0.1°~100°/s, 垂直0.1°~80°/s' },
          { name: '水平/垂直翻转', value: '支持' },
          { name: '预置位', value: '64个' }
        ]
      },
      {
        category: '基本规格',
        items: [
          { name: '尺寸', value: '245mm×145mm×165mm' },
          { name: '净重', value: '2KG左右' },
          { name: '机身', value: '雅致灰' }
        ]
      },
      {
        category: '接口',
        items: [
          { name: 'RJ45', value: '1个10/100M, 支持PoE供电, 视频分辨率(1080P30/P25, 720P30/P25, 360P30/P25)' },
          { name: 'USB 2.0', value: '1个Type-A, Host' },
          { name: 'USB 3.0', value: '1个Type-B (视频格式支持YUY2, NV12)' },
          { name: '3G-SDI', value: '1个, 视频分辨率(1080P60/P50/P30/P25, 720P60/P50)' },
          { name: 'HDMI-OUT', value: '1个, 视频分辨率(1080P60/P50/P30/P25, 720P60/P50)' },
          { name: 'Line in', value: '1个3.5mm音频接口' },
          { name: 'REF Audio', value: '1个3.5mm音频接口' },
          { name: 'RS485', value: '1个控制接口' },
          { name: 'RS232-IN', value: '1个控制接口' }
        ]
      },
      {
        category: '电源',
        items: [
          { name: 'DC', value: '12V/1.5A' },
          { name: 'PoE', value: '802.3af' }
        ]
      }
    ],
    brochureUrl: a9Pdf,
  }
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  // 默认选择第一张图片作为预览图
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentLightboxIndex, setCurrentLightboxIndex] = useState(0);
  
  // 确保始终选择第一张图片作为预览图
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [id]);
  
  // 添加ESC键关闭图片查看器的功能
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showLightbox) {
        closeLightbox();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showLightbox]);
  
  // 获取产品数据，如果不存在则返回首页
  const product = productData[id as keyof typeof productData];
  if (!product) {
    navigate('/');
    return null;
  }

  // 处理资料下载
  const handleDownloadBrochure = () => {
    // 在实际应用中，这里会触发文件下载
    if (product.brochureUrl && product.brochureUrl !== '#') {
      // 创建一个临时链接并触发下载
      const link = document.createElement('a');
      link.href = product.brochureUrl;
      link.download = `${product.name}产品彩页.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast(`${product.name}产品彩页已开始下载`);
      console.log(`下载产品 ${product.name} 的彩页`);
    } else {
      // 如果没有PDF链接，显示提示
      toast('该产品目前暂无可用的产品彩页，敬请期待');
    }
  };

  // 打开图片查看器
  const openLightbox = (index: number) => {
    setCurrentLightboxIndex(index);
    setShowLightbox(true);
    document.body.style.overflow = 'hidden'; // 防止背景滚动
  };

  // 关闭图片查看器
  const closeLightbox = () => {
    setShowLightbox(false);
    document.body.style.overflow = 'auto'; // 恢复背景滚动
  };

  // 切换到上一张图片
  const goToPrevImage = () => {
    setCurrentLightboxIndex(prevIndex => 
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  };

  // 切换到下一张图片
  const goToNextImage = () => {
    setCurrentLightboxIndex(prevIndex => 
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <>
      <ImageLightbox 
        isOpen={showLightbox} 
        images={product.images}
        currentIndex={currentLightboxIndex}
        onClose={closeLightbox}
        onPrev={goToPrevImage}
        onNext={goToNextImage}
      />
      <div className="min-h-screen bg-white text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* 返回按钮 - 调整样式以适应触摸屏幕 */}
          <button 
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="返回上一页"
          >
            <i className="fa-solid fa-arrow-left mr-1"></i> 返回
          </button>
          
          {/* 头部信息 - 根据产品品牌显示对应的logo */}
          <Header 
            showHrAvcLogo={product.id.startsWith('h')}
            showAiSpeechLogo={product.id.startsWith('a')}
            isProductDetailPage={true}
          />
          
          {/* 产品详情内容 - 在移动设备上调整为单列布局 */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* 产品图片区域 */}
            <div>
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden cursor-pointer relative"
                   onClick={() => openLightbox(selectedImageIndex)}>
                     <img 
                       src={product.images[selectedImageIndex]} 
                       alt={product.name} 
                       className="w-full h-full object-contain p-4 hover:scale-[1.02] transition-transform duration-300"
                     />
                    <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <i className="fa-solid fa-search-plus text-white text-4xl"></i>
                    </div>
              </div>
              
              {/* 缩略图导航 - 优化触摸体验 */}
              <div className="flex mt-3 gap-2 overflow-x-auto pb-2 -mx-1 px-1 hide-scrollbar">
                 {product.images.map((img, index) => (
                       <button
                        key={index}
                        className={`w-20 h-14 flex-shrink-0 overflow-hidden rounded border-2 ${selectedImageIndex === index ? 'border-blue-500' : 'border-transparent'} hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-300`}
                        onClick={(e) => {
                          e.stopPropagation(); // 防止触发父级点击事件
                          setSelectedImageIndex(index);
                        }}
                        onMouseEnter={() => {
                          setSelectedImageIndex(index);
                        }}
                        aria-label={`查看图片 ${index + 1}`}
                      >
                          <img 
                            src={img} 
                            alt={`缩略图 ${index + 1}`} 
                             className="w-full h-full object-contain cursor-pointer"
                             onClick={(e) => {
                               e.stopPropagation(); // 防止触发按钮的点击事件
                               openLightbox(index); // 直接点击缩略图也可以打开大图
                             }}
                          />
                    </button>
                 ))}
              </div>
            </div>
            
             {/* 产品信息区域 */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-2">{product.name}</h1>
              {(product as any).subtitle && (
                <h2 className={`text-base sm:text-lg ${product.id.startsWith('h') ? 'text-red-600' : 'text-blue-600'} mb-4`}>{(product as any).subtitle}</h2>
              )}
               <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base whitespace-pre-line">{product.description}</p>
              
                {/* 产品规格列表 */}
                <div className="mb-6">
                   <h2 className="text-base sm:text-lg font-semibold mb-3">产品规格</h2>
                    {(product as any).specs ? (
                       // 使用 specs 数组显示
                      <div className="space-y-6">
                        {(product as any).specs?.map((category: any, categoryIndex: number) => (
                          <div key={categoryIndex} className="overflow-x-auto">
                            <h3 className="font-medium mb-2">{category.category}</h3>
                            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {category.items.map((item: any, index: number) => (
                                  <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}>
                                    <td className="px-4 py-2 text-sm font-medium">{item.name}</td>
                                    <td className="px-4 py-2 text-sm" dangerouslySetInnerHTML={{ __html: item.value }}></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </div>
                    ) : (product as any).technicalSpecs ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {(product as any).technicalSpecs?.map((spec: string, index: number) => {
                              // 跳过空行
                              if (!spec.trim()) return null;
                               
                              // 标准规格行，尝试按照表格格式分隔
                              const parts = spec.split('\t');
                              if (parts.length >= 2) {
                                return (
                                  <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}>
                                    <td className="px-4 py-2 text-sm font-medium w-1/3">{parts[0]}</td>
                                    <td className="px-4 py-2 text-sm w-2/3">{parts.slice(1).join('\t')}</td>
                                  </tr>
                                );
                              }
                               
                              // 无法分隔的内容作为单列表格行
                              return (
                                <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}>
                                  <td colSpan={2} className="px-4 py-2 text-sm">{spec}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                    <>
                      {/* 输入板卡表格 */}
                      <div className="mb-4 overflow-x-auto">
                        <h3 className="font-medium mb-2">输入板卡</h3>
                        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                          <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">类型</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">说明</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {(product as any).inputCards?.map((card: any, index: number) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}>
                                <td className="px-4 py-2 text-sm">{card.type}</td>
                                <td className="px-4 py-2 text-sm">{card.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* 输出板卡表格 */}
                      <div className="mb-4 overflow-x-auto">
                        <h3 className="font-medium mb-2">输出板卡</h3>
                        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                          <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">类型</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">说明</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {(product as any).outputCards?.map((card: any, index: number) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}>
                                <td className="px-4 py-2 text-sm">{card.type}</td>
                                <td className="px-4 py-2 text-sm">{card.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* 机箱规模表格 */}
                      <div className="overflow-x-auto">
                        <h3 className="font-medium mb-2">机箱规模</h3>
                        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                          <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">型号</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">说明</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">尺寸</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">额定功率</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {(product as any).chassisSpecs?.map((chassis: any, index: number) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}>
                                <td className="px-4 py-2 text-sm">{chassis.model}</td>
                                <td className="px-4 py-2 text-sm">{chassis.description}</td>
                                <td className="px-4 py-2 text-sm">{chassis.size}</td>
                                <td className="px-4 py-2 text-sm">{chassis.power}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
               </div>
              
               {/* 下载按钮 - 增加触摸区域 */}
              <button
                onClick={handleDownloadBrochure}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors flex items-center justify-center w-full sm:w-auto text-sm sm:text-base"
                aria-label="下载产品彩页"
              >
                <i className="fa-solid fa-download mr-2"></i>
                下载产品彩页
              </button>
              
              {/* 联系方式 */}
              <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                <p>如需了解更多产品信息，请联系我们：</p>
                <p className="mt-1">guo@techhdi.com | 18814845538</p>
                <p className="mt-1">地址：杭州市余杭区七彩汇商业中心2-305室</p>
               <p className="text-xs mt-2 flex items-center gap-4" style={{color: '#9ca3af'}}>
  	<a href="https://beian.miit.gov.cn/" target="_blank" rel="nofollow noopener" style={{color: '#9ca3af', textDecoration: 'none'}} className="hover:text-gray-700 dark:hover:text-gray-300">
     		 ICP备案号：浙ICP备2026007647号-1
    	</a>
    	<a href="https://beian.mps.gov.cn/#/query/webSearch?code=33011002019014" rel="noreferrer" target="_blank" className="flex items-center">
      	<img src='https://beian.mps.gov.cn/img/logo01.dd7ff50e.png' alt="公安备案" className="w-4 h-4 mr-1" />
      		浙公网安备33011002019014号
    	</a>
      </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}