#!/usr/bin/env node

/**
 * SEO健康检查脚本 - 综合检查网站的SEO状态
 */

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// 主要页面
const mainPages = [
  '/',
  '/creation',
  '/gallery',
  '/dashboard',
  '/help',
  '/blog',
  '/community'
];

// 静态资源
const staticResources = [
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml'
];

async function checkPage(path) {
  try {
    const fullUrl = `${baseUrl}${path}`;
    const response = await fetch(fullUrl);
    
    if (!response.ok) {
      return { path, status: 'error', message: `HTTP ${response.status}` };
    }
    
    const html = await response.text();
    const issues = [];
    
    // 检查标题
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (!titleMatch) {
      issues.push('缺少标题标签');
    } else if (titleMatch[1].length < 30 || titleMatch[1].length > 60) {
      issues.push(`标题长度不理想 (${titleMatch[1].length}字符)`);
    }
    
    // 检查描述
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    if (!descMatch) {
      issues.push('缺少描述标签');
    } else if (descMatch[1].length < 120 || descMatch[1].length > 160) {
      issues.push(`描述长度不理想 (${descMatch[1].length}字符)`);
    }
    
    // 检查规范URL
    const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
    if (!canonicalMatch) {
      issues.push('缺少规范URL');
    } else {
      const expectedCanonical = `${baseUrl}${path === '/' ? '' : path}`;
      if (canonicalMatch[1] !== expectedCanonical) {
        issues.push(`规范URL不匹配: ${canonicalMatch[1]} vs ${expectedCanonical}`);
      }
    }
    
    // 检查OpenGraph
    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    
    if (!ogTitleMatch) issues.push('缺少OG标题');
    if (!ogDescMatch) issues.push('缺少OG描述');
    if (!ogImageMatch) issues.push('缺少OG图片');
    
    // 检查结构化数据
    const structuredDataMatch = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>/i);
    if (!structuredDataMatch) {
      issues.push('缺少结构化数据');
    }
    
    return {
      path,
      status: issues.length === 0 ? 'good' : 'warning',
      issues,
      title: titleMatch ? titleMatch[1] : null,
      description: descMatch ? descMatch[1] : null
    };
    
  } catch (error) {
    return { path, status: 'error', message: error.message };
  }
}

async function checkStaticResource(path) {
  try {
    const fullUrl = `${baseUrl}${path}`;
    const response = await fetch(fullUrl, { method: 'HEAD' });
    
    return {
      path,
      status: response.ok ? 'good' : 'error',
      statusCode: response.status,
      robotsTag: response.headers.get('X-Robots-Tag'),
      cacheControl: response.headers.get('Cache-Control')
    };
  } catch (error) {
    return { path, status: 'error', message: error.message };
  }
}

async function runSEOHealthCheck() {
  console.log(`🔍 开始SEO健康检查: ${baseUrl}\n`);
  
  // 检查主要页面
  console.log('📄 检查主要页面...');
  const pageResults = await Promise.all(mainPages.map(checkPage));
  
  pageResults.forEach(result => {
    const statusIcon = result.status === 'good' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${statusIcon} ${result.path}`);
    
    if (result.title) {
      console.log(`   标题: ${result.title}`);
    }
    
    if (result.issues && result.issues.length > 0) {
      result.issues.forEach(issue => {
        console.log(`   ⚠️  ${issue}`);
      });
    }
    
    if (result.message) {
      console.log(`   ❌ ${result.message}`);
    }
    
    console.log('');
  });
  
  // 检查静态资源
  console.log('📁 检查静态资源...');
  const staticResults = await Promise.all(staticResources.map(checkStaticResource));
  
  staticResults.forEach(result => {
    const statusIcon = result.status === 'good' ? '✅' : '❌';
    console.log(`${statusIcon} ${result.path} (${result.statusCode})`);
    
    if (result.robotsTag) {
      console.log(`   Robots: ${result.robotsTag}`);
    }
    
    if (result.cacheControl) {
      console.log(`   Cache: ${result.cacheControl}`);
    }
    
    console.log('');
  });
  
  // 总结
  const goodPages = pageResults.filter(r => r.status === 'good').length;
  const warningPages = pageResults.filter(r => r.status === 'warning').length;
  const errorPages = pageResults.filter(r => r.status === 'error').length;
  
  const goodStatic = staticResults.filter(r => r.status === 'good').length;
  const errorStatic = staticResults.filter(r => r.status === 'error').length;
  
  console.log('📊 总结:');
  console.log(`   页面: ${goodPages} 良好, ${warningPages} 警告, ${errorPages} 错误`);
  console.log(`   静态资源: ${goodStatic} 良好, ${errorStatic} 错误`);
  
  if (warningPages === 0 && errorPages === 0 && errorStatic === 0) {
    console.log('🎉 SEO健康状况良好！');
  } else {
    console.log('⚠️  发现一些SEO问题，建议修复');
  }
}

runSEOHealthCheck();