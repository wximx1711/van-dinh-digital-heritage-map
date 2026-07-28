import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { classificationColors } from '../constants';
import { getIconDataUri, hasSvgIcon, emojiFallbacks } from '../heritageIcons';
import type { MapMarker, HeritageType, Classification } from '../../core/types';
import type { ReactNode } from 'react';

interface TripRouteMarker {
  id: string;
  position: { lat: number; lng: number };
  orderNumber: number;
  dayIndex: number;
  color: string;
}

interface TripPolyline {
  dayIndex: number;
  path: { lat: number; lng: number }[];
  color: string;
}

interface LeafletMapViewProps {
  markers?: MapMarker[];
  selectedMarkerId?: string | null;
  onMarkerClick?: (id: string) => void;
  onInfoWindowClose?: () => void;
  renderInfoWindow?: (marker: MapMarker) => ReactNode;
  mapType?: 'roadmap' | 'satellite' | 'hybrid';
  userLocation?: { lat: number; lng: number } | null;
  highlightedMarkerId?: string | null;
  className?: string;
  tripRouteMarkers?: TripRouteMarker[];
  tripPolylines?: TripPolyline[];
  visibleDay?: number | null;
  onTripMarkerClick?: (id: string) => void;
  focusPosition?: { lat: number; lng: number } | null;
  fitTripBoundsKey?: number;
  selectingStartPoint?: boolean;
  startPointMarker?: { lat: number; lng: number } | null;
  onStartPointSelected?: (coords: { lat: number; lng: number }) => void;
  onCancelStartPointSelection?: () => void;
}

const VAN_DINH_CENTER: [number, number] = [20.755, 105.855];
const DEFAULT_ZOOM = 13;
const DAY_MARKER_SIZES = [32, 30, 28, 26, 24, 22, 20];

function pinSvg(type: HeritageType, classificationColor: string, highlighted: boolean): string {
  const body = highlighted
    ? `<path d="M14 2 C7 2 3 8 3 15 C3 24 14 38 14 38 C14 38 25 24 25 15 C25 8 21 2 14 2Z" fill="white" stroke="#D4A017" stroke-width="2.5"/>`
    : `<path d="M14 2 C7 2 3 8 3 15 C3 24 14 38 14 38 C14 38 25 24 25 15 C25 8 21 2 14 2Z" fill="white" stroke="#D0D0D0" stroke-width="1"/>`;
  const iconContent = hasSvgIcon(type)
    ? `<image href="${getIconDataUri(type)}" x="2" y="2" width="24" height="24" preserveAspectRatio="xMidYMid meet"/>`
    : (() => {
        const scale = type === 'den' || type === 'lang' ? 0.5 : 1;
        const fontSize = Math.round(16 * scale);
        const y = Math.round(14 + (21 - 14) * scale);
        return `<text x="14" y="${y}" text-anchor="middle" font-family="'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif" font-size="${fontSize}">${emojiFallbacks[type] ?? '?'}</text>`;
      })();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 40">
      ${body}
      ${iconContent}
      <rect x="6" y="28" width="16" height="5" rx="2.5" fill="${classificationColor}"/>
    </svg>`
  )}`;
}

function getLeafletIcon(type?: HeritageType, classification?: Classification, highlighted?: boolean): L.Icon {
  const c = classification ? classificationColors[classification] : '#999';
  return L.icon({
    iconUrl: pinSvg(type!, c, !!highlighted),
    iconSize: [28, 40],
    iconAnchor: [14, 38],
  });
}

