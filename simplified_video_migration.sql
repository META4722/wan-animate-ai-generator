-- 简化版视频生成系统迁移
-- 执行前确保第一个迁移已成功完成

-- 主要视频生成表
CREATE TABLE public.video_generations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,

    generation_type text NOT NULL CHECK (generation_type IN ('text-to-video', 'image-to-video')),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    fal_request_id text,

    prompt text,
    aspect_ratio text NOT NULL DEFAULT '16:9' CHECK (aspect_ratio IN ('16:9', '9:16', '1:1')),
    resolution text NOT NULL DEFAULT '720p' CHECK (resolution IN ('480p', '720p', '1080p')),
    duration integer NOT NULL DEFAULT 5 CHECK (duration IN (5, 10)),

    output_video_url text,
    output_thumbnail_url text,
    output_metadata jsonb DEFAULT '{}'::jsonb,

    credits_cost integer NOT NULL DEFAULT 1,
    credits_deducted boolean DEFAULT false,

    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    error_message text,

    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 文件上传表
CREATE TABLE public.file_uploads (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    file_name text NOT NULL,
    file_type text NOT NULL CHECK (file_type IN ('image', 'audio', 'video')),
    file_size bigint NOT NULL,
    mime_type text NOT NULL,
    file_url text NOT NULL,

    is_deleted boolean DEFAULT false,

    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 用户偏好设置表
CREATE TABLE public.user_video_preferences (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    default_resolution text DEFAULT '720p' CHECK (default_resolution IN ('480p', '720p', '1080p')),
    default_duration integer DEFAULT 5 CHECK (default_duration IN (5, 10)),
    default_aspect_ratio text DEFAULT '16:9' CHECK (default_aspect_ratio IN ('16:9', '9:16', '1:1')),

    preferred_generation_mode text DEFAULT 'text-to-video' CHECK (preferred_generation_mode IN ('text-to-video', 'image-to-video')),

    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

    UNIQUE(user_id)
);

-- 创建索引
CREATE INDEX video_generations_user_id_idx ON public.video_generations(user_id);
CREATE INDEX video_generations_customer_id_idx ON public.video_generations(customer_id);
CREATE INDEX video_generations_status_idx ON public.video_generations(status);
CREATE INDEX video_generations_created_at_idx ON public.video_generations(created_at DESC);

CREATE INDEX file_uploads_user_id_idx ON public.file_uploads(user_id);
CREATE INDEX file_uploads_created_at_idx ON public.file_uploads(created_at DESC);

-- 创建触发器
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

-- 启用RLS
ALTER TABLE public.video_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_video_preferences ENABLE ROW LEVEL SECURITY;

-- 安全策略
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

CREATE POLICY "Users can view their own file uploads"
    ON public.file_uploads FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own file uploads"
    ON public.file_uploads FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all file uploads"
    ON public.file_uploads FOR ALL
    USING (auth.role() = 'service_role');

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

-- 授权
GRANT ALL ON public.video_generations TO service_role;
GRANT ALL ON public.file_uploads TO service_role;
GRANT ALL ON public.user_video_preferences TO service_role;

-- 成本计算函数
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

-- 自动创建用户偏好设置的函数
CREATE OR REPLACE FUNCTION public.create_default_video_preferences()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_video_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 为新用户自动创建偏好设置的触发器
CREATE TRIGGER on_user_created_video_preferences
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.create_default_video_preferences();

GRANT EXECUTE ON FUNCTION public.calculate_video_generation_cost(text, integer, text) TO service_role;

-- 成功提示
DO $$
BEGIN
    RAISE NOTICE '🎉 视频生成系统迁移完成！';
    RAISE NOTICE '创建了 video_generations, file_uploads, user_video_preferences 表';
    RAISE NOTICE '系统现在支持完整的视频生成功能';
END $$;