-- 扩展的Supabase数据库表结构
-- 包含Credits、订阅管理和Webhook事件处理

-- 首先执行基础schema (supabase-schema.sql)，然后执行此文件

-- 5. 用户积分表
CREATE TABLE IF NOT EXISTS user_credits (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(10,2) DEFAULT 0.00,
    total_purchased DECIMAL(10,2) DEFAULT 0.00,
    total_used DECIMAL(10,2) DEFAULT 0.00,
    last_purchase_at TIMESTAMPTZ,

    CONSTRAINT positive_balance CHECK (balance >= 0),
    CONSTRAINT valid_totals CHECK (total_purchased >= 0 AND total_used >= 0)
);

-- 6. 积分交易记录表
CREATE TABLE IF NOT EXISTS credit_transactions (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    reference_id TEXT, -- 支付ID或相关引用
    metadata JSONB,

    CONSTRAINT valid_transaction_type CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'bonus')),
    CONSTRAINT non_zero_amount CHECK (amount != 0)
);

-- 7. 订阅计划表
CREATE TABLE IF NOT EXISTS subscription_plans (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    name TEXT NOT NULL,
    description TEXT,
    price_per_month DECIMAL(10,2) NOT NULL,
    credits_per_month INTEGER NOT NULL,
    features JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,

    CONSTRAINT positive_price CHECK (price_per_month >= 0),
    CONSTRAINT positive_credits CHECK (credits_per_month >= 0)
);

-- 8. 用户订阅表
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id TEXT REFERENCES subscription_plans(id),
    plan_name TEXT NOT NULL,
    status TEXT DEFAULT 'active',

    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,

    credits_per_month INTEGER NOT NULL,
    price_per_month DECIMAL(10,2) NOT NULL,

    external_subscription_id TEXT UNIQUE, -- Creem/Stripe订阅ID
    trial_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,

    CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'canceled', 'past_due', 'trialing')),
    CONSTRAINT valid_period CHECK (current_period_end > current_period_start),
    CONSTRAINT positive_values CHECK (credits_per_month >= 0 AND price_per_month >= 0)
);

-- 9. Webhook事件表
CREATE TABLE IF NOT EXISTS webhook_events (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    event_type TEXT NOT NULL,
    source TEXT NOT NULL,
    event_data JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    CONSTRAINT valid_source CHECK (source IN ('creem', 'stripe', 'internal')),
    CONSTRAINT valid_retry_count CHECK (retry_count >= 0)
);

