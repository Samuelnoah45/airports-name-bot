import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface Airport {
  id: string;
  Name: string;
  City: string;
  Country: string;
  IATA: string;
  ICAO: string;
}

let supabaseClient: SupabaseClient | null = null;

/**
 * Initialize and get Supabase client
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env file'
    );
  }

  console.log('[DEBUG] Initializing Supabase client');
  console.log(`[DEBUG] Supabase URL: ${supabaseUrl}`);
  console.log(`[DEBUG] Supabase Key: ${supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'MISSING'}`);

  supabaseClient = createClient(supabaseUrl, supabaseKey);
  return supabaseClient;
}

/**
 * Fetch all airports from Supabase
 */
export async function fetchAllAirports(): Promise<Airport[]> {
  const supabase = getSupabaseClient();
  
  console.log('[DEBUG] Fetching all airports from table "airport_list"');
  
  const { data, error } = await supabase
    .from('airport_list')
    .select('id, Name, City, Country, IATA, ICAO')
    .order('id', { ascending: true });

  if (error) {
    console.error('❌ Error fetching airports from Supabase:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw new Error(`Failed to fetch airports: ${error.message}`);
  }

  console.log(`[DEBUG] Fetched ${data?.length || 0} airports`);

  return data || [];
}

/**
 * Search airports by code (partial match, case-insensitive)
 */
export async function searchAirportsByCode(
  query: string
): Promise<Array<{ Name: string; City: string; Country: string; IATA: string; ICAO: string }>> {
  const supabase = getSupabaseClient();
  const normalizedQuery = query.trim().toUpperCase();

  console.log(`[DEBUG] Searching for: "${normalizedQuery}" in table "airport_list"`);

  // Search by IATA code (case-insensitive pattern matching)
  const { data, error } = await supabase
    .from('airport_list')
    .select('Name, City, Country, IATA, ICAO')
    .ilike('IATA', `%${normalizedQuery}%`)
    .order('IATA', { ascending: true })
    .limit(20);

  if (error) {
    console.error('❌ Error searching airports:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw new Error(`Failed to search airports: ${error.message}`);
  }

  console.log(`[DEBUG] Found ${data?.length || 0} results`);
  if (data && data.length > 0) {
    console.log(`[DEBUG] First result:`, data[0]);
  } else {
    console.log(`[DEBUG] No results found. Check:`);
    console.log(`  - Table name is "airport_list"`);
    console.log(`  - Column "IATA" exists and contains "${normalizedQuery}"`);
    console.log(`  - RLS policies allow SELECT`);
  }

  return data || [];
}

/**
 * Get exact airport by code
 */
export async function getAirportByExactCode(
  code: string
): Promise<{ Name: string; City: string; Country: string; IATA: string; ICAO: string } | null> {
  const supabase = getSupabaseClient();
  const normalizedCode = code.trim().toUpperCase();

  console.log(`[DEBUG] Getting exact match for: "${normalizedCode}"`);

  const { data, error } = await supabase
    .from('airport_list')
    .select('Name, City, Country, IATA, ICAO')
    .eq('IATA', normalizedCode)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      console.log(`[DEBUG] No exact match found for "${normalizedCode}"`);
      return null;
    }
    console.error('❌ Error getting airport by code:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw new Error(`Failed to get airport: ${error.message}`);
  }

  console.log(`[DEBUG] Found exact match:`, data);
  return data;
}
