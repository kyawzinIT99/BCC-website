type OfficialBrandTextProps = {
  className?: string;
};

export function OfficialBrandText({ className = "" }: OfficialBrandTextProps) {
  return (
    <span className={`official-brand-text ${className}`.trim()}>
      <strong>THE BURMESE CATHOLIC COMMUNITY</strong>
      <strong>OF</strong>
      <strong>WESTERN AUSTRALIA INC</strong>
      <strong className="official-brand-acronym">(BCC.WA)</strong>
      <span>FORMED: 7 FEBRUARY 1999</span>
      <span>INCORPORATED: 15 JUNE 2008</span>
      <span>(ABN: 93 671 779 607)</span>
    </span>
  );
}
