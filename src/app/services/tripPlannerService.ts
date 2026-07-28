import { haversineDistance } from '../utils/geo';
import type { HeritageSite, HeritageType, Classification } from '../../core/types';
import { getRouteMatrix, getRouteGeometry, clearRouteCache } from './routingService';
import type { TransportProfile } from './routingService';

export const VAN_DINH_ORIGIN = { lat: 20.755, lng: 105.855 };

const DAY_COLORS = [
  '#E74C3C', '#2980B9', '#27AE60', '#D4A017',
  '#8E44AD', '#D35400', '#16A085',
];

export const VISIT_DURATION: Record<string, number> = {
  dinh: 45, chua: 40, den: 30, mieu: 25, phu: 35,
  quan: 30, nhacu: 45, nhatho: 30, lang: 35,
};

const CLASSIFICATION_SCORE: Record<string, number> = {
  national: 3, city: 2, unranked: 1,
};

export interface TripDestination {
  siteId: string;
  nameVi: string;
  nameEn: string;
  type: HeritageType;
  classification: string;
  order: number;
  position: { lat: number; lng: number };
  distanceFromPrev: number;
  distanceFromStart: number;
  estimatedArrival: string;
  visitDuration: number;
  departureTime: string;
  travelTime: number;
  routeFromPrev?: [number, number][];
}

export interface DayItinerary {
  day: number;
  destinations: TripDestination[];
  color: string;
  totalDistance: number;
  totalDuration: number;
  routeGeometry: [number, number][];
}

export interface TripPlan {
  days: DayItinerary[];
  totalSites: number;
  totalDistance: number;
  totalDuration: number;
  startTime: string;
  endTime: string;
  totalVisitTime: number;
  totalTravelTime: number;
  transportMode: TransportProfile;
  origin: { lat: number; lng: number };
}

