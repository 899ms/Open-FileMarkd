import axios from 'axios';

// Mistral OCR 模型API配置
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/ocr';
const API_KEY = process.env.NEXT_PUBLIC_MISTRAL_API_KEY || '';

/**
 * 将PDF文件转换为Markdown格式
 * @param file PDF文件对象
 * @returns 转换后的Markdown文本
 */
export async function convertPdfToMarkdown(file: File): Promise<string> {
  try {
    // 转换文件为base64
    const base64Data = await fileToBase64(file);
    
    // 调用Mistral OCR API
    const response = await callMistralOcrApi(base64Data, file.type);
    
    // 从OCR结果中提取Markdown
    const markdown = extractMarkdownFromOcrResult(response);
    
    return markdown;
  } catch (error) {
    console.error('PDF转Markdown失败:', error);
    throw new Error('PDF转换失败，请稍后再试');
  }
}

/**
 * 将文件转换为base64格式
 * @param file 文件对象
 * @returns base64编码的字符串
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // 移除data:application/pdf;base64,前缀
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * 调用Mistral OCR API
 * @param base64Data base64编码的文件数据
 * @param fileType 文件MIME类型
 * @returns API响应结果
 */
async function callMistralOcrApi(base64Data: string, fileType: string): Promise<any> {
  if (!API_KEY) {
    throw new Error('缺少Mistral API密钥');
  }

  try {
    // 根据文件类型构建不同的请求体
    let payload;
    
    if (fileType === 'application/pdf') {
      // PDF文件使用document_url
      payload = {
        model: 'mistral-ocr-latest',
        document: {
          type: 'document_url',
          document_url: `data:${fileType};base64,${base64Data}`
        }
      };
    } else if (fileType.includes('image/')) {
      // 图像文件使用image_url
      payload = {
        model: 'mistral-ocr-latest',
        document: {
          type: 'image_url',
          image_url: `data:${fileType};base64,${base64Data}`
        }
      };
    } else {
      throw new Error('不支持的文件类型，仅支持PDF和图像文件');
    }

    const response = await axios.post(
      MISTRAL_API_URL,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        maxBodyLength: Infinity
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Mistral API调用失败:', error.response.status, error.response.data);
      throw new Error(`OCR处理失败: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else {
      console.error('Mistral API调用失败:', error);
      throw new Error('OCR处理失败');
    }
  }
}

/**
 * 从OCR结果中提取Markdown
 * @param ocrResult OCR API响应结果
 * @returns 提取的Markdown文本
 */
function extractMarkdownFromOcrResult(ocrResult: any): string {
  if (!ocrResult || !ocrResult.pages || !Array.isArray(ocrResult.pages) || ocrResult.pages.length === 0) {
    return '';
  }

  // 提取每页的markdown内容并合并
  const markdownContent = ocrResult.pages.map((page: any) => page.markdown || '').join('\n\n');
  
  return markdownContent;
}

/**
 * 将Markdown文本下载为文件
 * @param markdown Markdown文本
 * @param filename 文件名
 */
export function downloadMarkdown(markdown: string, filename: string): void {
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.replace('.pdf', '.md');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
} 