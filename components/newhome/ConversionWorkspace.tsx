import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import confetti from 'canvas-confetti';
import { useTranslations } from 'next-intl';

export interface BlockAnalysis {
  id: string;
  type: 'Header' | 'Paragraph' | 'Table' | 'List' | 'Equation' | 'Footer' | 'Code' | 'Metadata';
  readingOrder: number;
  confidence: number;
  content: string;
  notes?: string;
}

export interface ConversionResult {
  id: string;
  fileName: string;
  fileSize: number;
  format: string;
  markdownText: string;
  confidence: number;
  wordCount: number;
  charCount: number;
  readingTimeMinutes: number;
  blocksCount: {
    headers: number;
    paragraphs: number;
    tables: number;
    equations: number;
    lists: number;
  };
  blocks: BlockAnalysis[];
  detectedLanguage: string;
  timeElapsedMs: number;
  previewUrl?: string;
  sourceType: 'image' | 'pdf' | 'document' | 'text' | 'url';
  // ── Raw Mistral OCR data (present when include_blocks=true / confidence
  // scores granularity is set / extract_header/footer is true).  Underscore
  // prefix marks them as internal / optional. ──────────────────────────
  _mistralBlocks?: unknown[];
  _mistralTables?: unknown[];
  _mistralConfidenceScores?: unknown[];
  _mistralHeaders?: string[];
  _mistralFooters?: string[];
}

