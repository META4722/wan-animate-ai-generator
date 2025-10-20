-- 简化的数据库修复脚本
-- 分步骤安全地添加缺失的列

-- 1. 首先检查并修复 credits_history 表
DO $$
BEGIN
    -- 检查表是否存在
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credits_history') THEN
        RAISE NOTICE 'credits_history table exists, checking columns...';
        
        -- 添加 customer_id 列（如果不存在）
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'credits_history' AND column_name = 'customer_id'
        ) THEN
            ALTER TABLE public.credits_history ADD COLUMN customer_id uuid;
            RAISE NOTICE 'Added customer_id column to credits_history';
        ELSE
            RAISE NOTICE 'customer_id column already exists in credits_history';
        END IF;

        -- 添加 user_id 列（如果不存在）
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'credits_history' AND column_name = 'user_id'
        ) THEN
            ALTER TABLE public.credits_history ADD COLUMN user_id uuid;
            RAISE NOTICE 'Added user_id column to credits_history';
        ELSE
            RAISE NOTICE 'user_id column already exists in credits_history';
        END IF;
    ELSE
        RAISE NOTICE 'credits_history table does not exist, skipping...';
    END IF;
END $$;

-- 2. 修复 video_generations 表
DO $$
BEGIN
    -- 检查表是否存在
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'video_generations') THEN
        RAISE NOTICE 'video_generations table exists, checking columns...';
        
        -- 添加 video_url 列
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'video_generations' AND column_name = 'video_url'
        ) THEN
            ALTER TABLE public.video_generations ADD COLUMN video_url text;
            RAISE NOTICE 'Added video_url column to video_generations';
        END IF;

        -- 添加 credits_used 列
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'video_generations' AND column_name = 'credits_used'
        ) THEN
            ALTER TABLE public.video_generations ADD COLUMN credits_used integer DEFAULT 0;
            RAISE NOTICE 'Added credits_used column to video_generations';
        END IF;

        -- 添加 character_image_url 列
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'video_generations' AND column_name = 'character_image_url'
        ) THEN
            ALTER TABLE public.video_generations ADD COLUMN character_image_url text;
            RAISE NOTICE 'Added character_image_url column to video_generations';
        END IF;

        -- 添加 generation_type 列
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'video_generations' AND column_name = 'generation_type'
        ) THEN
            ALTER TABLE public.video_generations ADD COLUMN generation_type text DEFAULT 'text-to-video';
            RAISE NOTICE 'Added generation_type column to video_generations';
        END IF;

        -- 添加 aspect_ratio 列
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'video_generations' AND column_name = 'aspect_ratio'
        ) THEN
            ALTER TABLE public.video_generations ADD COLUMN aspect_ratio text DEFAULT '16:9';
            RAISE NOTICE 'Added aspect_ratio column to video_generations';
        END IF;

        -- 添加 seed 列
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'video_generations' AND column_name = 'seed'
        ) THEN
            ALTER TABLE public.video_generations ADD COLUMN seed integer;
            RAISE NOTICE 'Added seed column to video_generations';
        END IF;

        -- 添加 actual_prompt 列
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'video_generations' AND column_name = 'actual_prompt'
        ) THEN
            ALTER TABLE public.video_generations ADD COLUMN actual_prompt text;
            RAISE NOTICE 'Added actual_prompt column to video_generations';
        END IF;

        -- 添加 completed_at 列
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'video_generations' AND column_name = 'completed_at'
        ) THEN
            ALTER TABLE public.video_generations ADD COLUMN completed_at timestamp with time zone;
            RAISE NOTICE 'Added completed_at column to video_generations';
        END IF;
    ELSE
        RAISE NOTICE 'video_generations table does not exist, skipping...';
    END IF;
END $$;

-- 3. 填充 credits_history 的 user_id（如果可能）
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credits_history' AND column_name = 'user_id'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credits_history' AND column_name = 'customer_id'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'customers'
    ) THEN
        UPDATE public.credits_history 
        SET user_id = c.user_id 
        FROM public.customers c 
        WHERE credits_history.customer_id = c.id 
        AND credits_history.user_id IS NULL;
        
        RAISE NOTICE 'Populated user_id from customers table';
    END IF;
END $$;

-- 成功提示
DO $$
BEGIN
    RAISE NOTICE '=== Database Fix Completed ===';
    RAISE NOTICE 'Fixed missing columns in video_generations and credits_history tables';
    RAISE NOTICE 'You can now test the API endpoints';
END $$;