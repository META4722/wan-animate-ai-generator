import { NextRequest, NextResponse } from 'next/server'
import { supabase, subscriptionOperations } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const type = searchParams.get('type') || 'current'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    let subscriptions

    switch (type) {
      case 'current':
        const currentSubscription = await subscriptionOperations.getUserSubscription(userId)
        return NextResponse.json({
          success: true,
          subscription: currentSubscription
        })

      case 'history':
        subscriptions = await subscriptionOperations.getUserSubscriptionHistory(userId)
        return NextResponse.json({
          success: true,
          subscriptions
        })

      case 'plans':
        // 获取所有可用的订阅计划
        const { data: plans, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        if (error) {
          throw error
        }

        return NextResponse.json({
          success: true,
          plans: plans || []
        })

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('Subscriptions API error:', error)
    return NextResponse.json(
      { error: 'Failed to get subscriptions', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, user_id, plan_id, subscription_id } = body

    if (!action || !user_id) {
      return NextResponse.json(
        { error: 'Action and user_id are required' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'create':
        if (!plan_id) {
          return NextResponse.json(
            { error: 'Plan ID is required for creating subscription' },
            { status: 400 }
          )
        }

        // 获取计划信息
        const { data: plan, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', plan_id)
          .single()

        if (planError || !plan) {
          return NextResponse.json(
            { error: 'Invalid plan ID' },
            { status: 400 }
          )
        }

        // 创建Creem.io订阅的逻辑应该在这里
        // 这里返回需要重定向到Creem支付页面的URL
        const checkoutUrl = await createCreemCheckoutSession(user_id, plan)

        return NextResponse.json({
          success: true,
          checkout_url: checkoutUrl,
          plan: plan
        })

      case 'cancel':
        if (!subscription_id) {
          return NextResponse.json(
            { error: 'Subscription ID is required for canceling' },
            { status: 400 }
          )
        }

        const success = await subscriptionOperations.updateSubscriptionStatus(
          subscription_id,
          'canceled'
        )

        if (!success) {
          return NextResponse.json(
            { error: 'Failed to cancel subscription' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Subscription canceled successfully'
        })

      case 'reactivate':
        if (!subscription_id) {
          return NextResponse.json(
            { error: 'Subscription ID is required for reactivating' },
            { status: 400 }
          )
        }

        const reactivated = await subscriptionOperations.updateSubscriptionStatus(
          subscription_id,
          'active'
        )

        if (!reactivated) {
          return NextResponse.json(
            { error: 'Failed to reactivate subscription' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Subscription reactivated successfully'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('Subscriptions API error:', error)
    return NextResponse.json(
      { error: 'Failed to process subscription request', details: error.message },
      { status: 500 }
    )
  }
}

// 创建Creem.io支付会话
async function createCreemCheckoutSession(userId: string, plan: any): Promise<string> {
  const creemApiKey = process.env.CREEM_API_KEY
  const creemApiUrl = process.env.CREEM_API_URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!creemApiKey || !creemApiUrl) {
    throw new Error('Creem.io configuration missing')
  }

  try {
    const response = await fetch(`${creemApiUrl}/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${creemApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: userId,
        price_id: plan.id,
        success_url: `${siteUrl}/dashboard?subscription=success`,
        cancel_url: `${siteUrl}/pricing?subscription=canceled`,
        metadata: {
          user_id: userId,
          plan_id: plan.id,
          credits_per_month: plan.credits_per_month
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Creem API error: ${response.status} ${errorData}`)
    }

    const session = await response.json()
    return session.url || session.checkout_url

  } catch (error: any) {
    console.error('Failed to create Creem checkout session:', error)
    throw new Error(`Failed to create checkout session: ${error.message}`)
  }
}