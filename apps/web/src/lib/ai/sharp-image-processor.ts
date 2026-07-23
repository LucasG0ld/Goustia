import "server-only";

import { createHash } from "node:crypto";

import sharp from "sharp";

import type {
  ProcessedRecipeImage,
  RecipeImageProcessor,
} from "./image-pipeline";
import type { RecipeImageResponse } from "./providers/contracts";

const maximumImageBytes = 2_000_000;

export class SharpRecipeImageProcessor implements RecipeImageProcessor {
  async process(image: RecipeImageResponse): Promise<ProcessedRecipeImage> {
    if (image.bytes.byteLength === 0) throw new Error("IMAGE_EMPTY");
    const source = sharp(image.bytes, { failOn: "warning" });
    const metadata = await source.metadata();
    if (!metadata.width || !metadata.height || !metadata.format) {
      throw new Error("IMAGE_METADATA_INVALID");
    }
    if (metadata.width < 512 || metadata.height < 512) {
      throw new Error("IMAGE_DIMENSIONS_TOO_SMALL");
    }
    const bytes = await source
      .resize(1024, 768, { fit: "cover", position: "centre" })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
    if (bytes.byteLength > maximumImageBytes) {
      throw new Error("IMAGE_TOO_LARGE_AFTER_COMPRESSION");
    }
    return {
      ...image,
      bytes,
      contentType: "image/webp",
      width: 1024,
      height: 768,
      checksumSha256: createHash("sha256").update(bytes).digest("hex"),
    };
  }
}
