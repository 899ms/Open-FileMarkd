import { db } from '@/lib/db'
import { SUBSCRIPTION_PRODUCTS, type SubscriptionPlanType } from '@/lib/stripe'
import { users, pointsHistory } from '@/lib/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { expireSubscriptionIfNeeded } from '@/lib/subscription'

// 积分配置 - 可以在这里修改各种奖励积分
export const POINTS_CONFIG = {
  REGISTER_BONUS: 100, // 注册赠送积分
  DAILY_LOGIN_BONUS: 10, // 每日登录奖励
  REFERRAL_BONUS: 200, // 推荐用户奖励
} as const

// 积分操作类型
export enum PointsAction {
  REGISTER = 'register',
  DAILY_LOGIN = 'daily_login',
  REFERRAL = 'referral',
  MANUAL = 'manual',
  AI_CONVERSION = 'ai_conversion',
}

// 积分类型
export enum PointsType {
  PURCHASED = 'purchased', // 购买积分（永不过期）
  GIFTED = 'gifted', // 赠送积分（订阅到期清零）
}

// 操作描述映射
const ACTION_DESCRIPTIONS: Record<PointsAction, string> = {
  [PointsAction.REGISTER]: 'Registration bonus',
  [PointsAction.DAILY_LOGIN]: 'Daily login bonus',
  [PointsAction.REFERRAL]: 'Referral bonus',
  [PointsAction.MANUAL]: 'Manual operation',
  [PointsAction.AI_CONVERSION]: 'AI conversion',
}

const DEFAULT_SUBSCRIPTION_GIFTED_POINTS = 1000

export function getSubscriptionGiftedPoints(plan: SubscriptionPlanType | null | undefined) {
  if (!plan) {
    return DEFAULT_SUBSCRIPTION_GIFTED_POINTS
  }
  return SUBSCRIPTION_PRODUCTS[plan]?.giftedPoints ?? DEFAULT_SUBSCRIPTION_GIFTED_POINTS
}

// 添加积分历史记录
async function addPointsHistory(
  userId: string,
  points: number,
  action: PointsAction,
  pointsType: PointsType,
  description?: string
) {
  await db.insert(pointsHistory).values({
    id: nanoid(),
    userId,
    points,
    pointsType,
    action,
    description: description || ACTION_DESCRIPTIONS[action],
  })
}

