import { Model, Resolution, Action, Sampler } from "nekoai-js";
import type { Metadata, Image } from "nekoai-js";
import { client } from "../app.js";

import type { Request, Response } from "express";

interface NaiRequestBody {
  prompt?: string;
  negative?: string;
  model?: Model;
  width?: number;
  height?: number;
}

function getResolutionPreset(
  width?: number,
  height?: number
): Resolution | undefined {
  if (!width || !height) return Resolution.NORMAL_PORTRAIT;
  // 根据宽高比选择预设
  const ratio = width / height;
  if (ratio > 1.2) return Resolution.NORMAL_LANDSCAPE;
  if (ratio < 0.8) return Resolution.NORMAL_PORTRAIT;
  return Resolution.NORMAL_SQUARE;
}

function getResolutionSize(
  width?: number,
  height?: number
): { width: number; height: number } {
  if (!width || !height) return { width: 832, height: 1216 };
  const ratio = width / height;
  if (ratio > 1.2) return { width: 1216, height: 832 };
  if (ratio < 0.8) return { width: 832, height: 1216 };
  return { width: 1024, height: 1024 };
}

export async function naiContriller(req: Request, res: Response) {
  try {
    const body = req.body as NaiRequestBody;
    const seed = Math.floor(Math.random() * 4294967295);

    const metadata: Metadata = {
      prompt: body.prompt || "1girl, cute, anime style, detailed",
      negative_prompt: body.negative,
      model: body.model || Model.V4_5,
      action: Action.GENERATE,
      resPreset: getResolutionPreset(body.width, body.height),
      n_samples: 1,
      seed,
      steps: 28,
      scale: 5,
      qualityToggle: true,
      ucPreset: 0,
      sampler: Sampler.EULER,
    };

    const response = (await client.generateImage(metadata)) as Image[];

    if (!response || response.length === 0) {
      res.json({ success: false, error: "No image generated" });
      return;
    }

    const image = response[0];
    const imageBuffer = Buffer.from(image.data).toString("base64");
    const size = getResolutionSize(body.width, body.height);

    res.json({
      success: true,
      imageBuffer,
      seed: metadata.seed,
      metadata: {
        width: size.width,
        height: size.height,
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error("NAI generation error:", err);
    res.json({ success: false, error: err.message });
  }
}
