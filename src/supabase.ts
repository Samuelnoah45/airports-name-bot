import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface Airport {
  id: number;
  code: string;
  name: string;
  created_at: string;
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
  
  console.log('[DEBUG] Fetching all airports from table "airports"');
  
  const { data, error } = await supabase
    .from('airports')
    .select('id, code, name, created_at')
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
): Promise<Array<{ code: string; name: string }>> {
  const supabase = getSupabaseClient();
  const normalizedQuery = query.trim().toUpperCase();

  console.log(`[DEBUG] Searching for: "${normalizedQuery}" in table "airports"`);

  // First, let's test if we can query the table at all
  const { count, error: countError } = await supabase
    .from('airports')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.error('❌ Error checking table access:', countError);
    console.error('Error details:', JSON.stringify(countError, null, 2));
    throw new Error(`Failed to access airports table: ${countError.message}`);
  }
  
  console.log(`[DEBUG] Total rows in airports table: ${count}`);

  // Try a simple select first to see what columns exist
  const { data: sampleData, error: sampleError } = await supabase
    .from('airports')
    .select('*')
    .limit(1);
  
  if (sampleError) {
    console.error('❌ Error fetching sample data:', sampleError);
    console.error('Error details:', JSON.stringify(sampleError, null, 2));
  } else {
    console.log(`[DEBUG] Sample row structure:`, sampleData?.[0] ? Object.keys(sampleData[0]) : 'No data');
    if (sampleData && sampleData.length > 0) {
      console.log(`[DEBUG] Sample row:`, JSON.stringify(sampleData[0], null, 2));
    }
  }

  // Use ilike for case-insensitive pattern matching
  // Try different column name variations
  let data, error;
  
  // Try with 'code' column
  const result1 = await supabase
    .from('airports')
    .select('code, name')
    .ilike('code', `%${normalizedQuery}%`)
    .order('code', { ascending: true })
    .limit(20);
  
  data = result1.data;
  error = result1.error;
  
  // If that fails, try with different column names
  if (error || !data || data.length === 0) {
    console.log(`[DEBUG] Trying alternative column names...`);
    
    // Try 'iata' or 'airport_code' or just select all
    const result2 = await supabase
      .from('airports')
      .select('*')
      .ilike('code', `%${normalizedQuery}%`)
      .limit(20);
    
    if (!result2.error && result2.data && result2.data.length > 0) {
      console.log(`[DEBUG] Found data with select('*'), mapping columns...`);
      // Map to expected format
      data = result2.data.map((row: any) => ({
        code: row.code || row.iata || row.airport_code || row.Code || row.CODE,
        name: row.name || row.airport_name || row.Name || row.NAME || row.full_name
      })).filter((row: any) => row.code && row.name);
    } else {
      // Try exact match with different column
      const result3 = await supabase
        .from('airports')
        .select('*')
        .eq('code', normalizedQuery)
        .limit(20);
      
      if (!result3.error && result3.data && result3.data.length > 0) {
        console.log(`[DEBUG] Found data with exact match, mapping columns...`);
        data = result3.data.map((row: any) => ({
          code: row.code || row.iata || row.airport_code || row.Code || row.CODE,
          name: row.name || row.airport_name || row.Name || row.NAME || row.full_name
        })).filter((row: any) => row.code && row.name);
        error = null;
      }
    }
  }

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
    console.log(`  - Table name is "airports"`);
    console.log(`  - Column "code" exists and contains "${normalizedQuery}"`);
    console.log(`  - RLS policies allow SELECT`);
  }

  return data || [];
}

/**
 * Get exact airport by code
 */
export async function getAirportByExactCode(
  code: string
): Promise<{ code: string; name: string } | null> {
  const supabase = getSupabaseClient();
  const normalizedCode = code.trim().toUpperCase();

  console.log(`[DEBUG] Getting exact match for: "${normalizedCode}"`);

  const { data, error } = await supabase
    .from('airports')
    .select('code, name')
    .eq('code', normalizedCode)
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
