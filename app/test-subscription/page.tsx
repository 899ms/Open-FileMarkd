'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function TestSubscriptionPage() {
  const { data: session, status } = useSession();
  const [plan, setPlan] = useState('yearly');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const simulateSubscription = async () => {
    if (status !== 'authenticated') return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/test-stripe-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('测试订阅失败', error);
      setResult({ success: false, error: '测试订阅失败' });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center">正在加载...</div>;
  }

  if (status === 'unauthenticated') {
    return <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center">请先登录</div>;
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>订阅测试工具</CardTitle>
          <CardDescription>模拟订阅流程，直接更新数据库</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">选择订阅计划:</h3>
            <RadioGroup value={plan} onValueChange={setPlan} className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly">月度订阅</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yearly" id="yearly" />
                <Label htmlFor="yearly">年度订阅</Label>
              </div>
            </RadioGroup>
          </div>
          
          {result && (
            <div className={`p-3 rounded-md ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <p className="font-medium">{result.success ? '成功!' : '失败!'}</p>
              <p className="text-sm mt-1">{result.message || result.error}</p>
              {result.success && result.subscription && (
                <div className="mt-2 text-sm">
                  <p>订阅类型: {result.subscription.type === 'yearly' ? '年度' : '月度'}</p>
                  <p>到期时间: {new Date(result.subscription.currentPeriodEnd).toLocaleString('zh-CN')}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={simulateSubscription} 
            disabled={loading || status !== 'authenticated'}
            className="w-full"
          >
            {loading ? '处理中...' : '模拟订阅'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 