#!/usr/bin/env node

/**
 * 数据库连接检查工具
 * 使用方法：node scripts/check-db.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkDatabase() {
  console.log('🔍 数据库连接检查工具');
  console.log('===================');

  // 1. 检查环境变量
  console.log('\n1. 检查环境变量...');

  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  let envConfigured = true;
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (!value || value.includes('your-') || value.includes('-here')) {
      console.log(`❌ ${envVar}: 未配置或使用默认值`);
      envConfigured = false;
    } else {
      console.log(`✅ ${envVar}: 已配置`);
    }
  });

  if (!envConfigured) {
    console.log('\n⚠️  请先在 .env.local 中配置Supabase环境变量');
    console.log('参考 SUPABASE_SETUP_GUIDE.md 获取详细说明');
    return;
  }

  // 2. 测试基本连接
  console.log('\n2. 测试数据库连接...');

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 测试连接
    const { data, error } = await supabase
      .from('customers')
      .select('count')
      .limit(1);

    if (error) {
      console.log(`❌ 连接失败: ${error.message}`);
      console.log('可能原因：');
      console.log('- URL或密钥错误');
      console.log('- 网络连接问题');
      console.log('- 数据库迁移未执行');
      return;
    }

    console.log('✅ 数据库连接成功');

    // 3. 检查必要的表
    console.log('\n3. 检查数据库表结构...');

    const tables = [
      'customers',
      'credits_history',
      'video_generations',
      'file_uploads',
      'user_video_preferences'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ 表 '${table}': ${error.message}`);
        } else {
          console.log(`✅ 表 '${table}': 存在`);
        }
      } catch (err) {
        console.log(`❌ 表 '${table}': 检查失败`);
      }
    }

    // 4. 检查用户数据
    console.log('\n4. 检查用户数据...');

    // 检查auth.users表
    const { data: users, error: usersError } = await supabase
      .from('auth.users')
      .select('id, email, created_at')
      .limit(5);

    if (usersError) {
      console.log(`❌ 无法访问用户表: ${usersError.message}`);
    } else {
      console.log(`✅ 用户表访问正常，共有 ${users.length} 个用户（显示前5个）`);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.id})`);
      });
    }

    // 检查customers表
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('user_id, email, credits')
      .limit(5);

    if (customersError) {
      console.log(`❌ 无法访问客户表: ${customersError.message}`);
    } else {
      console.log(`✅ 客户表访问正常，共有 ${customers.length} 个客户记录`);
      customers.forEach((customer, index) => {
        console.log(`   ${index + 1}. ${customer.email}: ${customer.credits} 积分`);
      });
    }

    // 5. 给出建议
    console.log('\n5. 建议操作...');

    if (users.length === 0) {
      console.log('📝 建议：');
      console.log('   1. 访问 http://localhost:3000/sign-up 注册一个测试账户');
      console.log('   2. 然后使用 add-credits.js 脚本为账户添加积分');
    } else if (customers.length === 0) {
      console.log('📝 建议：');
      console.log('   - 现有用户没有客户记录，请使用以下命令添加积分：');
      users.forEach(user => {
        console.log(`   node scripts/add-credits.js ${user.email} 100`);
      });
    } else {
      console.log('🎉 数据库配置看起来不错！');
      console.log('   - 你可以开始测试视频生成功能了');
      console.log('   - 访问 http://localhost:3000 体验完整功能');
    }

  } catch (error) {
    console.log(`❌ 检查过程中发生错误: ${error.message}`);
    console.log('详细错误:', error);
  }
}

checkDatabase();