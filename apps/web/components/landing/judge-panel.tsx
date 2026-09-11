import { judges } from "@/components/landing/content";

export function JudgePanel({ visible }: { readonly visible: boolean }) {
  const judge = judges[0];
  if (!judge) {
    return null;
  }

  let visibilityClass = "pointer-events-none opacity-0 translate-y-3";
  if (visible) {
    visibilityClass = "pointer-events-auto opacity-100 translate-y-0";
  }

  return (
    <aside
      aria-hidden={!visible}
      className={`landing-device absolute right-4 bottom-28 z-20 w-[min(22rem,calc(100%-2rem))] rounded-[1.6rem] p-4 transition duration-500 sm:right-8 sm:bottom-32 ${visibilityClass}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="landing-device__handle inline-block h-2 w-10 rounded-full" />
        <span className="font-mono text-[10px] tracking-[0.18em] text-white/70">
          {judge.callsign}
        </span>
      </div>
      <p className="font-mono text-[10px] tracking-[0.16em] text-[#e8ff00] uppercase">
        perfil / juez
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-landing-display)] text-3xl leading-none font-extrabold tracking-[-0.05em] text-white uppercase">
        {judge.name}
      </h2>
      <p className="mt-2 font-mono text-xs tracking-[0.08em] text-white/75 lowercase">
        {judge.role}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-white/85">{judge.body}</p>
    </aside>
  );
}
