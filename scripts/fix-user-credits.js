#!/usr/bin/env node

/**
 * 修复用户积分问题
 * 确保所有用户都有10个初始积分
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少必要的环境变量');
  console.error('需要: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixUserCredits() {
  console.log('🔧 开始修复用户积分...\n');

  try {
    // 1. 检查当前状态
    console.log('1. 检查当前用户积分状态...');
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, user_id, email, credits')
      .order('created_at', { ascending: false });

    if (customersError) {
      console.error('❌ 查询客户数据失败:', customersError.message);
      return;
    }

    console.log(`📊 找到 ${customers.length} 个客户记录`);
    
    const lowCreditUsers = customers.filter(c => c.credits < 10);
    console.log(`⚠️  其中 ${lowCreditUsers.length} 个用户积分少于10个`);

    // 检查是否有用户没有customer记录
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ 查询认证用户失败:', authError.message);
      return;
    }

    const customerUserIds = new Set(customers.map(c => c.user_id));
    const usersWithoutCustomers = authUsers.users.filter(user => !customerUserIds.has(user.id));
    
    console.log(`⚠️  发现 ${usersWithoutCustomers.length} 个用户没有客户记录`);

    if (lowCreditUsers.length === 0 && usersWithoutCustomers.length === 0) {
      console.log('✅ 所有用户积分都正常，无需修复');
      return;
    }

    // 2. 为积分不足的用户补充积分
    console.log('\n2. 开始补充积分...');
    
    for (const customer of lowCreditUsers) {
      const creditsToAdd = 10 - customer.credits;
      
      console.log(`📧 处理用户: ${customer.email} (当前: ${customer.credits} 积分)`);
      
      // 更新客户积分
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          credits: 10,
          updated_at: new Date().toISOString(),
          metadata: {
            ...customer.metadata,
            credits_fixed: new Date().toISOString(),
            reason: 'initial_credits_fix'
          }
        })
        .eq('id', customer.id);

      if (updateError) {
        console.error(`❌ 更新用户 ${customer.email} 积分失败:`, updateError.message);
        continue;
      }

      // 添加积分历史记录
      const { error: historyError } = await supabase
        .from('credits_history')
        .insert({
          customer_id: customer.id,
          amount: creditsToAdd,
          type: 'add',
          description: `Initial credits fix: added ${creditsToAdd} credits to reach 10 total`,
          metadata: {
            source: 'credits_fix_script',
            original_credits: customer.credits,
            new_credits: 10,
            fixed_at: new Date().toISOString()
          }
        });

      if (historyError) {
        console.error(`❌ 添加积分历史失败:`, historyError.message);
      }

      console.log(`✅ ${customer.email}: ${customer.credits} → 10 积分 (+${creditsToAdd})`);
    }

    // 3. 为没有customer记录的用户创建记录
    console.log('\n3. 为缺少客户记录的用户创建记录...');
    
    if (usersWithoutCustomers.length > 0) {
      console.log(`⚠️  正在为 ${usersWithoutCustomers.length} 个用户创建客户记录...`);
      
      for (const user of usersWithoutCustomers) {
          console.log(`📧 为用户创建客户记录: ${user.email}`);
          
          // 创建客户记录
          const { data: newCustomer, error: createError } = await supabase
            .from('customers')
            .insert({
              user_id: user.id,
              email: user.email,
              credits: 10,
              creem_customer_id: `manual_${user.id}`,
              metadata: {
                source: 'manual_creation',
                initial_credits: 10,
                created_by: 'fix_script',
                created_at: new Date().toISOString()
              }
            })
            .select()
            .single();

          if (createError) {
            console.error(`❌ 创建客户记录失败:`, createError.message);
            continue;
          }

          // 添加积分历史记录
          await supabase
            .from('credits_history')
            .insert({
              customer_id: newCustomer.id,
              amount: 10,
              type: 'add',
              description: 'Welcome bonus - 10 credits for user registration',
              metadata: {
                source: 'welcome_bonus',
                user_registration: true,
                created_by: 'fix_script'
              }
            });

        console.log(`✅ ${user.email}: 新建客户记录，赠送10积分`);
      }
    } else {
      console.log('✅ 所有认证用户都有对应的客户记录');
    }

    // 4. 最终验证
    console.log('\n4. 最终验证...');
    const { data: finalCustomers } = await supabase
      .from('customers')
      .select('email, credits');

    const stillLowCredit = finalCustomers?.filter(c => c.credits < 10) || [];
    
    if (stillLowCredit.length === 0) {
      console.log('🎉 修复完成！所有用户现在都有至少10个积分');
    } else {
      console.log(`⚠️  仍有 ${stillLowCredit.length} 个用户积分不足10个`);
      stillLowCredit.forEach(customer => {
        console.log(`   ${customer.email}: ${customer.credits} 积分`);
      });
    }

    // 5. 更新触发器函数（确保新用户获得10积分）
    console.log('\n5. 更新触发器函数...');
    
    const triggerFunction = `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
          INSERT INTO public.customers (
              user_id,
              email,
              credits,
              creem_customer_id,
              created_at,
              updated_at,
              metadata
          ) VALUES (
              NEW.id,
              NEW.email,
              10,
              'auto_' || NEW.id::text,
              NOW(),
              NOW(),
              jsonb_build_object(
                  'source', 'auto_registration',
                  'initial_credits', 10,
                  'registration_date', NOW()
              )
          );

          INSERT INTO public.credits_history (
              customer_id,
              amount,
              type,
              description,
              created_at,
              metadata
          ) VALUES (
              (SELECT id FROM public.customers WHERE user_id = NEW.id),
              10,
              'add',
              'Welcome bonus - 10 credits for new user registration',
              NOW(),
              jsonb_build_object(
                  'source', 'welcome_bonus',
                  'user_registration', true
              )
          );

          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    const { error: functionError } = await supabase.rpc('exec_sql', { sql: triggerFunction });
    
    if (functionError) {
      console.log('⚠️  无法直接更新触发器函数，请手动运行迁移文件');
      console.log('   运行: supabase/migrations/20241230000003_fix_initial_credits.sql');
    } else {
      console.log('✅ 触发器函数已更新');
    }

    console.log('\n🎉 用户积分修复完成！');
    console.log('💡 建议: 运行 npm run test:credits 来验证修复结果');

  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error.message);
    console.error(error);
  }
}

// 运行修复
fixUserCredits().catch(console.error);