function createTripMarkerIcon(orderNumber: number, color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="width:${DAY_MARKER_SIZES[0]}px;height:${DAY_MARKER_SIZES[0]}px;border-radius:50%;background:${color};color:white;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);">${orderNumber}</div>`,
    iconSize: [DAY_MARKER_SIZES[0], DAY_MARKER_SIZES[0]],
    iconAnchor: [DAY_MARKER_SIZES[0] / 2, DAY_MARKER_SIZES[0] / 2],
  });
}

const tileLayers: Record<string, string> = {
  roadmap: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  hybrid: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};

const tileAttribution = {
  roadmap: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  satellite: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  hybrid: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
};

function MapController({
  focusPosition,
  fitTripBoundsKey,
  filteredTripMarkers,
  markers,
  onInfoWindowClose,
  selectingStartPoint,
  onStartPointSelected,
  onCancelStartPointSelection,
}: {
  focusPosition?: { lat: number; lng: number } | null;
  fitTripBoundsKey?: number;
  filteredTripMarkers: TripRouteMarker[];
  markers: MapMarker[];
  onInfoWindowClose?: () => void;
  selectingStartPoint?: boolean;
  onStartPointSelected?: (coords: { lat: number; lng: number }) => void;
  onCancelStartPointSelection?: () => void;
}) {
  const map = useMap();
  const focusPosRef = useRef<{ lat: number; lng: number } | null>(null);
  const fitTripKeyRef = useRef<number>(0);
  const markersKeyRef = useRef<string>('');
  const fitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useMapEvents({
    click: () => {
      if (selectingStartPoint) return;
      onInfoWindowClose?.();
    },
  });

  useMapEvents({
    click: (e) => {
      if (!selectingStartPoint) return;
      onStartPointSelected?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  useEffect(() => {
    if (!focusPosition) return;
    if (
      focusPosRef.current &&
      focusPosRef.current.lat === focusPosition.lat &&
      focusPosRef.current.lng === focusPosition.lng
    ) return;
    focusPosRef.current = focusPosition;
    map.setView([focusPosition.lat, focusPosition.lng], 17, { animate: true });
  }, [map, focusPosition]);

  useEffect(() => {
    if (fitTripBoundsKey === undefined || fitTripBoundsKey === fitTripKeyRef.current) return;
    fitTripKeyRef.current = fitTripBoundsKey;

    const positions = filteredTripMarkers.map(m => [m.position.lat, m.position.lng] as [number, number]);
    if (positions.length === 0) return;

    if (positions.length === 1) {
      map.setView(positions[0], 17, { animate: true });
    } else {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [map, fitTripBoundsKey, filteredTripMarkers]);

  useEffect(() => {
    if (markers.length === 0) return;
    const key = markers.map((m) => `${m.id}:${m.position.lat},${m.position.lng}`).join('|');
    if (key === markersKeyRef.current) return;
    markersKeyRef.current = key;

    if (fitTimerRef.current !== null) clearTimeout(fitTimerRef.current);
    fitTimerRef.current = setTimeout(() => {
      if (markers.length === 1) {
        map.setView([markers[0].position.lat, markers[0].position.lng], 17, { animate: true });
      } else {
        const bounds = L.latLngBounds(markers.map(m => [m.position.lat, m.position.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
      fitTimerRef.current = null;
    }, 100);
    return () => {
      if (fitTimerRef.current !== null) {
        clearTimeout(fitTimerRef.current);
        fitTimerRef.current = null;
      }
    };
  }, [map, markers]);

  return null;
}

function splitMarkers(markers: MapMarker[], highlightedId: string | null): { regular: MapMarker[]; highlighted: MapMarker[] } {
  const regular: MapMarker[] = [];
  const highlighted: MapMarker[] = [];
  for (const m of markers) {
    if (m.id === highlightedId) highlighted.push(m);
    else regular.push(m);
  }
  return { regular, highlighted };
}

function SelectedMarkerPopup({ marker, renderInfoWindow, onInfoWindowClose }: {
  marker: MapMarker | { id: string; position: { lat: number; lng: number } };
  renderInfoWindow?: (marker: MapMarker) => ReactNode;
  onInfoWindowClose?: () => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    const leafletMarker = markerRef.current;
    if (leafletMarker) {
      leafletMarker.openPopup();
    }
  }, [marker.id]);

  return (
    <Marker
      ref={markerRef}
      position={[marker.position.lat, marker.position.lng]}
      icon={L.divIcon({ className: '', iconSize: [0, 0] })}
    >
      <Popup onClose={onInfoWindowClose}>
        {renderInfoWindow?.(marker)}
      </Popup>
    </Marker>
  );
}

export function GoogleMapView({
  markers = [],
  selectedMarkerId,
  onMarkerClick,
  onInfoWindowClose,
  renderInfoWindow,
  mapType = 'roadmap',
  userLocation,
  highlightedMarkerId,
  className,
  tripRouteMarkers = [],
  tripPolylines = [],
  visibleDay,
  onTripMarkerClick,
  focusPosition,
  fitTripBoundsKey,
  selectingStartPoint,
  startPointMarker,
  onStartPointSelected,
  onCancelStartPointSelection,
}: LeafletMapViewProps) {
  const [clusterGroup, setClusterGroup] = useState<L.MarkerClusterGroup | null>(null);
  const [clusterVersion, setClusterVersion] = useState(0);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());
  const onMarkerClickRef = useRef(onMarkerClick);
  const onInfoWindowCloseRef = useRef(onInfoWindowClose);
  const onTripMarkerClickRef = useRef(onTripMarkerClick);
  onMarkerClickRef.current = onMarkerClick;
  onInfoWindowCloseRef.current = onInfoWindowClose;
  onTripMarkerClickRef.current = onTripMarkerClick;

  const filteredTripMarkers = useMemo(
    () => {
      if (!tripRouteMarkers.length) return [];
      if (visibleDay === null) return tripRouteMarkers;
      return tripRouteMarkers.filter(m => m.dayIndex === visibleDay);
    },
    [tripRouteMarkers, visibleDay],
  );

  const filteredTripPolylines = useMemo(
    () => {
      if (!tripPolylines.length) return [];
      if (visibleDay === null) return tripPolylines;
      return tripPolylines.filter(p => p.dayIndex === visibleDay);
    },
    [tripPolylines, visibleDay],
  );

  const selectedMarker = useMemo(
    () => {
      const fromMarkers = markers.find((m) => m.id === selectedMarkerId);
      if (fromMarkers) return fromMarkers;
      const fromTrip = tripRouteMarkers.find((m) => m.id === selectedMarkerId);
      if (fromTrip) return { id: fromTrip.id, position: fromTrip.position };
      return null;
    },
    [markers, tripRouteMarkers, selectedMarkerId],
  );

  const { regular: regularMarkers, highlighted: highlightedMarkers } = useMemo(
    () => splitMarkers(markers, highlightedMarkerId),
    [markers, highlightedMarkerId],
  );

  const handleClusterReady = useCallback((event: L.LeafletEvent) => {
    const map = event.target;
    const mcg = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 16,
    });
    mcg.addTo(map);
    setClusterGroup(mcg);
    setClusterVersion(v => v + 1);
  }, []);

  useEffect(() => {
    if (!clusterGroup) return;

    const mcg = clusterGroup;
    const markerMap = markerMapRef.current;
    const newIds = new Set(markers.map((m) => m.id));

    const toRemove: L.Marker[] = [];
    for (const [id, marker] of markerMap) {
      if (!newIds.has(id)) {
        toRemove.push(marker);
        markerMap.delete(id);
      }
    }

    const toAdd: L.Marker[] = [];
    for (const m of markers) {
      let marker = markerMap.get(m.id);
      const icon = getLeafletIcon(m.type, m.classification, m.id === highlightedMarkerId);

      if (marker) {
        marker.setLatLng([m.position.lat, m.position.lng]);
        marker.setIcon(icon);
        marker.setZIndexOffset(m.id === highlightedMarkerId ? 200 : 0);
      } else {
        marker = L.marker([m.position.lat, m.position.lng], { icon, zIndexOffset: m.id === highlightedMarkerId ? 200 : 0 });
        const id = m.id;
        marker.on('click', () => {
          onMarkerClickRef.current?.(id);
        });
        markerMap.set(m.id, marker);
        toAdd.push(marker);
      }
    }

    if (toRemove.length > 0) mcg.removeLayers(toRemove);
    if (toAdd.length > 0) mcg.addLayers(toAdd);
  }, [markers, highlightedMarkerId, clusterGroup, clusterVersion]);

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <MapContainer
        center={VAN_DINH_CENTER}
        zoom={DEFAULT_ZOOM}
        maxZoom={19}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        whenReady={handleClusterReady}
      >
        <TileLayer
          url={tileLayers[mapType]}
          attribution={tileAttribution[mapType]}
          maxZoom={19}
        />

        <MapController
          focusPosition={focusPosition}
          fitTripBoundsKey={fitTripBoundsKey}
          filteredTripMarkers={filteredTripMarkers}
          markers={markers}
          onInfoWindowClose={onInfoWindowClose}
          selectingStartPoint={selectingStartPoint}
          onStartPointSelected={onStartPointSelected}
          onCancelStartPointSelection={onCancelStartPointSelection}
        />

        {filteredTripPolylines.map((pl) => {
          const validPositions = pl.path
            .filter(p => p && Number.isFinite(p.lat) && Number.isFinite(p.lng))
            .map(p => [p.lat, p.lng] as [number, number]);
          if (validPositions.length < 2) return null;
          return (
            <Polyline
              key={`trip-poly-${pl.dayIndex}`}
              positions={validPositions}
              pathOptions={{
                color: pl.color,
                weight: 4,
                opacity: 0.8,
              }}
            />
          );
        })}

        {filteredTripMarkers
          .filter(m => m.position && Number.isFinite(m.position.lat) && Number.isFinite(m.position.lng))
          .map((m) => (
            <Marker
              key={`trip-marker-${m.dayIndex}-${m.orderNumber}`}
              position={[m.position.lat, m.position.lng]}
              icon={createTripMarkerIcon(m.orderNumber, m.color)}
              eventHandlers={{
                click: () => onTripMarkerClickRef.current?.(m.id),
              }}
            />
          ))}

        {highlightedMarkers.map((m) => (
          <Marker
            key={`hl-${m.id}`}
            position={[m.position.lat, m.position.lng]}
            icon={getLeafletIcon(m.type, m.classification, true)}
          />
        ))}

        {startPointMarker && Number.isFinite(startPointMarker.lat) && Number.isFinite(startPointMarker.lng) && (
          <Marker
            position={[startPointMarker.lat, startPointMarker.lng]}
            icon={L.divIcon({
              className: '',
              iconSize: [28, 28],
              html: '<div style="width:28px;height:28px;background:#D4A017;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.3);">📍</div>',
            })}
          >
            <Popup>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0F3D5E', fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                Điểm xuất phát / Starting Point
              </div>
            </Popup>
          </Marker>
        )}

        {userLocation && (
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={8}
            pathOptions={{
              color: '#4285F4',
              fillColor: '#4285F4',
              fillOpacity: 1,
              weight: 3,
            }}
          />
        )}

        {selectedMarker && renderInfoWindow && (
          <SelectedMarkerPopup
            marker={selectedMarker}
            renderInfoWindow={renderInfoWindow}
            onInfoWindowClose={() => onInfoWindowCloseRef.current?.()}
          />
        )}
      </MapContainer>
    </div>
  );
}
