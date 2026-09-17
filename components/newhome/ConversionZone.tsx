import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { ConversionResult, BlockAnalysis } from './ConversionWorkspace';

export interface PresetSample {
  id: string;
  title: string;
  category: string;
  categoryKey: 'sampleAcademic' | 'sampleFinancial' | 'sampleInvoice';
  format: string;
  fileSize: string;
  icon: string;
  description: string;
  sourcePreviewUrl?: string;
  sampleContent: string;
  blocks: BlockAnalysis[];
}

const SAMPLE_DEFS: Array<Omit<PresetSample, 'category' | 'description'> & { categoryKey: PresetSample['categoryKey']; descKey: 'sampleAcademicDesc' | 'sampleFinancialDesc' | 'sampleInvoiceDesc' }> = [
  {
    id: 'sample-academic',
    title: 'Quantum_Neural_Architecture_2024.pdf',
    categoryKey: 'sampleAcademic' as const,
    format: 'PDF',
    fileSize: '2.4 MB',
    icon: 'article',
    descKey: 'sampleAcademicDesc',
    sampleContent: `# Quantum-Enhanced Neural Architecture for Multimodal Document Processing

> **Authors:** Dr. Sarah Li, Alex Zhang, Michael Chen
> **Affiliation:** Institute for Advanced Visual Intelligence & Document Computing
> **Date:** October 2024 | **DOI:** 10.1038/s41586-024-08129-x

---

## 1. Abstract

We present a unified multimodal Transformer architecture capable of directly parsing unstructured document scans into standardized structured Markdown. By coupling optical layout bounding with fine-grained cross-attention semantic segmentation, our system achieves state-of-the-art token reconstruction fidelity.

## 2. Mathematical Formulation & Latency Model

The system optimization metric $\\mathcal{L}_{total}$ combines spatial boundary loss with token sequence cross-entropy:

$$\\mathcal{L}_{total} = \\alpha \\mathcal{L}_{spatial}(\\hat{B}, B) + \\beta \\sum_{t=1}^{T} -\\log P(y_t | y_{<t}, X_{vis})$$

## 3. Benchmark Evaluation Results

The performance was evaluated across 40 distinct document classes against top-tier OCR baselines:

| Model Architecture | OCR Precision (%) | Table Fidelity (IoU) | Math Equation Acc (%) | Mean Latency (ms) | 
| :--- | :--- | :--- | :--- | :--- | 
| **Traditional OCR Baseline** | 87.4% | 0.62 | 64.2% | 840ms | 
| **LayoutLM-v3 Enhanced** | 94.1% | 0.81 | 82.5% | 420ms |
| **FileMarkd AI** | **99.3%** | **0.97** | **98.8%** | **95ms** | 

### Key Architectural Highlights:
- **Zero-loss Reading Order:** Reconstructs multi-column and floating sidebars seamlessly.
- **Smart Footnote & Header Discard:** Clean output stripped of repetitive page numbers.
- **Native LaTeX Equation Extraction:** Preserves inline $\$E=mc^2\$$ and complex multi-line displays.`,
    blocks: [
      { id: 'b1', type: 'Header', readingOrder: 1, confidence: 1.0, content: '# Quantum-Enhanced Neural Architecture for Multimodal Document Processing' },
      { id: 'b2', type: 'Metadata', readingOrder: 2, confidence: 0.99, content: '> Authors: Dr. Sarah Li, Alex Zhang, Michael Chen' },
      { id: 'b3', type: 'Header', readingOrder: 3, confidence: 0.99, content: '## 1. Abstract' },
      { id: 'b4', type: 'Paragraph', readingOrder: 4, confidence: 0.99, content: 'We present a unified multimodal Transformer architecture capable of directly parsing unstructured document scans...' },
      { id: 'b5', type: 'Header', readingOrder: 5, confidence: 0.98, content: '## 2. Mathematical Formulation & Latency Model' },
      { id: 'b6', type: 'Equation', readingOrder: 6, confidence: 0.97, content: '$$\\mathcal{L}_{total} = \\alpha \\mathcal{L}_{spatial}(\\hat{B}, B) + \\beta \\sum_{t=1}^{T} -\\log P(y_t | y_{<t}, X_{vis})$$' },
      { id: 'b7', type: 'Equation', readingOrder: 7, confidence: 0.96, content: '$$\\eta = \sum_{i=1}^{n} \\frac{\\text{Precision}_i}{\\text{Latency}_i} \\times \left( 1 - e^{-\lambda \cdot \kappa_i} \right)$$' },
      { id: 'b8', type: 'Header', readingOrder: 8, confidence: 0.99, content: '## 3. Benchmark Evaluation Results' },
      { id: 'b9', type: 'Table', readingOrder: 9, confidence: 0.98, content: '| Model Architecture | OCR Precision (%) | Table Fidelity (IoU) | Math Equation Acc (%) | Mean Latency (ms) |' },
      { id: 'b10', type: 'List', readingOrder: 10, confidence: 1.0, content: '- Zero-loss Reading Order\n- Smart Footnote & Header Discard\n- Native LaTeX Equation Extraction' }
    ]
  },
  {
    id: 'sample-financial',
    title: 'Q3_Global_Financial_Report.xlsx',
    categoryKey: 'sampleFinancial' as const,
    format: 'Excel',
    fileSize: '1.1 MB',
    icon: 'table_chart',
    descKey: 'sampleFinancialDesc',
    sampleContent: `# 2024 Q3 集团财务与业务增长综合分析报告

**报告周期:** 2024年7月1日 - 2024年9月30日
**审计单位:** FileMarkd Financial Intelligence Group
**保密等级:** 商业机密 (Confidential)

---

## 一、 核心财务指标摘要 (Core Financial Metrics)

本季度集团总营收达到 **$142.8M**，同比增长 **28.4%**，净利润率攀升至 **21.2%**。

| 业务板块 (Segment) | Q3 营收 (USD) | 环比增长 (QoQ) | 同比增长 (YoY) | 毛利率 (Gross Margin) | 运营状态 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **企业级 SaaS 订阅** | $84.2M | +14.2% | +36.5% | 78.4% | \`[超额达成]\` |
| **API Token 算力服务** | $38.6M | +22.8% | +48.1% | 62.1% | \`[强劲增长]\` |
| **私有化模型部署** | $20.0M | +5.1% | +8.2% | 54.0% | \`[平稳推进]\` |
| **总计 / 平均** | **$142.8M** | **+15.3%** | **+28.4%** | **68.2%** | \`[健康运营]\` |

## 二、 区域市场表现与成本开支

\`\`\`json
{
  "regional_distribution": {
    "North_America": { "revenue_share": "45%", "growth": "+22%" },
    "Asia_Pacific": { "revenue_share": "35%", "growth": "+38%" },
    "Europe": { "revenue_share": "20%", "growth": "+15%" }
  },
  "rnd_investment_ratio": "18.5%"
}
\`\`\`

> **管理层评语:** "AI 模型效率与端到端转换工具的大规模普及为企业客户削减了 70% 以上的手工录入成本。"`,
    blocks: [
      { id: 'fb1', type: 'Header', readingOrder: 1, confidence: 1.0, content: '# 2024 Q3 集团财务与业务增长综合分析报告' },
      { id: 'fb2', type: 'Paragraph', readingOrder: 2, confidence: 0.99, content: '报告周期: 2024年7月1日 - 2024年9月30日' },
      { id: 'fb3', type: 'Header', readingOrder: 3, confidence: 0.99, content: '## 一、 核心财务指标摘要 (Core Financial Metrics)' },
      { id: 'fb4', type: 'Table', readingOrder: 4, confidence: 0.97, content: '| 业务板块 (Segment) | Q3 营收 (USD) | 环比增长 (QoQ) | 同比增长 (YoY) |' },
      { id: 'fb5', type: 'Code', readingOrder: 5, confidence: 1.0, content: '```json\n{\n  "regional_distribution": ...\n}\n```' },
      { id: 'fb6', type: 'Paragraph', readingOrder: 6, confidence: 0.98, content: '> 管理层评语: "AI 模型效率与端到端转换工具的大规模普及为企业客户削减了 70% 以上的手工录入成本。"' }
    ]
  },
  {
    id: 'sample-invoice',
    title: 'Commercial_Invoice_INV-88921.png',
    categoryKey: 'sampleInvoice' as const,
    format: 'PNG',
    fileSize: '820 KB',
    icon: 'receipt_long',
    descKey: 'sampleInvoiceDesc',
    sampleContent: `# 商业增值税发票凭证 (Tax Commercial Invoice)

- **发票号码:** \`INV-2024-88921\`
- **开票日期:** 2024-10-18
- **销售方:** FileMarkd Cloud Services Inc.
- **购买方:** TechNova Innovations Ltd.
- **税号 (VAT ID):** \`US9481028491\`

---

## 费用明细清单

| 项目编号 | 服务描述 | 单价 (USD) | 数量 | 适用税率 | 合计金额 (USD) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | FileMarkd Pro 企业年费席位 (x5) | $99.00 | 5 | 0% | $495.00 |
| **02** | 离线专属 OCR 模型算力包 (10k 积分) | $120.00 | 1 | 6% | $127.20 |
| **03** | 专属 API SLA 支持保障 (年度) | $300.00 | 1 | 6% | $318.00 |

### 汇总计算:
- **小计 (Subtotal):** $915.00
- **增值税 (VAT 6%):** $25.20
- **最终应付总额 (Total Due):** **$940.20**
- **支付状态:** \`已全额结算 (PAID IN FULL)\``,
    blocks: [
      { id: 'ib1', type: 'Header', readingOrder: 1, confidence: 0.99, content: '# 商业增值税发票凭证 (Tax Commercial Invoice)' },
      { id: 'ib2', type: 'List', readingOrder: 2, confidence: 1.0, content: '- 发票号码: INV-2024-88921\n- 开票日期: 2024-10-18' },
      { id: 'ib3', type: 'Header', readingOrder: 3, confidence: 0.99, content: '## 费用明细清单' },
      { id: 'ib4', type: 'Table', readingOrder: 4, confidence: 0.98, content: '| 项目编号 | 服务描述 | 单价 (USD) | 数量 | 适用税率 | 合计金额 (USD) |' },
      { id: 'ib5', type: 'Paragraph', readingOrder: 5, confidence: 0.99, content: '最终应付总额 (Total Due): $940.20' }
    ]
  }
];

