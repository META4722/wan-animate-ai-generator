#!/usr/bin/env node

/**
 * Sitemap验证脚本 - 检查sitemap的有效性和URL可访问性
 */

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wanimate.io';

async function validateSitemap() {
  try {
    console.log(`🗺️  验证sitemap: ${baseUrl}/sitemap.xml\n`);
    
    // 获取sitemap内容
    const response = await fetch(`${baseUrl}/sitemap.xml`);
    
    if (!response.ok) {
      console.log(`❌ 无法获取sitemap: ${response.status} ${response.statusText}`);
      return;
    }
    
    const sitemapContent = await response.text();
    console.log('✅ Sitemap可访问');
    
    // 解析URL
    const urlMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g);
    
    if (!urlMatches) {
      console.log('❌ 在sitemap中未找到URL');
      return;
    }
    
    const urls = urlMatches.map(match => match.replace(/<\/?loc>/g, ''));
    console.log(`📊 找到 ${urls.length} 个URL\n`);
    
    // 验证每个URL
    const results = [];
    for (const url of urls) {
      try {
        console.log(`检查: ${url}`);
        
        // 验证域名
        if (!url.includes('wanimate.io')) {
          console.log(`❌ 错误的域名: ${url}`);
          results.push({ url, status: 'wrong-domain' });
          continue;
        }
        
        // 检查URL可访问性
        const urlResponse = await fetch(url, { method: 'HEAD' });
        
        if (urlResponse.ok) {
          console.log(`✅ ${url} - ${urlResponse.status}`);
          results.push({ url, status: 'ok' });
        } else if (urlResponse.status === 301 || urlResponse.status === 302) {
          const location = urlResponse.headers.get('location');
          console.log(`🔄 ${url} - 重定向到: ${location}`);
          results.push({ url, status: 'redirect', location });
        } else {
          console.log(`❌ ${url} - ${urlResponse.status} ${urlResponse.statusText}`);
          results.push({ url, status: 'error', code: urlResponse.status });
        }
      } catch (error) {
        console.log(`❌ ${url} - 错误: ${error.message}`);
        results.push({ url, status: 'error', error: error.message });
      }
    }
    
    // 总结
    console.log('\n📋 验证总结:');
    const okCount = results.filter(r => r.status === 'ok').length;
    const redirectCount = results.filter(r => r.status === 'redirect').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const wrongDomainCount = results.filter(r => r.status === 'wrong-domain').length;
    
    console.log(`✅ 正常: ${okCount}`);
    console.log(`🔄 重定向: ${redirectCount}`);
    console.log(`❌ 错误: ${errorCount}`);
    console.log(`🚫 错误域名: ${wrongDomainCount}`);
    
    if (wrongDomainCount > 0 || errorCount > 0) {
      console.log('\n⚠️  发现问题，需要修复sitemap');
      process.exit(1);
    } else {
      console.log('\n🎉 Sitemap验证通过！');
    }
    
  } catch (error) {
    console.log(`❌ 验证失败: ${error.message}`);
    process.exit(1);
  }
}

validateSitemap();