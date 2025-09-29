#!/usr/bin/env node

/**
 * 管理员工具：为用户添加积分
 * 使用方法：node scripts/add-credits.js <email> <credits>
 * 示例：node scripts/add-credits.js user@example.com 100
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function addCredits(email, credits) {
  console.log('🔧 正在初始化Supabase客户端...');

  // 检查环境变量
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ 错误：缺少必要的环境变量');
    console.error('请确保 .env.local 文件中配置了：');
    console.error('- NEXT_PUBLIC_SUPABASE_URL');
    console.error('- SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-project-url-here') {
    console.error('❌ 错误：请先配置真实的Supabase URL');
    console.error('在 .env.local 中将 NEXT_PUBLIC_SUPABASE_URL 替换为你的项目URL');
    process.exit(1);
  }

  // 创建Supabase客户端（使用Service Role Key以绕过RLS）
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    console.log(`📧 正在查找用户: ${email}`);

    // 1. 查找用户
    const { data: users, error: userError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (userError || !users) {
      console.error(`❌ 未找到用户: ${email}`);
      console.error('请确保用户已注册，或检查邮箱地址是否正确');
      return;
    }

    console.log(`✅ 找到用户: ${users.email} (ID: ${users.id})`);

    // 2. 检查是否已有customer记录
    const { data: existingCustomer, error: customerCheckError } = await supabase
      .from('customers')
      .select('id, credits, user_id')
      .eq('user_id', users.id)
      .single();

    let customerId;
    let currentCredits = 0;

    if (existingCustomer) {
      customerId = existingCustomer.id;
      currentCredits = existingCustomer.credits || 0;
      console.log(`📊 当前积分: ${currentCredits}`);

      // 更新积分
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          credits: currentCredits + credits,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', users.id);

      if (updateError) {
        console.error('❌ 更新积分失败:', updateError.message);
        return;
      }
    } else {
      console.log('👤 创建新的customer记录...');

      // 创建新的customer记录
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert({
          user_id: users.id,
          email: users.email,
          credits: credits,
          creem_customer_id: `admin_${users.id}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {
            source: 'admin_script',
            created_by: 'add-credits-script'
          }
        })
        .select('id')
        .single();

      if (createError) {
        console.error('❌ 创建customer记录失败:', createError.message);
        return;
      }

      customerId = newCustomer.id;
    }

    // 3. 记录积分历史
    console.log('📝 记录积分历史...');
    const { error: historyError } = await supabase
      .from('credits_history')
      .insert({
        customer_id: customerId,
        amount: credits,
        type: 'add',
        description: `Admin credit addition via script`,
        created_at: new Date().toISOString(),
        metadata: {
          source: 'admin_script',
          admin_action: true,
          previous_credits: currentCredits,
          new_credits: currentCredits + credits
        }
      });

    if (historyError) {
      console.error('⚠️  积分已添加，但历史记录失败:', historyError.message);
    }

    // 4. 验证最终结果
    const { data: finalCustomer } = await supabase
      .from('customers')
      .select('credits')
      .eq('user_id', users.id)
      .single();

    console.log(`\n🎉 成功！`);
    console.log(`📧 用户: ${email}`);
    console.log(`💰 积分变化: ${currentCredits} → ${finalCustomer?.credits || 'unknown'}`);
    console.log(`➕ 添加积分: +${credits}`);

  } catch (error) {
    console.error('❌ 发生错误:', error.message);
    console.error('详细信息:', error);
  }
}

// 解析命令行参数
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log('📚 使用方法：');
  console.log('  node scripts/add-credits.js <email> <credits>');
  console.log('');
  console.log('📝 示例：');
  console.log('  node scripts/add-credits.js user@example.com 100');
  console.log('  node scripts/add-credits.js sarah@test.com 50');
  console.log('');
  console.log('⚠️  注意：');
  console.log('  - 请确保已正确配置 .env.local 中的Supabase环境变量');
  console.log('  - 需要SUPABASE_SERVICE_ROLE_KEY权限');
  console.log('  - 积分数量必须为正整数');
  process.exit(1);
}

const email = args[0];
const credits = parseInt(args[1]);

if (isNaN(credits) || credits <= 0) {
  console.error('❌ 错误：积分数量必须为正整数');
  process.exit(1);
}

if (!email.includes('@')) {
  console.error('❌ 错误：请提供有效的邮箱地址');
  process.exit(1);
}

console.log('💳 积分管理工具');
console.log('================');
console.log(`📧 目标用户: ${email}`);
console.log(`💰 添加积分: ${credits}`);
console.log('');

addCredits(email, credits);