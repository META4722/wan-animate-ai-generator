-- 完整数据库迁移脚本
-- 适用于全新的Supabase数据库
-- 一次性创建所有必要的表和功能

-- =====================================================
-- 第一部分：基础用户和积分系统
-- =====================================================

-- 创建customers表（客户信息和积分）
CREATE TABLE public.customers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    creem_customer_id text NOT NULL UNIQUE,
    email text NOT NULL,
    name text,
    country text,
    credits integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT customers_email_match CHECK (email = lower(email)),
    CONSTRAINT credits_non_negative CHECK (credits >= 0)
);

-- 创建积分历史表
CREATE TABLE public.credits_history (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    amount integer NOT NULL,
    type text NOT NULL CHECK (type IN ('add', 'subtract')),
    description text,
    creem_order_id text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb
);

-- 创建订阅表
CREATE TABLE public.subscriptions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    creem_subscription_id text NOT NULL UNIQUE,
    creem_product_id text NOT NULL,
    status text NOT NULL CHECK (status IN ('incomplete', 'expired', 'active', 'past_due', 'canceled', 'unpaid', 'paused', 'trialing')),
    current_period_start timestamp with time zone NOT NULL,
    current_period_end timestamp with time zone NOT NULL,
    canceled_at timestamp with time zone,
    trial_end timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 第二部分：视频生成系统
-- =====================================================

