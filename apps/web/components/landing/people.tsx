import {
  judgeSeats,
  mentorSeats,
  peopleCopy,
} from "@/components/landing/content";
import { HudLabel } from "@/components/landing/hud";
import {
  LandingContainer,
  LandingSectionHead,
} from "@/components/landing/shell";

function RevealSeat({
  index,
  role,
}: {
  readonly index: number;
  readonly role: string;
}) {
  const label = `${role} ${String(index).padStart(2, "0")}, ${peopleCopy.reveal}`;

  return (
    <li
      aria-label={label}
      className="grid aspect-square place-items-center border border-[var(--hud-ink)]/15 bg-[var(--hud-card)]"
    >
      <span className="font-[family-name:var(--font-landing-display)] text-2xl leading-none text-[var(--hud-ink)]/45 sm:text-3xl">
        {String(index).padStart(2, "0")}
      </span>
    </li>
  );
}

function CouncilRow({
  heading,
  role,
  seats,
}: {
  readonly heading: string;
  readonly role: string;
  readonly seats: readonly number[];
}) {
  return (
    <div className="border border-[var(--hud-ink)]/15 p-5 sm:p-7">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h3 className="font-[family-name:var(--font-landing-display)] text-3xl leading-none">
          {heading}
        </h3>
        <HudLabel className="text-[var(--hud-muted)]">
          {peopleCopy.announcement}
        </HudLabel>
      </div>
      <ul className="grid grid-cols-5 gap-2">
        {seats.map((index) => (
          <RevealSeat index={index} key={`${role}-${index}`} role={role} />
        ))}
      </ul>
    </div>
  );
}

export function LandingPeople() {
  return (
    <section
      aria-labelledby="people-heading"
      className="bg-[var(--hud-paper)]"
      id="people"
    >
      <LandingContainer className="py-20 sm:py-28">
        <HudLabel className="mb-4 text-[var(--hud-action)]">
          {peopleCopy.kicker}
        </HudLabel>
        <LandingSectionHead title={peopleCopy.title} titleId="people-heading">
          <p className="max-w-xl text-lg leading-relaxed text-[var(--hud-ink)]/75">
            {peopleCopy.lede}
          </p>
        </LandingSectionHead>

        <div className="grid gap-4 lg:grid-cols-2">
          <CouncilRow
            heading={peopleCopy.judges}
            role={peopleCopy.judgeRole}
            seats={judgeSeats}
          />
          <CouncilRow
            heading={peopleCopy.mentors}
            role={peopleCopy.mentorRole}
            seats={mentorSeats}
          />
        </div>
      </LandingContainer>
    </section>
  );
}
