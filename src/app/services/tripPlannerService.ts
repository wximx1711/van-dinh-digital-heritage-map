import { haversineDistance } from '../utils/geo';
import type { HeritageSite, HeritageType } from '../../core/types';

const UBND_XA_COORDS = { lat: 20.755, lng: 105.855 };

const DAY_COLORS = [
  '#E74C3C',
  '#2980B9',
  '#27AE60',
  '#D4A017',
  '#8E44AD',
  '#D35400',
  '#16A085',
];

const AVG_SPEED_KMH = 30;
const VISIT_DURATION_MINUTES = 45;

function fmtTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h${m > 0 ? m + 'ph' : ''}` : `${m}ph`;
}

function fmtDist(km: number): string {
  return km < 1 ? `${(km * 1000).toFixed(0)}m` : `${km.toFixed(1)}km`;
}

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
}

export interface DayItinerary {
  day: number;
  destinations: TripDestination[];
  color: string;
  totalDistance: number;
  totalDuration: number;
}

export interface TripPlan {
  days: DayItinerary[];
  totalSites: number;
  totalDistance: number;
  totalDuration: number;
}

export { fmtTime, fmtDist, AVG_SPEED_KMH, VISIT_DURATION_MINUTES, UBND_XA_COORDS };

function addMinutesToTime(baseMinutes: number, addMinutes: number): string {
  const total = baseMinutes + addMinutes;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function timeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

export function generateTripPlan(
  sites: HeritageSite[],
  numDays: number,
): TripPlan {
  const validSites = sites.filter(
    (s): s is HeritageSite & { lat: number; lon: number } =>
      s.lat !== null && s.lon !== null,
  );

  if (validSites.length === 0 || numDays < 1) {
    return { days: [], totalSites: 0 };
  }

  const categories: HeritageType[] = [
    'dinh', 'chua', 'den', 'mieu', 'phu',
    'quan', 'nhacu', 'nhatho', 'lang',
  ];

  const categoryOrder = new Map<HeritageType, number>();
  categories.forEach((c, i) => categoryOrder.set(c, i));

  const classScore: Record<string, number> = {
    national: 3,
    city: 2,
    unranked: 1,
  };

  const scored = validSites.map((s) => ({
    site: s,
    classificationScore: classScore[s.classification] ?? 1,
    distToUbnd: haversineDistance(
      UBND_XA_COORDS.lat, UBND_XA_COORDS.lng,
      s.lat, s.lon,
    ),
  }));

  scored.sort((a, b) => {
    if (b.classificationScore !== a.classificationScore) {
      return b.classificationScore - a.classificationScore;
    }
    return a.distToUbnd - b.distToUbnd;
  });

  const visited = new Set<string>();
  const days: DayItinerary[] = [];
  let lastCategoryOrder = -1;

  for (let dayIdx = 0; dayIdx < numDays; dayIdx++) {
    const remainingTotal = validSites.length - visited.size;
    const remainingDays = numDays - dayIdx;
    const targetCount = Math.max(
      1,
      Math.min(5, Math.ceil(remainingTotal / remainingDays)),
    );

    const destinations: TripDestination[] = [];
    let currentPos = UBND_XA_COORDS;
    let dayLastCat = lastCategoryOrder;
    let dayLastCat2 = -1;
    let dayTotalDist = 0;

    const dayDestPositions: { lat: number; lng: number }[] = [UBND_XA_COORDS];

    for (let slot = 0; slot < targetCount; slot++) {
      const unvisited = scored.filter((s) => !visited.has(s.site.id));
      if (unvisited.length === 0) break;

      const best = pickNext(unvisited, currentPos, dayLastCat, dayLastCat2, categoryOrder);
      if (!best) break;

      const s = best.site;
      const distFromPrev = haversineDistance(
        currentPos.lat, currentPos.lng, s.lat, s.lon,
      );
      dayTotalDist += distFromPrev;

      visited.add(s.id);
      dayDestPositions.push({ lat: s.lat, lng: s.lon });
      destinations.push({
        siteId: s.id,
        nameVi: s.nameVi,
        nameEn: s.nameEn,
        type: s.type,
        classification: s.classification,
        order: slot + 1,
        position: { lat: s.lat, lng: s.lon },
        distanceFromPrev: distFromPrev,
        distanceFromStart: 0,
        estimatedArrival: '',
      });

      currentPos = { lat: s.lat, lng: s.lon };
      dayLastCat2 = dayLastCat;
      dayLastCat = categoryOrder.get(s.type) ?? -1;
    }

    if (destinations.length > 0) {
      const travelTimeMin = (dayTotalDist / AVG_SPEED_KMH) * 60;
      const visitTimeMin = destinations.length * VISIT_DURATION_MINUTES;
      const totalDayMin = travelTimeMin + visitTimeMin;

      let runningMinutes = 8 * 60;
      let cumulativeDist = 0;
      for (let di = 0; di < destinations.length; di++) {
        const d = destinations[di];
        const segDist = d.distanceFromPrev;
        if (di > 0) {
          runningMinutes += Math.round((segDist / AVG_SPEED_KMH) * 60);
        }
        cumulativeDist += segDist;
        d.distanceFromStart = cumulativeDist;
        d.estimatedArrival = addMinutesToTime(8 * 60, runningMinutes - 8 * 60);
        runningMinutes += VISIT_DURATION_MINUTES;
      }

      days.push({
        day: dayIdx + 1,
        destinations,
        color: DAY_COLORS[dayIdx % DAY_COLORS.length],
        totalDistance: dayTotalDist,
        totalDuration: totalDayMin,
      });
      lastCategoryOrder = dayLastCat;
    }
  }

  const unvisitedRemaining = scored.filter((s) => !visited.has(s.site.id));
  if (unvisitedRemaining.length > 0 && days.length > 0) {
    for (const item of unvisitedRemaining) {
      const s = item.site;
      const lastDay = days[days.length - 1];
      if (lastDay.destinations.length < 5) {
        const nextOrder = lastDay.destinations.length + 1;
        const prevPos = lastDay.destinations.length > 0
          ? lastDay.destinations[lastDay.destinations.length - 1].position
          : UBND_XA_COORDS;
        const distFromPrev = haversineDistance(prevPos.lat, prevPos.lng, s.lat, s.lon);
        const lastDest = lastDay.destinations[lastDay.destinations.length - 1];
        const prevArrivalMinutes = lastDest ? timeToMinutes(lastDest.estimatedArrival) : 8 * 60;
        const travelMin = Math.round((distFromPrev / AVG_SPEED_KMH) * 60);
        const arrivalMinutes = prevArrivalMinutes + VISIT_DURATION_MINUTES + travelMin;

        lastDay.totalDistance += distFromPrev;
        lastDay.totalDuration += travelMin + VISIT_DURATION_MINUTES;
        lastDay.destinations.push({
          siteId: s.id,
          nameVi: s.nameVi,
          nameEn: s.nameEn,
          type: s.type,
          classification: s.classification,
          order: nextOrder,
          position: { lat: s.lat, lng: s.lon },
          distanceFromPrev: distFromPrev,
          distanceFromStart: lastDest ? lastDest.distanceFromStart + distFromPrev : distFromPrev,
          estimatedArrival: addMinutesToTime(0, arrivalMinutes),
        });
        visited.add(s.id);
      } else {
        const dayDist = haversineDistance(UBND_XA_COORDS.lat, UBND_XA_COORDS.lng, s.lat, s.lon);
        const travelMin = Math.round((dayDist / AVG_SPEED_KMH) * 60);
        days.push({
          day: days.length + 1,
          destinations: [{
            siteId: s.id,
            nameVi: s.nameVi,
            nameEn: s.nameEn,
            type: s.type,
            classification: s.classification,
            order: 1,
            position: { lat: s.lat, lng: s.lon },
            distanceFromPrev: dayDist,
            distanceFromStart: dayDist,
            estimatedArrival: addMinutesToTime(8 * 60, travelMin),
          }],
          color: DAY_COLORS[days.length % DAY_COLORS.length],
          totalDistance: dayDist,
          totalDuration: travelMin + VISIT_DURATION_MINUTES,
        });
        visited.add(s.id);
      }
    }
  }

  const totalDistance = days.reduce((sum, d) => sum + d.totalDistance, 0);
  const totalDuration = days.reduce((sum, d) => sum + d.totalDuration, 0);

  return { days, totalSites: visited.size, totalDistance, totalDuration };
}

function pickNext(
  candidates: { site: HeritageSite & { lat: number; lon: number }; classificationScore: number }[],
  currentPos: { lat: number; lng: number },
  lastCat: number,
  lastCat2: number,
  categoryOrder: Map<HeritageType, number>,
): { site: HeritageSite & { lat: number; lon: number } } | null {
  let best: { site: HeritageSite & { lat: number; lon: number }; score: number } | null = null;

  for (const c of candidates) {
    const s = c.site;
    const dist = haversineDistance(currentPos.lat, currentPos.lng, s.lat, s.lon);
    const cat = categoryOrder.get(s.type) ?? -1;
    const sameAsLast = cat === lastCat ? 5 : 0;
    const sameAsLast2 = cat === lastCat2 ? 3 : 0;
    const classificationBonus = c.classificationScore * 1000;
    const score = dist + sameAsLast * 0.5 + sameAsLast2 * 0.3 - classificationBonus;

    if (best === null || score < best.score) {
      best = { site: s, score };
    }
  }

  return best;
}


