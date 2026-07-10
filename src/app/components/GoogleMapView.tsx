import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { useJsApiLoader, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { heritageMarkerColors } from '../constants';
import type { MapMarker, HeritageType } from '../../core/types';
import type { ReactNode } from 'react';

interface GoogleMapViewProps {
  apiKey: string;
  markers?: MapMarker[];
  selectedMarkerId?: string | null;
  onMarkerClick?: (id: string) => void;
  onInfoWindowClose?: () => void;
  renderInfoWindow?: (marker: MapMarker) => ReactNode;
  mapTypeId?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  userLocation?: google.maps.LatLngLiteral | null;
  highlightedMarkerId?: string | null;
  className?: string;
}

const VAN_DINH_CENTER: google.maps.LatLngLiteral = {
  lat: 20.755,
  lng: 105.855,
};

const DEFAULT_ZOOM = 15;

const containerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions: google.maps.MapOptions = {
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  clickableIcons: false,
};

export function GoogleMapView({
  apiKey,
  markers = [],
  selectedMarkerId,
  onMarkerClick,
  onInfoWindowClose,
  renderInfoWindow,
  mapTypeId,
  userLocation,
  highlightedMarkerId,
  className,
}: GoogleMapViewProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [clustererVersion, setClustererVersion] = useState(0);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markerMapRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const onMarkerClickRef = useRef(onMarkerClick);
  const onInfoWindowCloseRef = useRef(onInfoWindowClose);
  onMarkerClickRef.current = onMarkerClick;
  onInfoWindowCloseRef.current = onInfoWindowClose;

  const mapCenter = useMemo(() => VAN_DINH_CENTER, []);

  const selectedMarker = useMemo(
    () => markers.find((m) => m.id === selectedMarkerId) ?? null,
    [markers, selectedMarkerId],
  );

  const handleMapClick = useCallback(() => {
    onInfoWindowCloseRef.current?.();
  }, []);

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  // Called only after google.maps is available (inside guarded effects).
  function getMarkerIcon(type?: HeritageType, highlighted?: boolean): google.maps.Symbol | undefined {
    if (highlighted) {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#D4A017',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      };
    }
    if (!type) return undefined;
    const color = heritageMarkerColors[type];
    if (!color) return undefined;
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 3,
    };
  }

  // Create/destroy MarkerClusterer when map instance becomes available
  useEffect(() => {
    if (!map) return;
    const clusterer = new MarkerClusterer({ map });
    clustererRef.current = clusterer;
    setClustererVersion(v => v + 1);
    return () => {
      clusterer.clearMarkers();
      clustererRef.current = null;
      markerMapRef.current.clear();
    };
  }, [map]);

  // Sync heritage markers with the clusterer
  useEffect(() => {
    const clusterer = clustererRef.current;
    if (!clusterer) return;

    const markerMap = markerMapRef.current;
    const newIds = new Set(markers.map((m) => m.id));
    const curHighlighted = highlightedMarkerId;

    // Remove markers that no longer exist in the list
    const toRemove: google.maps.Marker[] = [];
    for (const [id, marker] of markerMap) {
      if (!newIds.has(id)) {
        toRemove.push(marker);
        markerMap.delete(id);
      }
    }

    // Track listener removers for proper cleanup
    const cleanups: (() => void)[] = [];

    // Add or update markers
    const toAdd: google.maps.Marker[] = [];
    for (const m of markers) {
      let marker = markerMap.get(m.id);
      const isHighlighted = curHighlighted === m.id;
      const icon = getMarkerIcon(m.type, isHighlighted);

      if (marker) {
        marker.setPosition(m.position);
        marker.setLabel(m.label ?? null);
        marker.setIcon(icon ?? null);
        marker.setZIndex(isHighlighted ? 200 : null);
      } else {
        marker = new google.maps.Marker({
          position: m.position,
          label: m.label,
          icon: icon,
          zIndex: isHighlighted ? 200 : undefined,
        });
        markerMap.set(m.id, marker);
        toAdd.push(marker);
      }

      // Always re-attach click listener (cleaned up by previous run's cleanup)
      const id = m.id;
      const listener = marker.addListener('click', () => {
        onMarkerClickRef.current?.(id);
      });
      cleanups.push(() => google.maps.event.removeListener(listener));
    }

    if (toRemove.length > 0) {
      clusterer.removeMarkers(toRemove);
    }
    if (toAdd.length > 0) {
      clusterer.addMarkers(toAdd);
    }

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, [markers, highlightedMarkerId, clustererVersion]);

  // Auto-fit viewport when the visible marker set changes
  const markersKeyRef = useRef<string>('');
  const fitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!map) return;
    if (markers.length === 0) return;

    const key = markers.map((m) => `${m.id}:${m.position.lat},${m.position.lng}`).join('|');
    if (key === markersKeyRef.current) return;
    markersKeyRef.current = key;

    if (fitTimerRef.current !== null) {
      clearTimeout(fitTimerRef.current);
    }

    fitTimerRef.current = setTimeout(() => {
      if (markers.length === 1) {
        map.panTo(markers[0].position);
        map.setZoom(17);
      } else {
        const bounds = new google.maps.LatLngBounds();
        markers.forEach((m) => bounds.extend(m.position));
        map.fitBounds(bounds, 50);
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

  if (loadError) {
    return (
      <div
        className={className}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F0F4F8',
          color: '#E74C3C',
          fontSize: 14,
          textAlign: 'center',
          padding: 24,
        }}
      >
        <div>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
          <div style={{ fontWeight: 700, marginBottom: 4, color: '#1a2332' }}>
            Failed to load Google Maps
          </div>
          <div style={{ color: '#5d7a8c' }}>
            Please check your API key and try again.
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={className}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F0F4F8',
        }}
      >
        <div style={{ textAlign: 'center', color: '#5d7a8c' }}>
          <style>{`@keyframes gmap-spin { to { transform: rotate(360deg); } }`}</style>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '3px solid rgba(15,61,94,0.2)',
              borderTopColor: '#0F3D5E',
              animation: 'gmap-spin 0.8s linear infinite',
              margin: '0 auto 12px',
            }}
          />
          <div style={{ fontSize: 13 }}>Loading map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={DEFAULT_ZOOM}
        mapTypeId={mapTypeId}
        options={mapOptions}
        onClick={handleMapClick}
        onLoad={handleMapLoad}
      >
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            }}
            zIndex={1000}
          />
        )}

        {selectedMarker && renderInfoWindow && (
          <InfoWindow
            position={selectedMarker.position}
            onCloseClick={onInfoWindowClose}
          >
            {renderInfoWindow(selectedMarker)}
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
