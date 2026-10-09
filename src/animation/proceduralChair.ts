type Dust = {
  x: number;
  y: number;
  radius: number;
  speed: number;
};

const CAMERA = {
  x: 0.62,
  y: 0.46,
  lift: 0.05,
  zoom: 0.34,
};

function mulberry32(seed: number): () => number {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function fillRound(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: string | CanvasGradient,
): void {
  roundRect(ctx, x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawRoom(ctx: CanvasRenderingContext2D, width: number, height: number, progress: number): void {
  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, "#17140f");
  background.addColorStop(0.48, "#0c0b09");
  background.addColorStop(1, "#070605");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.strokeStyle = "rgba(244, 239, 230, 0.045)";
  ctx.lineWidth = 1;
  const panels = 8;
  for (let index = 1; index < panels; index += 1) {
    const x = (width / panels) * index;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height * 0.42);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const shaft = ctx.createLinearGradient(width * 0.08, 0, width * 0.48, height);
  shaft.addColorStop(0, "rgba(255, 214, 160, 0.18)");
  shaft.addColorStop(1, "rgba(255, 214, 160, 0)");
  ctx.fillStyle = shaft;
  ctx.beginPath();
  ctx.moveTo(width * 0.06, 0);
  ctx.lineTo(width * 0.18, 0);
  ctx.lineTo(width * 0.46, height);
  ctx.lineTo(width * 0.24, height);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  const glow = ctx.createRadialGradient(
    width * 0.74,
    height * 0.06,
    8,
    width * 0.68,
    height * 0.18,
    width * 0.48,
  );
  glow.addColorStop(0, `rgba(232, 196, 140, ${0.34 + progress * 0.08})`);
  glow.addColorStop(0.35, "rgba(180, 110, 50, 0.08)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  const lampX = width * 0.86;
  ctx.strokeStyle = "rgba(230, 208, 164, 0.45)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(lampX, 0);
  ctx.lineTo(lampX, height * 0.07);
  ctx.stroke();
  ctx.fillStyle = "#1c1612";
  ctx.beginPath();
  ctx.moveTo(lampX - 26, height * 0.07);
  ctx.lineTo(lampX + 26, height * 0.07);
  ctx.lineTo(lampX + 14, height * 0.125);
  ctx.lineTo(lampX - 14, height * 0.125);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const floorY = height * 0.93;
  const floor = ctx.createLinearGradient(0, floorY, 0, height);
  floor.addColorStop(0, "#1a1410");
  floor.addColorStop(1, "#090807");
  ctx.fillStyle = floor;
  ctx.fillRect(width * 0.58, floorY, width * 0.42, height - floorY);
  ctx.strokeStyle = "rgba(198, 163, 106, 0.22)";
  ctx.beginPath();
  ctx.moveTo(width * 0.58, floorY);
  ctx.lineTo(width, floorY);
  ctx.stroke();
}

function drawMirror(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const mirrorWidth = Math.min(width * 0.26, 340);
  const mirrorHeight = Math.min(height * 0.46, 520);
  const x = width * CAMERA.x - mirrorWidth / 2;
  const y = height * 0.08;

  ctx.fillStyle = "#100e0c";
  ctx.strokeStyle = "rgba(198, 163, 106, 0.45)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, mirrorWidth, mirrorHeight, 3);
  ctx.fill();
  ctx.stroke();

  const sheen = ctx.createLinearGradient(x, y, x + mirrorWidth, y + mirrorHeight);
  sheen.addColorStop(0, "rgba(244, 239, 230, 0.1)");
  sheen.addColorStop(0.45, "rgba(244, 239, 230, 0.02)");
  sheen.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = sheen;
  roundRect(ctx, x + 10, y + 10, mirrorWidth - 20, mirrorHeight - 20, 2);
  ctx.fill();
}

function drawChair(ctx: CanvasRenderingContext2D, height: number): void {
  const u = height / 520;
  const chrome = ctx.createLinearGradient(-12 * u, 0, 12 * u, 0);
  chrome.addColorStop(0, "#6d685f");
  chrome.addColorStop(0.42, "#f4efe6");
  chrome.addColorStop(1, "#5e5952");

  ctx.fillStyle = "rgba(0, 0, 0, 0.48)";
  ctx.beginPath();
  ctx.ellipse(0, 168 * u, 138 * u, 22 * u, 0, 0, Math.PI * 2);
  ctx.fill();

  const base = ctx.createLinearGradient(-120 * u, 0, 120 * u, 0);
  base.addColorStop(0, "#514c45");
  base.addColorStop(0.5, "#ddd6c8");
  base.addColorStop(1, "#615c55");
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.ellipse(0, 150 * u, 112 * u, 16 * u, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, 142 * u, 74 * u, 11 * u, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = chrome;
  fillRound(ctx, -7 * u, 28 * u, 14 * u, 114 * u, 6 * u, chrome);

  const back = ctx.createLinearGradient(-90 * u, -280 * u, 90 * u, 20 * u);
  back.addColorStop(0, "#c4a07a");
  back.addColorStop(0.18, "#7a5140");
  back.addColorStop(0.55, "#4a2e24");
  back.addColorStop(1, "#2a1812");
  fillRound(ctx, -82 * u, -268 * u, 164 * u, 286 * u, 30 * u, back);
  fillRound(ctx, -112 * u, -188 * u, 38 * u, 128 * u, 18 * u, "#5a3a2c");
  fillRound(ctx, 74 * u, -188 * u, 38 * u, 128 * u, 18 * u, "#3a241c");

  ctx.strokeStyle = "rgba(198, 163, 106, 0.32)";
  ctx.lineWidth = 1;
  roundRect(ctx, -64 * u, -248 * u, 128 * u, 236 * u, 22 * u);
  ctx.stroke();

  const head = ctx.createLinearGradient(-50 * u, -320 * u, 50 * u, -250 * u);
  head.addColorStop(0, "#e6c7a4");
  head.addColorStop(0.45, "#8a5a42");
  head.addColorStop(1, "#3f291f");
  fillRound(ctx, -4 * u, -268 * u, 8 * u, 22 * u, 2 * u, chrome);
  fillRound(ctx, -50 * u, -312 * u, 100 * u, 52 * u, 18 * u, head);

  const seat = ctx.createLinearGradient(0, -16 * u, 0, 48 * u);
  seat.addColorStop(0, "#a87858");
  seat.addColorStop(0.4, "#5c3a2a");
  seat.addColorStop(1, "#2a1812");
  fillRound(ctx, -120 * u, -6 * u, 240 * u, 52 * u, 16 * u, seat);
  fillRound(ctx, -86 * u, 2 * u, 110 * u, 10 * u, 6 * u, "rgba(244, 239, 230, 0.08)");

  fillRound(ctx, -156 * u, -16 * u, 42 * u, 16 * u, 8 * u, "#2a1c16");
  fillRound(ctx, 114 * u, -16 * u, 42 * u, 16 * u, 8 * u, "#2a1c16");
  fillRound(ctx, -146 * u, -4 * u, 10 * u, 40 * u, 3 * u, "#4a4038");
  fillRound(ctx, 136 * u, -4 * u, 10 * u, 40 * u, 3 * u, "#4a4038");

  fillRound(ctx, -48 * u, 78 * u, 96 * u, 18 * u, 8 * u, "#2a1d17");
  fillRound(ctx, -7 * u, 92 * u, 14 * u, 40 * u, 4 * u, chrome);
}

function drawScissors(ctx: CanvasRenderingContext2D, progress: number, chairHeight: number): void {
  const fade = Math.max(0, Math.min(1, (progress - 0.58) / 0.22));
  if (fade <= 0) return;

  const u = chairHeight / 520;
  ctx.save();
  ctx.translate(196 * u, -36 * u);
  ctx.rotate(-0.3);
  ctx.globalAlpha = fade;
  ctx.strokeStyle = "#e6d0a4";
  ctx.lineWidth = Math.max(1.5, 2.4 * u);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-34 * u, 48 * u);
  ctx.quadraticCurveTo(0, 0, 12 * u, -62 * u);
  ctx.moveTo(34 * u, 48 * u);
  ctx.quadraticCurveTo(0, 0, -12 * u, -62 * u);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 5 * u, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export class ProceduralChair {
  private readonly dust: Dust[];

  constructor() {
    const random = mulberry32(11);
    this.dust = Array.from({ length: 42 }, () => ({
      x: random(),
      y: random(),
      radius: random() * 1.3 + 0.25,
      speed: random() * 0.55 + 0.15,
    }));
  }

  draw(ctx: CanvasRenderingContext2D, width: number, height: number, progress: number): void {
    ctx.clearRect(0, 0, width, height);
    drawRoom(ctx, width, height, progress);
    drawMirror(ctx, width, height);

    const chairHeight = Math.min(width, height) * 0.7;
    const zoom = 1 + progress * CAMERA.zoom;
    const originX = width * CAMERA.x;
    const originY = height * CAMERA.y - progress * height * CAMERA.lift;
    const spot = ctx.createRadialGradient(originX, originY - chairHeight * 0.15, 24, originX, originY, chairHeight * 0.72);
    spot.addColorStop(0, "rgba(255, 214, 170, 0.28)");
    spot.addColorStop(0.5, "rgba(140, 80, 40, 0.08)");
    spot.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = spot;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(originX, originY);
    ctx.scale(zoom, zoom);
    ctx.rotate((progress - 0.35) * 0.035);
    drawChair(ctx, chairHeight / zoom);
    drawScissors(ctx, progress, chairHeight / zoom);
    ctx.restore();

    ctx.save();
    for (const mote of this.dust) {
      const y = (mote.y * height + progress * 70 * mote.speed) % height;
      ctx.globalAlpha = 0.22 * mote.speed;
      ctx.fillStyle = "#f4efe6";
      ctx.beginPath();
      ctx.arc(mote.x * width, y, mote.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    const vignette = ctx.createRadialGradient(
      width * 0.5,
      height * 0.45,
      width * 0.18,
      width * 0.5,
      height * 0.5,
      width * 0.72,
    );
    vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignette.addColorStop(1, "rgba(0, 0, 0, 0.58)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.fillStyle = "rgba(120, 72, 40, 0.12)";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}

export const proceduralChair = new ProceduralChair();
