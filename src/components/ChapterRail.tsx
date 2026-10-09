type ChapterRailProps = {
  label: string;
};

export function ChapterRail({ label }: ChapterRailProps) {
  return (
    <p className="rail" aria-hidden="true">
      {label}
    </p>
  );
}
