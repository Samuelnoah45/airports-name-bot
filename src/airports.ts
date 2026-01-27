import * as fs from 'fs';
import * as path from 'path';

interface AirportData {
  [key: string]: string;
}

let airportData: AirportData | null = null;

/**
 * Load airport data from JSON file
 */
export function loadAirportData(): AirportData {
  if (airportData) {
    return airportData;
  }

  const filePath = path.join(__dirname, '..', 'airports.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data: AirportData = JSON.parse(rawData);
  airportData = data;
  return data;
}

/**
 * Search for airport by code (partial, case-insensitive matching)
 * @param query - Airport code to search for
 * @returns Array of matching airports with their codes and names
 */
export function searchAirport(query: string): Array<{ code: string; name: string }> {
  const airports = loadAirportData();
  const normalizedQuery = query.trim().toUpperCase();

  const results: Array<{ code: string; name: string }> = [];

  for (const [code, name] of Object.entries(airports)) {
    if (code.includes(normalizedQuery)) {
      results.push({ code, name });
    }
  }

  return results;
}

/**
 * Get exact airport match
 * @param code - Airport IATA code
 * @returns Airport name if found, null otherwise
 */
export function getAirportByCode(code: string): string | null {
  const airports = loadAirportData();
  const normalizedCode = code.trim().toUpperCase();
  return airports[normalizedCode] || null;
}

/**
 * Get all airports
 * @returns Object with all airport codes and names
 */
export function getAllAirports(): AirportData {
  return loadAirportData();
}
