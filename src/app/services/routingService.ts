const OSRM_BASE = 'https://router.project-osrm.org';

export type TransportProfile = 'driving' | 'walking' | 'cycling';

const PROFILE_MAP: Record<TransportProfile, string> = {
  driving: 'driving',
  walking: 'foot',
  cycling: 'bike',
};

export interface RouteMatrix {
  durations: number[][];
  distances: number[][];
}

export interface RouteResult {
  distance: number;
  duration: number;
  geometry: [number, number][];
}

const matrixCache = new Map<string, RouteMatrix>();
const routeCache = new Map<string, RouteResult>();

function cacheKey(points: { lat: number; lng: number }[], profile: string): string {
  return profile + '|' + points.map(p => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join(';');
}

function toOsrmCoords(points: { lat: number; lng: number }[]): string {
  return points.map(p => `${p.lng},${p.lat}`).join(';');
}

export async function getRouteMatrix(
  points: { lat: number; lng: number }[],
  profile: TransportProfile = 'driving',
): Promise<RouteMatrix> {
  const key = cacheKey(points, profile);
  const cached = matrixCache.get(key);
  if (cached) return cached;

  const coords = toOsrmCoords(points);
  const url = `${OSRM_BASE}/table/v1/${PROFILE_MAP[profile]}/${coords}?annotations=duration,distance`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`OSRM table request failed: ${response.status}`);
  const data = await response.json();
  if (data.code !== 'Ok') throw new Error(`OSRM error: ${data.code}`);

  const result: RouteMatrix = { durations: data.durations, distances: data.distances };
  matrixCache.set(key, result);
  return result;
}

export async function getRouteGeometry(
  waypoints: { lat: number; lng: number }[],
  profile: TransportProfile = 'driving',
): Promise<RouteResult> {
  if (waypoints.length < 2) return { distance: 0, duration: 0, geometry: [] };

  const key = 'route_' + cacheKey(waypoints, profile);
  const cached = routeCache.get(key);
  if (cached) return cached;

  const coords = toOsrmCoords(waypoints);
  const url = `${OSRM_BASE}/route/v1/${PROFILE_MAP[profile]}/${coords}?overview=full&geometries=geojson`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`OSRM route request failed: ${response.status}`);
  const data = await response.json();
  if (data.code !== 'Ok' || !data.routes.length) throw new Error(`OSRM error: ${data.code}`);

  const route = data.routes[0];
  const geometry: [number, number][] = route.geometry.coordinates.map(
    (c: number[]) => [c[1], c[0]] as [number, number],
  );

  const result: RouteResult = { distance: route.distance, duration: route.duration, geometry };
  routeCache.set(key, result);
  return result;
}

export function clearRouteCache(): void {
  matrixCache.clear();
  routeCache.clear();
}
