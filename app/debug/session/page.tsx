"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SessionDebugPage() {
  const { data: session, status, update } = useSession();
  const [sessionJson, setSessionJson] = useState<string>("");
  
  useEffect(() => {
    if (session) {
      setSessionJson(JSON.stringify(session, null, 2));
    }
  }, [session]);
  
  const refreshSession = async () => {
    try {
      await fetch('/api/refresh-session');
      // 强制更新会话
      await update();
      // 重新加载页面以确保获取最新状态
      window.location.reload();
    } catch (err) {
      console.error('刷新会话失败:', err);
    }
  };
  
  if (status === "loading") {
    return <div className="container p-8">加载中...</div>;
  }
  
  if (status === "unauthenticated") {
    return <div className="container p-8">请先登录</div>;
  }

  return (
    <div className="container p-8">
      <h1 className="text-2xl font-bold mb-4">Session Debug</h1>
      
      <div className="mb-4">
        <Button onClick={refreshSession}>刷新会话</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Session 信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md overflow-auto">
            <pre className="text-sm">
              {sessionJson}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 