-- 创建视频生成任务表
CREATE TABLE public.video_generations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,

    -- 生成类型和状态
    generation_type text NOT NULL CHECK (generation_type IN ('text-to-video', 'image-to-video')),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    fal_request_id text, -- Fal.ai请求ID

    -- 输入参数
    prompt text, -- 文本提示词
    aspect_ratio text NOT NULL DEFAULT '16:9' CHECK (aspect_ratio IN ('16:9', '9:16', '1:1')),
    resolution text NOT NULL DEFAULT '720p' CHECK (resolution IN ('480p', '720p', '1080p')),
    duration integer NOT NULL DEFAULT 5 CHECK (duration IN (5, 10)),
    expand_prompt boolean DEFAULT true,
    first_frame_image_url text, -- 图片转视频的首帧图片

    -- 音频设置
    enable_audio boolean DEFAULT true,
    audio_url text, -- 自定义音频文件URL

    -- 高级设置
    motion_scale integer DEFAULT 127 CHECK (motion_scale >= 0 AND motion_scale <= 255),
    enable_camera_motion boolean DEFAULT true,

    -- 输出结果
    output_video_url text, -- 生成的视频URL
    output_thumbnail_url text, -- 视频缩略图URL
    output_metadata jsonb DEFAULT '{}'::jsonb, -- Fal.ai返回的元数据

    -- 计费信息
    credits_cost integer NOT NULL DEFAULT 1,
    credits_deducted boolean DEFAULT false,

    -- 处理信息
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    error_message text,
    processing_logs jsonb DEFAULT '[]'::jsonb,

    -- 时间戳
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 创建文件上传表
CREATE TABLE public.file_uploads (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- 文件信息
    file_name text NOT NULL,
    file_type text NOT NULL CHECK (file_type IN ('image', 'audio', 'video')),
    file_size bigint NOT NULL, -- 文件大小（字节）
    mime_type text NOT NULL,
    file_url text NOT NULL, -- 存储URL
    storage_path text, -- 内部存储路径

    -- 文件元数据
    dimensions jsonb, -- 图片/视频尺寸
    duration_seconds numeric, -- 音频/视频时长
    file_hash text, -- 文件哈希（去重用）

    -- 使用跟踪
    used_in_generations uuid[], -- 使用此文件的生成任务ID数组
    is_deleted boolean DEFAULT false,

    -- 时间戳
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 创建用户视频偏好设置表
CREATE TABLE public.user_video_preferences (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- 默认设置
    default_resolution text DEFAULT '720p' CHECK (default_resolution IN ('480p', '720p', '1080p')),
    default_duration integer DEFAULT 5 CHECK (default_duration IN (5, 10)),
    default_aspect_ratio text DEFAULT '16:9' CHECK (default_aspect_ratio IN ('16:9', '9:16', '1:1')),
    default_enable_audio boolean DEFAULT true,
    default_expand_prompt boolean DEFAULT true,
    default_motion_scale integer DEFAULT 127,
    default_enable_camera_motion boolean DEFAULT true,

    -- UI偏好
    preferred_generation_mode text DEFAULT 'text-to-video' CHECK (preferred_generation_mode IN ('text-to-video', 'image-to-video')),
    show_advanced_settings boolean DEFAULT false,
    auto_save_generations boolean DEFAULT true,

    -- 通知偏好
    email_on_completion boolean DEFAULT true,
    email_on_failure boolean DEFAULT true,

    -- 时间戳
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

    UNIQUE(user_id)
);

-- =====================================================
-- 第三部分：索引优化
-- =====================================================

-- 基础表索引
CREATE INDEX customers_user_id_idx ON public.customers(user_id);
CREATE INDEX customers_creem_customer_id_idx ON public.customers(creem_customer_id);
CREATE INDEX credits_history_customer_id_idx ON public.credits_history(customer_id);
CREATE INDEX credits_history_created_at_idx ON public.credits_history(created_at);
CREATE INDEX subscriptions_customer_id_idx ON public.subscriptions(customer_id);
CREATE INDEX subscriptions_status_idx ON public.subscriptions(status);

-- 视频生成表索引
CREATE INDEX video_generations_user_id_idx ON public.video_generations(user_id);
CREATE INDEX video_generations_customer_id_idx ON public.video_generations(customer_id);
CREATE INDEX video_generations_status_idx ON public.video_generations(status);
CREATE INDEX video_generations_type_idx ON public.video_generations(generation_type);
CREATE INDEX video_generations_created_at_idx ON public.video_generations(created_at DESC);
CREATE INDEX video_generations_fal_request_id_idx ON public.video_generations(fal_request_id) WHERE fal_request_id IS NOT NULL;

-- 文件上传表索引
CREATE INDEX file_uploads_user_id_idx ON public.file_uploads(user_id);
CREATE INDEX file_uploads_file_type_idx ON public.file_uploads(file_type);
CREATE INDEX file_uploads_created_at_idx ON public.file_uploads(created_at DESC);
CREATE INDEX file_uploads_active_idx ON public.file_uploads(user_id, created_at DESC) WHERE is_deleted = false;

-- =====================================================
-- 第四部分：触发器和函数
-- =====================================================

-- 创建updated_at触发器函数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 为所有需要的表创建updated_at触发器
CREATE TRIGGER handle_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_video_generations_updated_at
    BEFORE UPDATE ON public.video_generations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_file_uploads_updated_at
    BEFORE UPDATE ON public.file_uploads
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_user_video_preferences_updated_at
    BEFORE UPDATE ON public.user_video_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 第五部分：行级安全策略 (RLS)
-- =====================================================

-- 启用RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_video_preferences ENABLE ROW LEVEL SECURITY;

-- 客户表策略
CREATE POLICY "Users can view their own customer data"
    ON public.customers FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer data"
    ON public.customers FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage customer data"
    ON public.customers FOR ALL
    USING (auth.role() = 'service_role');

-- 积分历史策略
CREATE POLICY "Users can view their own credits history"
    ON public.credits_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.customers
            WHERE customers.id = credits_history.customer_id
            AND customers.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage credits history"
    ON public.credits_history FOR ALL
    USING (auth.role() = 'service_role');

-- 订阅策略
CREATE POLICY "Users can view their own subscriptions"
    ON public.subscriptions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.customers
            WHERE customers.id = subscriptions.customer_id
            AND customers.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage subscriptions"
    ON public.subscriptions FOR ALL
    USING (auth.role() = 'service_role');

-- 视频生成策略
CREATE POLICY "Users can view their own video generations"
    ON public.video_generations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video generations"
    ON public.video_generations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video generations"
    ON public.video_generations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all video generations"
    ON public.video_generations FOR ALL
    USING (auth.role() = 'service_role');

-- 文件上传策略
CREATE POLICY "Users can view their own file uploads"
    ON public.file_uploads FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own file uploads"
    ON public.file_uploads FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own file uploads"
    ON public.file_uploads FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own file uploads"
    ON public.file_uploads FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all file uploads"
    ON public.file_uploads FOR ALL
    USING (auth.role() = 'service_role');

-- 用户偏好策略
CREATE POLICY "Users can view their own video preferences"
    ON public.user_video_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video preferences"
    ON public.user_video_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video preferences"
    ON public.user_video_preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all video preferences"
    ON public.user_video_preferences FOR ALL
    USING (auth.role() = 'service_role');

-- =====================================================
-- 第六部分：权限授予
-- =====================================================

-- 授予service_role所有表的权限
GRANT ALL ON public.customers TO service_role;
GRANT ALL ON public.credits_history TO service_role;
GRANT ALL ON public.subscriptions TO service_role;
GRANT ALL ON public.video_generations TO service_role;
GRANT ALL ON public.file_uploads TO service_role;
GRANT ALL ON public.user_video_preferences TO service_role;

-- =====================================================
-- 第七部分：实用函数
-- =====================================================

-- 视频生成成本计算函数
CREATE OR REPLACE FUNCTION public.calculate_video_generation_cost(
    resolution text,
    duration integer,
    generation_type text DEFAULT 'text-to-video'
)
RETURNS integer AS $$
BEGIN
    -- 根据分辨率计算积分：480p=5, 720p=10, 1080p=15
    RETURN CASE resolution
        WHEN '480p' THEN 5
        WHEN '720p' THEN 10
        WHEN '1080p' THEN 15
        ELSE 10 -- 默认值
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 为新用户自动创建客户记录的函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- 为新注册用户自动创建customer记录
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
        10, -- 新用户赠送10积分
        'auto_' || NEW.id::text,
        NOW(),
        NOW(),
        jsonb_build_object(
            'source', 'auto_registration',
            'initial_credits', 10,
            'registration_date', NOW()
        )
    );

    -- 记录初始积分赠送历史
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

    -- 为新用户创建默认视频偏好设置
    INSERT INTO public.user_video_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建新用户自动触发器
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 授予函数执行权限
GRANT EXECUTE ON FUNCTION public.calculate_video_generation_cost(text, integer, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- =====================================================
-- 完成提示
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 完整数据库迁移成功完成！';
    RAISE NOTICE '✅ 创建了所有必要的表和功能';
    RAISE NOTICE '✅ 配置了行级安全策略';
    RAISE NOTICE '✅ 设置了自动触发器';
    RAISE NOTICE '✅ 新用户注册将自动获得3个积分';
    RAISE NOTICE '🚀 系统已准备就绪，可以开始使用！';
END $$;