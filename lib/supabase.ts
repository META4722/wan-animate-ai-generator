import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库类型定义
export interface GeneratedImage {
  id: number
  created_at: string
  updated_at: string
  user_id: string | null
  user_email: string | null
  image_url: string
  image_filename: string | null
  local_path: string | null
  thumbnail_url: string | null
  prompt: string | null
  enhanced_prompt: string | null
  style: string
  aspect_ratio: string
  generation_type: string
  model_used: string
  is_favorite: boolean
  is_public: boolean
  download_count: number
  view_count: number
  api_response: any
  generation_cost: number
  generation_time_ms: number | null
  tags: string[] | null
  category: string | null
}

export interface UserCollection {
  id: number
  created_at: string
  updated_at: string
  user_id: string
  name: string
  description: string | null
  is_public: boolean
  image_count: number
}

export interface CollectionImage {
  id: number
  created_at: string
  collection_id: number
  image_id: number
}

export interface UserUsageStats {
  id: number
  date: string
  user_id: string
  images_generated: number
  total_cost: number
  api_calls: number
}

export interface UserCredits {
  id: number
  created_at: string
  updated_at: string
  user_id: string
  balance: number
  total_purchased: number
  total_used: number
  last_purchase_at: string | null
}

export interface CreditTransaction {
  id: number
  created_at: string
  user_id: string
  transaction_type: 'purchase' | 'usage' | 'refund' | 'bonus'
  amount: number
  balance_after: number
  description: string
  reference_id: string | null
  metadata: any
}

export interface UserSubscription {
  id: number
  created_at: string
  updated_at: string
  user_id: string
  plan_id: string
  plan_name: string
  status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  credits_per_month: number
  price_per_month: number
  external_subscription_id: string | null
  trial_end: string | null
  canceled_at: string | null
}

export interface WebhookEvent {
  id: number
  created_at: string
  event_type: string
  source: 'creem' | 'stripe' | 'internal'
  event_data: any
  processed: boolean
  processed_at: string | null
  error_message: string | null
  retry_count: number
  user_id: string | null
}

// 图片操作函数
export const imageOperations = {
  // 保存生成的图片到数据库
  async saveImage(imageData: {
    user_id?: string
    image_url: string
    prompt?: string
    style?: string
    aspect_ratio?: string
    generation_type?: string
    api_response?: any
    generation_cost?: number
    generation_time_ms?: number
  }): Promise<GeneratedImage | null> {
    const { data, error } = await supabase
      .from('generated_images')
      .insert([{
        user_id: imageData.user_id || null,
        image_url: imageData.image_url,
        prompt: imageData.prompt || null,
        style: imageData.style || 'Realistic',
        aspect_ratio: imageData.aspect_ratio || '16:9',
        generation_type: imageData.generation_type || 'text',
        api_response: imageData.api_response || null,
        generation_cost: imageData.generation_cost || 0,
        generation_time_ms: imageData.generation_time_ms || null
      }])
      .select()
      .single()

    if (error) {
      console.error('Error saving image:', error)
      return null
    }

    return data
  },

  // 获取用户的图片历史
  async getUserImages(userId: string, limit: number = 50): Promise<GeneratedImage[]> {
    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching user images:', error)
      return []
    }

    return data || []
  },

  // 获取公开图片
  async getPublicImages(limit: number = 50): Promise<GeneratedImage[]> {
    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching public images:', error)
      return []
    }

    return data || []
  },

  // 切换收藏状态
  async toggleFavorite(imageId: number, userId: string): Promise<boolean> {
    // 首先获取当前状态
    const { data: currentImage, error: fetchError } = await supabase
      .from('generated_images')
      .select('is_favorite')
      .eq('id', imageId)
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching image:', fetchError)
      return false
    }

    // 切换状态
    const { error: updateError } = await supabase
      .from('generated_images')
      .update({ is_favorite: !currentImage.is_favorite })
      .eq('id', imageId)
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error updating favorite:', updateError)
      return false
    }

    return true
  },

  // 删除图片
  async deleteImage(imageId: number, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('generated_images')
      .delete()
      .eq('id', imageId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting image:', error)
      return false
    }

    return true
  },

  // 增加查看次数
  async incrementViewCount(imageId: number): Promise<void> {
    const { error } = await supabase.rpc('increment_view_count', {
      image_id: imageId
    })

    if (error) {
      console.error('Error incrementing view count:', error)
    }
  },

  // 增加下载次数
  async incrementDownloadCount(imageId: number): Promise<void> {
    const { error } = await supabase.rpc('increment_download_count', {
      image_id: imageId
    })

    if (error) {
      console.error('Error incrementing download count:', error)
    }
  }
}

