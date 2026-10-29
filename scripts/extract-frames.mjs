import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const input = process.argv[2];
const requested = Number(process.argv[3] ?? 96);
const outDir = resolve("public/sequences/chair");

if (!input) {
  console.error("Usage: npm run frames -- <video.mp4> [frameCount]");
  process.exit(1);
}

if (!Number.isFinite(requested)) {
  console.error("Frame count must be a number between 24 and 240.");
  process.exit(1);
}

const frameCount = Math.min(240, Math.max(24, Math.round(requested)));

function requireBin(bin) {
  const probe = spawnSync(bin, ["-version"], { encoding: "utf8" });
  if (probe.error || probe.status !== 0) {
    console.error(`${bin} is required. On a Mac: brew install ffmpeg`);
    process.exit(1);
  }
}

requireBin("ffmpeg");
requireBin("ffprobe");

const durationProbe = spawnSync(
  "ffprobe",
  [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    input,
  ],
  { encoding: "utf8" },
);

const duration = Number(durationProbe.stdout.trim());
if (!Number.isFinite(duration) || duration <= 0) {
  console.error("Could not read the video duration. Check the file path.");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

for (const file of readdirSync(outDir)) {
  if (/^frame_\d+\.(jpe?g|png|webp)$/.test(file) || file === "manifest.json") {
    rmSync(join(outDir, file));
  }
}

const fps = frameCount / duration;
const extracted = spawnSync(
  "ffmpeg",
  [
    "-y",
    "-i",
    input,
    "-vf",
    `fps=${fps},scale=1280:-2:flags=lanczos`,
    "-c:v",
    "libwebp",
    "-quality",
    "62",
    join(outDir, "frame_%04d.webp"),
  ],
  { stdio: "inherit" },
);

if (extracted.status !== 0) {
  console.error("ffmpeg failed before a manifest could be written.");
  process.exit(extracted.status ?? 1);
}

const count = readdirSync(outDir).filter((file) => /^frame_\d+\.webp$/.test(file)).length;

if (count < 2) {
  console.error("Not enough frames were written.");
  process.exit(1);
}

const manifest = {
  count,
  ext: "webp",
  pad: 4,
  base: "/sequences/chair/frame_",
};

writeFileSync(join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${count} frames and manifest.json to ${outDir}`);
