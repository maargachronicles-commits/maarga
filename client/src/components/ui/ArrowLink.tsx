import Link from "next/link";
import clsx from "clsx";

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" fill="none" className={className} aria-hidden>
      <path d="M3 7h8.2M7.1 2.9 11.2 7l-4.1 4.1" stroke="currentColor" strokeWidth="1.18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ArrowLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={clsx("arrow-link", className)}>
      <span>{children}</span>
      <ArrowIcon />
    </Link>
  );
}
