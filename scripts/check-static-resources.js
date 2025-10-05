#!/usr/bin/env node

/**
 * 静态资源SEO检查脚本
 */

const staticResources = [
  '/_next/static/media/4cf2300e9c8272f7-s.p.woff2',
  '/favicon.ico',
  '/apple-icon.png',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/robots.txt',
  '/sitemap.xml'
];

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function checkStaticResource(path) {
  try {
    const fullUrl = `${baseUrl}${path}`;
    console.log(`检查静态资源: ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Static-Resource-Checker/1.0'
      }
    });
    
    if (response.ok) {
      const robotsTag = response.headers.get('X-Robots-Tag');
      const cacheControl = response.headers.get('Cache-Control');
      
      console.log(`✅ ${path} - ${response.status}`);
      
      if (robotsTag) {
        console.log(`   Robots: ${robotsTag}`);
      }
      
      if (cacheControl) {
        console.log(`   Cache: ${cacheControl}`);
      }
      
      // 检查是否应该有noindex标签
      const shouldHaveNoIndex = path.includes('_next') || 
                               path.includes('favicon') || 
                               path.includes('woff') ||
                               path.includes('robots.txt') ||
                               path.includes('sitemap.xml');
      
      if (shouldHaveNoIndex && (!robotsTag || !robotsTag.includes('noindex'))) {
        console.log(`   ⚠️  建议添加noindex标签`);
      }
      
      console.log('');
      return true;
    } else {
      console.log(`❌ ${path} - ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${path} - 错误: ${error.message}`);
    return false;
  }
}

async function checkAllStaticResources() {
  console.log(`开始检查 ${baseUrl} 的静态资源SEO设置...\n`);
  
  const results = await Promise.all(staticResources.map(checkStaticResource));
  const successCount = results.filter(Boolean).length;
  
  console.log(`检查完成: ${successCount}/${staticResources.length} 个静态资源可访问`);
  
  console.log('\n建议:');
  console.log('1. 确保字体文件和图标文件有X-Robots-Tag: noindex');
  console.log('2. 确保静态资源有适当的缓存控制头');
  console.log('3. 在Google Search Console中监控这些资源的索引状态');
}

checkAllStaticResources();