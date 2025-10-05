#!/usr/bin/env node

/**
 * URL检查脚本 - 验证网站的所有重要页面都能正常访问
 */

const urls = [
  '/',
  '/gallery', 
  '/dashboard',
  '/community',
  '/blog',
  '/help',
  '/privacy',
  '/terms',
  '/coming-soon',
  '/sitemap.xml',
  '/robots.txt'
];

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function checkUrl(url) {
  try {
    const fullUrl = `${baseUrl}${url}`;
    console.log(`检查: ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'URL-Checker/1.0'
      }
    });
    
    if (response.ok) {
      console.log(`✅ ${url} - ${response.status}`);
      return true;
    } else {
      console.log(`❌ ${url} - ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${url} - 错误: ${error.message}`);
    return false;
  }
}

async function checkAllUrls() {
  console.log(`开始检查 ${baseUrl} 的所有URL...\n`);
  
  const results = await Promise.all(urls.map(checkUrl));
  const successCount = results.filter(Boolean).length;
  
  console.log(`\n检查完成: ${successCount}/${urls.length} 个URL正常`);
  
  if (successCount === urls.length) {
    console.log('🎉 所有URL都正常工作！');
    process.exit(0);
  } else {
    console.log('⚠️  有些URL存在问题，请检查上面的错误信息');
    process.exit(1);
  }
}

checkAllUrls();