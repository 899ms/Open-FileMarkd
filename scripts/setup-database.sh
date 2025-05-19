#!/bin/bash

# 执行Prisma数据库迁移
echo "正在初始化数据库..."
npx prisma migrate dev --name init

# 生成Prisma客户端
echo "正在生成Prisma客户端..."
npx prisma generate

echo "数据库设置完成!" 