import Link from "next/link";

/**
 * Temporary catch-all so every routed link on the homepage (About, Experience,
 * Destinations, Events, Gallery, Shop, Contact, detail pages) resolves while
 * the real pages are built. Delete this file as pages are implemented.
 */
export default async function PlaceholderPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const title = slug.join(" / ").replace(/-/g, " ");
  return (
    <main className="container flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="t-body text-red">Coming soon</p>
      <h1 className="t-h2 mt-1 capitalize text-ink">{title}</h1>
      <Link href="/" className="arrow-link mt-8 text-red">
        Back to home
      </Link>
    </main>
  );
}
