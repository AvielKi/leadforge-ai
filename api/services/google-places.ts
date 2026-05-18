import { env } from "../lib/env";

const GOOGLE_PLACES_BASE = "https://maps.googleapis.com/maps/api/place";

export function hasGooglePlaces(): boolean {
  return !!env.googlePlacesApiKey && env.googlePlacesApiKey.length > 10 && !env.googlePlacesApiKey.includes("your-google");
}

interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  city: string;
  country: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  types: string[];
  latitude: number;
  longitude: number;
  googleMapsUrl: string;
}

interface GoogleSearchResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  geometry?: {
    location?: { lat: number; lng: number };
  };
}

interface GooglePlaceDetail {
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  url?: string;
  address_components?: Array<{
    types: string[];
    long_name: string;
  }>;
}

// ───────────────────────────────────────────────
// Search businesses via Google Places API
// ───────────────────────────────────────────────
export async function searchBusinesses(params: {
  query: string;
  location?: string;
  radius?: number;
  type?: string;
  maxResults?: number;
}): Promise<PlaceResult[]> {
  if (!hasGooglePlaces()) {
    return [];
  }

  try {
    // Step 1: Text search
    const searchUrl = new URL(`${GOOGLE_PLACES_BASE}/textsearch/json`);
    searchUrl.searchParams.set("query", params.query);
    searchUrl.searchParams.set("key", env.googlePlacesApiKey);
    if (params.location) {
      const coords = await geocodeLocation(params.location);
      if (coords) {
        searchUrl.searchParams.set("location", `${coords.lat},${coords.lng}`);
        searchUrl.searchParams.set("radius", String((params.radius || 50) * 1000));
      }
    }
    if (params.type) {
      searchUrl.searchParams.set("type", params.type);
    }

    const searchRes = await fetch(searchUrl.toString());
    const searchData = await searchRes.json() as {
      status: string;
      error_message?: string;
      results?: GoogleSearchResult[];
    };

    if (searchData.status !== "OK" && searchData.status !== "ZERO_RESULTS") {
      console.error("Google Places API error:", searchData.status, searchData.error_message);
      return [];
    }

    const results = searchData.results || [];
    const businesses: PlaceResult[] = [];

    // Step 2: Get details for each result (limit to maxResults)
    const limited = results.slice(0, Math.min(params.maxResults || 10, 20));

    for (const result of limited) {
      const details = await getPlaceDetails(result.place_id);

      // Parse address components
      const addressComponents = details?.address_components || [];
      const city = addressComponents.find((c) => c.types.includes("locality"))?.long_name || "";
      const country = addressComponents.find((c) => c.types.includes("country"))?.long_name || "";

      businesses.push({
        placeId: result.place_id,
        name: result.name,
        address: result.formatted_address || result.vicinity || "",
        city,
        country,
        phone: details?.formatted_phone_number || details?.international_phone_number,
        website: details?.website,
        rating: result.rating,
        reviewCount: result.user_ratings_total,
        types: result.types || [],
        latitude: result.geometry?.location?.lat || 0,
        longitude: result.geometry?.location?.lng || 0,
        googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${result.place_id}`,
      });

      // Small delay to respect rate limits
      await sleep(100);
    }

    return businesses;
  } catch (err) {
    console.error("Google Places search error:", err);
    return [];
  }
}

// ───────────────────────────────────────────────
// Get detailed place information
// ───────────────────────────────────────────────
export async function getPlaceDetails(placeId: string): Promise<GooglePlaceDetail | null> {
  if (!hasGooglePlaces()) return null;

  try {
    const url = new URL(`${GOOGLE_PLACES_BASE}/details/json`);
    url.searchParams.set("place_id", placeId);
    url.searchParams.set("fields", "name,formatted_address,formatted_phone_number,international_phone_number,website,url,address_components,types,rating,user_ratings_total,geometry,opening_hours,photos");
    url.searchParams.set("key", env.googlePlacesApiKey);

    const res = await fetch(url.toString());
    const data = await res.json() as {
      status: string;
      result?: GooglePlaceDetail;
    };

    if (data.status !== "OK") {
      console.error("Place details error:", data.status);
      return null;
    }

    return data.result || null;
  } catch (err) {
    console.error("Place details error:", err);
    return null;
  }
}

// ───────────────────────────────────────────────
// Find nearby businesses
// ───────────────────────────────────────────────
export async function findNearbyBusinesses(params: {
  lat: number;
  lng: number;
  radiusKm: number;
  keyword?: string;
  type?: string;
  maxResults?: number;
}): Promise<PlaceResult[]> {
  if (!hasGooglePlaces()) return [];

  try {
    const url = new URL(`${GOOGLE_PLACES_BASE}/nearbysearch/json`);
    url.searchParams.set("location", `${params.lat},${params.lng}`);
    url.searchParams.set("radius", String(params.radiusKm * 1000));
    url.searchParams.set("key", env.googlePlacesApiKey);
    if (params.keyword) url.searchParams.set("keyword", params.keyword);
    if (params.type) url.searchParams.set("type", params.type);

    const res = await fetch(url.toString());
    const data = await res.json() as {
      status: string;
      results?: GoogleSearchResult[];
    };

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Nearby search error:", data.status);
      return [];
    }

    const results = data.results || [];
    const businesses: PlaceResult[] = [];

    for (const result of results.slice(0, params.maxResults || 10)) {
      const details = await getPlaceDetails(result.place_id);
      const addressComponents = details?.address_components || [];
      const city = addressComponents.find((c) => c.types.includes("locality"))?.long_name || "";
      const country = addressComponents.find((c) => c.types.includes("country"))?.long_name || "";

      businesses.push({
        placeId: result.place_id,
        name: result.name,
        address: result.vicinity || "",
        city,
        country,
        phone: details?.formatted_phone_number || details?.international_phone_number,
        website: details?.website,
        rating: result.rating,
        reviewCount: result.user_ratings_total,
        types: result.types || [],
        latitude: result.geometry?.location?.lat || 0,
        longitude: result.geometry?.location?.lng || 0,
        googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${result.place_id}`,
      });

      await sleep(100);
    }

    return businesses;
  } catch (err) {
    console.error("Nearby search error:", err);
    return [];
  }
}

// ───────────────────────────────────────────────
// Geocode a location string to lat/lng
// ───────────────────────────────────────────────
export async function geocodeLocation(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!hasGooglePlaces()) return null;

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("address", address);
    url.searchParams.set("key", env.googlePlacesApiKey);

    const res = await fetch(url.toString());
    const data = await res.json() as {
      status: string;
      results?: Array<{
        geometry?: {
          location?: { lat: number; lng: number };
        };
      }>;
    };

    if (data.status !== "OK") return null;

    const location = data.results?.[0]?.geometry?.location;
    if (!location) return null;

    return { lat: location.lat, lng: location.lng };
  } catch {
    return null;
  }
}

// ───────────────────────────────────────────────
// Categorize Google place types into our categories
// ───────────────────────────────────────────────
export function categorizePlace(types: string[]): { category: string; subCategory: string } {
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

// ───────────────────────────────────────────────
// Detect if business likely has WhatsApp
// ───────────────────────────────────────────────
export function detectWhatsapp(phone?: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[^\d+]/g, "");
  return cleaned.length >= 10;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
