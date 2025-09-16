import { NextRequest, NextResponse } from 'next/server'
import { supabase, webhookOperations, creditsOperations, subscriptionOperations } from '@/lib/supabase'
import crypto from 'crypto'

// Creem.io Webhook处理
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-creem-signature')

    // 验证webhook签名
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('CREEM_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    // 验证签名
    if (signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')

      const providedSignature = signature.replace('sha256=', '')

      if (expectedSignature !== providedSignature) {
        console.error('Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const eventData = JSON.parse(body)
    const eventType = eventData.type || eventData.event_type

    console.log('Received Creem webhook:', eventType, eventData)

    // 记录webhook事件
    const webhookEvent = await webhookOperations.logWebhookEvent({
      event_type: eventType,
      source: 'creem',
      event_data: eventData,
      user_id: eventData.customer_id || eventData.user_id
    })

    if (!webhookEvent) {
      return NextResponse.json({ error: 'Failed to log webhook event' }, { status: 500 })
    }

    let processed = false
    let errorMessage = ''

    try {
      // 处理不同类型的webhook事件
      switch (eventType) {
        case 'payment.completed':
        case 'invoice.payment_succeeded':
          processed = await handlePaymentCompleted(eventData)
          break

        case 'subscription.created':
        case 'customer.subscription.created':
          processed = await handleSubscriptionCreated(eventData)
          break

        case 'subscription.updated':
        case 'customer.subscription.updated':
          processed = await handleSubscriptionUpdated(eventData)
          break

        case 'subscription.deleted':
        case 'customer.subscription.deleted':
          processed = await handleSubscriptionCanceled(eventData)
          break

        case 'payment.failed':
        case 'invoice.payment_failed':
          processed = await handlePaymentFailed(eventData)
          break

        default:
          console.log('Unhandled webhook event type:', eventType)
          processed = true // 标记为已处理以避免重试
          break
      }

    } catch (error: any) {
      console.error('Error processing webhook:', error)
      errorMessage = error.message
      processed = false
    }

    // 更新webhook事件状态
    await webhookOperations.markEventProcessed(webhookEvent.id, processed, errorMessage)

    if (!processed) {
      return NextResponse.json({
        error: 'Failed to process webhook',
        details: errorMessage
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      event_id: webhookEvent.id,
      processed: true
    })

  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    )
  }
}

// 处理支付完成事件
async function handlePaymentCompleted(eventData: any): Promise<boolean> {
  const userId = eventData.customer_id || eventData.metadata?.user_id
  const amount = parseFloat(eventData.amount || eventData.amount_paid || 0)
  const credits = parseInt(eventData.credits || eventData.metadata?.credits || '0')
  const paymentId = eventData.id || eventData.payment_intent

  if (!userId || !paymentId) {
    throw new Error('Missing required payment data: user_id or payment_id')
  }

  // 添加积分到用户账户
  if (credits > 0) {
    const success = await creditsOperations.addCredits(
      userId,
      credits,
      `Credits purchase - Payment ${paymentId}`,
      paymentId
    )

    if (!success) {
      throw new Error('Failed to add credits to user account')
    }
  }

  // 记录支付信息到数据库
  const { error } = await supabase
    .from('payment_records')
    .insert({
      user_id: userId,
      external_payment_id: paymentId,
      amount: amount,
      status: 'completed',
      credits_purchased: credits,
      metadata: eventData
    })

  if (error) {
    console.error('Failed to record payment:', error)
    // 不抛出错误，因为积分已经添加成功
  }

  return true
}

// 处理订阅创建事件
async function handleSubscriptionCreated(eventData: any): Promise<boolean> {
  const userId = eventData.customer_id || eventData.customer
  const subscription = eventData.subscription || eventData

  if (!userId || !subscription) {
    throw new Error('Missing required subscription data')
  }

  const subscriptionData = {
    user_id: userId,
    plan_id: subscription.plan_id || subscription.items?.data?.[0]?.price?.id || 'unknown',
    plan_name: subscription.plan_name || subscription.items?.data?.[0]?.price?.nickname || 'Unknown Plan',
    status: subscription.status || 'active',
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    credits_per_month: parseInt(subscription.credits_per_month || subscription.metadata?.credits_per_month || '100'),
    price_per_month: parseFloat(subscription.price_per_month || subscription.items?.data?.[0]?.price?.unit_amount / 100 || '0'),
    external_subscription_id: subscription.id
  }

  const newSubscription = await subscriptionOperations.createSubscription(subscriptionData)

  if (!newSubscription) {
    throw new Error('Failed to create subscription record')
  }

  // 如果是新订阅，添加第一个月的积分
  if (subscriptionData.credits_per_month > 0) {
    await creditsOperations.addCredits(
      userId,
      subscriptionData.credits_per_month,
      `Monthly credits - ${subscriptionData.plan_name}`,
      subscription.id
    )
  }

  return true
}

// 处理订阅更新事件
async function handleSubscriptionUpdated(eventData: any): Promise<boolean> {
  const subscription = eventData.subscription || eventData
  const externalId = subscription.id

  if (!externalId) {
    throw new Error('Missing subscription ID')
  }

  const updateData: any = {
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
  }

  if (subscription.cancel_at_period_end !== undefined) {
    updateData.cancel_at_period_end = subscription.cancel_at_period_end
  }

  const { error } = await supabase
    .from('user_subscriptions')
    .update(updateData)
    .eq('external_subscription_id', externalId)

  if (error) {
    throw new Error(`Failed to update subscription: ${error.message}`)
  }

  return true
}

// 处理订阅取消事件
async function handleSubscriptionCanceled(eventData: any): Promise<boolean> {
  const subscription = eventData.subscription || eventData
  const externalId = subscription.id

  if (!externalId) {
    throw new Error('Missing subscription ID')
  }

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString()
    })
    .eq('external_subscription_id', externalId)

  if (error) {
    throw new Error(`Failed to cancel subscription: ${error.message}`)
  }

  return true
}

// 处理支付失败事件
async function handlePaymentFailed(eventData: any): Promise<boolean> {
  const userId = eventData.customer_id || eventData.customer
  const paymentId = eventData.id || eventData.payment_intent
  const amount = parseFloat(eventData.amount || 0)

  if (!userId || !paymentId) {
    throw new Error('Missing required payment failure data')
  }

  // 记录失败的支付
  const { error } = await supabase
    .from('payment_records')
    .insert({
      user_id: userId,
      external_payment_id: paymentId,
      amount: amount,
      status: 'failed',
      metadata: eventData
    })

  if (error) {
    console.error('Failed to record payment failure:', error)
  }

  // 这里可以添加通知用户支付失败的逻辑

  return true
}