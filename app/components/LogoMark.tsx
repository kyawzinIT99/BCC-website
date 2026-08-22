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
      <img
        src="/bccwa-logo-original.png?v=20260822b"
        alt=""
        width={560}
        height={560}
      />
    </span>
  );
}
