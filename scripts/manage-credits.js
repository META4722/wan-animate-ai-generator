#!/usr/bin/env node

/**
 * 用户积分管理脚本
 * 需要配置 SUPABASE_SERVICE_ROLE_KEY
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function manageCredits() {
  console.log('💳 用户积分管理系统');
  console.log('==================');

  // 检查必要的环境变量
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('❌ 缺少必要的环境变量:');
    console.log('   NEXT_PUBLIC_SUPABASE_URL');
    console.log('   SUPABASE_SERVICE_ROLE_KEY');
    console.log('\n请在 .env.local 中配置这些变量');
    return;
  }

  try {
    // 使用service_role key创建管理员客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { autoRefreshToken: false, persistSession: false }
      }
    );

    console.log('✅ 管理员连接成功');

    // 查看所有用户
    console.log('\n👥 查看现有用户:');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.log(`❌ 获取用户列表失败: ${usersError.message}`);
      return;
    }

    if (users.users.length === 0) {
      console.log('📝 暂无注册用户');
      console.log('\n建议操作:');
      console.log('1. 启动开发服务器: npm run dev');
      console.log('2. 访问 http://localhost:3000');
      console.log('3. 注册一个测试账户');
      console.log('4. 再次运行此脚本来添加积分');
      return;
    }

    console.log(`找到 ${users.users.length} 个用户:`);
    users.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (ID: ${user.id})`);
    });

    // 查看每个用户的积分情况
    console.log('\n💰 用户积分情况:');
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*');

    if (customersError) {
      console.log(`❌ 获取客户数据失败: ${customersError.message}`);
      return;
    }

    if (customers.length === 0) {
      console.log('📝 暂无客户记录（用户需要先登录一次来创建记录）');
    } else {
      customers.forEach(customer => {
        const user = users.users.find(u => u.id === customer.user_id);
        console.log(`📧 ${user?.email || 'Unknown'}: ${customer.credits} 积分`);
      });
    }

    // 提供实用功能
    console.log('\n🛠️  可用操作:');
    console.log('1. 运行 node scripts/migrate-existing-users.js - 迁移已有用户到customers表');
    console.log('2. 手动添加积分 - 使用下面的addCreditsToUser函数');

    // 实际的添加积分函数
    async function addCreditsToUser(userEmail, creditsToAdd) {
      try {
        // 找到用户
        const { data: user } = await supabase.auth.admin.listUsers();
        const targetUser = user.users.find(u => u.email === userEmail);

        if (!targetUser) {
          console.log(`❌ 用户 ${userEmail} 不存在`);
          return false;
        }

        // 获取customer记录
        const { data: customer } = await supabase
          .from('customers')
          .select('id, credits')
          .eq('user_id', targetUser.id)
          .single();

        if (!customer) {
          console.log(`❌ 用户 ${userEmail} 没有customer记录，请先运行迁移脚本`);
          return false;
        }

        // 更新积分
        const { error: updateError } = await supabase
          .from('customers')
          .update({
            credits: customer.credits + creditsToAdd
          })
          .eq('user_id', targetUser.id);

        if (updateError) {
          console.log(`❌ 更新积分失败: ${updateError.message}`);
          return false;
        }

        // 记录积分历史
        const { error: historyError } = await supabase
          .from('credits_history')
          .insert({
            customer_id: customer.id,
            amount: creditsToAdd,
            type: 'add',
            description: '管理员手动添加积分'
          });

        if (historyError) {
          console.log(`⚠️  积分历史记录失败: ${historyError.message}`);
        }

        console.log(`✅ 成功为 ${userEmail} 添加 ${creditsToAdd} 积分`);
        console.log(`   当前积分: ${customer.credits} → ${customer.credits + creditsToAdd}`);
        return true;

      } catch (error) {
        console.log(`❌ 添加积分时发生错误: ${error.message}`);
        return false;
      }
    }

    // 如果有用户，提供快速添加积分的示例
    if (users.users.length > 0) {
      console.log('\n💡 快速添加积分示例:');
      const firstUser = users.users[0];
      console.log(`// 为 ${firstUser.email} 添加 10 积分:`);
      console.log(`// await addCreditsToUser('${firstUser.email}', 10);`);
    }

  } catch (error) {
    console.log(`❌ 发生错误: ${error.message}`);
  }
}

manageCredits();