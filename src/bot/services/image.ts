import type { Model } from "nekoai-js";
import { SizeChoices, type SizeChoiceKey } from "../types/index.js";

const NAI_API_URL = process.env.NAI_API_URL || "http://localhost:8484/nai";

export interface GenerateOptions {
  prompt: string;
  negative?: string;
  model: Model;
  width: number;
  height: number;
}

export interface GenerateResult {
  success: boolean;
  error?: string;
  imageBuffer?: Buffer;
  seed?: number;
  metadata?: {
    width: number;
    height: number;
  };
}

interface ApiResponse {
  success: boolean;
  error?: string;
  imageBuffer?: string; // base64
  seed?: number;
  metadata?: {
    width: number;
    height: number;
  };
}

export class ImageService {
  static getSizeFromChoice(choice: SizeChoiceKey): {
    width: number;
    height: number;
  } {
    return SizeChoices[choice];
  }

  async generate(options: GenerateOptions): Promise<GenerateResult> {
    try {
      const response = await fetch(NAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: options.prompt,
          negative: options.negative,
          model: options.model,
          width: options.width,
          height: options.height,
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `API 请求失败: ${response.status} ${response.statusText}`,
        };
      }

      const result = (await response.json()) as ApiResponse;

      if (!result.success || !result.imageBuffer) {
        return {
          success: false,
          error: result.error || "未知错误",
        };
      }

      return {
        success: true,
        imageBuffer: Buffer.from(result.imageBuffer, "base64"),
        seed: result.seed,
        metadata: result.metadata,
      };
    } catch (error) {
      const err = error as Error;
      if (err.message.includes("ECONNREFUSED")) {
        return {
          success: false,
          error: "无法连接到 NAI API 服务，请确保服务已启动",
        };
      }
      return {
        success: false,
        error: err.message,
      };
    }
  }
}

let imageServiceInstance: ImageService | null = null;

export function getImageService(): ImageService {
  if (!imageServiceInstance) {
    imageServiceInstance = new ImageService();
  }
  return imageServiceInstance;
}
