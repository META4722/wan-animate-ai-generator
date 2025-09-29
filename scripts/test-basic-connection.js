#!/usr/bin/env node

/**
 * 测试基本Supabase连接
 * 使用 anon key 测试基础功能
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testBasicConnection() {
  console.log('🔍 测试基本Supabase连接');
  console.log('=======================');

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('❌ 缺少基本的Supabase配置');
    return;
  }

  console.log('✅ 基本配置存在，正在测试连接...');

  try {
    // 使用anon key创建客户端（模拟前端行为）
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log('\n📡 测试连接性...');

    // 测试基本的健康检查
    const { data, error } = await supabase
      .from('customers')
      .select('count')
      .limit(1);

    if (error) {
      if (error.message.includes('relation "customers" does not exist')) {
        console.log('❌ 数据库表不存在');
        console.log('   需要运行数据库迁移脚本');
        console.log('   请查看 QUICK_START_DATABASE.md 获取详细说明');
      } else {
        console.log(`❌ 连接错误: ${error.message}`);
      }
      return;
    }

    console.log('✅ 基本连接测试成功！');

    // 测试认证功能
    console.log('\n🔐 测试认证系统...');

    // 检查当前用户状态
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.log('⚠️  认证检查失败（这是正常的，因为没有登录）');
    } else {
      console.log('✅ 认证系统正常工作');
    }

    console.log('\n🎉 基本设置看起来不错！');
    console.log('\n下一步：');
    console.log('1. 访问你的Supabase项目Dashboard');
    console.log('2. 进入 Settings > API 获取 service_role key');
    console.log('3. 将 service_role key 添加到 .env.local');
    console.log('4. 运行数据库迁移（如果还没有运行）');
    console.log('5. 注册一个测试用户并添加积分');

  } catch (error) {
    console.log(`❌ 测试过程中发生错误: ${error.message}`);

    if (error.message.includes('fetch')) {
      console.log('可能的原因：');
      console.log('- 网络连接问题');
      console.log('- URL格式错误');
      console.log('- 防火墙阻止连接');
    }
  }
}

testBasicConnection();