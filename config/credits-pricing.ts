/**
 * 积分定价规则配置
 * 根据视频分辨率和时长计算所需积分
 */

export interface CreditsPricingRule {
  resolution: string;
  duration5s: number;
  duration10s: number;
}

export const CREDITS_PRICING: CreditsPricingRule[] = [
  {
    resolution: '480p',
    duration5s: 5,
    duration10s: 10,
  },
  {
    resolution: '720p', 
    duration5s: 10,
    duration10s: 20,
  },
  {
    resolution: '1080p',
    duration5s: 15,
    duration10s: 30,
  },
];

/**
 * 计算视频生成所需积分
 * @param resolution 视频分辨率 ('480p' | '720p' | '1080p')
 * @param duration 视频时长（秒）
 * @returns 所需积分数量
 */
export function calculateRequiredCredits(resolution: string, duration: number): number {
  const rule = CREDITS_PRICING.find(r => r.resolution === resolution);
  
  if (!rule) {
    // 默认使用1080p价格
    return duration <= 5 ? 15 : 30;
  }
  
  return duration <= 5 ? rule.duration5s : rule.duration10s;
}

/**
 * 获取积分定价表格（用于显示给用户）
 */
export function getCreditsPricingTable() {
  return {
    '480p': {
      '5s': 5,
      '10s': 10,
    },
    '720p': {
      '5s': 10,
      '10s': 20,
    },
    '1080p': {
      '5s': 15,
      '10s': 30,
    },
  };
}

/**
 * 估算积分包可生成的视频数量
 * @param credits 积分数量
 * @param resolution 默认分辨率
 * @param duration 默认时长
 * @returns 估算的视频数量
 */
export function estimateVideoCount(
  credits: number, 
  resolution: string = '480p', 
  duration: number = 5
): number {
  const costPerVideo = calculateRequiredCredits(resolution, duration);
  return Math.floor(credits / costPerVideo);
}

/**
 * 积分套餐信息
 */
export const CREDITS_PACKAGES = {
  trial: {
    name: 'Trial',
    credits: 100,
    price: 10,
    estimatedVideos: estimateVideoCount(100),
    description: '适合测试和小项目',
  },
  base: {
    name: 'Base', 
    credits: 300,
    price: 27,
    estimatedVideos: estimateVideoCount(300),
    description: '适合内容创作者',
  },
  pro: {
    name: 'Pro',
    credits: 500, 
    price: 40,
    estimatedVideos: estimateVideoCount(500),
    description: '适合专业工作室',
  },
};