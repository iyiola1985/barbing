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
  if (narrow) return { stride: 3, maxEdge: 720, workers: 3 };
  if (compact) return { stride: 2, maxEdge: 960, workers: 4 };
  return { stride: 2, maxEdge: 1280, workers: 5 };
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

function loadImage(url: string, priority: "high" | "auto" = "auto"): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.fetchPriority = priority;
    image.onload = () => resolve(image);
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

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: FrameImage,
  width: number,
  height: number,
): void {
  const { width: sourceWidth, height: sourceHeight } = frameSize(image);
  if (!sourceWidth || !sourceHeight) return;
  const portrait = width < 760 && height > width * 1.15;
  if (portrait) {
    // Phone: show the chair large and centered so the turn reads while scrolling.
    const scale = width / (sourceWidth * 0.5);
    const drawWidth = sourceWidth * scale;
    const drawHeight = sourceHeight * scale;
    const subject = 0.62;
    ctx.fillStyle = "#090807";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(
      image,
      width * 0.5 - drawWidth * subject,
      height * 0.56 - drawHeight / 2,
      drawWidth,
      drawHeight,
    );
    return;
  }

  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const minX = width - drawWidth;
  const focusX = width * 0.68 - drawWidth / 2;
  const x = Math.min(0, Math.max(minX, focusX));
  ctx.drawImage(image, x, (height - drawHeight) / 2, drawWidth, drawHeight);
}

export class FrameSequence {
  private images: (FrameImage | null)[] = [];
  private mode: SequenceMode = "procedural";
  private pending: Promise<SequenceMode> | null = null;
  private settle: ((mode: SequenceMode) => void) | null = null;
  private settled = false;
  private listeners = new Set<() => void>();
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
    if (!this.pending) {
      this.pending = new Promise((resolve) => {
        this.settle = resolve;
      });
      void this.load();
    }
    return this.pending;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
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

  private settleOnce(mode: SequenceMode): void {
    if (this.settled) return;
    this.settled = true;
    this.mode = mode;
    this.settle?.(mode);
    this.emit();
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener());
  }

  private async load(): Promise<void> {
    let data: unknown;
    try {
      const response = await fetch(this.manifestUrl);
      if (!response.ok) {
        this.settleOnce("procedural");
        return;
      }
      data = await response.json();
    } catch {
      this.settleOnce("procedural");
      return;
    }

    if (!isManifest(data)) {
      this.settleOnce("procedural");
      return;
    }

    const plan = framePlan();
    const indexes: number[] = [];
    for (let index = 0; index < data.count; index += plan.stride) indexes.push(index);
    const last = data.count - 1;
    if (indexes[indexes.length - 1] !== last) indexes.push(last);
    const urls = indexes.map((index) => frameUrl(data, index));
    this.images = new Array(urls.length).fill(null);

    const store = (index: number, image: HTMLImageElement | null) => {
      if (!image) return;
      this.images[index] = shrinkFrame(image, plan.maxEdge);
      this.mode = "frames";
      this.settleOnce("frames");
      this.emit();
    };

    store(0, await loadImage(urls[0] ?? "", "high"));

    let cursor = 1;
    const pool = Array.from({ length: Math.min(plan.workers, Math.max(urls.length - 1, 0)) }, async () => {
      while (cursor < urls.length) {
        const index = cursor;
        cursor += 1;
        store(index, await loadImage(urls[index] ?? ""));
      }
    });
    await Promise.all(pool);

    const loaded = this.images.filter((image) => image !== null).length;
    if (loaded === 0) this.settleOnce("procedural");
  }
}

let chairSequence: FrameSequence | null = null;

export function getChairSequence(): FrameSequence {
  chairSequence ??= new FrameSequence(sequences.chair.manifest, proceduralChair);
  return chairSequence;
}
