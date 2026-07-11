import { useState, useEffect, useCallback } from 'react';
import { fetchHeritageSites } from '../../app/services/heritageService';
import type { HeritageSite, MapMarker } from '../../core/types';

interface UseHeritageMapMarkersResult {
  markers: MapMarker[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

function isValidCoordinate(site: HeritageSite): site is HeritageSite & { lat: number; lon: number } {
  if (site.lat === null || site.lon === null) {
    if (import.meta.env.DEV) {
      console.warn(
        `[useHeritageMapMarkers] Skipping site ${site.id} (${site.nameVi}): null coordinates`,
      );
    }
    return false;
  }
  if (site.lat < -90 || site.lat > 90) {
    if (import.meta.env.DEV) {
      console.warn(
        `[useHeritageMapMarkers] Skipping site ${site.id} (${site.nameVi}): invalid lat ${site.lat}`,
      );
    }
    return false;
  }
  if (site.lon < -180 || site.lon > 180) {
    if (import.meta.env.DEV) {
      console.warn(
        `[useHeritageMapMarkers] Skipping site ${site.id} (${site.nameVi}): invalid lng ${site.lon}`,
      );
    }
    return false;
  }
  return true;
}

function deduplicate(sites: (HeritageSite & { lat: number; lon: number })[]): MapMarker[] {
  const seen = new Set<string>();
  const markers: MapMarker[] = [];

  for (const site of sites) {
    const key = `${site.lat.toFixed(6)},${site.lon.toFixed(6)}`;
    if (seen.has(key)) {
      if (import.meta.env.DEV) {
        console.warn(
          `[useHeritageMapMarkers] Duplicate coordinates at ${key} for site ${site.id} (${site.nameVi})`,
        );
      }
      continue;
    }
    seen.add(key);
    markers.push({
      id: site.id,
      position: { lat: site.lat, lng: site.lon },
      type: site.type,
      classification: site.classification,
    });
  }

  return markers;
}

export function useHeritageMapMarkers(): UseHeritageMapMarkersResult {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMarkers = useCallback(async () => {
    try {
      setLoading(true);
      const sites = await fetchHeritageSites();
      const valid = sites.filter(isValidCoordinate);
      const result = deduplicate(valid);
      setMarkers(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkers();
  }, [fetchMarkers]);

  return { markers, loading, error, refetch: fetchMarkers };
}
