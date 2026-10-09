import { sequences } from "../content/sequences";
import { proceduralChair, type ProceduralChair } from "./proceduralChair";

export type SequenceMode = "frames" | "procedural";

type SequenceManifest = {
  count: number;
  ext: string;
  pad: number;
  base: string;
};

const FRAME_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

function isManifest(value: unknown): value is SequenceManifest {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.count === "number" &&
    record.count >= 2 &&
    typeof record.ext === "string" &&
    FRAME_EXTENSIONS.includes(record.ext) &&
    typeof record.pad === "number" &&
    typeof record.base === "string"
  );
}

function frameUrl(manifest: SequenceManifest, index: number): string {
  const number = String(index + 1).padStart(manifest.pad, "0");
  return `${manifest.base}${number}.${manifest.ext}`;
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      const decode = image.decode?.() ?? Promise.resolve();
      void decode.then(() => resolve(image)).catch(() => resolve(image));
    };
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

async function loadAll(urls: string[]): Promise<(HTMLImageElement | null)[]> {
  const results: (HTMLImageElement | null)[] = new Array(urls.length).fill(null);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(6, urls.length) }, async () => {
    while (cursor < urls.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await loadImage(urls[index] ?? "");
    }
  });
  await Promise.all(workers);
  return results;
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
): void {
  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;
  if (!sourceWidth || !sourceHeight) return;
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const minX = width - drawWidth;
  const focusX = width * 0.68 - drawWidth / 2;
  const x = Math.min(0, Math.max(minX, focusX));
  ctx.drawImage(image, x, (height - drawHeight) / 2, drawWidth, drawHeight);
}

export class FrameSequence {
  private images: (HTMLImageElement | null)[] = [];
  private mode: SequenceMode = "procedural";
  private pending: Promise<SequenceMode> | null = null;

  constructor(
    private readonly manifestUrl: string,
    private readonly fallback: ProceduralChair,
  ) {}

  getMode(): SequenceMode {
    return this.mode;
  }

  init(): Promise<SequenceMode> {
    this.pending ??= this.load();
    return this.pending;
  }

  draw(ctx: CanvasRenderingContext2D, width: number, height: number, progress: number): void {
    switch (this.mode) {
      case "frames": {
        const image = this.imageAt(progress);
        if (image) {
          ctx.clearRect(0, 0, width, height);
          drawCover(ctx, image, width, height);
          return;
        }
        this.fallback.draw(ctx, width, height, progress);
        return;
      }
      case "procedural":
        this.fallback.draw(ctx, width, height, progress);
        return;
      default: {
        const unreachable: never = this.mode;
        return unreachable;
      }
    }
  }

  private imageAt(progress: number): HTMLImageElement | null {
    if (this.images.length === 0) return null;
    const index = Math.round(progress * (this.images.length - 1));
    const exact = this.images[index];
    if (exact) return exact;

    for (let step = 1; step < this.images.length; step += 1) {
      const before = this.images[index - step];
      if (before) return before;
      const after = this.images[index + step];
      if (after) return after;
    }

    return null;
  }

  private async load(): Promise<SequenceMode> {
    let data: unknown;
    try {
      const response = await fetch(this.manifestUrl, { cache: "no-cache" });
      if (!response.ok) return "procedural";
      data = await response.json();
    } catch {
      return "procedural";
    }

    if (!isManifest(data)) return "procedural";

    const urls = Array.from({ length: data.count }, (_, index) => frameUrl(data, index));
    const images = await loadAll(urls);
    const loaded = images.filter((image) => image !== null).length;
    if (loaded / data.count < 0.9) return "procedural";

    this.images = images;
    this.mode = "frames";
    return "frames";
  }
}

let chairSequence: FrameSequence | null = null;

export function getChairSequence(): FrameSequence {
  chairSequence ??= new FrameSequence(sequences.chair.manifest, proceduralChair);
  return chairSequence;
}
