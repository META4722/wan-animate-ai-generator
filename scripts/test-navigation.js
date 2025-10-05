#!/usr/bin/env node

/**
 * 导航链接测试脚本 - 验证所有导航链接都能正常工作
 */

const navigationLinks = [
  // Header navigation
  { name: 'Home', url: '/' },
  { name: 'Pricing', url: '/#pricing' },
  { name: 'Blog', url: '/blog' },
  { name: 'Help', url: '/help' },
  
  // Footer navigation
  { name: 'Create Videos', url: '/creation' },
  { name: 'Gallery', url: '/gallery' },
  { name: 'Community', url: '/community' },
  { name: 'Privacy Policy', url: '/privacy' },
  { name: 'Terms of Service', url: '/terms' },
  
  // Other important pages
  { name: 'Dashboard', url: '/dashboard' },
  { name: 'Sign In', url: '/sign-in' },
  { name: 'Sign Up', url: '/sign-up' }
];

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wanimate.io/';

async function testLink(link) {
  try {
    // Skip anchor links for this test
    if (link.url.startsWith('#')) {
      console.log(`⏭️  ${link.name} (${link.url}) - 跳过锚点链接`);
      return true;
    }
    
    const fullUrl = `${baseUrl}${link.url}`;
    console.log(`测试: ${link.name} -> ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Navigation-Test/1.0'
      }
    });
    
    if (response.ok) {
      console.log(`✅ ${link.name} - ${response.status}`);
      return true;
    } else if (response.status === 302 || response.status === 301) {
      const location = response.headers.get('location');
      console.log(`🔄 ${link.name} - 重定向到: ${location}`);
      return true;
    } else {
      console.log(`❌ ${link.name} - ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${link.name} - 错误: ${error.message}`);
    return false;
  }
}

async function testAllNavigation() {
  console.log(`🧭 开始测试导航链接: ${baseUrl}\n`);
  
  const results = await Promise.all(navigationLinks.map(testLink));
  const successCount = results.filter(Boolean).length;
  
  console.log(`\n测试完成: ${successCount}/${navigationLinks.length} 个链接正常`);
  
  if (successCount === navigationLinks.length) {
    console.log('🎉 所有导航链接都正常工作！');
  } else {
    console.log('⚠️  有些链接存在问题，请检查上面的错误信息');
  }
  
  console.log('\n建议:');
  console.log('1. 确保所有页面都已创建并可访问');
  console.log('2. 检查路由配置是否正确');
  console.log('3. 验证重定向规则是否按预期工作');
}

testAllNavigation();