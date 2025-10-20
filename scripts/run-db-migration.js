#!/usr/bin/env node

/**
 * 运行数据库迁移脚本
 * 修复表结构问题
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少必要的环境变量');
  console.error('需要: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🔧 开始数据库迁移...\n');

  try {
    // 读取迁移文件
    const migrationPath = 'supabase/migrations/20241231000003_simple_fix.sql';
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ 迁移文件不存在:', migrationPath);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 执行迁移文件:', migrationPath);
    console.log('📝 SQL长度:', migrationSQL.length, '字符\n');

    // 执行迁移
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL 
    });

    if (error) {
      console.error('❌ 迁移执行失败:', error.message);
      console.error('详细信息:', error);
      process.exit(1);
    }

    console.log('✅ 迁移执行成功！');
    
    if (data) {
      console.log('📊 执行结果:', data);
    }

    // 验证修复结果
    console.log('\n🔍 验证修复结果...');
    
    // 检查 video_generations 表结构
    const { data: videoGenCols, error: videoGenError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'video_generations')
      .in('column_name', ['video_url', 'credits_used', 'character_image_url']);

    if (!videoGenError && videoGenCols) {
      console.log('✅ video_generations 表列检查:');
      videoGenCols.forEach(col => {
        console.log(`   - ${col.column_name}`);
      });
    }

    // 检查 credits_history 表结构
    const { data: creditsHistCols, error: creditsHistError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'credits_history')
      .in('column_name', ['user_id', 'customer_id']);

    if (!creditsHistError && creditsHistCols) {
      console.log('✅ credits_history 表列检查:');
      creditsHistCols.forEach(col => {
        console.log(`   - ${col.column_name}`);
      });
    }

    // 检查 animations 表是否存在
    const { data: animationsTable, error: animationsError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'animations')
      .eq('table_schema', 'public');

    if (!animationsError && animationsTable && animationsTable.length > 0) {
      console.log('✅ animations 表已创建');
    }

    console.log('\n🎉 数据库迁移完成！');
    console.log('💡 现在可以重新测试API端点');

  } catch (error) {
    console.error('❌ 迁移过程中发生错误:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// 如果没有 exec_sql 函数，提供替代方案
async function checkExecSqlFunction() {
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1;' });
    return !error;
  } catch (error) {
    return false;
  }
}

async function main() {
  const hasExecSql = await checkExecSqlFunction();
  
  if (!hasExecSql) {
    console.log('⚠️  exec_sql 函数不可用');
    console.log('📋 请手动在Supabase Dashboard的SQL Editor中执行以下文件:');
    console.log('   supabase/migrations/20241231000002_fix_table_columns.sql');
    console.log('\n🔗 Supabase Dashboard: https://supabase.com/dashboard');
    return;
  }

  await runMigration();
}

main().catch(console.error);