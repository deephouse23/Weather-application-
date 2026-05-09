/**
 * Top US hub airports for the airport misery board.
 * Coordinates used to fetch nearest-station METAR-equivalent data and to
 * intersect with SIGMET regions.
 */

export interface MajorAirport {
  iata: string;
  icao: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lon: number;
  tzOffset: number;
}

export const MAJOR_US_AIRPORTS: MajorAirport[] = [
  { iata: 'ATL', icao: 'KATL', name: 'Hartsfield-Jackson Atlanta', city: 'Atlanta', state: 'GA', lat: 33.6407, lon: -84.4277, tzOffset: -5 },
  { iata: 'DFW', icao: 'KDFW', name: 'Dallas/Fort Worth', city: 'Dallas', state: 'TX', lat: 32.8998, lon: -97.0403, tzOffset: -6 },
  { iata: 'DEN', icao: 'KDEN', name: 'Denver International', city: 'Denver', state: 'CO', lat: 39.8561, lon: -104.6737, tzOffset: -7 },
  { iata: 'ORD', icao: 'KORD', name: "Chicago O'Hare", city: 'Chicago', state: 'IL', lat: 41.9742, lon: -87.9073, tzOffset: -6 },
  { iata: 'LAX', icao: 'KLAX', name: 'Los Angeles International', city: 'Los Angeles', state: 'CA', lat: 33.9416, lon: -118.4085, tzOffset: -8 },
  { iata: 'JFK', icao: 'KJFK', name: 'John F. Kennedy International', city: 'New York', state: 'NY', lat: 40.6413, lon: -73.7781, tzOffset: -5 },
  { iata: 'LAS', icao: 'KLAS', name: 'Harry Reid International', city: 'Las Vegas', state: 'NV', lat: 36.0840, lon: -115.1537, tzOffset: -8 },
  { iata: 'MCO', icao: 'KMCO', name: 'Orlando International', city: 'Orlando', state: 'FL', lat: 28.4312, lon: -81.3081, tzOffset: -5 },
  { iata: 'CLT', icao: 'KCLT', name: 'Charlotte Douglas', city: 'Charlotte', state: 'NC', lat: 35.2140, lon: -80.9431, tzOffset: -5 },
  { iata: 'MIA', icao: 'KMIA', name: 'Miami International', city: 'Miami', state: 'FL', lat: 25.7959, lon: -80.2870, tzOffset: -5 },
  { iata: 'SEA', icao: 'KSEA', name: 'Seattle-Tacoma', city: 'Seattle', state: 'WA', lat: 47.4502, lon: -122.3088, tzOffset: -8 },
  { iata: 'PHX', icao: 'KPHX', name: 'Phoenix Sky Harbor', city: 'Phoenix', state: 'AZ', lat: 33.4342, lon: -112.0116, tzOffset: -7 },
  { iata: 'EWR', icao: 'KEWR', name: 'Newark Liberty', city: 'Newark', state: 'NJ', lat: 40.6895, lon: -74.1745, tzOffset: -5 },
  { iata: 'SFO', icao: 'KSFO', name: 'San Francisco International', city: 'San Francisco', state: 'CA', lat: 37.6213, lon: -122.3790, tzOffset: -8 },
  { iata: 'IAH', icao: 'KIAH', name: 'Houston Intercontinental', city: 'Houston', state: 'TX', lat: 29.9844, lon: -95.3414, tzOffset: -6 },
  { iata: 'BOS', icao: 'KBOS', name: 'Boston Logan', city: 'Boston', state: 'MA', lat: 42.3656, lon: -71.0096, tzOffset: -5 },
  { iata: 'MSP', icao: 'KMSP', name: 'Minneapolis-St Paul', city: 'Minneapolis', state: 'MN', lat: 44.8848, lon: -93.2223, tzOffset: -6 },
  { iata: 'FLL', icao: 'KFLL', name: 'Fort Lauderdale-Hollywood', city: 'Fort Lauderdale', state: 'FL', lat: 26.0726, lon: -80.1527, tzOffset: -5 },
  { iata: 'DTW', icao: 'KDTW', name: 'Detroit Metropolitan', city: 'Detroit', state: 'MI', lat: 42.2162, lon: -83.3554, tzOffset: -5 },
  { iata: 'PHL', icao: 'KPHL', name: 'Philadelphia International', city: 'Philadelphia', state: 'PA', lat: 39.8744, lon: -75.2424, tzOffset: -5 },
  { iata: 'LGA', icao: 'KLGA', name: 'LaGuardia', city: 'New York', state: 'NY', lat: 40.7769, lon: -73.8740, tzOffset: -5 },
  { iata: 'BWI', icao: 'KBWI', name: 'Baltimore/Washington', city: 'Baltimore', state: 'MD', lat: 39.1774, lon: -76.6684, tzOffset: -5 },
  { iata: 'SLC', icao: 'KSLC', name: 'Salt Lake City', city: 'Salt Lake City', state: 'UT', lat: 40.7899, lon: -111.9791, tzOffset: -7 },
  { iata: 'DCA', icao: 'KDCA', name: 'Reagan Washington National', city: 'Washington', state: 'DC', lat: 38.8512, lon: -77.0402, tzOffset: -5 },
  { iata: 'MDW', icao: 'KMDW', name: 'Chicago Midway', city: 'Chicago', state: 'IL', lat: 41.7868, lon: -87.7522, tzOffset: -6 },
  { iata: 'IAD', icao: 'KIAD', name: 'Washington Dulles', city: 'Washington', state: 'DC', lat: 38.9531, lon: -77.4565, tzOffset: -5 },
  { iata: 'SAN', icao: 'KSAN', name: 'San Diego International', city: 'San Diego', state: 'CA', lat: 32.7338, lon: -117.1933, tzOffset: -8 },
  { iata: 'TPA', icao: 'KTPA', name: 'Tampa International', city: 'Tampa', state: 'FL', lat: 27.9755, lon: -82.5332, tzOffset: -5 },
  { iata: 'PDX', icao: 'KPDX', name: 'Portland International', city: 'Portland', state: 'OR', lat: 45.5898, lon: -122.5951, tzOffset: -8 },
  { iata: 'AUS', icao: 'KAUS', name: 'Austin-Bergstrom', city: 'Austin', state: 'TX', lat: 30.1945, lon: -97.6699, tzOffset: -6 },
];

export function findAirportByCode(code: string): MajorAirport | undefined {
  const upper = code.trim().toUpperCase();
  return MAJOR_US_AIRPORTS.find(
    (a) => a.iata === upper || a.icao === upper,
  );
}

export function findAirportByCity(query: string): MajorAirport | undefined {
  const lower = query.trim().toLowerCase();
  return MAJOR_US_AIRPORTS.find(
    (a) =>
      a.city.toLowerCase() === lower ||
      a.name.toLowerCase().includes(lower),
  );
}
