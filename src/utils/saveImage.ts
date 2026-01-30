import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

export async function saveImage(data: Uint8Array, path: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, data);
}