interface ConversionWorkspaceProps {
  result: ConversionResult;
  onReset: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ConversionWorkspace: React.FC<ConversionWorkspaceProps> = ({
  result,
  onReset,
  onShowToast = (msg) => console.warn('[ConversionWorkspace] onShowToast missing:', msg)
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'raw'>('preview');
  const t = useTranslations('conversionWorkspace');
  const tTabs = useTranslations('conversionWorkspace.tabs');
  const tViewMode = useTranslations('conversionWorkspace.viewMode');
  const tActions = useTranslations('conversionWorkspace.actions');
  const tSource = useTranslations('conversionWorkspace.sourcePanel');
  const tEditor = useTranslations('conversionWorkspace.editor');
  const tStatus = useTranslations('conversionWorkspace.statusBar');
  const tToast = useTranslations('conversionWorkspace.toast');
  const [markdownContent, setMarkdownContent] = useState(result.markdownText);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'markdown'>('split');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Convert any data: URL into a blob URL once per result.
  //
  // Why: when the user uploads a PDF (e.g. arxiv sample with embedded
  // images referenced as "img-0.jpeg"), Firefox's built-in PDF viewer
  // resolves those relative URLs against the parent document's origin
  // (filemarkd.vercel.app) instead of the PDF itself — so every embedded
  // image request hits our Next.js router as a 404.  Blob URLs are opaque
  // origins, so the relative URLs in the PDF resolve against the blob
  // scheme and never touch our app's routes.
  const safePreviewUrl = useMemo(() => {
    const raw = result.previewUrl;
    if (!raw || typeof raw !== 'string') return raw;
    if (!/^data:/i.test(raw)) return raw; // already an http(s) URL — safe
    try {
      const [meta = '', b64 = ''] = raw.split(',');
      const mimeMatch = /data:([^;]+)(;base64)?/i.exec(meta);
      const mime = mimeMatch?.[1] ?? 'application/octet-stream';
      const isBase64 = /;base64/i.test(meta);
      const bytes = isBase64
        ? Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
        : new TextEncoder().encode(decodeURIComponent(b64));
      const blob = new Blob([bytes], { type: mime });
      return URL.createObjectURL(blob);
    } catch {
      return raw; // fall back to original on any decoding error
    }
  }, [result.previewUrl]);

  // Revoke the blob URL when the component unmounts or the preview changes.
  useEffect(() => {
    return () => {
      if (
        safePreviewUrl &&
        typeof safePreviewUrl === 'string' &&
        safePreviewUrl.startsWith('blob:')
      ) {
        try { URL.revokeObjectURL(safePreviewUrl); } catch { /* ignore */ }
      }
    };
  }, [safePreviewUrl]);

  useEffect(() => {
    setMarkdownContent(result.markdownText);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {
      // ignore
    }
  }, [result]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      setCopied(true);
      onShowToast(tToast('copySuccess'), 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast(tToast('copyFailed'), 'error');
    }
  };

  const handleDownloadMd = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const nameWithoutExt = result.fileName.replace(/\.[^/.]+$/, '');
    a.href = url;
    a.download = `${nameWithoutExt}.md`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast(tToast('downloadSuccess', { name: nameWithoutExt }), 'success');
  };

  const handleExportTxt = () => {
    const txtContent = markdownContent;
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.fileName.replace(/\.[^/.]+$/, '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast(tToast('txtExported'), 'success');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-24 animate-in fade-in slide-in-from-bottom-6 duration-500">
      
      {/* Workspace Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300/80 dark:border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Top Workspace Header Bar */}
        <div className="bg-slate-50 dark:bg-slate-950/80 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-mono font-bold text-xs">
              {result.format}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 font-headline truncate max-w-xs sm:max-w-md">
                  {result.fileName}
                </h3>
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold">
                  {tSource('confidence', { pct: (result.confidence * 100).toFixed(1) })}
                </span>
              </div>
            </div>
          </div>

          {/* View Mode & Actions */}
          <div className="flex items-center flex-wrap gap-2">
            
            {/* View Mode Toggle */}
            <div className="hidden sm:flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl text-xs font-mono">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'split'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {tViewMode('split')}
              </button>
              <button
                onClick={() => setViewMode('markdown')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'markdown'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {tViewMode('markdownOnly')}
              </button>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? tActions('copied') : tActions('copyMarkdown')}</span>
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownloadMd}
              className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              title={tActions('downloadTitle')}
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>{tActions('downloadMd')}</span>
            </button>

            {/* Export TXT */}
            <button
              onClick={handleExportTxt}
              className="hidden md:flex bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl text-xs font-mono font-medium items-center gap-1 transition-all cursor-pointer"
              title={tActions('exportTitle')}
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>{tActions('exportTxt')}</span>
            </button>

            {/* Reset / Convert Another */}
            <button
              onClick={onReset}
              className="border border-slate-300 dark:border-slate-700 hover:border-emerald-600 dark:hover:border-emerald-500 text-slate-600 dark:text-slate-300 px-3 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-1 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              <span>{tActions('reset')}</span>
            </button>
          </div>
        </div>

        {/* Workspace Body: Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px] divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          
          {/* Left Panel: Source File Preview */}
          {viewMode === 'split' && (
            <div className="lg:col-span-5 p-6 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col overflow-hidden max-h-[750px]">

              <div className="flex-1 flex flex-col space-y-6 min-h-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm font-headline text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-lg">
                      visibility
                    </span>
                    {tSource('title')}
                  </h4>
                  <span className="text-[11px] font-mono bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                    {result.detectedLanguage.toUpperCase()}
                  </span>
                </div>

                {/* Source Preview — render whatever the user actually uploaded:
                    images via <img>, PDFs via iframe with toolbar stripped,
                    plain text via <pre>, and any other binary (DOCX/PPTX/
                    XLSX/...) via <iframe src=dataUrl> so the browser's
                    built-in viewer or download prompt takes over. */}
                {safePreviewUrl ? (() => {
                  const url: string = safePreviewUrl;
                  const isImage =
                    result.sourceType === 'image' ||
                    /^data:image\//i.test(url) ||
                    /^blob:.*image\//i.test(url) ||
                    /\.(png|jpe?g|gif|webp|avif|bmp|tiff?|heic|heif)(\?|$)/i.test(url);
                  const isPdf =
                    result.sourceType === 'pdf' ||
                    /^data:application\/pdf/i.test(url) ||
                    /^blob:.*application\/pdf/i.test(url) ||
                    /\.pdf(\?|$)/i.test(url);
                  const isText =
                    result.sourceType === 'text' ||
                    /^data:text\//i.test(url) ||
                    (/^blob:/i.test(url) && /^text\//i.test(result.fileName));
                  const previewShell =
                    'flex-1 min-h-0 rounded-2xl border border-slate-300 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shadow-inner';
                  if (isImage) {
                    return (
                      <div className={`${previewShell} p-2`}>
                        <img
                          src={url}
                          alt={result.fileName}
                          className="w-full h-full max-h-full object-contain rounded-xl"
                        />
                      </div>
                    );
                  }
                  if (isPdf) {
                    // Use blob URL (opaque origin) so PDF.js resolves any
                    // embedded relative image URLs against the blob scheme
                    // instead of the parent page origin (filemarkd.vercel.app).
                    return (
                      <div className={previewShell}>
                        <iframe
                          src={`${url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                          title={result.fileName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full min-h-[420px] bg-white"
                        />
                      </div>
                    );
                  }
                  if (isText) {
                    return <SourceTextPreview url={url} fileName={result.fileName} />;
                  }
                  // DOCX/PPTX/XLSX and any other binary uploaded by the
                  // user — show the file bytes through the browser's
                  // built-in viewer (Chrome/Edge ship PDF/Office viewers).
                  return (
                    <div className={previewShell}>
                      <iframe
                        src={url}
                        title={result.fileName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full min-h-[420px] bg-white"
                      />
                    </div>
                  );
                })() : (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs">
                    <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {result.format.toUpperCase()}
                      </span>
                      <span className="truncate" title={result.fileName}>
                        {result.fileName}
                      </span>
                    </div>
                  </div>
                )}

                {/* Structural breakdown removed: the left panel now shows
                    only the source document preview. */}

              </div>

              {/* Bottom Security Info */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between flex-shrink-0">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-emerald-600 text-sm">verified_user</span>
                  {tSource('encrypted')}
                </span>
                <span className="font-mono">{tSource('engine')}</span>
              </div>

            </div>
          )}

          {/* Right Panel: Output Markdown Inspector */}
          {(viewMode === 'split' || viewMode === 'markdown') && (
            <div className={`${viewMode === 'split' ? 'lg:col-span-7' : 'lg:col-span-12'} flex flex-col bg-white dark:bg-slate-900 min-h-[640px]`}>
              
              {/* Output Sub-Navigation Tabs */}
              <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/60">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'preview'
                        ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    {tTabs('preview')}
                  </button>
                  <button
                    onClick={() => setActiveTab('raw')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'raw'
                        ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">code</span>
                    {tTabs('raw')}
                  </button>
                </div>

                {/* Quick Search Toggle */}
                <div className="flex items-center gap-2">
                  {showSearch && (
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={tEditor('searchPlaceholder')}
                      className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 w-32 sm:w-44 focus:outline-none focus:border-emerald-600"
                    />
                  )}
                  <button
                    onClick={() => setShowSearch(!showSearch)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs transition-colors cursor-pointer"
                    title={tEditor('searchTitle')}
                  >
                    <span className="material-symbols-outlined text-sm">search</span>
                  </button>
                </div>
              </div>

              {/* Tab Content Display */}
              <div className="flex-1 p-6 overflow-y-auto max-h-[660px]">
                
                {/* Tab 1: Rendered Markdown with KaTeX formulas and styled tables */}
                {activeTab === 'preview' && (
                  <div className="markdown-body prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm sm:text-base">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {markdownContent}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Tab 2: Raw Markdown Text Editor */}
                {activeTab === 'raw' && (
                  <div className="flex flex-col h-full space-y-2">
                    <div className="text-[11px] font-mono text-slate-500 flex justify-between">
                      <span>{tEditor('directEditHint')}</span>
                      <span>{tEditor('chars', { count: markdownContent.length })}</span>
                    </div>
                    <textarea
                      value={markdownContent}
                      onChange={(e) => setMarkdownContent(e.target.value)}
                      className="w-full flex-1 min-h-[480px] font-mono text-xs sm:text-sm p-4 rounded-xl bg-slate-900 text-emerald-300 border border-slate-800 focus:outline-none focus:border-emerald-500 leading-relaxed resize-y selection:bg-emerald-600 selection:text-white"
                      spellCheck={false}
                    />
                  </div>
                )}

              </div>

              {/* Bottom Editor Status Bar */}
              <div className="px-6 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-4">
                  <span>{tStatus('utf8')}</span>
                  <span>{tStatus('markdownGfm')}</span>
                  <span>{tStatus('katexSupport')}</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">content_copy</span>
                  {tEditor('copyAll')}
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

/**
 * Decodes a data:text/plain;base64,... URL into readable text and renders
 * it inside a scrollable monospace block. Used for plain-text uploads
 * (.txt, .md, .tex, .ipynb, ...) so the left panel literally shows the
 * file the user uploaded.
 */
const SourceTextPreview: React.FC<{ url: string; fileName: string }> = ({ url, fileName }) => {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const decode = async () => {
      try {
        // If the URL is a plain text data URL, fetch + TextDecoder keeps
        // UTF-8 fidelity (no lossy btoa round-trip).
        if (/^data:text\//i.test(url)) {
          const res = await fetch(url);
          const text = await res.text();
          if (!cancelled) setContent(text);
          return;
        }
        // Plain string (already decoded upstream) — render as-is.
        if (!cancelled) setContent(url);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      }
    };
    decode();
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="rounded-2xl border border-slate-300 dark:border-slate-700 overflow-hidden bg-slate-900 shadow-inner">
      <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-mono text-slate-400 bg-slate-800/70 border-b border-slate-700">
        <span className="truncate">{fileName}</span>
        <span>UTF-8</span>
      </div>
      <pre className="w-full max-h-[480px] overflow-auto p-4 text-[12px] leading-relaxed text-emerald-300 font-mono whitespace-pre-wrap break-words">
        {content ?? (error ? `// ${error}` : '// loading…')}
      </pre>
    </div>
  );
};
