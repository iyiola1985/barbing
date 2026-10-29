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

type FrameImage = HTMLImageElement | HTMLCanvasElement;

type FramePlan = {
  stride: number;
  maxEdge: number;
  workers: number;
};

export function framePixelRatio(): number {
  const compact = window.matchMedia("(max-width: 760px)").matches;
  return Math.min(window.devicePixelRatio || 1, compact ? 1.15 : 1.5);
}

function framePlan(): FramePlan {
  const narrow = window.matchMedia("(max-width: 420px)").matches;
  const compact = narrow || window.matchMedia("(max-width: 760px)").matches;
  if (!compact) return { stride: 1, maxEdge: 1600, workers: 4 };
  if (narrow) return { stride: 3, maxEdge: 640, workers: 2 };
  return { stride: 2, maxEdge: 800, workers: 2 };
}

function frameSize(image: FrameImage): { width: number; height: number } {
  if (image instanceof HTMLImageElement) {
    return { width: image.naturalWidth, height: image.naturalHeight };
  }
  return { width: image.width, height: image.height };
}

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

function shrinkFrame(image: HTMLImageElement, maxEdge: number): FrameImage {
  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;
  const longest = Math.max(sourceWidth, sourceHeight);
  if (!sourceWidth || !sourceHeight || longest <= maxEdge) return image;

  const scale = maxEdge / longest;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(sourceWidth * scale));
  canvas.height = Math.max(1, Math.round(sourceHeight * scale));
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return image;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.onload = null;
  image.onerror = null;
  image.src = "";
  return canvas;
}

async function loadAll(urls: string[], workers: number, maxEdge: number): Promise<(FrameImage | null)[]> {
  const results: (FrameImage | null)[] = new Array(urls.length).fill(null);
  let cursor = 0;
  const pool = Array.from({ length: Math.min(workers, urls.length) }, async () => {
    while (cursor < urls.length) {
      const index = cursor;
      cursor += 1;
      const image = await loadImage(urls[index] ?? "");
      results[index] = image ? shrinkFrame(image, maxEdge) : null;
      if (index % 3 === 2) await new Promise((resolve) => setTimeout(resolve, 0));
    }
  });
  await Promise.all(pool);
  return results;
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: FrameImage,
  width: number,
  height: number,
): void {
  const { width: sourceWidth, height: sourceHeight } = frameSize(image);
  if (!sourceWidth || !sourceHeight) return;
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const minX = width - drawWidth;
  const focus = width < 700 ? 1.02 : 0.68;
  const focusX = width * focus - drawWidth / 2;
  const x = Math.min(0, Math.max(minX, focusX));
  ctx.drawImage(image, x, (height - drawHeight) / 2, drawWidth, drawHeight);
}

export class FrameSequence {
  private images: (FrameImage | null)[] = [];
  private mode: SequenceMode = "procedural";
  private pending: Promise<SequenceMode> | null = null;
  private lastDrawn: FrameImage | null = null;
  private lastWidth = 0;
  private lastHeight = 0;

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
        if (!image) {
          this.lastDrawn = null;
          this.fallback.draw(ctx, width, height, progress);
          return;
        }
        if (image === this.lastDrawn && width === this.lastWidth && height === this.lastHeight) return;
        this.lastDrawn = image;
        this.lastWidth = width;
        this.lastHeight = height;
        ctx.clearRect(0, 0, width, height);
        drawCover(ctx, image, width, height);
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

  private imageAt(progress: number): FrameImage | null {
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

    const plan = framePlan();
    const indexes: number[] = [];
    for (let index = 0; index < data.count; index += plan.stride) indexes.push(index);
    const last = data.count - 1;
    if (indexes[indexes.length - 1] !== last) indexes.push(last);
    const urls = indexes.map((index) => frameUrl(data, index));
    const images = await loadAll(urls, plan.workers, plan.maxEdge);
    const loaded = images.filter((image) => image !== null).length;
    if (loaded / images.length < 0.9) return "procedural";

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