// 添加积分
export async function addPoints(
  userId: string,
  points: number,
  action: PointsAction = PointsAction.MANUAL,
  pointsType: PointsType = PointsType.PURCHASED, // 默认为购买积分
  description?: string
) {
  try {
    // 入口拦截:先检查订阅是否过期
    await expireSubscriptionIfNeeded(userId)

    // 根据积分类型更新不同的字段
    if (pointsType === PointsType.PURCHASED) {
      await db
        .update(users)
        .set({
          points: sql`${users.points} + ${points}`,
          purchasedPoints: sql`${users.purchasedPoints} + ${points}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
    } else {
      await db
        .update(users)
        .set({
          points: sql`${users.points} + ${points}`,
          giftedPoints: sql`${users.giftedPoints} + ${points}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
    }

    // 添加历史记录
    await addPointsHistory(userId, points, action, pointsType, description)

    // 获取更新后的积分总数
    const user = await db
      .select({ points: users.points })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    const newPoints = user.length > 0 ? user[0].points || 0 : 0
    console.log(`用户 ${userId} 获得 ${points} ${pointsType}积分 (${action})，当前总积分: ${newPoints}`)
    return newPoints
  } catch (error) {
    console.error('添加积分失败:', error)
    throw error
  }
}

// 获取用户积分
export async function getUserPoints(userId: string) {
  try {
    const result = await db
      .select({ points: users.points })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    return result[0]?.points || 0
  } catch (error) {
    console.error('获取用户积分失败:', error)
    return 0
  }
}

// 扣除积分（优先扣赠送积分，再扣购买积分）
export async function deductPoints(
  userId: string,
  points: number,
  description?: string,
  action: PointsAction = PointsAction.MANUAL,
) {
  try {
    // 入口拦截:先检查订阅是否过期
    await expireSubscriptionIfNeeded(userId)

    // 重新查一次用户当前积分信息
    const user = await db
      .select({
        points: users.points,
        giftedPoints: users.giftedPoints,
        purchasedPoints: users.purchasedPoints,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (user.length === 0) {
      throw new Error('用户不存在')
    }

    const currentUser = user[0]
    const totalPoints = currentUser.points || 0
    const giftedPoints = currentUser.giftedPoints || 0
    const purchasedPoints = currentUser.purchasedPoints || 0

    if (totalPoints < points) {
      throw new Error('Insufficient points')
    }

    let remaining = points
    let giftedUsed = 0
    let purchasedUsed = 0

    // 优先使用赠送积分
    if (giftedPoints > 0 && remaining > 0) {
      giftedUsed = Math.min(giftedPoints, remaining)
      remaining -= giftedUsed
    }

    // 剩余部分使用购买积分
    if (remaining > 0) {
      purchasedUsed = remaining
    }

    // 一次性更新三个字段
    await db
      .update(users)
      .set({
        points: sql`${users.points} - ${points}`,
        giftedPoints: sql`${users.giftedPoints} - ${giftedUsed}`,
        purchasedPoints: sql`${users.purchasedPoints} - ${purchasedUsed}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))

    // 写一条历史记录，pointsType 与实际消耗的来源对应
    const consumedType = giftedUsed > 0 ? PointsType.GIFTED : PointsType.PURCHASED
    await addPointsHistory(userId, -points, action, consumedType, description || 'Points deduction')

    const newPoints = totalPoints - points
    console.log(
      `用户 ${userId} 扣除 ${points} 积分（赠送:${giftedUsed} / 购买:${purchasedUsed}），剩余: ${newPoints}`,
    )
    return newPoints
  } catch (error) {
    console.error('扣除积分失败:', error)
    throw error
  }
}

// 获取用户积分历史
export async function getUserPointsHistory(userId: string, limit: number = 20, offset: number = 0) {
  try {
    const history = await db
      .select({
        id: pointsHistory.id,
        points: pointsHistory.points,
        action: pointsHistory.action,
        description: pointsHistory.description,
        createdAt: pointsHistory.createdAt,
      })
      .from(pointsHistory)
      .where(eq(pointsHistory.userId, userId))
      .orderBy(desc(pointsHistory.createdAt))
      .limit(limit)
      .offset(offset)

    return history
  } catch (error) {
    console.error('获取积分历史失败:', error)
    return []
  }
}

// 获取用户积分历史总数
export async function getUserPointsHistoryCount(userId: string) {
  try {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(pointsHistory)
      .where(eq(pointsHistory.userId, userId))

    return result[0]?.count || 0
  } catch (error) {
    console.error('获取积分历史总数失败:', error)
    return 0
  }
}

// 给新注册用户赠送积分（归类为购买积分，永不过期）
export async function giveRegisterBonus(userId: string) {
  return addPoints(
    userId,
    POINTS_CONFIG.REGISTER_BONUS,
    PointsAction.REGISTER,
    PointsType.PURCHASED // 注册积分归类为购买积分，永不过期
  )
}

// 获取用户积分详情（gifted / purchased 分类）
export async function getUserPointsDetail(userId: string) {
  const user = await db
    .select({
      points: users.points,
      giftedPoints: users.giftedPoints,
      purchasedPoints: users.purchasedPoints,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (user.length === 0) {
    throw new Error('用户不存在')
  }

  return {
    points: user[0].points ?? 0,
    giftedPoints: user[0].giftedPoints ?? 0,
    purchasedPoints: user[0].purchasedPoints ?? 0,
  }
}