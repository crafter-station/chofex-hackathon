import Link from "next/link";

const bannerItemIds = ["ridge", "summit", "valley", "pass"] as const;

function BannerGroup({ copy }: { readonly copy: "first" | "second" }) {
  return (
    <span className="landing-live-banner-group">
      {bannerItemIds.map((itemId) => (
        <span className="landing-live-banner-item" key={`${copy}-${itemId}`}>
          <span className="landing-live-banner-dot" />
          Challenge 1 is live
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
      aria-label="Challenge 1 is live. View The Shipping Machine details and instructions."
      className="landing-live-banner"
      href="/challenges/black-box"
    >
      <span className="sr-only">
        Challenge 1 is live. View details and instructions.
      </span>
      <span aria-hidden="true" className="landing-live-banner-track">
        <BannerGroup copy="first" />
        <BannerGroup copy="second" />
      </span>
    </Link>
  );
}
