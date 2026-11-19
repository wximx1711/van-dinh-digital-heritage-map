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

/**
 * Đảm bảo hiển thị đầy đủ 100% di tích lên bản đồ.
 * Đối với các di tích trong cùng một cụm (chung làng/thôn) bị trùng tọa độ GPS,
 * hệ thống tự động phân bố nhẹ theo hình tròn (bán kính ~15m) để các điểm ghim (markers)
 * không bị đè lên nhau, người dân và du khách có thể bấm chọn riêng từng di tích dễ dàng.
 */
function disperseAndMapSites(sites: (HeritageSite & { lat: number; lon: number })[]): MapMarker[] {
  const groups = new Map<string, (HeritageSite & { lat: number; lon: number })[]>();
  for (const site of sites) {
    const key = `${site.lat.toFixed(6)},${site.lon.toFixed(6)}`;
    let group = groups.get(key);
    if (!group) {
      group = [];
      groups.set(key, group);
    }
    group.push(site);
  }

  const RADIUS_DEG = 0.00015; // Bán kính lệch ~15 mét
  const markers: MapMarker[] = [];

  for (const group of groups.values()) {
    if (group.length === 1) {
      const site = group[0];
      markers.push({
        id: site.id,
        position: { lat: site.lat, lng: site.lon },
        type: site.type,
        classification: site.classification,
      });
    } else {
      const n = group.length;
      const baseLat = group[0].lat;
      const baseLng = group[0].lon;
      const cosLat = Math.cos((baseLat * Math.PI) / 180);

      group.forEach((site, index) => {
        const angle = (2 * Math.PI * index) / n - Math.PI / 2;
        const dLat = RADIUS_DEG * Math.cos(angle);
        const dLng = (RADIUS_DEG / Math.max(cosLat, 0.1)) * Math.sin(angle);

        markers.push({
          id: site.id,
          position: {
            lat: baseLat + dLat,
            lng: baseLng + dLng,
          },
          type: site.type,
          classification: site.classification,
        });
      });
    }
  }

  return markers;
}

export function useHeritageMapMarkers(sites?: HeritageSite[]): UseHeritageMapMarkersResult {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const processSites = useCallback(async (input: HeritageSite[]) => {
    const valid = input.filter(isValidCoordinate);
    return disperseAndMapSites(valid);
  }, []);

  const fetchMarkers = useCallback(async () => {
    try {
      setLoading(true);
      const input = sites ?? await fetchHeritageSites();
      const result = await processSites(input);
      setMarkers(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [sites, processSites]);

  useEffect(() => {
    fetchMarkers();
  }, [fetchMarkers]);

  return { markers, loading, error, refetch: fetchMarkers };
}
