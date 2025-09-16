-- Supabase数据库表结构
-- 用于存储AI生成的图片数据

-- 1. 生成图片主表
CREATE TABLE IF NOT EXISTS generated_images (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- 用户信息
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT,

    -- 图片信息
    image_url TEXT NOT NULL,
    image_filename TEXT,
    local_path TEXT,
    thumbnail_url TEXT,

    -- 生成参数
    prompt TEXT,
    enhanced_prompt TEXT,
    style TEXT DEFAULT 'Realistic',
    aspect_ratio TEXT DEFAULT '16:9',
    generation_type TEXT DEFAULT 'text', -- text, sketch, elevation, exterior, interior
    model_used TEXT DEFAULT 'flux-kontext-pro',

    -- 用户交互
    is_favorite BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    download_count BIGINT DEFAULT 0,
    view_count BIGINT DEFAULT 0,

    -- API和成本信息
    api_response JSONB,
    generation_cost DECIMAL(10,4) DEFAULT 0.0000,
    generation_time_ms INTEGER,

    -- 标签和分类
    tags TEXT[],
    category TEXT,

    -- 索引优化
    CONSTRAINT valid_generation_type CHECK (generation_type IN ('text', 'sketch', 'elevation', 'exterior', 'interior')),
    CONSTRAINT valid_aspect_ratio CHECK (aspect_ratio IN ('1:1', '4:3', '3:2', '16:9'))
);

-- 2. 用户收藏夹表
CREATE TABLE IF NOT EXISTS user_collections (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    image_count INTEGER DEFAULT 0,

    UNIQUE(user_id, name)
);

-- 3. 收藏夹图片关联表
CREATE TABLE IF NOT EXISTS collection_images (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    collection_id BIGINT REFERENCES user_collections(id) ON DELETE CASCADE,
    image_id BIGINT REFERENCES generated_images(id) ON DELETE CASCADE,

    UNIQUE(collection_id, image_id)
);

-- 4. 用户使用统计表
CREATE TABLE IF NOT EXISTS user_usage_stats (
    id BIGSERIAL PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    images_generated INTEGER DEFAULT 0,
    total_cost DECIMAL(10,4) DEFAULT 0.0000,
    api_calls INTEGER DEFAULT 0,

    UNIQUE(date, user_id)
);

-- 5. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_created_at ON generated_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_images_style ON generated_images(style);
CREATE INDEX IF NOT EXISTS idx_generated_images_type ON generated_images(generation_type);
CREATE INDEX IF NOT EXISTS idx_generated_images_favorite ON generated_images(is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_generated_images_public ON generated_images(is_public) WHERE is_public = TRUE;

CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_images_collection_id ON collection_images(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_images_image_id ON collection_images(image_id);

CREATE INDEX IF NOT EXISTS idx_user_usage_stats_user_date ON user_usage_stats(user_id, date DESC);

-- 6. 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_generated_images_updated_at
    BEFORE UPDATE ON generated_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_collections_updated_at
    BEFORE UPDATE ON user_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. 行级安全策略 (RLS)
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage_stats ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的图片或公开图片
CREATE POLICY "Users can view own images or public images" ON generated_images
    FOR SELECT USING (
        auth.uid() = user_id OR is_public = TRUE
    );

-- 用户只能插入自己的图片
CREATE POLICY "Users can insert own images" ON generated_images
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的图片
CREATE POLICY "Users can update own images" ON generated_images
    FOR UPDATE USING (auth.uid() = user_id);

-- 用户只能删除自己的图片
CREATE POLICY "Users can delete own images" ON generated_images
    FOR DELETE USING (auth.uid() = user_id);

-- 收藏夹策略
CREATE POLICY "Users can manage own collections" ON user_collections
    FOR ALL USING (auth.uid() = user_id);

-- 收藏夹图片关联策略
CREATE POLICY "Users can manage own collection images" ON collection_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_collections
            WHERE id = collection_id AND user_id = auth.uid()
        )
    );

-- 使用统计策略
CREATE POLICY "Users can view own usage stats" ON user_usage_stats
    FOR ALL USING (auth.uid() = user_id);

-- 8. 创建视图以便于查询
CREATE OR REPLACE VIEW user_image_stats AS
SELECT
    user_id,
    COUNT(*) as total_images,
    COUNT(*) FILTER (WHERE is_favorite = TRUE) as favorite_images,
    COUNT(*) FILTER (WHERE is_public = TRUE) as public_images,
    COUNT(DISTINCT style) as unique_styles_used,
    COUNT(DISTINCT generation_type) as unique_types_used,
    SUM(download_count) as total_downloads,
    SUM(view_count) as total_views,
    SUM(generation_cost) as total_cost,
    MAX(created_at) as last_generation_at
FROM generated_images
GROUP BY user_id;

-- 9. 创建函数以更新收藏夹图片数量
CREATE OR REPLACE FUNCTION update_collection_image_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE user_collections
        SET image_count = image_count + 1
        WHERE id = NEW.collection_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE user_collections
        SET image_count = image_count - 1
        WHERE id = OLD.collection_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_collection_count_trigger
    AFTER INSERT OR DELETE ON collection_images
    FOR EACH ROW EXECUTE FUNCTION update_collection_image_count();

-- 10. 示例数据插入函数
CREATE OR REPLACE FUNCTION insert_generated_image(
    p_user_id UUID,
    p_image_url TEXT,
    p_prompt TEXT,
    p_style TEXT DEFAULT 'Realistic',
    p_aspect_ratio TEXT DEFAULT '16:9',
    p_generation_type TEXT DEFAULT 'text'
)
RETURNS BIGINT AS $$
DECLARE
    new_image_id BIGINT;
BEGIN
    INSERT INTO generated_images (
        user_id, image_url, prompt, style, aspect_ratio, generation_type
    ) VALUES (
        p_user_id, p_image_url, p_prompt, p_style, p_aspect_ratio, p_generation_type
    ) RETURNING id INTO new_image_id;

    RETURN new_image_id;
END;
$$ LANGUAGE plpgsql;