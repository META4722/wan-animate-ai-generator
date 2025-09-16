import { NextRequest, NextResponse } from 'next/server'
import { supabase, creditsOperations } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // 获取用户积分信息
    const credits = await creditsOperations.getUserCredits(userId)

    if (!credits) {
      // 如果用户没有积分记录，初始化一个
      const newCredits = await creditsOperations.initializeUserCredits(userId, 10) // 新用户送10积分
      return NextResponse.json({
        success: true,
        credits: newCredits
      })
    }

    return NextResponse.json({
      success: true,
      credits
    })

  } catch (error: any) {
    console.error('Get credits API error:', error)
    return NextResponse.json(
      { error: 'Failed to get credits', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, action, amount, description, reference_id } = body

    if (!user_id || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      )
    }

    let success = false

    switch (action) {
      case 'use':
        if (!amount || amount <= 0) {
          return NextResponse.json(
            { error: 'Amount must be positive for usage' },
            { status: 400 }
          )
        }

        // 检查是否有足够积分
        const hasEnough = await creditsOperations.hasEnoughCredits(user_id, amount)
        if (!hasEnough) {
          return NextResponse.json(
            { error: 'Insufficient credits' },
            { status: 400 }
          )
        }

        success = await creditsOperations.useCredits(user_id, amount, description || 'Credit usage')
        break

      case 'add':
        if (!amount || amount <= 0) {
          return NextResponse.json(
            { error: 'Amount must be positive for adding credits' },
            { status: 400 }
          )
        }

        success = await creditsOperations.addCredits(
          user_id,
          amount,
          description || 'Credit purchase',
          reference_id
        )
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "use" or "add"' },
          { status: 400 }
        )
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to process credit transaction' },
        { status: 500 }
      )
    }

    // 返回更新后的积分信息
    const updatedCredits = await creditsOperations.getUserCredits(user_id)

    return NextResponse.json({
      success: true,
      credits: updatedCredits
    })

  } catch (error: any) {
    console.error('Credits API error:', error)
    return NextResponse.json(
      { error: 'Failed to process credits', details: error.message },
      { status: 500 }
    )
  }
}