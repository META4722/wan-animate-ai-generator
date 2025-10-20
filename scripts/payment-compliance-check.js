#!/usr/bin/env node

/**
 * 支付合规性检查脚本
 * 检查网站是否符合支付处理商的要求
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 检查支付合规性...\n');

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

function addCheck(status, category, message) {
  checks[status].push(`${category}: ${message}`);
}

// 1. 检查必要页面是否存在
console.log('1. 检查必要页面...');

const requiredPages = [
  { path: 'app/privacy/page.tsx', name: 'Privacy Policy' },
  { path: 'app/terms/page.tsx', name: 'Terms of Service' },
  { path: 'app/contact/page.tsx', name: 'Contact Us' }
];

requiredPages.forEach(page => {
  if (fs.existsSync(page.path)) {
    addCheck('passed', 'Pages', `${page.name} page exists`);
  } else {
    addCheck('failed', 'Pages', `${page.name} page missing`);
  }
});

// 2. 检查页面内容是否完整
console.log('2. 检查页面内容...');

try {
  const privacyContent = fs.readFileSync('app/privacy/page.tsx', 'utf8');
  if (privacyContent.includes('Wan 2.2 Animate') || privacyContent.includes('video animation')) {
    addCheck('passed', 'Content', 'Privacy Policy content matches product');
  } else {
    addCheck('failed', 'Content', 'Privacy Policy content does not match product');
  }

  if (privacyContent.includes('support@wanimate.io') || privacyContent.includes('contact')) {
    addCheck('passed', 'Content', 'Privacy Policy includes contact information');
  } else {
    addCheck('warnings', 'Content', 'Privacy Policy should include contact information');
  }
} catch (error) {
  addCheck('failed', 'Content', 'Cannot read Privacy Policy content');
}

try {
  const termsContent = fs.readFileSync('app/terms/page.tsx', 'utf8');
  if (termsContent.includes('Wan 2.2 Animate') || termsContent.includes('video animation')) {
    addCheck('passed', 'Content', 'Terms of Service content matches product');
  } else {
    addCheck('failed', 'Content', 'Terms of Service content does not match product');
  }

  if (termsContent.includes('refund') && termsContent.includes('cancellation')) {
    addCheck('passed', 'Content', 'Terms include refund and cancellation policies');
  } else {
    addCheck('warnings', 'Content', 'Terms should clearly state refund and cancellation policies');
  }
} catch (error) {
  addCheck('failed', 'Content', 'Cannot read Terms of Service content');
}

try {
  const contactContent = fs.readFileSync('app/contact/page.tsx', 'utf8');
  if (contactContent.includes('support@wanimate.io')) {
    addCheck('passed', 'Content', 'Contact page includes support email');
  } else {
    addCheck('warnings', 'Content', 'Contact page should include support email');
  }

  if (contactContent.includes('address') || contactContent.includes('Address')) {
    addCheck('passed', 'Content', 'Contact page includes business address');
  } else {
    addCheck('warnings', 'Content', 'Contact page should include business address');
  }
} catch (error) {
  addCheck('failed', 'Content', 'Cannot read Contact page content');
}

// 3. 检查Footer链接
console.log('3. 检查Footer链接...');

try {
  const footerContent = fs.readFileSync('components/footer.tsx', 'utf8');
  if (footerContent.includes('Privacy Policy') && footerContent.includes('Terms of Service')) {
    addCheck('passed', 'Navigation', 'Footer includes legal page links');
  } else {
    addCheck('failed', 'Navigation', 'Footer missing legal page links');
  }

  if (footerContent.includes('Contact Us') || footerContent.includes('contact')) {
    addCheck('passed', 'Navigation', 'Footer includes contact link');
  } else {
    addCheck('warnings', 'Navigation', 'Footer should include contact link');
  }
} catch (error) {
  addCheck('failed', 'Navigation', 'Cannot read Footer content');
}

// 4. 检查产品描述的真实性
console.log('4. 检查产品描述...');

try {
  const heroContent = fs.readFileSync('components/home/hero.tsx', 'utf8');
  const keyFeaturesContent = fs.readFileSync('components/home/key-features.tsx', 'utf8');
  
  // 检查是否有夸大宣传
  const exaggeratedTerms = [
    'best in the world', 'revolutionary', 'never seen before', 
    'unlimited power', 'magical', 'impossible', 'perfect'
  ];
  
  let hasExaggeration = false;
  exaggeratedTerms.forEach(term => {
    if (heroContent.toLowerCase().includes(term) || keyFeaturesContent.toLowerCase().includes(term)) {
      hasExaggeration = true;
    }
  });

  if (!hasExaggeration) {
    addCheck('passed', 'Marketing', 'Product descriptions are realistic');
  } else {
    addCheck('warnings', 'Marketing', 'Avoid exaggerated marketing claims');
  }

  // 检查是否有具体的技术描述
  if (keyFeaturesContent.includes('AI') && keyFeaturesContent.includes('animation')) {
    addCheck('passed', 'Marketing', 'Product features are clearly described');
  } else {
    addCheck('warnings', 'Marketing', 'Product features should be clearly described');
  }
} catch (error) {
  addCheck('warnings', 'Marketing', 'Cannot verify product descriptions');
}

// 5. 检查定价信息
console.log('5. 检查定价信息...');

try {
  const pricingContent = fs.readFileSync('components/home/pricing.tsx', 'utf8');
  const subscriptionConfig = fs.readFileSync('config/subscriptions.ts', 'utf8');
  
  if (pricingContent.includes('$') && subscriptionConfig.includes('productId')) {
    addCheck('passed', 'Pricing', 'Pricing information is present and configured');
  } else {
    addCheck('warnings', 'Pricing', 'Ensure pricing information is accurate and complete');
  }

  if (pricingContent.includes('cancel') || pricingContent.includes('refund')) {
    addCheck('passed', 'Pricing', 'Pricing includes cancellation information');
  } else {
    addCheck('warnings', 'Pricing', 'Pricing should mention cancellation policy');
  }
} catch (error) {
  addCheck('warnings', 'Pricing', 'Cannot verify pricing information');
}

// 6. 检查环境变量配置
console.log('6. 检查支付配置...');

try {
  const envLocal = fs.readFileSync('.env.local', 'utf8');
  
  if (envLocal.includes('CREEM_API_KEY') && envLocal.includes('CREEM_API_URL')) {
    addCheck('passed', 'Configuration', 'Payment provider configuration present');
  } else {
    addCheck('warnings', 'Configuration', 'Ensure payment provider is properly configured');
  }

  if (envLocal.includes('NEXT_PUBLIC_SITE_URL')) {
    addCheck('passed', 'Configuration', 'Site URL configured for callbacks');
  } else {
    addCheck('warnings', 'Configuration', 'Site URL should be configured for payment callbacks');
  }
} catch (error) {
  addCheck('warnings', 'Configuration', 'Cannot verify environment configuration');
}

// 7. 检查是否有虚假证言或评价
console.log('7. 检查虚假内容...');

const contentFiles = [
  'components/home/hero.tsx',
  'components/home/key-features.tsx',
  'components/home/video-showcase.tsx',
  'app/page.tsx'
];

let hasTestimonials = false;
contentFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const testimonialKeywords = [
      'testimonial', 'review', 'customer says', 'user says', 
      '"amazing"', '"incredible"', '"best tool"', 'rating', 'stars'
    ];
    
    testimonialKeywords.forEach(keyword => {
      if (content.toLowerCase().includes(keyword)) {
        hasTestimonials = true;
      }
    });
  } catch (error) {
    // File doesn't exist or can't be read
  }
});

if (!hasTestimonials) {
  addCheck('passed', 'Content', 'No fake testimonials or reviews found');
} else {
  addCheck('warnings', 'Content', 'Ensure all testimonials and reviews are genuine');
}

// 输出结果
console.log('\n📊 合规性检查结果:\n');

if (checks.passed.length > 0) {
  console.log('✅ 通过的检查:');
  checks.passed.forEach(check => console.log(`   ${check}`));
  console.log('');
}

if (checks.warnings.length > 0) {
  console.log('⚠️  需要注意的问题:');
  checks.warnings.forEach(check => console.log(`   ${check}`));
  console.log('');
}

if (checks.failed.length > 0) {
  console.log('❌ 需要修复的问题:');
  checks.failed.forEach(check => console.log(`   ${check}`));
  console.log('');
}

// 总结
const totalChecks = checks.passed.length + checks.warnings.length + checks.failed.length;
const passRate = Math.round((checks.passed.length / totalChecks) * 100);

console.log(`📈 总体评分: ${passRate}% (${checks.passed.length}/${totalChecks} 项通过)`);

if (checks.failed.length === 0) {
  console.log('🎉 恭喜！您的网站已准备好申请支付处理服务');
} else {
  console.log('🔧 请修复上述问题后再申请支付处理服务');
}

console.log('\n💡 支付申请建议:');
console.log('   1. 确保所有页面内容真实准确');
console.log('   2. 提供清晰的联系方式和客服支持');
console.log('   3. 明确说明退款和取消政策');
console.log('   4. 避免夸大或虚假的营销宣传');
console.log('   5. 确保网站功能完整且用户体验良好');

// 创建合规性报告
const report = {
  timestamp: new Date().toISOString(),
  totalChecks,
  passRate,
  results: checks,
  recommendations: [
    '确保所有页面内容真实准确',
    '提供清晰的联系方式和客服支持',
    '明确说明退款和取消政策',
    '避免夸大或虚假的营销宣传',
    '确保网站功能完整且用户体验良好'
  ]
};

fs.writeFileSync('payment-compliance-report.json', JSON.stringify(report, null, 2));
console.log('\n📄 详细报告已保存到: payment-compliance-report.json');