// 收藏夹操作函数
export const collectionOperations = {
  // 创建收藏夹
  async createCollection(userId: string, name: string, description?: string): Promise<UserCollection | null> {
    const { data, error } = await supabase
      .from('user_collections')
      .insert([{
        user_id: userId,
        name,
        description: description || null
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating collection:', error)
      return null
    }

    return data
  },

  // 获取用户收藏夹
  async getUserCollections(userId: string): Promise<UserCollection[]> {
    const { data, error } = await supabase
      .from('user_collections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching collections:', error)
      return []
    }

    return data || []
  },

  // 添加图片到收藏夹
  async addImageToCollection(collectionId: number, imageId: number): Promise<boolean> {
    const { error } = await supabase
      .from('collection_images')
      .insert([{
        collection_id: collectionId,
        image_id: imageId
      }])

    if (error) {
      console.error('Error adding image to collection:', error)
      return false
    }

    return true
  },

  // 从收藏夹移除图片
  async removeImageFromCollection(collectionId: number, imageId: number): Promise<boolean> {
    const { error } = await supabase
      .from('collection_images')
      .delete()
      .eq('collection_id', collectionId)
      .eq('image_id', imageId)

    if (error) {
      console.error('Error removing image from collection:', error)
      return false
    }

    return true
  },

  // 获取收藏夹中的图片
  async getCollectionImages(collectionId: number): Promise<GeneratedImage[]> {
    const { data, error } = await supabase
      .from('collection_images')
      .select(`
        image_id,
        generated_images (*)
      `)
      .eq('collection_id', collectionId)

    if (error) {
      console.error('Error fetching collection images:', error)
      return []
    }

    return (data?.map((item: any) => item.generated_images).filter(Boolean) as GeneratedImage[]) || []
  }
}

// 统计操作函数
export const statsOperations = {
  // 记录今日使用量
  async recordUsage(userId: string, cost: number = 0): Promise<void> {
    const { error } = await supabase.rpc('record_daily_usage', {
      p_user_id: userId,
      p_cost: cost
    })

    if (error) {
      console.error('Error recording usage:', error)
    }
  },

  // 获取用户统计
  async getUserStats(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('user_image_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching user stats:', error)
      return null
    }

    return data
  }
}

// Credits操作函数
export const creditsOperations = {
  // 获取用户余额
  async getUserCredits(userId: string): Promise<UserCredits | null> {
    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching user credits:', error)
      return null
    }

    return data
  },

  // 初始化用户余额
  async initializeUserCredits(userId: string, initialBalance: number = 0): Promise<UserCredits | null> {
    const { data, error } = await supabase
      .from('user_credits')
      .insert([{
        user_id: userId,
        balance: initialBalance,
        total_purchased: initialBalance,
        total_used: 0
      }])
      .select()
      .single()

    if (error) {
      console.error('Error initializing user credits:', error)
      return null
    }

    return data
  },

  // 使用积分
  async useCredits(userId: string, amount: number, description: string): Promise<boolean> {
    const { error } = await supabase.rpc('use_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_description: description
    })

    if (error) {
      console.error('Error using credits:', error)
      return false
    }

    return true
  },

  // 充值积分
  async addCredits(userId: string, amount: number, description: string, referenceId?: string): Promise<boolean> {
    const { error } = await supabase.rpc('add_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_description: description,
      p_reference_id: referenceId || null
    })

    if (error) {
      console.error('Error adding credits:', error)
      return false
    }

    return true
  },

  // 获取积分交易记录
  async getCreditTransactions(userId: string, limit: number = 50): Promise<CreditTransaction[]> {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching credit transactions:', error)
      return []
    }

    return data || []
  },

  // 检查用户是否有足够积分
  async hasEnoughCredits(userId: string, requiredAmount: number): Promise<boolean> {
    const credits = await this.getUserCredits(userId)
    return credits ? credits.balance >= requiredAmount : false
  }
}

