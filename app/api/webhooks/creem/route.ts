import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/utils/supabase/service-role'
import { addCreditsToCustomer } from '@/utils/supabase/subscriptions'
import crypto from 'crypto'

// 开发模式日志
const isDev = process.env.NODE_ENV === 'development'
const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] 🔔 WEBHOOK: ${message}`)
  if (data) {
    console.log('📄 Data:', JSON.stringify(data, null, 2))
  }
}

// Creem.io Webhook处理
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    log('📨 Received webhook request')
    
    const body = await request.text()
    const signature = request.headers.get('x-creem-signature')
    const userAgent = request.headers.get('user-agent')
    const contentType = request.headers.get('content-type')
    
    log('📋 Request details', {
      signature: signature ? 'Present' : 'Missing',
      userAgent,
      contentType,
      bodyLength: body.length
    })

    // 验证webhook签名
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET
    if (!webhookSecret) {
      log('❌ CREEM_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    // 验证签名
    if (signature) {
      log('🔐 Verifying webhook signature')
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')

      const providedSignature = signature.replace('sha256=', '')

      if (expectedSignature !== providedSignature) {
        log('❌ Invalid webhook signature', {
          expected: expectedSignature.substring(0, 10) + '...',
          provided: providedSignature.substring(0, 10) + '...'
        })
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
      log('✅ Signature verified successfully')
    } else if (isDev) {
      log('⚠️  No signature provided (development mode - allowing)')
    } else {
      log('❌ No signature provided in production')
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    const eventData = JSON.parse(body)
    
    // 详细调试：打印完整的事件数据
    log('🔍 Full webhook event data', eventData)
    
    // 尝试多种方式提取事件类型和数据
    let eventType = 'unknown'
    let actualEventData = eventData
    
    // 方案 1: 直接事件格式
    if (eventData.type) {
      eventType = eventData.type
      actualEventData = eventData
    }
    // 方案 2: eventType 字段 (Creem 实际使用的格式)
    else if (eventData.eventType) {
      eventType = eventData.eventType
      // 如果有 object 字段，使用它作为实际数据
      if (eventData.object) {
        actualEventData = eventData.object
        // 保留原始事件的一些字段
        actualEventData.original_event_id = eventData.id
        actualEventData.event_created_at = eventData.created_at
      } else {
        actualEventData = eventData
      }
    }
    // 方案 3: event_type 字段
    else if (eventData.event_type) {
      eventType = eventData.event_type
      actualEventData = eventData
    }
    // 方案 3: 嵌套在 data 中
    else if (eventData.data && eventData.data.type) {
      eventType = eventData.data.type
      actualEventData = eventData.data
    }
    // 方案 4: 嵌套在 object 中
    else if (eventData.object && eventData.object.type) {
      eventType = eventData.object.type
      actualEventData = eventData.object
    }
    // 方案 5: webhook_event 包装器
    else if (eventData.webhook_event && eventData.webhook_event.type) {
      eventType = eventData.webhook_event.type
      actualEventData = eventData.webhook_event
    }
    // 方案 6: 根据 ID 前缀推断事件类型
    else if (eventData.id) {
      if (eventData.id.startsWith('sub_')) {
        eventType = 'subscription.created'
        actualEventData = eventData
      } else if (eventData.id.startsWith('pay_') || eventData.id.startsWith('ch_')) {
        eventType = 'payment.completed'
        actualEventData = eventData
      } else if (eventData.id.startsWith('evt_')) {
        // 这可能是一个事件包装器，尝试查找嵌套的实际事件
        log('🔍 Detected event wrapper, searching for nested event data')
        
        // 查找所有可能包含实际事件的字段
        const possibleEventFields = ['data', 'object', 'payload', 'event', 'webhook_data']
        for (const field of possibleEventFields) {
          if (eventData[field] && typeof eventData[field] === 'object') {
            if (eventData[field].type || eventData[field].event_type) {
              eventType = eventData[field].type || eventData[field].event_type
              actualEventData = eventData[field]
              log(`✅ Found nested event in field: ${field}`)
              break
            }
          }
        }
      }
    }

    log('🎯 Processing webhook event', {
      originalId: eventData.id,
      extractedType: eventType,
      actualDataId: actualEventData.id,
      customer: actualEventData.customer_id || actualEventData.customer,
      amount: actualEventData.amount,
      allKeys: Object.keys(eventData),
      actualDataKeys: Object.keys(actualEventData)
    })

    // 记录webhook事件到数据库（如果表存在）
    const supabase = createServiceRoleClient()
    let webhookEvent: any = null
    
    try {
      const { data, error: logError } = await supabase
        .from('webhook_events')
        .insert({
          event_type: eventType,
          source: 'creem',
          event_data: eventData, // 保存原始数据用于调试
          user_id: actualEventData.metadata?.user_id || actualEventData.customer?.user_id || actualEventData.customer_id || actualEventData.user_id || null,
          processed: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (logError) {
        log('⚠️  Failed to log webhook event (table may not exist)', logError.message)
        // 继续处理，不因为日志失败而中断
      } else {
        webhookEvent = data
        log('📝 Webhook event logged', { id: webhookEvent?.id })
      }
    } catch (error) {
      log('⚠️  Webhook event logging skipped (table not found)')
      // 继续处理，不因为日志失败而中断
    }

    let processed = false
    let errorMessage = ''

    try {
      // 处理不同类型的webhook事件
      switch (eventType) {
        case 'checkout.completed':
        case 'payment.completed':
        case 'invoice.payment_succeeded':
          log('💰 Processing payment completion')
          processed = await handlePaymentCompleted(actualEventData)
          break

        case 'subscription.created':
        case 'customer.subscription.created':
        case 'subscription.active':  // Creem 实际使用的事件类型
          log('📅 Processing subscription creation/activation')
          processed = await handleSubscriptionCreated(actualEventData)
          break

        case 'subscription.updated':
        case 'customer.subscription.updated':
        case 'subscription.paid':  // Creem 订阅支付事件
          log('🔄 Processing subscription update/payment')
          processed = await handleSubscriptionUpdated(actualEventData)
          break

        case 'subscription.canceled':
        case 'subscription.deleted':
        case 'customer.subscription.deleted':
          log('❌ Processing subscription cancellation')
          processed = await handleSubscriptionCanceled(actualEventData)
          break

        case 'payment.failed':
        case 'invoice.payment_failed':
          log('💸 Processing payment failure')
          processed = await handlePaymentFailed(actualEventData)
          break

        case 'unknown':
          log('❓ Unknown webhook event type - attempting generic processing')
          // 尝试通用处理
          if (actualEventData.id && actualEventData.id.startsWith('sub_')) {
            log('🔄 Treating as subscription event')
            processed = await handleSubscriptionCreated(actualEventData)
          } else if (actualEventData.id && (actualEventData.id.startsWith('pay_') || actualEventData.id.startsWith('ch_'))) {
            log('💰 Treating as payment event')
            processed = await handlePaymentCompleted(actualEventData)
          } else {
            log('⚠️  Cannot determine event type, marking as processed to avoid retry')
            processed = true
          }
          break

        default:
          log('❓ Unhandled webhook event type', { type: eventType })
          processed = true // 标记为已处理以避免重试
          break
      }

    } catch (error: any) {
      log('❌ Error processing webhook', error)
      errorMessage = error.message
      processed = false
    }

    // 更新webhook事件状态（如果记录存在）
    if (webhookEvent?.id) {
      try {
        await supabase
          .from('webhook_events')
          .update({
            processed: processed,
            error_message: errorMessage || null,
            processed_at: new Date().toISOString()
          })
          .eq('id', webhookEvent.id)
      } catch (error) {
        log('⚠️  Failed to update webhook event status')
      }
    }

    const processingTime = Date.now() - startTime
    log(`⏱️  Webhook processing completed in ${processingTime}ms`, {
      processed,
      error: errorMessage || null
    })

    if (!processed) {
      return NextResponse.json({
        error: 'Failed to process webhook',
        details: errorMessage
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      event_id: webhookEvent?.id,
      processed: true,
      processing_time_ms: processingTime
    })

  } catch (error: any) {
    const processingTime = Date.now() - startTime
    log('💥 Critical webhook error', {
      error: error.message,
      stack: error.stack,
      processingTime
    })
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    )
  }
}

// 处理支付完成事件
async function handlePaymentCompleted(eventData: any): Promise<boolean> {
  const userId = eventData.metadata?.user_id || eventData.customer?.user_id
  const creemCustomerId = eventData.customer?.id
  const amount = parseFloat(eventData.amount || eventData.amount_paid || 0)
  const credits = parseInt(eventData.metadata?.credits || eventData.credits || '0')
  const paymentId = eventData.id
  const productType = eventData.metadata?.product_type || 'credits'

  log('💰 Processing payment', {
    userId,
    creemCustomerId,
    amount,
    credits,
    paymentId,
    productType
  })

  if (!userId) {
    throw new Error('Missing user_id in payment data')
  }

  if (!paymentId) {
    throw new Error('Missing payment_id in payment data')
  }

  const supabase = createServiceRoleClient()

  // 查找用户的customer记录
  let { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id, credits')
    .eq('user_id', userId)
    .single()

  if (customerError || !customer) {
    log('❌ Customer not found, creating new customer record')
    // 创建新的customer记录
    const { data: newCustomer, error: createError } = await supabase
      .from('customers')
      .insert({
        user_id: userId,
        email: eventData.customer?.email || 'unknown@example.com',
        credits: 0,
        creem_customer_id: creemCustomerId || `creem_${userId}`
      })
      .select()
      .single()

    if (createError || !newCustomer) {
      throw new Error(`Failed to create customer record: ${createError?.message}`)
    }
    
    // 使用新创建的customer记录
    customer = newCustomer
  }

  // 确定积分数量
  let finalCredits = credits
  
  // 如果metadata中没有积分信息，尝试从产品ID获取
  if (finalCredits === 0) {
    const productId = eventData.product?.id || eventData.metadata?.product_id
    if (productId) {
      finalCredits = getCreditsForProduct(productId)
      log('💎 Credits determined from product ID', { productId, credits: finalCredits })
    }
  }

  // 添加积分到用户账户
  if (finalCredits > 0) {
    try {
      const productName = eventData.product?.id ? getProductName(eventData.product.id) : 'Credits Purchase'
      await addCreditsToCustomer(
        customer.id,
        finalCredits,
        paymentId,
        `${productName} - Payment ${paymentId}`
      )
      log('✅ Credits added successfully', { credits: finalCredits, customerId: customer.id })
    } catch (error: any) {
      log('❌ Failed to add credits', error)
      throw new Error(`Failed to add credits: ${error.message}`)
    }
  } else {
    log('⚠️  No credits to add for this payment', { 
      productId: eventData.product?.id,
      metadata: eventData.metadata 
    })
  }

  // 记录支付信息到数据库（如果表存在）
  try {
    const { error } = await supabase
      .from('payment_records')
      .insert({
        user_id: userId,
        external_payment_id: paymentId,
        amount: amount,
        status: 'completed',
        credits_purchased: finalCredits,
        metadata: eventData
      })

    if (error) {
      log('⚠️  Failed to record payment (table may not exist)', error)
      // 不抛出错误，因为积分已经添加成功
    } else {
      log('📝 Payment recorded successfully')
    }
  } catch (error) {
    log('⚠️  Payment recording skipped (table not found)')
  }

  return true
}

// 处理订阅创建事件
async function handleSubscriptionCreated(eventData: any): Promise<boolean> {
  const userId = eventData.metadata?.user_id || eventData.customer?.user_id
  const creemCustomerId = eventData.customer?.id
  const subscription = eventData.subscription || eventData
  const planId = eventData.product?.id || eventData.metadata?.plan_id

  log('📅 Processing subscription creation', {
    userId,
    creemCustomerId,
    subscriptionId: subscription?.id || eventData.id,
    planId,
    status: subscription?.status || eventData.status
  })

  if (!userId) {
    throw new Error('Missing user_id in subscription data')
  }

  const supabase = createServiceRoleClient()

  // 根据产品ID确定积分数量
  const creditsPerMonth = getCreditsForPlan(planId)
  
  log('💎 Subscription credits allocation', {
    planId,
    creditsPerMonth
  })

  // 查找用户的customer记录
  let { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id, credits')
    .eq('user_id', userId)
    .single()

  if (customerError || !customer) {
    log('❌ Customer not found, creating new customer record')
    // 创建新的customer记录
    const { data: newCustomer, error: createError } = await supabase
      .from('customers')
      .insert({
        user_id: userId,
        email: eventData.customer?.email || 'unknown@example.com',
        credits: 0,
        creem_customer_id: creemCustomerId || `creem_${userId}`
      })
      .select()
      .single()

    if (createError || !newCustomer) {
      throw new Error(`Failed to create customer record: ${createError?.message}`)
    }
    
    // 使用新创建的customer记录
    customer = newCustomer
  }

  // 添加订阅的月度积分
  if (creditsPerMonth > 0) {
    try {
      await addCreditsToCustomer(
        customer.id,
        creditsPerMonth,
        subscription?.id || eventData.id,
        `Monthly subscription credits - ${getPlanName(planId)}`
      )
      log('✅ Subscription credits added successfully', { 
        credits: creditsPerMonth, 
        customerId: customer.id 
      })
    } catch (error: any) {
      log('❌ Failed to add subscription credits', error)
      throw new Error(`Failed to add subscription credits: ${error.message}`)
    }
  }

  // 记录订阅信息（如果表存在）
  try {
    const { error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        creem_subscription_id: subscription?.id || eventData.id,
        plan_id: planId,
        status: subscription?.status || eventData.status || 'active',
        credits_per_month: creditsPerMonth,
        created_at: new Date().toISOString(),
        metadata: eventData
      })

    if (error) {
      log('⚠️  Failed to record subscription (table may not exist)', error)
      // 不抛出错误，因为积分已经添加成功
    } else {
      log('📝 Subscription recorded successfully')
    }
  } catch (error) {
    log('⚠️  Subscription recording skipped (table not found)')
  }

  return true
}

// 根据产品ID获取积分数量
function getCreditsForPlan(planId: string): number {
  // 订阅产品映射积分（每月）
  const subscriptionCreditsMap: { [key: string]: number } = {
    'prod_4xaHcIcRndFQ9sPXF0Gjnv': 100,  // Starter - 100 credits/month
    'prod_6rOJtTwlyjsH9AVuSzh8aR': 300,  // Creator - 300 credits/month
    'prod_3qPYksZMtk94wQsdkgajrJ': 800,  // Studio - 800 credits/month
  }
  
  return subscriptionCreditsMap[planId] || 100 // 默认100积分
}

// 根据产品ID获取一次性购买的积分数量
function getCreditsForProduct(productId: string): number {
  // 一次性积分购买产品映射
  const creditsProductMap: { [key: string]: number } = {
    'prod_MqcjVo0Bpx0rbYmHVlrh2': 100,  // Trial - 100 credits
    'prod_4ICkTovEC6o9QY6UuL3aI0': 300,  // Base - 300 credits
    'prod_3b3oyQtIJA3eaMIHLNjyCc': 500,  // Pro - 500 credits
  }
  
  return creditsProductMap[productId] || 0
}

// 根据产品ID获取套餐名称
function getPlanName(planId: string): string {
  const planNameMap: { [key: string]: string } = {
    'prod_4xaHcIcRndFQ9sPXF0Gjnv': 'Starter Plan',
    'prod_6rOJtTwlyjsH9AVuSzh8aR': 'Creator Plan',
    'prod_3qPYksZMtk94wQsdkgajrJ': 'Studio Plan',
  }
  
  return planNameMap[planId] || 'Unknown Plan'
}

// 根据产品ID获取积分产品名称
function getProductName(productId: string): string {
  const productNameMap: { [key: string]: string } = {
    'prod_MqcjVo0Bpx0rbYmHVlrh2': 'Trial Credits',
    'prod_4ICkTovEC6o9QY6UuL3aI0': 'Base Credits',
    'prod_3b3oyQtIJA3eaMIHLNjyCc': 'Pro Credits',
  }
  
  return productNameMap[productId] || 'Credits Purchase'
}

// 处理订阅更新事件
async function handleSubscriptionUpdated(eventData: any): Promise<boolean> {
  const subscription = eventData.subscription || eventData
  const subscriptionId = subscription?.id || eventData.id
  const userId = eventData.customer?.id || eventData.metadata?.user_id

  log('🔄 Processing subscription update', {
    subscriptionId,
    userId,
    status: subscription?.status || eventData.status
  })

  if (!subscriptionId) {
    throw new Error('Missing subscription ID')
  }

  const supabase = createServiceRoleClient()

  // 如果订阅续费，添加新的月度积分
  if (subscription?.status === 'active' || eventData.status === 'active') {
    const planId = eventData.product?.id || eventData.metadata?.plan_id
    const creditsPerMonth = getCreditsForPlan(planId)
    
    if (creditsPerMonth > 0 && userId) {
      try {
        // 查找用户的customer记录
        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', userId)
          .single()

        if (customer) {
          await addCreditsToCustomer(
            customer.id,
            creditsPerMonth,
            subscriptionId,
            `Monthly subscription renewal - ${getPlanName(planId)}`
          )
          log('✅ Renewal credits added successfully', { credits: creditsPerMonth })
        }
      } catch (error: any) {
        log('❌ Failed to add renewal credits', error)
        // 不抛出错误，继续处理订阅更新
      }
    }
  }

  // 更新订阅状态（如果表存在）
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: subscription?.status || eventData.status,
        updated_at: new Date().toISOString(),
        metadata: eventData
      })
      .eq('creem_subscription_id', subscriptionId)

    if (error) {
      log('⚠️  Failed to update subscription record', error)
    } else {
      log('📝 Subscription updated successfully')
    }
  } catch (error) {
    log('⚠️  Subscription update skipped (table not found)')
  }

  return true
}

// 处理订阅取消事件
async function handleSubscriptionCanceled(eventData: any): Promise<boolean> {
  const subscription = eventData.subscription || eventData
  const subscriptionId = subscription?.id || eventData.id

  log('❌ Processing subscription cancellation', {
    subscriptionId,
    status: subscription?.status || eventData.status
  })

  if (!subscriptionId) {
    throw new Error('Missing subscription ID')
  }

  const supabase = createServiceRoleClient()

  // 更新订阅状态为已取消（如果表存在）
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: eventData
      })
      .eq('creem_subscription_id', subscriptionId)

    if (error) {
      log('⚠️  Failed to update subscription status', error)
    } else {
      log('📝 Subscription marked as canceled')
    }
  } catch (error) {
    log('⚠️  Subscription cancellation update skipped (table not found)')
  }

  // 注意：取消订阅时不扣除积分，用户保留已获得的积分
  log('💎 User keeps existing credits after cancellation')

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