-- 创建 webhook_events 表用于记录和调试webhook事件
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type text NOT NULL,
    source text NOT NULL DEFAULT 'creem',
    event_data jsonb NOT NULL,
    user_id uuid,
    processed boolean DEFAULT false,
    error_message text,
    created_at timestamp with time zone DEFAULT now(),
    processed_at timestamp with time zone
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON public.webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON public.webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON public.webhook_events(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_user_id ON public.webhook_events(user_id);

-- 启用 RLS
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略（只允许服务角色访问）
CREATE POLICY "Service role can manage webhook events" ON public.webhook_events
    FOR ALL USING (auth.role() = 'service_role');

-- 添加注释
COMMENT ON TABLE public.webhook_events IS 'Records all webhook events for debugging and processing';
COMMENT ON COLUMN public.webhook_events.event_type IS 'Type of webhook event (e.g., payment.completed, subscription.created)';
COMMENT ON COLUMN public.webhook_events.source IS 'Source of the webhook (e.g., creem, stripe)';
COMMENT ON COLUMN public.webhook_events.event_data IS 'Full webhook payload as JSON';
COMMENT ON COLUMN public.webhook_events.user_id IS 'Associated user ID if available';
COMMENT ON COLUMN public.webhook_events.processed IS 'Whether the event has been successfully processed';
COMMENT ON COLUMN public.webhook_events.error_message IS 'Error message if processing failed';

-- 创建 payment_records 表（如果不存在）
CREATE TABLE IF NOT EXISTS public.payment_records (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    external_payment_id text NOT NULL,
    amount decimal(10,2) NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    credits_purchased integer DEFAULT 0,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_payment_records_user_id ON public.payment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_external_id ON public.payment_records(external_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON public.payment_records(status);

-- 启用 RLS
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
CREATE POLICY "Users can view their own payment records" ON public.payment_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage payment records" ON public.payment_records
    FOR ALL USING (auth.role() = 'service_role');

-- 添加注释
COMMENT ON TABLE public.payment_records IS 'Records all payment transactions';

-- 成功提示
DO $
BEGIN
    RAISE NOTICE '=== Webhook Events Table Created ===';
    RAISE NOTICE 'Created webhook_events table for event logging';
    RAISE NOTICE 'Created payment_records table for payment tracking';
    RAISE NOTICE 'Added appropriate indexes and RLS policies';
END $;