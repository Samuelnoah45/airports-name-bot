/**
 * Airport utilities using Supabase database
 * 
 * This module provides functions to search and retrieve airport data
 * from a Supabase database instead of a static JSON file.
 */

import { searchAirportsByCode, getAirportByExactCode, fetchAllAirports } from './supabase';

/**
 * Search for airport by code (partial, case-insensitive matching)
 * @param query - Airport code to search for
 * @returns Array of matching airports with their codes and names
 */
export async function searchAirport(query: string): Promise<Array<{ Name: string; City: string; Country: string; IATA: string; ICAO: string }>> {
  try {
    return await searchAirportsByCode(query);
  } catch (error) {
    console.error('Error searching airports:', error);
    return [];
  }
}

/**
 * Get exact airport match by code
 * @param code - Airport IATA code
 * @returns Airport name if found, null otherwise
 */
export async function getAirportByCode(code: string): Promise<{ Name: string; City: string; Country: string; IATA: string; ICAO: string } | null> {
  try {
    const airport = await getAirportByExactCode(code);
    return airport;
  } catch (error) {
    console.error('Error getting airport by code:', error);
    return null;
  }
}

/**
 * Get all airports from database
 * @returns Array of all airports
 */
export async function getAllAirports() {
  try {
    return await fetchAllAirports();
  } catch (error) {
    console.error('Error fetching all airports:', error);
    return [];
  }
}
