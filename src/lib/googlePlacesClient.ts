// Client-side Google Places API client
// Uses the NEW Google Places API (v1) which supports CORS from browsers

const GOOGLE_PLACES_KEY = "AIzaSyDmxfevGHxc5U2RLjLRVqPSS2gl13-sFCE";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function discoverBusinessesClientSide(params: {
  query: string;
  location?: string;
  maxResults?: number;
  autoAnalyze?: boolean;
}): Promise<any> {
  try {
    const fullQuery = params.location
      ? `${params.query} in ${params.location}`
      : params.query;

    // Use NEW Google Places API (v1) - supports CORS
    const searchRes = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_PLACES_KEY,
          "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.addressComponents,places.types,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber,places.googleMapsUri,places.location,places.businessStatus",
        },
        body: JSON.stringify({
          textQuery: fullQuery,
          pageSize: params.maxResults || 10,
        }),
      }
    );

    if (!searchRes.ok) {
      const errText = await searchRes.text();
      return {
        success: false,
        discovered: 0,
        analyzed: 0,
        businesses: [],
        message: `Google Places API error (${searchRes.status}): ${errText?.slice(0, 200)}. Ensure Places API is enabled in Google Cloud Console.`,
        aiPowered: false,
      };
    }

    const searchData = await searchRes.json();
    const places = searchData.places || [];

    if (places.length === 0) {
      return {
        success: true,
        discovered: 0,
        analyzed: 0,
        businesses: [],
        message: "No businesses found. Try a different search query.",
        aiPowered: false,
      };
    }

    const businesses = [];
    let analyzed = 0;

    for (const place of places) {
      const components = place.addressComponents || [];
      const city =
        components.find((c: any) => c.types?.includes("locality"))?.longText ||
        components.find((c: any) => c.types?.includes("administrative_area_level_2"))?.longText ||
        "";
      const country =
        components.find((c: any) => c.types?.includes("country"))?.longText || "";

      const cat = categorizePlace(place.types || []);
      const hasWebsite = !!place.websiteUri;
      const phone = place.nationalPhoneNumber || "";
      const hasWhatsapp = !!phone && phone.replace(/[^\d+]/g, "").length >= 10;

      const websiteScore = hasWebsite ? 45 : 0;
      const mapsScore = place.userRatingCount && place.userRatingCount > 10 ? 50 : 25;
      const overallScore = Math.round(websiteScore * 0.25 + mapsScore * 0.25 + 15);

      const opportunityLevel =
        overallScore < 20
          ? "very_high"
          : overallScore < 40
            ? "high"
            : overallScore < 60
              ? "medium"
              : "low";

      const issues: string[] = [];
      if (!hasWebsite) issues.push("No website detected — losing online visibility");
      if (!hasWhatsapp) issues.push("No WhatsApp Business — losing direct bookings");
      if (place.userRatingCount && place.userRatingCount < 20)
        issues.push("Few Google reviews — build review strategy");

      businesses.push({
        placeId: place.id,
        name: place.displayName?.text || place.displayName || "Unnamed",
        address: place.formattedAddress || "",
        city,
        country,
        phone: phone || null,
        whatsapp: hasWhatsapp ? phone : null,
        website: place.websiteUri || null,
        googleMapsUrl: place.googleMapsUri || `https://www.google.com/maps/place/?q=place_id:${place.id}`,
        rating: place.rating ?? undefined,
        reviewCount: place.userRatingCount ?? undefined,
        types: place.types || [],
        latitude: place.location?.latitude || 0,
        longitude: place.location?.longitude || 0,
        category: cat.category,
        subCategory: cat.subCategory,
        hasWebsite,
        hasFacebook: false,
        hasWhatsapp,
        opportunityLevel,
        digitalScore: overallScore,
        aiSummary: `${place.displayName?.text || "This business"} has a ${overallScore < 40 ? "limited" : "developing"} digital presence. ${!hasWebsite ? "The lack of a website is the biggest missed opportunity." : "There's room for improvement."}`,
        detectedIssues: issues,
        _status: "new",
        source: "google_places",
        discoveryData: { placeId: place.id, types: place.types },
      });

      analyzed++;
    }

    return {
      success: true,
      discovered: businesses.length,
      analyzed,
      businesses,
      aiPowered: false,
    };
  } catch (err: any) {
    return {
      success: false,
      discovered: 0,
      analyzed: 0,
      businesses: [],
      message: `Error: ${err?.message || String(err)}. Make sure you're online and the Google Places API (New) is enabled in your Google Cloud Console.`,
      aiPowered: false,
    };
  }
}

function categorizePlace(types: string[]): { category: string; subCategory: string } {
  const typeMap: Record<string, { category: string; subCategory: string }> = {
    lodging: { category: "Hotels", subCategory: "Hotel" },
    restaurant: { category: "Restaurants", subCategory: "Restaurant" },
    cafe: { category: "Restaurants", subCategory: "Cafe" },
    beauty_salon: { category: "Salons", subCategory: "Beauty Salon" },
    hair_care: { category: "Salons", subCategory: "Hair Salon" },
    spa: { category: "Salons", subCategory: "Spa" },
    travel_agency: { category: "Tours", subCategory: "Travel Agency" },
    tourist_attraction: { category: "Tours", subCategory: "Tourist Attraction" },
    store: { category: "Retail", subCategory: "Retail Store" },
    gym: { category: "Fitness", subCategory: "Gym" },
    health: { category: "Health", subCategory: "Health Services" },
    doctor: { category: "Health", subCategory: "Medical" },
    real_estate_agency: { category: "Real Estate", subCategory: "Agency" },
    car_repair: { category: "Automotive", subCategory: "Car Repair" },
    bar: { category: "Restaurants", subCategory: "Bar" },
    night_club: { category: "Entertainment", subCategory: "Night Club" },
    museum: { category: "Tours", subCategory: "Museum" },
    campground: { category: "Lodges", subCategory: "Campground" },
    park: { category: "Tours", subCategory: "Park" },
    point_of_interest: { category: "Tours", subCategory: "Attraction" },
    establishment: { category: "Business", subCategory: "General" },
  };
  for (const type of types) {
    if (typeMap[type]) return typeMap[type];
  }
  return { category: "Business", subCategory: "General" };
}
