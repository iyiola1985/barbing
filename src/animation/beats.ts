export function bandOpacity(progress: number, index: number, count: number): number {
  if (count <= 1) return 1;

  const span = 1 / count;
  const fade = span * 0.45;
  const center = (index + 0.5) * span;

  if (index === 0 && progress <= center) return 1;
  if (index === count - 1 && progress >= center) return 1;

  const distance = Math.abs(progress - center);
  const plateau = span / 2 - fade / 2;
  const edge = span / 2 + fade / 2;

  if (distance <= plateau) return 1;
  if (distance >= edge) return 0;
  return 1 - (distance - plateau) / (edge - plateau);
}

export function bandShift(progress: number, index: number, count: number, opacity: number): number {
  if (count <= 1) return 0;
  const span = 1 / count;
  const center = (index + 0.5) * span;
  const direction = progress > center ? -1 : 1;
  return (1 - opacity) * 22 * direction;
}

/** One line at a time. The current line is gone before the next line appears. */
export function soloOpacity(progress: number, index: number, count: number): number {
  if (count <= 1) return 1;

  const span = 1 / count;
  const start = index * span;
  const end = start + span;
  const fade = span * 0.22;
  const gap = span * 0.08;
  const fadeInEnd = start + gap + fade;
  const fadeOutStart = end - gap - fade;

  if (index === 0 && progress <= fadeOutStart) return 1;
  if (index === count - 1 && progress >= fadeInEnd) return 1;
  if (progress <= start + gap || progress >= end - gap) return 0;
  if (progress < fadeInEnd) return (progress - (start + gap)) / fade;
  if (progress > fadeOutStart) return (end - gap - progress) / fade;
  return 1;
}
