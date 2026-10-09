import { useLayoutEffect, useState } from "react";
import { ScrollTrigger } from "./gsap";

type Chapter = { id: string; label: string };

export function useActiveChapter(chapters: readonly Chapter[]): string {
  const [label, setLabel] = useState(chapters[0]?.label ?? "");

  useLayoutEffect(() => {
    const triggers = chapters.map((chapter) =>
      ScrollTrigger.create({
        trigger: `#${chapter.id}`,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (self.isActive) setLabel(chapter.label);
        },
      }),
    );

    return () => {
      for (const trigger of triggers) trigger.kill();
    };
  }, [chapters]);

  return label;
}
