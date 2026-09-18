import Link from "next/link";

const bannerItemIds = ["ridge", "summit", "valley", "pass"] as const;

function BannerGroup({
  groupInstance,
}: {
  readonly groupInstance: "first" | "second";
}) {
  return (
    <span className="landing-live-banner-group">
      {bannerItemIds.map((itemId) => (
        <span
          className="landing-live-banner-item"
          key={`${groupInstance}-${itemId}`}
        >
          <span className="landing-live-banner-dot" />
          Challenge 1 / live
          <span aria-hidden="true">—</span>
          Compite por pase directo
          <span aria-hidden="true">—</span>
          The Shipping Machine
          <span aria-hidden="true">→</span>
        </span>
      ))}
    </span>
  );
}

export function LiveChallengeBanner() {
  return (
    <Link
      aria-label="Challenge 1 está abierto. Compite por un pase directo con The Shipping Machine."
      className="landing-live-banner"
      href="/challenges/black-box"
    >
      <span className="sr-only">
        Challenge 1 está abierto. Compite por un pase directo.
      </span>
      <span aria-hidden="true" className="landing-live-banner-track">
        <BannerGroup groupInstance="first" />
        <BannerGroup groupInstance="second" />
      </span>
    </Link>
  );
}
