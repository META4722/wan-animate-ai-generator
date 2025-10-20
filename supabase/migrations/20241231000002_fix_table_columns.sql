-- 修复数据库表结构问题
-- 添加缺失的列和修复现有表结构

-- 1. 修复 video_generations 表
DO $$
BEGIN
    -- 添加 video_url 列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'video_generations' AND column_name = 'video_url'
    ) THEN
        ALTER TABLE public.video_generations ADD COLUMN video_url text;
        RAISE NOTICE 'Added video_url column to video_generations table';
    END IF;

    -- 添加 credits_used 列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'video_generations' AND column_name = 'credits_used'
    ) THEN
        ALTER TABLE public.video_generations ADD COLUMN credits_used integer DEFAULT 0;
        RAISE NOTICE 'Added credits_used column to video_generations table';
    END IF;

    -- 添加 character_image_url 列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'video_generations' AND column_name = 'character_image_url'
    ) THEN
        ALTER TABLE public.video_generations ADD COLUMN character_image_url text;
        RAISE NOTICE 'Added character_image_url column to video_generations table';
    END IF;

    -- 添加 seed 列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'video_generations' AND column_name = 'seed'
    ) THEN
        ALTER TABLE public.video_generations ADD COLUMN seed integer;
        RAISE NOTICE 'Added seed column to video_generations table';
    END IF;

    -- 添加 actual_prompt 列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'video_generations' AND column_name = 'actual_prompt'
    ) THEN
        ALTER TABLE public.video_generations ADD COLUMN actual_prompt text;
        RAISE NOTICE 'Added actual_prompt column to video_generations table';
    END IF;

    -- 添加 completed_at 列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'video_generations' AND column_name = 'completed_at'
    ) THEN
        ALTER TABLE public.video_generations ADD COLUMN completed_at timestamp with time zone;
        RAISE NOTICE 'Added completed_at column to video_generations table';
    END IF;

    -- 添加 aspect_ratio 列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'video_generations' AND column_name = 'aspect_ratio'
    ) THEN
        ALTER TABLE public.video_generations ADD COLUMN aspect_ratio text DEFAULT '16:9';
        RAISE NOTICE 'Added aspect_ratio column to video_generations table';
    END IF;

    -- 添加 generation_type 列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'video_generations' AND column_name = 'generation_type'
    ) THEN
        ALTER TABLE public.video_generations ADD COLUMN generation_type text DEFAULT 'text-to-video';
        RAISE NOTICE 'Added generation_type column to video_generations table';
    END IF;
END $$;

-- 2. 修复 credits_history 表
DO $$
BEGIN
    -- 首先确保 customer_id 列存在
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credits_history' AND column_name = 'customer_id'
    ) THEN
        ALTER TABLE public.credits_history ADD COLUMN customer_id uuid;
        RAISE NOTICE 'Added customer_id column to credits_history table';
        
        -- 添加外键约束（如果customers表存在）
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
            ALTER TABLE public.credits_history ADD CONSTRAINT fk_credits_history_customer_id 
            FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added foreign key constraint for customer_id';
        END IF;
    END IF;

    -- 检查 credits_history 表是否存在 user_id 列
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credits_history' AND column_name = 'user_id'
    ) THEN
        -- 如果没有 user_id 列，添加它
        ALTER TABLE public.credits_history ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added user_id column to credits_history table';
        
        -- 尝试从 customer_id 填充 user_id（如果可能）
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
            UPDATE public.credits_history 
            SET user_id = c.user_id 
            FROM public.customers c 
            WHERE credits_history.customer_id = c.id 
            AND credits_history.user_id IS NULL;
            
            RAISE NOTICE 'Populated user_id from customers table';
        END IF;
    END IF;
END $$;

-- 3. 创建 animations 表（如果不存在）
CREATE TABLE IF NOT EXISTS public.animations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
    prompt text NOT NULL,
    video_url text,
    character_image_url text,
    seed integer,
    actual_prompt text,
    aspect_ratio text DEFAULT '16:9',
    resolution text DEFAULT '1080p',
    duration integer DEFAULT 5,
    generation_type text DEFAULT 'text-to-video',
    status text DEFAULT 'pending',
    credits_used integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 创建 animations 表的索引
CREATE INDEX IF NOT EXISTS animations_user_id_idx ON public.animations(user_id);
CREATE INDEX IF NOT EXISTS animations_customer_id_idx ON public.animations(customer_id);
CREATE INDEX IF NOT EXISTS animations_status_idx ON public.animations(status);
CREATE INDEX IF NOT EXISTS animations_created_at_idx ON public.animations(created_at);

-- 启用 RLS
ALTER TABLE public.animations ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
DROP POLICY IF EXISTS "Users can view their own animations" ON public.animations;
CREATE POLICY "Users can view their own animations"
    ON public.animations FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own animations" ON public.animations;
CREATE POLICY "Users can insert their own animations"
    ON public.animations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own animations" ON public.animations;
CREATE POLICY "Users can update their own animations"
    ON public.animations FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage animations" ON public.animations;
CREATE POLICY "Service role can manage animations"
    ON public.animations FOR ALL
    USING (auth.role() = 'service_role');

-- 为 animations 表创建 updated_at 触发器
DROP TRIGGER IF EXISTS handle_animations_updated_at ON public.animations;
CREATE TRIGGER handle_animations_updated_at
    BEFORE UPDATE ON public.animations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. 创建索引（如果不存在）
DO $$
BEGIN
    -- 只有当列存在时才创建索引
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credits_history' AND column_name = 'user_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS credits_history_user_id_idx ON public.credits_history(user_id);
        RAISE NOTICE 'Created index on credits_history.user_id';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credits_history' AND column_name = 'customer_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS credits_history_customer_id_idx ON public.credits_history(customer_id);
        RAISE NOTICE 'Created index on credits_history.customer_id';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credits_history' AND column_name = 'type'
    ) THEN
        CREATE INDEX IF NOT EXISTS credits_history_type_idx ON public.credits_history(type);
        RAISE NOTICE 'Created index on credits_history.type';
    END IF;
END $$;

-- 5. 更新 RLS 策略
DO $$
BEGIN
    -- 只有当 user_id 列存在时才创建基于 user_id 的策略
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credits_history' AND column_name = 'user_id'
    ) THEN
        DROP POLICY IF EXISTS "Users can view their own credits history via user_id" ON public.credits_history;
        CREATE POLICY "Users can view their own credits history via user_id"
            ON public.credits_history FOR SELECT
            USING (auth.uid() = user_id);
        RAISE NOTICE 'Created RLS policy for credits_history.user_id';
    END IF;
END $$;

-- 成功提示
DO $$
BEGIN
    RAISE NOTICE 'Database table structure fixes completed successfully!';
    RAISE NOTICE 'Fixed tables: video_generations, credits_history, animations';
    RAISE NOTICE 'Added missing columns and created proper indexes';
    RAISE NOTICE 'All RLS policies have been updated';
END $$;