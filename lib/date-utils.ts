/**
 * 日期格式化工具函数
 * 解决 Next.js 水合错误问题
 */

import { useState, useEffect } from "react";

/**
 * 自定义 Hook 用于检测是否在客户端
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * 安全的日期格式化函数，避免水合错误
 * @param dateString - 日期字符串
 * @param options - 格式化选项
 * @returns 格式化后的日期字符串
 */
export function formatDateSafe(
  dateString: string,
  options?: {
    isClient?: boolean;
    fallbackFormat?: 'iso' | 'simple';
  }
): string {
  const { isClient = false, fallbackFormat = 'iso' } = options || {};

  if (!isClient) {
    // 服务器端渲染时使用一致的格式
    const date = new Date(dateString);
    if (fallbackFormat === 'simple') {
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }
    return date.toISOString().split('T')[0]; // 默认使用 ISO 格式
  }

  // 客户端渲染时使用本地化格式
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    // 如果格式化失败，回退到简单格式
    return new Date(dateString).toISOString().split('T')[0];
  }
}

/**
 * 安全的日期时间格式化函数
 * @param dateString - 日期字符串
 * @param options - 格式化选项
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTimeSafe(
  dateString: string,
  options?: {
    isClient?: boolean;
  }
): string {
  const { isClient = false } = options || {};

  if (!isClient) {
    // 服务器端渲染时使用一致的格式
    const date = new Date(dateString);
    return date.toISOString().replace('T', ' ').split('.')[0]; // YYYY-MM-DD HH:mm:ss
  }

  // 客户端渲染时使用本地化格式
  try {
    return new Date(dateString).toLocaleString();
  } catch (error) {
    // 如果格式化失败，回退到简单格式
    const date = new Date(dateString);
    return date.toISOString().replace('T', ' ').split('.')[0];
  }
}

/**
 * React 组件中使用的日期格式化 Hook
 * @param dateString - 日期字符串
 * @returns 格式化后的日期字符串
 */
export function useDateFormat(dateString: string): string {
  const isClient = useIsClient();
  return formatDateSafe(dateString, { isClient });
}

/**
 * React 组件中使用的日期时间格式化 Hook
 * @param dateString - 日期字符串
 * @returns 格式化后的日期时间字符串
 */
export function useDateTimeFormat(dateString: string): string {
  const isClient = useIsClient();
  return formatDateTimeSafe(dateString, { isClient });
}