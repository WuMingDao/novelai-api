import { Model } from "nekoai-js";

export const ModelChoices = {
  "V4.5": Model.V4_5,
  V4_5cur: Model.V4_5_CUR,
  V4: Model.V4,
  V4cur: Model.V4_CUR,
  V3: Model.V3,
  V3furry: Model.FURRY,
} as const;

export type ModelChoiceKey = keyof typeof ModelChoices;

export const SizeChoices = {
  竖图: { width: 832, height: 1216 },
  横图: { width: 1216, height: 832 },
  方图: { width: 1024, height: 1024 },
  特殊竖图: { width: 704, height: 1472 },
  特殊横图: { width: 1472, height: 704 },
} as const;

export type SizeChoiceKey = keyof typeof SizeChoices;
