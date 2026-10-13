export interface HeroSlide {
  id: string;
  /** 图片 key（查 HERO_IMAGE_BY_KEY）或完整 data: URI */
  image: string;
  /** 替代文字。必填——读屏用户与图片加载失败时唯一的信息来源 */
  alt: string;
  /**
   * contain = 完整显示整台设备（超宽产品图必须用这个）
   * cover   = 铺满容器（带背景的横版海报用）
   */
  fit?: 'contain' | 'cover';
  /** 图上叠加的标题；图片里已印产品名就别写，会重复 */
  name?: string;
  /** 图上叠加的副标题 */
  note?: string;
  /** 站内 /product/<id>、站内区块 /#products，或站外完整 https:// */
  href?: string;
  linkLabel?: string;
}

export interface HeroSlidesCatalog {
  /** 自动轮播间隔（毫秒）。设为 0 关闭自动播放 */
  autoplayMs: number;
  slides: HeroSlide[];
}