interface ConversionZoneProps {
  onConversionComplete: (result: ConversionResult) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  filterFormat?: string | null;
}

function estimatePdfPages(fileData: string, fileName: string) {
  if (!fileName.toLowerCase().endsWith('.pdf') || !fileData.startsWith('data:')) return undefined;
  try {
    const encoded = fileData.slice(fileData.indexOf(',') + 1);
    const pdf = atob(encoded).slice(0, 8 * 1024 * 1024);
    const pages = pdf.match(/\/Type\s*\/Page(?!s)\b/g)?.length || 0;
    return pages > 0 ? pages : undefined;
  } catch {
    return undefined;
  }
}

export const ConversionZone: React.FC<ConversionZoneProps> = ({
  onConversionComplete,
  onShowToast = (msg) => console.warn('[ConversionZone] onShowToast missing:', msg),
  filterFormat
}) => {
  const t = useTranslations('conversionZone');
  const { status: sessionStatus } = useSession();
  const [planTier, setPlanTier] = useState<'guest' | 'registered' | 'trial' | 'subscribed' | 'loading'>('loading');

  useEffect(() => {
    if (sessionStatus === 'loading') {
      setPlanTier('loading');
      return;
    }
    if (sessionStatus !== 'authenticated') {
      setPlanTier('guest');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/user/subscription');
        if (cancelled) return;
        if (!res.ok) {
          setPlanTier('registered');
          return;
        }
        const data = await res.json();
        const isActive =
          data?.subscriptionStatus === 'active' &&
          data?.subscriptionCurrentPeriodEnd &&
          new Date(data.subscriptionCurrentPeriodEnd) > new Date();
        if (!isActive) {
          setPlanTier('registered');
          return;
        }
        if (data.subscriptionPlan === 'trial') {
          setPlanTier('trial');
        } else if (data.subscriptionPlan === 'pro' || data.subscriptionPlan === 'annual') {
          setPlanTier('subscribed');
        } else {
          setPlanTier('registered');
        }
      } catch {
        if (!cancelled) setPlanTier('registered');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionStatus]);

  const subtitleText = (() => {
    if (planTier === 'guest') return t('dropzone.subtitle_registered');
    if (planTier === 'trial') return t('dropzone.subtitle_trial');
    if (planTier === 'subscribed') return t('dropzone.subtitle_subscribed');
    if (planTier === 'registered') return t('dropzone.subtitle_registered');
    return t('dropzone.subtitle_registered');
  })();

  const PRESET_SAMPLES: PresetSample[] = SAMPLE_DEFS.map(def => ({
    id: def.id,
    title: def.title,
    category: t(`categories.${def.categoryKey}`),
    categoryKey: def.categoryKey,
    format: def.format,
    fileSize: def.fileSize,
    icon: def.icon,
    description: t(def.descKey),
    sampleContent: def.sampleContent,
    blocks: def.blocks
  }));

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingFileName, setProcessingFileName] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 统一的登录守卫。所有转换入口都应该先调用它。
   * - 未登录：弹 toast 提示，返回 false
   * - 加载中：静默拒绝（避免在 session 还没就绪时误判为已登录或未登录）
   * - 已登录：放行，返回 true
   */
  const requireAuth = (): boolean => {
    if (sessionStatus === 'unauthenticated') {
      onShowToast(t('toast.loginRequired'), 'error');
      return false;
    }
    if (sessionStatus !== 'authenticated') {
      return false;
    }
    return true;
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
    // Reset so selecting the same file again still triggers onChange
    if (e.target) e.target.value = '';
  };

  const handleSelectFileClick = () => {
    if (!requireAuth()) return;
    fileInputRef.current?.click();
  };

  const processSelectedFile = async (file: File) => {
    if (!requireAuth()) return;

    if (file.size > 50 * 1024 * 1024) {
      onShowToast(t('toast.fileTooLarge'), 'error');
      return;
    }

    setProcessingFileName(file.name);
    setIsProcessing(true);
    setProgress(10);

    const isImage = file.type.startsWith('image/') ||
      /\.(png|jpe?g|gif|webp|avif|bmp|tiff?|heic|heif)$/i.test(file.name);
    const isText = file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.tex') || file.name.endsWith('.ipynb');

    const reader = new FileReader();

    reader.onload = async () => {
      let progressTimer: ReturnType<typeof setInterval> | undefined;
      let uploadFailed = false;
      let uploadErrorCode: string | undefined;
      let uploadMaxFileSize: number | undefined;
      let conversionErrorCode: string | undefined;
      try {
        const fileData = reader.result as string;

        progressTimer = setInterval(() => {
          setProgress(prev => {
            if (prev >= 85) {
              clearInterval(progressTimer);
              return 85;
            }
            return prev + Math.floor(Math.random() * 18) + 8;
          });
        }, 220);

        const payload: any = {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
          sourceType: isImage ? 'image' : isText ? 'text' : 'document'
        };

        if (isImage || file.type.includes('pdf')) {
          payload.fileData = fileData;
        } else if (isText) {
          payload.rawText = fileData;
        } else {
          payload.fileData = fileData;
        }
        const estimatedPages = isImage || isText
          ? 1
          : estimatePdfPages(fileData, file.name);
        if (estimatedPages) payload.pageCount = estimatedPages;

        // Persist the original file in R2 before starting conversion. The
        // conversion payload keeps its existing shape for compatibility.
        const uploadBody = new FormData();
        uploadBody.append('file', file, file.name);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadBody,
        });

        if (!uploadRes.ok) {
          uploadFailed = true;
          const uploadError = await uploadRes.json().catch(() => ({}));
          uploadErrorCode = uploadError.error;
          uploadMaxFileSize = uploadError.maxFileSize;
          throw new Error('file upload failed');
        }

        const uploadData = await uploadRes.json();
        payload.uploadKey = uploadData.key;
        // When R2 exposes a public URL, pass it to the OCR endpoint so PDFs
        // can be processed using Mistral's document_url input. Private buckets
        // fall back to the inline data URL instead.
        if (typeof uploadData.url === 'string' && uploadData.url) {
          payload.fileUrl = uploadData.url;
        }

        const res = await fetch('/api/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        clearInterval(progressTimer);

        if (res.ok) {
          const data = await res.json();
          setProgress(100);
          setTimeout(() => {
            setIsProcessing(false);
            // Build a previewUrl that always reflects what the user actually
            // uploaded. For any binary file the local FileReader result is
            // already a data URL (data:image/..., data:application/pdf, ...,
            // data:application/vnd.openxmlformats-officedocument...). Just
            // use it directly so the left panel can render the original
            // bytes without depending on R2's public host.
            let previewUrl: string | undefined;
            if (isText) {
              const text = typeof fileData === 'string' && fileData.startsWith('data:')
                ? atob(fileData.split(',')[1] || '')
                : (fileData as string);
              const base64 = typeof window !== 'undefined'
                ? window.btoa(unescape(encodeURIComponent(text)))
                : '';
              previewUrl = `data:text/plain;charset=utf-8;base64,${base64}`;
            } else {
              // image, pdf, docx, pptx, xlsx, csv, ods, odp, odt, ...
              previewUrl = fileData;
            }
            if (!previewUrl && typeof data.result?.previewUrl === 'string') {
              previewUrl = data.result.previewUrl;
            }
            console.log('[preview]', { name: file.name, type: file.type, isImage, isText, previewUrlPrefix: previewUrl?.slice(0, 60), hasData: !!fileData });
            onConversionComplete({
              ...data.result,
              previewUrl,
            });
            onShowToast(t('toast.conversionComplete', { name: file.name }), 'success');
          }, 450);
        } else {
          const conversionError = await res.json().catch(() => ({}));
          conversionErrorCode = conversionError.error;
          throw new Error('conversion api error');
        }
      } catch (err: any) {
        console.error('File conversion error:', err);
        if (progressTimer) clearInterval(progressTimer);

        if (uploadFailed) {
          setIsProcessing(false);
          if (uploadErrorCode === 'file_too_large' && uploadMaxFileSize) {
            onShowToast(t('toast.fileTooLargeForPlan', {
              size: Math.round(uploadMaxFileSize / (1024 * 1024)),
            }), 'error');
          } else if (uploadErrorCode === 'unsupported_file_type') {
            onShowToast(t('toast.unsupportedFileType'), 'error');
          } else if (uploadErrorCode === 'unauthorized') {
            onShowToast(t('toast.loginRequired'), 'error');
          } else {
            onShowToast(t('toast.uploadFailed'), 'error');
          }
          return;
        }

        if (conversionErrorCode === 'points_insufficient') {
          setIsProcessing(false);
          onShowToast(t('toast.pointsInsufficient'), 'error');
          return;
        }

        if (conversionErrorCode === 'mistral_unauthorized') {
          setIsProcessing(false);
          onShowToast(t('toast.conversionFailedUnauthorized'), 'error');
          return;
        }
        if (conversionErrorCode === 'mistral_rate_limited') {
          setIsProcessing(false);
          onShowToast(t('toast.conversionFailedRateLimited'), 'error');
          return;
        }
        if (conversionErrorCode === 'mistral_unavailable') {
          setIsProcessing(false);
          onShowToast(t('toast.conversionFailedUnavailable'), 'error');
          return;
        }

        setIsProcessing(false);
        onShowToast(t('toast.conversionFailed'), 'error');
      }
    };

    // Always read the file into memory as a data URL so the left panel can
    // render the exact bytes the user uploaded. text/plain formats use
    // readAsText and are wrapped into a text/plain data URL below; all
    // other formats (image, pdf, office, etc.) use readAsDataURL.
    if (isText) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const handleUrlImport = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      onShowToast(t('toast.invalidUrl'), 'info');
      return;
    }

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      onShowToast(t('toast.urlInvalidFormat'), 'error');
      return;
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      onShowToast(t('toast.urlInvalidFormat'), 'error');
      return;
    }

    // URL imports call the real OCR pipeline (no R2 upload, but still
    // chargeable), so they require authentication just like file uploads.
    if (!requireAuth()) return;

    const inferredName = parsed.pathname.split('/').filter(Boolean).pop() || 'remote-document';
    const fileName = inferredName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'remote-document';
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    const sourceType: 'image' | 'pdf' | 'text' | 'document' = (() => {
      if (['jpg', 'jpeg', 'png', 'avif', 'tiff', 'gif', 'heic', 'bmp', 'webp'].includes(extension)) return 'image';
      if (extension === 'pdf') return 'pdf';
      if (['txt', 'md', 'tex', 'csv', 'xml', 'json'].includes(extension)) return 'text';
      return 'document';
    })();

    setProcessingFileName(fileName);
    setIsProcessing(true);
    setProgress(15);

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 88) {
          clearInterval(progressTimer);
          return 88;
        }
        return prev + 12;
      });
    }, 220);

    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentUrl: parsed.toString(),
          fileName,
          fileSize: 0,
          sourceType,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({} as Record<string, unknown>));
        const code = typeof errBody.error === 'string' ? errBody.error : 'conversion_failed';
        const maxSize = typeof errBody.maxFileSize === 'number' ? errBody.maxFileSize : undefined;
        throw Object.assign(new Error(code), { code, maxSize });
      }

      const data = await res.json();
      clearInterval(progressTimer);
      setProgress(100);
      setTimeout(() => {
        setIsProcessing(false);
        // For URL imports the preview is the remote URL itself: images load
        // straight into <img>, PDFs render via the browser's built-in viewer,
        // and other formats (DOCX/PPTX/...) get passed to <iframe> the same
        // way the upload path does. The Workspace renderer already detects
        // the right branch from the URL extension / MIME prefix.
        const previewUrl = parsed.toString();
        onConversionComplete({
          ...data.result,
          sourceType,
          previewUrl,
        });
        setUrlInput('');
        onShowToast(t('toast.urlSuccess'), 'success');
      }, 400);
    } catch (err) {
      clearInterval(progressTimer);
      setIsProcessing(false);
      const code = err instanceof Error ? err.message : 'conversion_failed';
      const toastFor = (key: string) => onShowToast(t(key), 'error');
      switch (code) {
        case 'invalid_url':
          toastFor('toast.urlInvalidFormat');
          break;
        case 'url_blocked':
          toastFor('toast.urlBlocked');
          break;
        case 'url_unreachable':
          toastFor('toast.urlUnreachable');
          break;
        case 'unsupported_url_format':
          toastFor('toast.urlUnsupportedFormat');
          break;
        case 'inline_too_large':
          onShowToast(t('toast.inlineTooLarge'), 'error');
          break;
        case 'url_too_large': {
          const sizeMb = Math.round(((err as { maxSize?: number }).maxSize ?? 50 * 1024 * 1024) / (1024 * 1024));
          onShowToast(t('toast.urlTooLarge', { size: sizeMb }), 'error');
          break;
        }
        case 'points_insufficient':
          toastFor('toast.pointsInsufficient');
          break;
        case 'unauthorized':
          toastFor('toast.loginRequired');
          break;
        default:
          toastFor('toast.conversionFailed');
      }
    }
  };

  const handleSelectPreset = (sample: PresetSample) => {
    setProcessingFileName(sample.title);
    setIsProcessing(true);
    setProgress(20);

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 92) {
          clearInterval(progressTimer);
          return 92;
        }
        return prev + 22;
      });
    }, 150);

    setTimeout(() => {
      clearInterval(progressTimer);
      setProgress(100);
      setTimeout(() => {
        setIsProcessing(false);
        const result: ConversionResult = {
          id: sample.id,
          fileName: sample.title,
          fileSize: 1024 * 1024 * 2.1,
          format: sample.format,
          markdownText: sample.sampleContent,
          confidence: 0.991,
          wordCount: sample.sampleContent.trim().split(/\s+/).length,
          charCount: sample.sampleContent.length,
          readingTimeMinutes: 2,
          blocksCount: {
            headers: sample.blocks.filter(b => b.type === 'Header').length,
            paragraphs: sample.blocks.filter(b => b.type === 'Paragraph').length,
            tables: sample.blocks.filter(b => b.type === 'Table').length,
            equations: sample.blocks.filter(b => b.type === 'Equation').length,
            lists: sample.blocks.filter(b => b.type === 'List').length
          },
          blocks: sample.blocks,
          detectedLanguage: 'zh/en',
          timeElapsedMs: 640,
          sourceType: sample.format === 'PNG' ? 'image' : 'document'
        };
        onConversionComplete(result);
        onShowToast(t('toast.sampleLoaded', { name: sample.title }), 'success');
      }, 350);
    }, 1000);
  };

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <section className="relative z-10 w-full mt-32 sm:mt-40 py-16 scroll-mt-24" id="conversion">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="w-full max-w-5xl mx-auto">
          <div className="bg-[#f8f9ff]/60 dark:bg-slate-900/60 rounded-[2rem] border border-slate-300/80 dark:border-slate-800 overflow-hidden shadow-xl backdrop-blur-md">

            <div className="bg-slate-100/90 dark:bg-slate-800/90 px-6 py-4 border-b border-slate-200 dark:border-slate-700/80 flex justify-between items-center select-none">
              <div className="flex gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-500/80"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400/90"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/80"></div>
              </div>
              <div className="font-mono text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                {t('header.title')}
              </div>
              <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-md">
                {t('header.status')}
              </div>
            </div>

            <div className="p-6 sm:p-10 min-h-[520px] flex flex-col items-center justify-center relative bg-white/40 dark:bg-slate-950/40">

              {!isProcessing ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  className={`w-full border-[3px] border-dashed rounded-3xl flex flex-col items-center justify-center transition-all p-8 sm:p-14 text-center group relative overflow-hidden ${
                    isDragging
                      ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/50 scale-[0.99] shadow-lg shadow-emerald-600/10'
                      : 'border-emerald-600/30 dark:border-emerald-500/30 hover:border-emerald-600 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.csv,.txt,.epub,.xml,.rtf,.odt,.bib,.fb2,.ipynb,.tex,.opml,.jpg,.jpeg,.png,.avif,.tiff,.gif,.heic,.bmp,.webp"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  <div className="w-16 h-16 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/80 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-3xl">
                      upload_file
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold font-headline text-slate-900 dark:text-slate-50 mb-2">
                    {t('dropzone.title')}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mb-8">
                    {subtitleText}
                  </p>

                  <button
                    onClick={handleSelectFileClick}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-4 rounded-2xl font-headline text-base sm:text-lg font-semibold hover:shadow-xl hover:shadow-emerald-700/30 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-2xl">file_open</span>
                    {t('dropzone.selectFile')}
                  </button>

                  <div className="mt-8 w-full max-w-md flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUrlImport()}
                      placeholder={t('dropzone.urlPlaceholder')}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                    />
                    <button
                      onClick={handleUrlImport}
                      className="bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-3 rounded-xl font-mono text-sm font-medium hover:shadow-md active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                    >
                      {t('dropzone.import')}
                    </button>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 w-full max-w-2xl">
                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider flex items-center justify-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-emerald-600">bolt</span>
                      {t('dropzone.presetHint')}
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {PRESET_SAMPLES.map((sample) => (
                        <button
                          key={sample.id}
                          onClick={() => handleSelectPreset(sample)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-emerald-950/80 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <span className="material-symbols-outlined text-emerald-600 text-sm">
                            {sample.icon}
                          </span>
                          <span>{sample.category}</span>
                          <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-slate-900 px-1.5 py-0.5 rounded">
                            {sample.format}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 w-full max-w-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
                      <span className="material-symbols-outlined text-emerald-600 text-base">lock</span>
                      {t('dropzone.securityNotice')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in zoom-in-95 duration-300">
                  <div className="relative w-36 h-36 mb-8">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        className="text-slate-200 dark:text-slate-800 stroke-current"
                        cx="50"
                        cy="50"
                        fill="transparent"
                        r={radius}
                        strokeWidth="6"
                      />
                      <circle
                        className="text-emerald-600 dark:text-emerald-400 stroke-current transition-all duration-300"
                        cx="50"
                        cy="50"
                        fill="transparent"
                        r={radius}
                        strokeWidth="6"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold font-headline text-emerald-700 dark:text-emerald-400">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </div>

                  <h4 className="text-2xl font-bold font-headline text-slate-900 dark:text-slate-100 mb-2">
                    {t('processing.title')}
                  </h4>
                  <p className="text-sm font-mono text-slate-500 dark:text-slate-400 mb-8 max-w-md truncate">
                    {processingFileName}
                  </p>

                  <div className="w-full max-w-md space-y-3">
                    <div className="flex justify-between items-center text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      <span>{t('processing.stageLabel')}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        {t('processing.running')}
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500/80 w-full shimmer-bar"></div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
