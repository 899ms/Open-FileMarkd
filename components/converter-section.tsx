"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useLanguage } from "@/components/language-provider"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Upload, FileType, Check, Download, AlertCircle, Lock, FileUp, ArrowUp } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { downloadMarkdown } from "@/lib/pdf-to-markdown"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { SimpleUsageStatus } from "@/components/simple-usage-status"
import { useSession } from "next-auth/react"

// 定义文件大小限制
const FREE_USER_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const PREMIUM_USER_MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB

export function ConverterSection() {
  const { t, language } = useLanguage()
  const { isAuthenticated, user } = useAuth()
  const { data: session } = useSession() // 直接使用session以确保获取最新状态
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [isConverted, setIsConverted] = useState(false)
  const [markdown, setMarkdown] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    hasSubscription: boolean;
    maxFileSizeMB: number;
    lastSynced?: number; // 添加上次同步时间戳
  }>({ 
    hasSubscription: false, 
    maxFileSizeMB: 5,
    lastSynced: 0
  });

  // 获取用户订阅状态 - 带节流功能
  const fetchSubscriptionStatus = async (forceSync = false) => {
    if (!isAuthenticated) return;
    
    // 检查上次同步时间，除非强制同步，否则10分钟内不重复请求
    const now = Date.now();
    if (!forceSync && subscriptionStatus.lastSynced && (now - subscriptionStatus.lastSynced < 10 * 60 * 1000)) {
      console.log('跳过订阅状态同步，距上次同步时间不足10分钟');
      return;
    }
    
    try {
      const response = await fetch('/api/check-subscription');
      if (response.status === 404) {
        console.warn('订阅API未找到，使用会话数据');
        // 使用会话数据作为备选
        setSubscriptionStatus({
          hasSubscription: session?.user?.hasActiveSubscription === true,
          maxFileSizeMB: session?.user?.hasActiveSubscription === true ? 30 : 5,
          lastSynced: now
        });
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log('订阅状态API返回:', data);
        setSubscriptionStatus({
          hasSubscription: data.hasActiveSubscription === true,
          maxFileSizeMB: data.maxFileSizeMB || 5,
          lastSynced: now
        });
      } else {
        // API错误时回退到会话数据
        setSubscriptionStatus({
          hasSubscription: session?.user?.hasActiveSubscription === true,
          maxFileSizeMB: session?.user?.hasActiveSubscription === true ? 30 : 5,
          lastSynced: now
        });
      }
    } catch (err) {
      console.error('获取订阅状态失败:', err);
      // 出错时使用会话数据
      setSubscriptionStatus({
        hasSubscription: session?.user?.hasActiveSubscription === true,
        maxFileSizeMB: session?.user?.hasActiveSubscription === true ? 30 : 5,
        lastSynced: now
      });
    }
  };
  
  // 组件挂载时获取订阅信息 - 但不频繁请求
  useEffect(() => {
    if (isAuthenticated) {
      // 判断是否需要同步 - 只在会话中hasActiveSubscription变化或首次加载时同步
      const sessionHasSubscription = session?.user?.hasActiveSubscription === true;
      const stateHasSubscription = subscriptionStatus.hasSubscription;
      
      // 只有当订阅状态不一致或首次加载时才同步
      if (sessionHasSubscription !== stateHasSubscription || !subscriptionStatus.lastSynced) {
        fetchSubscriptionStatus(true); // 强制同步
      } else {
        fetchSubscriptionStatus(false); // 基于时间判断是否同步
      }
    }
  }, [isAuthenticated, session?.user?.hasActiveSubscription]);

  // 上传区域点击或拖放前强制同步一次订阅状态（用户即将执行操作）
  const syncSubscriptionBeforeAction = () => {
    // 只在用户可能触发文件上传前同步一次
    if (isAuthenticated) {
      fetchSubscriptionStatus(false); // 非强制，让内部逻辑决定是否需要同步
    }
  };

  // 检查文件大小
  const checkFileSize = (file: File): boolean => {
    // 使用从API获取的订阅状态
    const hasSubscription = subscriptionStatus.hasSubscription;
    const maxFileSizeMB = subscriptionStatus.maxFileSizeMB;
    const maxFileSize = maxFileSizeMB * 1024 * 1024;
    
    // 记录详细的调试信息
    console.log('文件大小检查:', { 
      fileSize: file.size,
      fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
      hasSubscription,
      maxFileSizeMB,
      maxFileSize
    });
    
    if (file.size > maxFileSize) {
      setError(
        t(hasSubscription ? "converter.error.fileSizeExceedsPremium" : "converter.error.fileSizeExceedsFree", {
          size: maxFileSizeMB,
          current: (file.size / (1024 * 1024)).toFixed(2)
        })
      );
      return false;
    }
    return true;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // 验证文件类型
      if (selectedFile.type !== 'application/pdf') {
        setError(t("converter.error.pdfOnly"));
        return;
      }
      
      // 验证文件大小
      if (!checkFileSize(selectedFile)) {
        return;
      }
      
      setFile(selectedFile)
      setIsConverted(false)
      setError(null)
      setMarkdown("")
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
    syncSubscriptionBeforeAction();
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      
      // 验证文件类型
      if (droppedFile.type !== 'application/pdf') {
        setError(t("converter.error.pdfOnly"))
        return;
      }
      
      // 验证文件大小
      if (!checkFileSize(droppedFile)) {
        return;
      }
      
      setFile(droppedFile)
      setIsConverted(false)
      setError(null)
      setMarkdown("")
    }
  }

  const handleUploadClick = () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    
    // 先同步订阅状态，再触发上传
    syncSubscriptionBeforeAction();
    fileInputRef.current?.click();
  }

  const resetFile = () => {
    setFile(null)
    setIsConverted(false)
    setError(null)
    setMarkdown("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleConvert = async () => {
    if (!file) return

    setIsConverting(true)
    setError(null)

    try {
      // 创建FormData对象
      const formData = new FormData()
      formData.append('file', file)

      console.log('开始调用转换API...', { fileName: file.name, fileSize: file.size, fileType: file.type });
      
      // 显式设置API URL路径
      const apiUrl = window.location.origin + '/api/convert';
      console.log('转换API URL:', apiUrl);
      
      // 调用API
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        // 确保包含凭据，这样会话cookie会被发送
        credentials: 'include'
      })

      console.log('API响应状态:', response.status, response.statusText);
      
      // 获取响应文本以进行调试
      const responseText = await response.text();
      console.log('原始响应:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
      
      let responseData;
      try {
        // 尝试解析JSON
        responseData = JSON.parse(responseText);
        console.log('响应数据:', responseData);
      } catch (parseErr) {
        console.error('解析响应失败:', parseErr);
        throw new Error('无法解析API响应');
      }
      
      if (!response.ok) {
        // 如果状态码为404，提供更明确的错误信息
        if (response.status === 404) {
          throw new Error('API端点不存在，请确保服务器已正确配置');
        }
        throw new Error(responseData.error || t("converter.error.default") || `API响应错误: ${response.status}`);
      }

      // 如果响应成功且有markdown字段，设置markdown内容
      if (responseData.markdown) {
        setMarkdown(responseData.markdown);
        setIsConverted(true);
        console.log('转换成功，获取到Markdown内容');
      } else {
        console.error('API响应缺少markdown数据:', responseData);
        throw new Error('API响应缺少markdown数据');
      }
    } catch (err) {
      console.error('转换出错:', err);
      
      // 详细记录错误信息
      if (err instanceof Error) {
        console.error('错误类型:', err.constructor.name);
        console.error('错误消息:', err.message);
        console.error('错误堆栈:', err.stack);
      } else {
        console.error('未知错误类型:', typeof err);
        console.error('错误详情:', JSON.stringify(err));
      }
      
      // 定制化错误消息
      let errorMessage = (err as Error).message || t("converter.error.default");
      
      // 针对常见错误提供更友好的消息
      if (errorMessage.includes('404') || errorMessage.includes('不存在')) {
        errorMessage = "API端点不存在，请检查服务器配置和路由";
      } else if (errorMessage.includes('用户信息获取失败')) {
        errorMessage = "无法获取用户信息，请尝试重新登录";
      } else if (errorMessage.includes('无法解析API响应')) {
        errorMessage = "服务器响应格式错误，请联系管理员";
      }
      
      setError(errorMessage);
    } finally {
      setIsConverting(false)
    }
  }

  const handleDownload = () => {
    if (file && markdown) {
      downloadMarkdown(markdown, file.name)
    }
  }

  return (
    <section id="converter" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-primary">{t("converter.title")}</h2>
          </div>
        </div>
        <div className="mx-auto max-w-3xl mt-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>{t("converter.upload")}</CardTitle>
              <CardDescription>
                <div className="text-xs text-muted-foreground">
                  <AlertCircle className="h-3 w-3 inline-block mr-1" />
                  {isAuthenticated 
                    ? t(subscriptionStatus.hasSubscription 
                        ? "converter.fileLimitPremium" 
                        : "converter.fileLimitFree")
                    : t("converter.fileLimitLogin")}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 cursor-pointer ${
                  isDragging 
                    ? "border-primary bg-primary/10 scale-[1.02] shadow-lg" 
                    : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/10"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadClick}
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className={`rounded-full p-4 transition-all duration-200 ${
                    isDragging ? "bg-primary/20" : "bg-muted"
                  }`}>
                    {file ? (
                      <FileType className="h-8 w-8 text-primary" />
                    ) : (
                      <Upload className={`h-8 w-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                    )}
                  </div>
                  {file ? (
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {file.size > 1024 * 1024 
                          ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
                          : `${(file.size / 1024).toFixed(2)} KB`}
                      </p>
                      <div className="flex flex-col space-y-2 mt-3">
                        <div className="text-xs text-muted-foreground">
                          {subscriptionStatus.hasSubscription 
                            ? t("converter.yourLimitPremium") 
                            : t("converter.yourLimitFree")}
                        </div>
                        <Button
                          onClick={handleConvert}
                          className="mt-1"
                          disabled={isConverting}
                        >
                          {isConverting ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {t("converter.converting")}
                            </span>
                          ) : (
                            t("converter.convert")
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                      />
                      <p className="text-sm font-medium">{isDragging ? t("converter.dropHere") : t("converter.clickOrDrop")}</p>
                      
                      {isAuthenticated && (
                        <div className="mt-3 pt-2 w-full">
                          <SimpleUsageStatus />
                        </div>
                      )}
                      
                      {!isAuthenticated && (
                        <div className="flex flex-col items-center mt-2">
                          <Link href="/login" className="text-xs text-primary hover:underline">
                            {t("converter.loginForMoreFeatures")}
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <Alert className="mt-4 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900">
                  <AlertDescription className="text-red-600 dark:text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {isConverted && markdown && (
                <div className="mt-6">
                  <div className="font-medium mb-2">{t("converter.preview")}</div>
                  <div className="border rounded-md p-4 whitespace-pre-wrap overflow-auto max-h-[400px] markdown-content bg-background text-foreground">
                    {markdown}
                  </div>
                  <div className="mt-4 text-center">
                    <Button onClick={handleDownload}>
                      <Download className="mr-2 h-4 w-4" />
                      {t("converter.download")}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 登录提示对话框 */}
        <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <DialogContent className="sm:max-w-md bg-dialog-content text-foreground">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-xl text-foreground">{t("auth.loginRequired")}</DialogTitle>
              <DialogDescription className="text-base pt-2 text-muted-foreground opacity-100">
                {t("auth.loginToUseConverter")}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 bg-background/50 rounded-md p-4 border border-border">
              <h4 className="text-sm font-medium mb-3 text-foreground">
                {t("auth.loginBenefits")}
              </h4>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-foreground">
                  <Check className="h-4 w-4 mr-2 text-green-600 dark:text-green-500" />
                  {t("auth.benefit1")}
                </li>
                <li className="flex items-center text-sm text-foreground">
                  <Check className="h-4 w-4 mr-2 text-green-600 dark:text-green-500" />
                  {t("auth.benefit2")}
                </li>
                <li className="flex items-center text-sm text-foreground">
                  <Check className="h-4 w-4 mr-2 text-green-600 dark:text-green-500" />
                  {t("auth.benefit3")}
                </li>
              </ul>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-3 mt-2">
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button 
                  onClick={() => router.push("/login")} 
                  className="w-full"
                >
                  {t("auth.login")}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/register")} 
                  className="w-full"
                >
                  {t("auth.register")}
                </Button>
              </div>
              <Button 
                variant="link" 
                onClick={() => setShowLoginDialog(false)}
                className="text-sm mt-1 sm:mt-0"
              >
                {t("auth.continueAsGuest")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
