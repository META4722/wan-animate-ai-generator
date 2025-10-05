/**
 * 静态资源SEO处理工具
 */

// 不应该被搜索引擎索引的文件扩展名
export const NO_INDEX_EXTENSIONS = [
  '.woff',
  '.woff2', 
  '.ttf',
  '.eot',
  '.otf',
  '.ico',
  '.map',
  '.json'
];

// 不应该被搜索引擎索引的路径
export const NO_INDEX_PATHS = [
  '/_next/',
  '/api/',
  '/admin/',
  '/.well-known/',
  '/favicon.ico',
  '/apple-icon.png',
  '/robots.txt',
  '/sitemap.xml'
];

/**
 * 检查路径是否应该被搜索引擎索引
 */
export function shouldIndexPath(pathname: string): boolean {
  // 检查路径
  for (const path of NO_INDEX_PATHS) {
    if (pathname.startsWith(path)) {
      return false;
    }
  }
  
  // 检查文件扩展名
  for (const ext of NO_INDEX_EXTENSIONS) {
    if (pathname.endsWith(ext)) {
      return false;
    }
  }
  
  return true;
}

/**
 * 获取静态资源的robots标签
 */
export function getStaticResourceRobots(pathname: string): string {
  if (!shouldIndexPath(pathname)) {
    return 'noindex, nofollow, noarchive, nosnippet';
  }
  
  return 'index, follow';
}

/**
 * 获取静态资源的缓存控制头
 */
export function getStaticResourceCacheControl(pathname: string): string {
  // 字体文件 - 长期缓存
  if (pathname.match(/\.(woff|woff2|ttf|eot|otf)$/)) {
    return 'public, max-age=31536000, immutable';
  }
  
  // 图标文件 - 中期缓存
  if (pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp)$/) && 
      (pathname.includes('favicon') || pathname.includes('icon'))) {
    return 'public, max-age=86400';
  }
  
  // Next.js静态文件 - 长期缓存
  if (pathname.startsWith('/_next/static/')) {
    return 'public, max-age=31536000, immutable';
  }
  
  // 默认缓存
  return 'public, max-age=3600';
}