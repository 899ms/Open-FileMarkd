-- 更新所有当前有效订阅但hasActiveSubscription为false的用户
UPDATE "User"
SET "hasActiveSubscription" = true
WHERE "stripeCurrentPeriodEnd" > NOW()
AND "hasActiveSubscription" = false; 