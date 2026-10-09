import { site } from "../content/site";

type PreloaderProps = {
  done: boolean;
};

export function Preloader({ done }: PreloaderProps) {
  return (
    <div
      className={done ? "preloader is-done" : "preloader"}
      role={done ? undefined : "status"}
      aria-label={done ? undefined : `Loading ${site.name}`}
      aria-hidden={done ? true : undefined}
    >
      <div className="preloader-mark" aria-hidden="true">
        <img src={site.logo} alt="" width={120} height={120} />
        <i className="preloader-rule" />
        <span>{site.name}</span>
      </div>
    </div>
  );
}
