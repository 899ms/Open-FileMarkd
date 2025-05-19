import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"
import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GitHubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // 查找用户
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            stripeCustomerId: true,
            stripeSubscriptionId: true,
            stripePriceId: true,
            stripeCurrentPeriodEnd: true,
            subscriptionPlan: true,
          }
        })

        // 如果用户不存在或密码不匹配或用户没有密码（如OAuth用户）
        if (!user || !user.password || !(await compare(credentials.password, user.password))) {
          return null
        }

        // 返回不包含密码的用户信息
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          stripeCustomerId: user.stripeCustomerId,
          stripeSubscriptionId: user.stripeSubscriptionId,
          stripePriceId: user.stripePriceId,
          stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
          subscriptionPlan: user.subscriptionPlan,
        }
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        // 添加Stripe订阅信息
        token.stripeCustomerId = user.stripeCustomerId
        token.stripeSubscriptionId = user.stripeSubscriptionId
        token.stripePriceId = user.stripePriceId
        token.stripeCurrentPeriodEnd = user.stripeCurrentPeriodEnd ? 
          user.stripeCurrentPeriodEnd.toISOString() : null
        token.subscriptionPlan = user.subscriptionPlan
        
        // 检查是否有活跃订阅
        token.hasActiveSubscription = !!(
          user.stripeSubscriptionId && 
          user.stripeCurrentPeriodEnd && 
          new Date(user.stripeCurrentPeriodEnd) > new Date()
        )
      }
      if (account) {
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        
        // 添加Stripe订阅信息到会话
        session.user.stripeCustomerId = token.stripeCustomerId
        session.user.stripeSubscriptionId = token.stripeSubscriptionId
        session.user.stripePriceId = token.stripePriceId
        session.user.stripeCurrentPeriodEnd = token.stripeCurrentPeriodEnd ? 
          new Date(token.stripeCurrentPeriodEnd) : null
        session.user.hasActiveSubscription = token.hasActiveSubscription
        session.user.subscriptionPlan = token.subscriptionPlan as string | null
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 