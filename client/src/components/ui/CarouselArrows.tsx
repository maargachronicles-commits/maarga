interface Props {
  onPrev: () => void;
  onNext: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  className?: string;
}

/** Figma "Frame 257": two 33.6px squares, 16px gap, chevrons 4×8. */
export default function CarouselArrows({ onPrev, onNext, prevDisabled, nextDisabled, className }: Props) {
  return (
    <div className={`flex items-center gap-4 ${className ?? ""}`}>
      <button type="button" className="car-btn" onClick={onPrev} disabled={prevDisabled} aria-label="Previous">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
          <path d="M10 4 6 8l4 4" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button type="button" className="car-btn" onClick={onNext} disabled={nextDisabled} aria-label="Next">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
          <path d="m6 4 4 4-4 4" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
