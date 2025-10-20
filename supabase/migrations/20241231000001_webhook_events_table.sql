-- 创建webhook事件表
-- 用于记录和跟踪所有webhook事件

-- 创建webhook_events表（如果不存在）
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type text NOT NULL,
    source text NOT NULL DEFAULT 'creem',
    event_data jsonb NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    processed boolean DEFAULT false,
    error_message text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    processed_at timestamp with time zone
);

-- 创建索引
CREATE INDEX IF NOT EXISTS webhook_events_event_type_idx ON public.webhook_events(event_type);
CREATE INDEX IF NOT EXISTS webhook_events_source_idx ON public.webhook_events(source);
CREATE INDEX IF NOT EXISTS webhook_events_user_id_idx ON public.webhook_events(user_id);
CREATE INDEX IF NOT EXISTS webhook_events_processed_idx ON public.webhook_events(processed);
CREATE INDEX IF NOT EXISTS webhook_events_created_at_idx ON public.webhook_events(created_at);

-- 启用RLS
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Service role can manage webhook events"
    ON public.webhook_events FOR ALL
    USING (auth.role() = 'service_role');

-- 用户可以查看自己的webhook事件
CREATE POLICY "Users can view their own webhook events"
    ON public.webhook_events FOR SELECT
    USING (auth.uid() = user_id);

-- 创建payment_records表（如果不存在）
CREATE TABLE IF NOT EXISTS public.payment_records (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    external_payment_id text NOT NULL,
    amount decimal(10,2) NOT NULL,
    currency text DEFAULT 'usd',
    status text NOT NULL,
    credits_purchased integer DEFAULT 0,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS payment_records_user_id_idx ON public.payment_records(user_id);
CREATE INDEX IF NOT EXISTS payment_records_external_payment_id_idx ON public.payment_records(external_payment_id);
CREATE INDEX IF NOT EXISTS payment_records_status_idx ON public.payment_records(status);
CREATE INDEX IF NOT EXISTS payment_records_created_at_idx ON public.payment_records(created_at);

-- 启用RLS
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Service role can manage payment records"
    ON public.payment_records FOR ALL
    USING (auth.role() = 'service_role');

-- 用户可以查看自己的支付记录
CREATE POLICY "Users can view their own payment records"
    ON public.payment_records FOR SELECT
    USING (auth.uid() = user_id);

-- 创建updated_at触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为payment_records表创建updated_at触发器
DROP TRIGGER IF EXISTS handle_payment_records_updated_at ON public.payment_records;
CREATE TRIGGER handle_payment_records_updated_at
    BEFORE UPDATE ON public.payment_records
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 成功提示
DO $$
BEGIN
    RAISE NOTICE 'Webhook events and payment records tables created successfully!';
    RAISE NOTICE 'Tables: webhook_events, payment_records';
    RAISE NOTICE 'All indexes, triggers, and RLS policies have been created';
END $$;