-- 10. 支付记录表
CREATE TABLE IF NOT EXISTS payment_records (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    external_payment_id TEXT UNIQUE NOT NULL, -- Creem/Stripe支付ID
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL,
    payment_method TEXT,
    credits_purchased INTEGER,
    subscription_id BIGINT REFERENCES user_subscriptions(id),
    metadata JSONB,

    CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    CONSTRAINT positive_amount CHECK (amount > 0)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_external_id ON user_subscriptions(external_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period_end ON user_subscriptions(current_period_end);

CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed) WHERE processed = FALSE;
CREATE INDEX IF NOT EXISTS idx_webhook_events_source ON webhook_events(source);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_user_id ON webhook_events(user_id);

CREATE INDEX IF NOT EXISTS idx_payment_records_user_id ON payment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_external_id ON payment_records(external_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON payment_records(status);

-- 创建更新时间触发器
CREATE TRIGGER update_user_credits_updated_at
    BEFORE UPDATE ON user_credits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 行级安全策略 (RLS)
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

-- 用户积分策略
CREATE POLICY "Users can view own credits" ON user_credits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON user_credits
    FOR UPDATE USING (auth.uid() = user_id);

-- 交易记录策略
CREATE POLICY "Users can view own transactions" ON credit_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- 订阅计划策略（所有人可查看）
CREATE POLICY "Anyone can view active plans" ON subscription_plans
    FOR SELECT USING (is_active = TRUE);

-- 用户订阅策略
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Webhook事件策略（仅管理员）
CREATE POLICY "Service role can manage webhook events" ON webhook_events
    FOR ALL USING (auth.role() = 'service_role');

-- 支付记录策略
CREATE POLICY "Users can view own payments" ON payment_records
    FOR SELECT USING (auth.uid() = user_id);

-- 创建积分相关的RPC函数
CREATE OR REPLACE FUNCTION use_credits(
    p_user_id UUID,
    p_amount DECIMAL,
    p_description TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    current_balance DECIMAL;
    new_balance DECIMAL;
BEGIN
    -- 获取当前余额
    SELECT balance INTO current_balance
    FROM user_credits
    WHERE user_id = p_user_id;

    -- 检查余额是否足够
    IF current_balance IS NULL OR current_balance < p_amount THEN
        RETURN FALSE;
    END IF;

    -- 计算新余额
    new_balance := current_balance - p_amount;

    -- 更新用户积分
    UPDATE user_credits
    SET balance = new_balance,
        total_used = total_used + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- 记录交易
    INSERT INTO credit_transactions (user_id, transaction_type, amount, balance_after, description)
    VALUES (p_user_id, 'usage', -p_amount, new_balance, p_description);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION add_credits(
    p_user_id UUID,
    p_amount DECIMAL,
    p_description TEXT,
    p_reference_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_balance DECIMAL;
    new_balance DECIMAL;
BEGIN
    -- 获取或创建用户积分记录
    INSERT INTO user_credits (user_id, balance, total_purchased, total_used)
    VALUES (p_user_id, 0, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;

    -- 获取当前余额
    SELECT balance INTO current_balance
    FROM user_credits
    WHERE user_id = p_user_id;

    -- 计算新余额
    new_balance := current_balance + p_amount;

    -- 更新用户积分
    UPDATE user_credits
    SET balance = new_balance,
        total_purchased = total_purchased + p_amount,
        updated_at = NOW(),
        last_purchase_at = CASE
            WHEN p_reference_id IS NOT NULL THEN NOW()
            ELSE last_purchase_at
        END
    WHERE user_id = p_user_id;

    -- 记录交易
    INSERT INTO credit_transactions (user_id, transaction_type, amount, balance_after, description, reference_id)
    VALUES (p_user_id, 'purchase', p_amount, new_balance, p_description, p_reference_id);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 记录每日使用量的RPC函数
CREATE OR REPLACE FUNCTION record_daily_usage(
    p_user_id UUID,
    p_cost DECIMAL
)
RETURNS VOID AS $$
DECLARE
    today_date DATE := CURRENT_DATE;
BEGIN
    INSERT INTO user_usage_stats (date, user_id, images_generated, total_cost, api_calls)
    VALUES (today_date, p_user_id, 1, p_cost, 1)
    ON CONFLICT (date, user_id)
    DO UPDATE SET
        images_generated = user_usage_stats.images_generated + 1,
        total_cost = user_usage_stats.total_cost + p_cost,
        api_calls = user_usage_stats.api_calls + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 增加查看次数的RPC函数
CREATE OR REPLACE FUNCTION increment_view_count(image_id BIGINT)
RETURNS VOID AS $$
BEGIN
    UPDATE generated_images
    SET view_count = view_count + 1
    WHERE id = image_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 增加下载次数的RPC函数
CREATE OR REPLACE FUNCTION increment_download_count(image_id BIGINT)
RETURNS VOID AS $$
BEGIN
    UPDATE generated_images
    SET download_count = download_count + 1
    WHERE id = image_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 增加重试次数的RPC函数
CREATE OR REPLACE FUNCTION increment_retry_count(event_id BIGINT)
RETURNS VOID AS $$
BEGIN
    UPDATE webhook_events
    SET retry_count = retry_count + 1
    WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 获取用户完整统计信息的函数
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'credits', (
            SELECT json_build_object(
                'balance', COALESCE(balance, 0),
                'total_purchased', COALESCE(total_purchased, 0),
                'total_used', COALESCE(total_used, 0)
            )
            FROM user_credits WHERE user_id = p_user_id
        ),
        'subscription', (
            SELECT json_build_object(
                'plan_name', plan_name,
                'status', status,
                'current_period_end', current_period_end,
                'credits_per_month', credits_per_month
            )
            FROM user_subscriptions
            WHERE user_id = p_user_id AND status = 'active'
            LIMIT 1
        ),
        'usage_stats', (
            SELECT json_build_object(
                'total_images', COALESCE(total_images, 0),
                'favorite_images', COALESCE(favorite_images, 0),
                'total_downloads', COALESCE(total_downloads, 0),
                'total_views', COALESCE(total_views, 0),
                'last_generation_at', last_generation_at
            )
            FROM user_image_stats WHERE user_id = p_user_id
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 插入默认订阅计划
INSERT INTO subscription_plans (id, name, description, price_per_month, credits_per_month, features, sort_order) VALUES
('free', 'Free Plan', 'Basic plan with limited credits', 0.00, 10, '{"max_images_per_day": 5, "styles": ["Realistic"], "support": "community"}', 1),
('basic', 'Basic Plan', 'Perfect for casual users', 9.99, 100, '{"max_images_per_day": 50, "styles": ["Realistic", "Night", "Snow", "Rain"], "support": "email"}', 2),
('pro', 'Pro Plan', 'For professional designers', 19.99, 250, '{"max_images_per_day": 100, "styles": "all", "support": "priority", "commercial_use": true}', 3),
('premium', 'Premium Plan', 'Unlimited creativity', 39.99, 500, '{"max_images_per_day": 200, "styles": "all", "support": "priority", "commercial_use": true, "api_access": true}', 4)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_per_month = EXCLUDED.price_per_month,
    credits_per_month = EXCLUDED.credits_per_month,
    features = EXCLUDED.features,
    sort_order = EXCLUDED.sort_order;

-- 创建用于处理Webhook的函数
CREATE OR REPLACE FUNCTION process_creem_webhook(
    p_event_type TEXT,
    p_event_data JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    webhook_id BIGINT;
    user_uuid UUID;
    subscription_data JSONB;
    payment_data JSONB;
BEGIN
    -- 记录webhook事件
    INSERT INTO webhook_events (event_type, source, event_data, processed)
    VALUES (p_event_type, 'creem', p_event_data, FALSE)
    RETURNING id INTO webhook_id;

    -- 根据事件类型处理
    CASE p_event_type
        WHEN 'subscription.created', 'subscription.updated' THEN
            subscription_data := p_event_data->'subscription';
            user_uuid := (subscription_data->>'customer_id')::UUID;

            -- 创建或更新订阅
            INSERT INTO user_subscriptions (
                user_id, plan_id, plan_name, status,
                current_period_start, current_period_end,
                credits_per_month, price_per_month,
                external_subscription_id
            ) VALUES (
                user_uuid,
                subscription_data->>'plan_id',
                subscription_data->>'plan_name',
                subscription_data->>'status',
                (subscription_data->>'current_period_start')::TIMESTAMPTZ,
                (subscription_data->>'current_period_end')::TIMESTAMPTZ,
                (subscription_data->>'credits_per_month')::INTEGER,
                (subscription_data->>'price_per_month')::DECIMAL,
                subscription_data->>'id'
            )
            ON CONFLICT (external_subscription_id)
            DO UPDATE SET
                status = EXCLUDED.status,
                current_period_start = EXCLUDED.current_period_start,
                current_period_end = EXCLUDED.current_period_end,
                updated_at = NOW();

        WHEN 'payment.completed' THEN
            payment_data := p_event_data->'payment';
            user_uuid := (payment_data->>'customer_id')::UUID;

            -- 记录支付
            INSERT INTO payment_records (
                user_id, external_payment_id, amount, status,
                credits_purchased, metadata
            ) VALUES (
                user_uuid,
                payment_data->>'id',
                (payment_data->>'amount')::DECIMAL,
                'completed',
                (payment_data->>'credits')::INTEGER,
                payment_data
            );

            -- 添加积分
            PERFORM add_credits(
                user_uuid,
                (payment_data->>'credits')::DECIMAL,
                'Credits purchase via ' || (payment_data->>'payment_method'),
                payment_data->>'id'
            );

        ELSE
            -- 未知事件类型，只记录不处理
            NULL;
    END CASE;

    -- 标记为已处理
    UPDATE webhook_events
    SET processed = TRUE, processed_at = NOW()
    WHERE id = webhook_id;

    RETURN TRUE;

EXCEPTION WHEN OTHERS THEN
    -- 记录错误
    UPDATE webhook_events
    SET error_message = SQLERRM, retry_count = retry_count + 1
    WHERE id = webhook_id;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;