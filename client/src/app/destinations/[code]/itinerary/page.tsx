import ItineraryPage from "./[itin]/page";

/** /destinations/HAM0001/itinerary → the destination's first published itinerary. */
export default async function FirstItinerary({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <ItineraryPage params={Promise.resolve({ code, itin: "_first" })} />;
}