export function fmtTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h${m > 0 ? m + 'ph' : ''}` : `${m}ph`;
}

export function fmtDist(meters: number): string {
  const km = meters / 1000;
  return km < 1 ? `${Math.round(meters)}m` : `${km.toFixed(1)}km`;
}

export { VAN_DINH_ORIGIN as UBND_XA_COORDS, VISIT_DURATION as VISIT_DURATION_MINUTES };

export type TripType = 'half-day' | 'one-day' | 'full-day';

export interface PlannerConfig {
  sites: HeritageSite[];
  origin: { lat: number; lng: number };
  destinationCount: number;
  transportMode: TransportProfile;
  tripType: TripType;
  onProgress?: (step: string) => void;
}

const TRIP_TYPE_LIMITS: Record<TripType, number> = {
  'half-day': 240,
  'one-day': 480,
  'full-day': 600,
};

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const total = Math.round(minutes);
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function selectCandidates(
  sites: HeritageSite[],
  origin: { lat: number; lng: number },
  count: number,
): (HeritageSite & { lat: number; lon: number })[] {
  const valid = sites.filter(
    (s): s is HeritageSite & { lat: number; lon: number } =>
      s.lat !== null && s.lon !== null,
  );

  const scored = valid.map(s => ({
    site: s,
    score: (CLASSIFICATION_SCORE[s.classification] ?? 1) * 10000
      - haversineDistance(origin.lat, origin.lng, s.lat, s.lon),
  }));

  scored.sort((a, b) => b.score - a.score);

  const selected: (HeritageSite & { lat: number; lon: number })[] = [];
  const seenTypes = new Set<HeritageType>();
  const batch = Math.min(count * 2, scored.length);

  for (let i = 0; i < batch && selected.length < count; i++) {
    const s = scored[i].site;
    if (!seenTypes.has(s.type) || selected.length < count - 1) {
      selected.push(s);
      seenTypes.add(s.type);
    }
  }

  while (selected.length < count && selected.length < scored.length) {
    selected.push(scored[selected.length].site);
  }

  return selected;
}

function nearestNeighbor(
  matrix: number[][],
  startIdx: number,
  count: number,
  priorityScores: number[],
): number[] {
  const visited = new Set<number>();
  const order: number[] = [];
  let current = startIdx;
  visited.add(current);
  order.push(current);

  for (let step = 0; step < count; step++) {
    let bestIdx = -1;
    let bestCost = Infinity;
    for (let j = 1; j < matrix.length; j++) {
      if (visited.has(j)) continue;
      const travelCost = matrix[current][j];
      const priorityBonus = priorityScores[j] / 1000;
      const cost = travelCost - priorityBonus;
      if (cost < bestCost) {
        bestCost = cost;
        bestIdx = j;
      }
    }
    if (bestIdx === -1) break;
    visited.add(bestIdx);
    order.push(bestIdx);
    current = bestIdx;
  }

  return order;
}

function twoOptImprovement(
  order: number[],
  matrix: number[][],
): number[] {
  let improved = true;
  const n = order.length;
  let best = order.slice();

  while (improved) {
    improved = false;
    for (let i = 1; i < n - 1; i++) {
      for (let k = i + 1; k < n; k++) {
        const newOrder = best.slice(0, i).concat(
          best.slice(i, k + 1).reverse(),
          best.slice(k + 1),
        );

        const oldCost = matrix[best[i - 1]][best[i]]
          + (k + 1 < n ? matrix[best[k]][best[k + 1]] : 0);
        const newCost = matrix[best[i - 1]][best[k]]
          + (k + 1 < n ? matrix[best[i]][best[k + 1]] : 0);

        if (newCost < oldCost) {
          best = newOrder;
          improved = true;
        }
      }
    }
  }

  return best;
}

export async function generateTripPlan(config: PlannerConfig): Promise<TripPlan> {
  const {
    sites, origin, destinationCount, transportMode,
    tripType, onProgress,
  } = config;

  onProgress?.('Selecting heritage sites...');
  const candidates = selectCandidates(sites, origin, destinationCount);

  if (candidates.length === 0) {
    return emptyPlan(origin, transportMode);
  }

  const count = Math.min(candidates.length, destinationCount);
  const selected = candidates.slice(0, count);
  const allPoints = [origin, ...selected.map(s => ({ lat: s.lat, lng: s.lon }))];

  onProgress?.('Fetching route data from OSRM...');
  let matrix: { durations: number[][]; distances: number[][] };

  try {
    matrix = await getRouteMatrix(allPoints, transportMode);
  } catch {
    onProgress?.('Using estimated distances (OSRM unavailable)...');
    const n = allPoints.length;
    const durations: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    const distances: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const d = haversineDistance(
          allPoints[i].lat, allPoints[i].lng,
          allPoints[j].lat, allPoints[j].lng,
        ) * 1000;
        distances[i][j] = d;
        durations[i][j] = d / (transportMode === 'walking' ? 1.4 : transportMode === 'cycling' ? 15 : 40) * 3.6;
      }
    }
    matrix = { durations, distances };
  }

  onProgress?.('Optimizing route order...');
  const priorityScores = [0, ...selected.map(s => CLASSIFICATION_SCORE[s.classification] ?? 1)];
  let order = nearestNeighbor(matrix.durations, 0, count, priorityScores);
  order = twoOptImprovement(order, matrix.durations);

  const orderedSites = order.slice(1).map(idx => selected[idx - 1]);

  onProgress?.('Building route geometry...');
  const orderedPoints = [origin, ...orderedSites.map(s => ({ lat: s.lat, lng: s.lon }))];

  let routeGeometry: [number, number][] = [];
  try {
    const routeResult = await getRouteGeometry(orderedPoints, transportMode);
    routeGeometry = routeResult.geometry;
  } catch {
    routeGeometry = orderedPoints.map(p => [p.lat, p.lng] as [number, number]);
  }

  onProgress?.('Building timeline...');
  const destinations: TripDestination[] = [];
  const maxMinutes = TRIP_TYPE_LIMITS[tripType];
  let currentMinutes = 8 * 60;
  let totalTravelSec = 0;
  let totalVisitMin = 0;
  let totalDistM = 0;
  const startTime = minutesToTime(currentMinutes);
  let segmentGeometries: [number, number][] = [orderedPoints[0] ? [orderedPoints[0].lat, orderedPoints[0].lng] : [0, 0]];

  for (let i = 0; i < orderedSites.length; i++) {
    const site = orderedSites[i];
    const fromIdx = order[i];
    const toIdx = order[i + 1];
    const travelTimeSec = matrix.durations[fromIdx]?.[toIdx] ?? 0;
    const travelDistM = matrix.distances[fromIdx]?.[toIdx] ?? 0;
    const travelTimeMin = Math.round(travelTimeSec / 60);
    const visitMin = VISIT_DURATION[site.type] ?? 40;

    if (i > 0) {
      currentMinutes += travelTimeMin;
    }
    totalTravelSec += travelTimeSec;
    totalDistM += travelDistM;

    if (currentMinutes + visitMin > 8 * 60 + maxMinutes && i > 0) break;

    const arrivalTime = minutesToTime(currentMinutes);
    currentMinutes += visitMin;
    totalVisitMin += visitMin;
    const departureTime = minutesToTime(currentMinutes);

    if (routeGeometry.length > 1) {
      const legStart = Math.round((i / orderedSites.length) * routeGeometry.length);
      const legEnd = Math.round(((i + 1) / orderedSites.length) * routeGeometry.length);
      const legGeo = routeGeometry.slice(legStart, legEnd);
      segmentGeometries.push(...legGeo);
    }

    destinations.push({
      siteId: site.id,
      nameVi: site.nameVi,
      nameEn: site.nameEn,
      type: site.type,
      classification: site.classification,
      order: i + 1,
      position: { lat: site.lat, lng: site.lon },
      distanceFromPrev: travelDistM,
      distanceFromStart: totalDistM,
      estimatedArrival: arrivalTime,
      visitDuration: visitMin,
      departureTime,
      travelTime: travelTimeMin,
    });
  }

  const endTime = minutesToTime(currentMinutes);
  const totalDurationMin = currentMinutes - timeToMinutes(startTime);

  const fullRouteGeo = routeGeometry.length > 1
    ? routeGeometry
    : orderedPoints.map(p => [p.lat, p.lng] as [number, number]);

  return {
    days: [{
      day: 1,
      destinations,
      color: DAY_COLORS[0],
      totalDistance: totalDistM,
      totalDuration: totalDurationMin,
      routeGeometry: fullRouteGeo,
    }],
    totalSites: destinations.length,
    totalDistance: totalDistM,
    totalDuration: totalDurationMin,
    startTime,
    endTime,
    totalVisitTime: totalVisitMin,
    totalTravelTime: Math.round(totalTravelSec / 60),
    transportMode: transportMode,
    origin,
  };
}

function emptyPlan(origin: { lat: number; lng: number }, mode: TransportProfile): TripPlan {
  return {
    days: [],
    totalSites: 0,
    totalDistance: 0,
    totalDuration: 0,
    startTime: '08:00',
    endTime: '08:00',
    totalVisitTime: 0,
    totalTravelTime: 0,
    transportMode: mode,
    origin,
  };
}

export { clearRouteCache };
