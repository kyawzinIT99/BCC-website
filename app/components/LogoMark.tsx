import { bccwaLogoDataUrl } from "./brandAssets";

type LogoMarkProps = {
  className?: string;
};

export function LogoMark({ className = "" }: LogoMarkProps) {
  return (
    <span
      className={`community-logo ${className}`.trim()}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bccwaLogoDataUrl} alt="" width={720} height={405} />
    </span>
  );
}
