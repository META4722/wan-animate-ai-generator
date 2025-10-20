-- 修复新用户初始积分为10个积分
-- 更新触发器函数，确保新用户获得10个积分

-- 创建或替换函数：自动创建customer记录（10积分版本）
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

    -- 为新用户创建默认视频偏好设置（如果表存在）
    INSERT INTO public.user_video_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 确保触发器存在
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 为现有用户补充积分（如果他们的积分少于10个）
UPDATE public.customers 
SET 
    credits = 10,
    updated_at = NOW(),
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
        'credits_updated', NOW(),
        'reason', 'initial_credits_fix'
    )
WHERE credits < 10;

-- 为积分被更新的用户添加历史记录
INSERT INTO public.credits_history (
    customer_id,
    amount,
    type,
    description,
    created_at,
    metadata
)
SELECT 
    c.id,
    (10 - COALESCE(original_credits.credits, 0)) as added_credits,
    'add',
    'Initial credits adjustment to 10 credits',
    NOW(),
    jsonb_build_object(
        'source', 'credits_fix',
        'original_credits', COALESCE(original_credits.credits, 0),
        'new_credits', 10
    )
FROM public.customers c
LEFT JOIN (
    SELECT id, credits 
    FROM public.customers 
    WHERE credits < 10
) original_credits ON c.id = original_credits.id
WHERE c.credits = 10 
AND c.metadata->>'reason' = 'initial_credits_fix'
AND NOT EXISTS (
    SELECT 1 FROM public.credits_history ch 
    WHERE ch.customer_id = c.id 
    AND ch.description = 'Initial credits adjustment to 10 credits'
);

-- 成功提示
DO $$
BEGIN
    RAISE NOTICE 'Initial credits fix completed successfully!';
    RAISE NOTICE 'All users now have at least 10 initial credits.';
    RAISE NOTICE 'New users will automatically get 10 credits when they register.';
END $$;