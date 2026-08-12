import Image from "next/image";

type LogoMarkProps = {
  className?: string;
};

export function LogoMark({ className = "" }: LogoMarkProps) {
  return (
    <span
      className={`community-logo ${className}`.trim()}
      aria-hidden="true"
    >
      <Image
        src="/bccwa-logo.jpg"
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
