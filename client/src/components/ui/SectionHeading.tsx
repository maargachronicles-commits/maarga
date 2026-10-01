import clsx from "clsx";

interface Props {
  label: string;
  title: string;
  body?: string;
  /** Figma: label→title gap is 4px, title→body 24px (or 18px for the Intellect blocks) */
  bodyGap?: 24 | 18;
  bodyWidth?: number;
  className?: string;
  light?: boolean;
}

/** Small red label + Clash 28px title (+ optional centred Erode body). */
export default function SectionHeading({
  label,
  title,
  body,
  bodyGap = 24,
  bodyWidth = 864,
  className,
  light,
}: Props) {
  return (
    <div className={clsx("flex flex-col items-center text-center", className)}>
      <p className={clsx("t-body", light ? "text-cream" : "text-red")}>{label}</p>
      <h2 className={clsx("t-h2 mt-1", light ? "text-white" : "text-ink")}>{title}</h2>
      {body && (
        <p
          className={clsx("t-body whitespace-pre-line", light ? "text-white" : "text-ink")}
          style={{ marginTop: bodyGap, maxWidth: bodyWidth }}
        >
          {body}
        </p>
      )}
    </div>
  );
}
