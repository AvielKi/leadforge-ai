// Client-side Google Places API client
// Uses the user's own API key directly from the browser
// This works on static hosting without a backend server

const GOOGLE_PLACES_KEY = "AIzaSyDmxfevGHxc5U2RLjLRVqPSS2gl13-sFCE";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function discoverBusinessesClientSide(params: {
  query: string;
  location?: string;
  maxResults?: number;
  autoAnalyze?: boolean;
}): Promise<any> {
  try {
    // Step 1: Text search via Google Places API (client-side)
    const searchParams = new URLSearchParams();
    searchParams.set("query", params.query + (params.location ? ` in ${params.location}` : ""));
    searchParams.set("key", GOOGLE_PLACES_KEY);

    const searchRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?${searchParams.toString()}`
    );
    const searchData = await searchRes.json();

    if (searchData.status === "REQUEST_DENIED" || searchData.status === "INVALID_REQUEST") {
      return {
        success: false,
        discovered: 0,
        analyzed: 0,
        businesses: [],
        message: `Google Places API error: ${searchData.error_message || searchData.status}. Please ensure the Places API is enabled in your Google Cloud Console and billing is set up.`,
        aiPowered: false,
      };
    }

    if (searchData.status !== "OK" && searchData.status !== "ZERO_RESULTS") {
      return {
        success: false,
        discovered: 0,
        analyzed: 0,
        businesses: [],
        message: `Google Places: ${searchData.status}${searchData.error_message ? ` - ${searchData.error_message}` : ""}`,
        aiPowered: false,
      };
    }

    const results = searchData.results || [];
    if (results.length === 0) {
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

    for (const result of results.slice(0, params.maxResults || 10)) {
      // Get place details
      const detailsRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${result.place_id}&fields=name,formatted_address,formatted_phone_number,international_phone_number,website,url,address_components,types,rating,user_ratings_total,geometry&key=${GOOGLE_PLACES_KEY}`
      );
      const detailsData = await detailsRes.json();
      const details = detailsData.result || {};

      // Parse address
      const components = details.address_components || [];
      const city = components.find((c: { types: string[] }) => c.types.includes("locality"))?.long_name || "";
      const country = components.find((c: { types: string[] }) => c.types.includes("country"))?.long_name || "";

      const cat = categorizePlace(result.types || []);
      const hasWebsite = !!details.website;
      const hasFacebook = false;
      const phone = details.formatted_phone_number || details.international_phone_number;
      const hasWhatsapp = !!phone && phone.replace(/[^\d+]/g, "").length >= 10;

      // Simple scoring (no OpenAI on client side for security)
      const websiteScore = hasWebsite ? 45 : 0;
      const mapsScore = result.user_ratings_total && result.user_ratings_total > 10 ? 50 : 25;
      const overallScore = Math.round(websiteScore * 0.25 + mapsScore * 0.25 + 15);

      const opportunityLevel = overallScore < 20 ? "very_high" : overallScore < 40 ? "high" : overallScore < 60 ? "medium" : "low";

      const issues: string[] = [];
      if (!hasWebsite) issues.push("No website detected — losing online visibility");
      if (!hasWhatsapp) issues.push("No WhatsApp Business — losing direct bookings");
      if (result.user_ratings_total && result.user_ratings_total < 20) issues.push("Few Google reviews — build review strategy");

      businesses.push({
        placeId: result.place_id,
        name: result.name,
        address: details.formatted_address || result.formatted_address || result.vicinity || "",
        city,
        country,
        phone: phone || null,
        whatsapp: hasWhatsapp ? phone : null,
        website: details.website || null,
        googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${result.place_id}`,
        rating: result.rating ?? undefined,
        reviewCount: result.user_ratings_total ?? undefined,
        types: result.types || [],
        latitude: result.geometry?.location?.lat || 0,
        longitude: result.geometry?.location?.lng || 0,
        category: cat.category,
        subCategory: cat.subCategory,
        hasWebsite,
        hasFacebook,
        hasWhatsapp,
        opportunityLevel,
        digitalScore: overallScore,
        aiSummary: `${result.name} has a ${overallScore < 40 ? "limited" : "developing"} digital presence. ${!hasWebsite ? "The lack of a website is the biggest missed opportunity." : "There's room for improvement."}`,
        detectedIssues: issues,
        _status: "new",
        source: "google_places",
        discoveryData: JSON.stringify({ placeId: result.place_id, types: result.types }),
      });

      analyzed++;

      // Rate limiting delay
      await sleep(200);
    }

    return {
      success: true,
      discovered: businesses.length,
      analyzed,
      businesses,
      aiPowered: false,
    };
  } catch (err) {
    return {
      success: false,
      discovered: 0,
      analyzed: 0,
      businesses: [],
      message: `Error: ${String(err)}. Make sure you're online and the Google Places API is enabled.`,
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