// 订阅操作函数
export const subscriptionOperations = {
  // 获取用户当前订阅
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error) {
      console.error('Error fetching user subscription:', error)
      return null
    }

    return data
  },

  // 创建订阅
  async createSubscription(subscriptionData: {
    user_id: string
    plan_id: string
    plan_name: string
    status: string
    current_period_start: string
    current_period_end: string
    credits_per_month: number
    price_per_month: number
    external_subscription_id?: string
  }): Promise<UserSubscription | null> {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert([subscriptionData])
      .select()
      .single()

    if (error) {
      console.error('Error creating subscription:', error)
      return null
    }

    return data
  },

  // 更新订阅状态
  async updateSubscriptionStatus(subscriptionId: number, status: string, metadata?: any): Promise<boolean> {
    const updateData: any = { status }

    if (status === 'canceled') {
      updateData.canceled_at = new Date().toISOString()
    }

    if (metadata) {
      Object.assign(updateData, metadata)
    }

    const { error } = await supabase
      .from('user_subscriptions')
      .update(updateData)
      .eq('id', subscriptionId)

    if (error) {
      console.error('Error updating subscription status:', error)
      return false
    }

    return true
  },

  // 获取用户所有订阅历史
  async getUserSubscriptionHistory(userId: string): Promise<UserSubscription[]> {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching subscription history:', error)
      return []
    }

    return data || []
  },

  // 检查用户是否有活跃订阅
  async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId)
    return subscription !== null && subscription.status === 'active'
  }
}

// Webhook操作函数
export const webhookOperations = {
  // 记录webhook事件
  async logWebhookEvent(eventData: {
    event_type: string
    source: 'creem' | 'stripe' | 'internal'
    event_data: any
    user_id?: string
  }): Promise<WebhookEvent | null> {
    const { data, error } = await supabase
      .from('webhook_events')
      .insert([{
        event_type: eventData.event_type,
        source: eventData.source,
        event_data: eventData.event_data,
        user_id: eventData.user_id || null,
        processed: false,
        retry_count: 0
      }])
      .select()
      .single()

    if (error) {
      console.error('Error logging webhook event:', error)
      return null
    }

    return data
  },

  // 标记webhook事件为已处理
  async markEventProcessed(eventId: number, success: boolean, errorMessage?: string): Promise<boolean> {
    const updateData: any = {
      processed: success,
      processed_at: new Date().toISOString()
    }

    if (!success && errorMessage) {
      updateData.error_message = errorMessage
      // 通过RPC函数来增加retry_count
      await supabase.rpc('increment_retry_count', { event_id: eventId })
    }

    const { error } = await supabase
      .from('webhook_events')
      .update(updateData)
      .eq('id', eventId)

    if (error) {
      console.error('Error updating webhook event:', error)
      return false
    }

    return true
  },

  // 获取未处理的webhook事件
  async getUnprocessedEvents(limit: number = 50): Promise<WebhookEvent[]> {
    const { data, error } = await supabase
      .from('webhook_events')
      .select('*')
      .eq('processed', false)
      .lt('retry_count', 5) // 最多重试5次
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('Error fetching unprocessed events:', error)
      return []
    }

    return data || []
  },

  // 获取用户相关的webhook事件
  async getUserWebhookEvents(userId: string, limit: number = 50): Promise<WebhookEvent[]> {
    const { data, error } = await supabase
      .from('webhook_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching user webhook events:', error)
      return []
    }

    return data || []
  }
}