import { redirect } from "next/navigation";

/** A destination opens on its itinerary tab (the Experience tab is the per-destination experience page). */
export default async function DestinationPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  redirect(`/destinations/${code}/itinerary`);
}
