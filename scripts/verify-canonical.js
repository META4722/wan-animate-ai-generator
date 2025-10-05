#!/usr/bin/env node

/**
 * 规范URL验证脚本 - 检查网站的规范URL设置
 */

const pages = [
  '/',
  '/gallery', 
  '/dashboard',
  '/community',
  '/blog',
  '/help',
  '/privacy',
  '/terms'
];

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wanimate.io';

async function checkCanonicalUrl(path) {
  try {
    const fullUrl = `${baseUrl}${path}`;
    console.log(`检查规范URL: ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Canonical-URL-Checker/1.0'
      }
    });
    
    if (response.ok) {
      const html = await response.text();
      
      // 查找规范URL标签
      const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
      
      if (canonicalMatch) {
        const canonicalUrl = canonicalMatch[1];
        const expectedCanonical = `${baseUrl}${path === '/' ? '' : path}`;
        
        if (canonicalUrl === expectedCanonical) {
          console.log(`✅ ${path} - 规范URL正确: ${canonicalUrl}`);
          return true;
        } else {
          console.log(`❌ ${path} - 规范URL不匹配:`);
          console.log(`   期望: ${expectedCanonical}`);
          console.log(`   实际: ${canonicalUrl}`);
          return false;
        }
      } else {
        console.log(`⚠️  ${path} - 未找到规范URL标签`);
        return false;
      }
    } else {
      console.log(`❌ ${path} - HTTP ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${path} - 错误: ${error.message}`);
    return false;
  }
}

async function verifyAllCanonicalUrls() {
  console.log(`开始验证 ${baseUrl} 的规范URL设置...\n`);
  
  const results = await Promise.all(pages.map(checkCanonicalUrl));
  const successCount = results.filter(Boolean).length;
  
  console.log(`\n验证完成: ${successCount}/${pages.length} 个页面的规范URL设置正确`);
  
  if (successCount === pages.length) {
    console.log('🎉 所有页面的规范URL都设置正确！');
    process.exit(0);
  } else {
    console.log('⚠️  有些页面的规范URL设置存在问题，请检查上面的错误信息');
    process.exit(1);
  }
}

verifyAllCanonicalUrls();