#!/usr/bin/env node

/**
 * 将已有的登录用户迁移到customers表
 * 为每个现有用户创建customer记录并赠送初始积分
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function migrateExistingUsers() {
  console.log('🔄 迁移已有用户到customers表');
  console.log('=============================');

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

    // 1. 获取所有已注册用户
    console.log('\n📋 获取所有注册用户...');
    const { data: authUsers, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.log(`❌ 获取用户列表失败: ${usersError.message}`);
      return;
    }

    console.log(`找到 ${authUsers.users.length} 个注册用户`);

    if (authUsers.users.length === 0) {
      console.log('📝 暂无注册用户，无需迁移');
      return;
    }

    // 2. 获取已有的customer记录
    console.log('\n🔍 检查现有customer记录...');
    const { data: existingCustomers, error: customersError } = await supabase
      .from('customers')
      .select('user_id');

    if (customersError) {
      console.log(`❌ 获取customers失败: ${customersError.message}`);
      return;
    }

    const existingUserIds = new Set(existingCustomers.map(c => c.user_id));
    console.log(`已有 ${existingCustomers.length} 个customer记录`);

    // 3. 找出需要迁移的用户
    const usersToMigrate = authUsers.users.filter(user => !existingUserIds.has(user.id));
    console.log(`需要迁移 ${usersToMigrate.length} 个用户`);

    if (usersToMigrate.length === 0) {
      console.log('✅ 所有用户都已在customers表中，无需迁移');
      return;
    }

    // 4. 开始迁移过程
    console.log('\n🚀 开始迁移用户...');
    let successCount = 0;
    let errorCount = 0;

    for (const user of usersToMigrate) {
      try {
        console.log(`\n📧 迁移用户: ${user.email}`);

        // 创建customer记录
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .insert({
            user_id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            credits: 10, // 给现有用户10个积分作为欢迎奖励
            creem_customer_id: `migrated_${user.id}`,
            metadata: {
              source: 'manual_migration',
              migration_date: new Date().toISOString(),
              initial_credits: 10,
              migrated_from: 'existing_auth_user'
            }
          })
          .select()
          .single();

        if (customerError) {
          console.log(`   ❌ 创建customer失败: ${customerError.message}`);
          errorCount++;
          continue;
        }

        // 记录积分历史
        const { error: historyError } = await supabase
          .from('credits_history')
          .insert({
            customer_id: customer.id,
            amount: 10,
            type: 'add',
            description: 'Migration welcome bonus for existing user',
            metadata: {
              source: 'migration_bonus',
              migration_date: new Date().toISOString()
            }
          });

        if (historyError) {
          console.log(`   ⚠️  积分历史记录失败: ${historyError.message}`);
        }

        // 创建默认视频偏好设置
        const { error: preferencesError } = await supabase
          .from('user_video_preferences')
          .insert({
            user_id: user.id
          });

        if (preferencesError) {
          console.log(`   ⚠️  创建偏好设置失败: ${preferencesError.message}`);
        }

        console.log(`   ✅ 成功迁移，赠送10积分`);
        successCount++;

      } catch (error) {
        console.log(`   ❌ 迁移失败: ${error.message}`);
        errorCount++;
      }
    }

    // 5. 迁移总结
    console.log('\n📊 迁移总结:');
    console.log(`✅ 成功迁移: ${successCount} 个用户`);
    console.log(`❌ 失败: ${errorCount} 个用户`);

    if (successCount > 0) {
      console.log('\n🎉 迁移完成！现在所有用户都可以使用视频生成功能了');

      // 显示最终状态
      console.log('\n👥 最终用户状态:');
      const { data: finalCustomers, error: finalError } = await supabase
        .from('customers')
        .select('user_id, email, credits, created_at');

      if (!finalError) {
        finalCustomers.forEach(customer => {
          const user = authUsers.users.find(u => u.id === customer.user_id);
          const status = existingUserIds.has(customer.user_id) ? '(原有)' : '(新迁移)';
          console.log(`📧 ${customer.email}: ${customer.credits} 积分 ${status}`);
        });
      }
    }

  } catch (error) {
    console.log(`❌ 迁移过程中发生错误: ${error.message}`);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  migrateExistingUsers();
}

module.exports = { migrateExistingUsers };