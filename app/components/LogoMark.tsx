import Image from "next/image";

type LogoMarkProps = {
  className?: string;
};

const logoSrc = "/_next/static/brand/bccwa-logo.jpg";

export function LogoMark({ className = "" }: LogoMarkProps) {
  return (
    <span
      className={`community-logo ${className}`.trim()}
      aria-hidden="true"
    >
      <Image
        src={logoSrc}
        alt=""
        width={720}
        height={405}
        sizes="72px"
        priority
        unoptimized
      />
    </span>
  );
}
