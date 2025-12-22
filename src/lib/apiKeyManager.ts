// API Key Management - handles user's custom YouTube API key
// Stores in localStorage for non-logged in users, Supabase for logged in users

import { createClient } from "./supabase/client";

const STORAGE_KEY = "youtube_api_key";
const API_REQUEST_COUNT_KEY = "youtube_api_request_count";
const API_REQUEST_RESET_DATE_KEY = "youtube_api_request_reset_date";
const MAX_REQUESTS_BEFORE_PROMPT = 50; // Prompt user after 50 requests

interface ApiKeyStatus {
  key: string | null;
  isCustom: boolean;
  shouldPrompt: boolean;
  requestCount: number;
}

/**
 * Get the API key to use (user's custom key or default env key)
 */
export async function getYouTubeApiKey(): Promise<string | null> {
  // First check for user's custom key
  const customKey = await getUserApiKey();
  if (customKey) {
    return customKey;
  }

  // Fallback to environment variable
  return process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || null;
}

/**
 * Get user's custom API key (from localStorage or Supabase)
 */
export async function getUserApiKey(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Not logged in - use localStorage
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY);
    }
    return null;
  }

  // Logged in - use Supabase
  try {
    const { data, error } = await supabase
      .from("user_settings")
      .select("youtube_api_key")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned, which is fine
      console.error("Error fetching user API key:", error);
      return null;
    }

    return data?.youtube_api_key || null;
  } catch (error) {
    console.error("Error fetching API key from Supabase:", error);
    return null;
  }
}

/**
 * Save user's custom API key
 */
export async function saveUserApiKey(apiKey: string): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Not logged in - use localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, apiKey);
        return true;
      } catch (error) {
        console.error("Error saving API key to localStorage:", error);
        return false;
      }
    }
    return false;
  }

  // Logged in - use Supabase
  try {
    const { error } = await supabase.from("user_settings").upsert(
      {
        user_id: user.id,
        youtube_api_key: apiKey,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

    if (error) {
      console.error("Error saving API key to Supabase:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error saving API key:", error);
    return false;
  }
}

/**
 * Delete user's custom API key
 */
export async function deleteUserApiKey(): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Not logged in - use localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
      } catch (error) {
        console.error("Error removing API key from localStorage:", error);
        return false;
      }
    }
    return false;
  }

  // Logged in - use Supabase
  try {
    const { error } = await supabase
      .from("user_settings")
      .update({ youtube_api_key: null })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error removing API key from Supabase:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error removing API key:", error);
    return false;
  }
}

/**
 * Track API request count (for prompting users to use their own key)
 */
export function trackApiRequest(): void {
  if (typeof window === "undefined") return;

  const today = new Date().toDateString();
  const resetDate = localStorage.getItem(API_REQUEST_RESET_DATE_KEY);

  // Reset count if it's a new day
  if (resetDate !== today) {
    localStorage.setItem(API_REQUEST_RESET_DATE_KEY, today);
    localStorage.setItem(API_REQUEST_COUNT_KEY, "0");
  }

  const currentCount = parseInt(
    localStorage.getItem(API_REQUEST_COUNT_KEY) || "0",
    10
  );
  localStorage.setItem(API_REQUEST_COUNT_KEY, (currentCount + 1).toString());
}

/**
 * Get API key status (whether user has custom key, should be prompted, etc.)
 */
export async function getApiKeyStatus(): Promise<ApiKeyStatus> {
  const customKey = await getUserApiKey();
  const defaultKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

  if (typeof window === "undefined") {
    return {
      key: customKey || defaultKey || null,
      isCustom: !!customKey,
      shouldPrompt: false,
      requestCount: 0,
    };
  }

  const today = new Date().toDateString();
  const resetDate = localStorage.getItem(API_REQUEST_RESET_DATE_KEY);

  // Reset count if it's a new day
  if (resetDate !== today) {
    localStorage.setItem(API_REQUEST_RESET_DATE_KEY, today);
    localStorage.setItem(API_REQUEST_COUNT_KEY, "0");
  }

  const requestCount = parseInt(
    localStorage.getItem(API_REQUEST_COUNT_KEY) || "0",
    10
  );

  const shouldPrompt =
    !customKey && // User doesn't have custom key
    !!defaultKey && // Default key exists (we're using shared key)
    requestCount >= MAX_REQUESTS_BEFORE_PROMPT; // Reached threshold

  return {
    key: customKey || defaultKey || null,
    isCustom: !!customKey,
    shouldPrompt,
    requestCount,
  };
}

/**
 * Reset request count (call this when user adds their own key)
 */
export function resetRequestCount(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(API_REQUEST_COUNT_KEY);
    localStorage.removeItem(API_REQUEST_RESET_DATE_KEY);
  }
}

