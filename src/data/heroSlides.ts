export interface HeroSlide {
  id: string;
  /** 图片 key（查任意一张图片登记表）或完整 data: URI */
  image: string;
  /** 替代文字。必填——读屏用户与图片加载失败时唯一的信息来源 */
  alt: string;
  /**
   * contain = 完整显示整张图（推荐：超宽产品图两端不会被切、带标题的海报不会被切）
   * cover   = 铺满容器，必然裁掉上下或左右
   */
  fit?: 'contain' | 'cover';
  /** 左下角显示的名称，写「公司 + 产品名」，如「HRVAC VMM0412 视频处理器」 */
  name: string;
}

export interface HeroSlidesCatalog {
  /** 自动轮播间隔（毫秒）。设为 0 关闭自动播放 */
  autoplayMs: number;
  slides: HeroSlide[];
}
