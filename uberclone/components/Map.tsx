'use client';

import { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

interface MapProps {
  pickupLocation?: { lat: number; lng: number };
  dropoffLocation?: { lat: number; lng: number };
  onPickupChange?: (location: { lat: number; lng: number; address: string }) => void;
  onDropoffChange?: (location: { lat: number; lng: number; address: string }) => void;
  readonly?: boolean;
}

export default function Map({
  pickupLocation,
  dropoffLocation,
  onPickupChange,
  onDropoffChange,
  readonly = false,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const updateLocation = async (lat: number, lng: number, type: 'pickup' | 'dropoff') => {
    if (typeof google === 'undefined') return;
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      const address = response.results[0]?.formatted_address || '';

      if (type === 'pickup' && onPickupChange) {
        onPickupChange({ lat, lng, address });
      } else if (type === 'dropoff' && onDropoffChange) {
        onDropoffChange({ lat, lng, address });
      }

      // Update route if both locations are set
      if (pickupLocation && dropoffLocation) {
        const newPickup = type === 'pickup' ? { lat, lng } : pickupLocation;
        const newDropoff = type === 'dropoff' ? { lat, lng } : dropoffLocation;
        updateRoute(newPickup, newDropoff);
      }
    } catch (error) {
      console.error('Error geocoding location:', error);
    }
  };

  const updateRoute = (pickup: { lat: number; lng: number }, dropoff: { lat: number; lng: number }) => {
    if (!map || !directionsRenderer || typeof google === 'undefined') return;

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: pickup,
        destination: dropoff,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result);
        }
      }
    );
  };

  useEffect(() => {
    const initMap = async () => {
      setOptions({
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        v: 'weekly',
      });

      await importLibrary('places');
      await importLibrary('routes'); // Directions is part of routes library

      if (mapRef.current && typeof google !== 'undefined') {
        const newMap = new google.maps.Map(mapRef.current, {
          center: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
          zoom: 13,
        });

        setMap(newMap);
        setIsLoaded(true);

        // Get user's current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              newMap.setCenter(userLocation);
            },
            () => {
              console.log('Error getting user location');
            }
          );
        }
      }
    };

    initMap().catch((error) => {
      console.error('Error loading Google Maps:', error);
    });
  }, []);

  useEffect(() => {
    if (!map || !isLoaded || typeof google === 'undefined') return;

    // Create directions renderer
    const renderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
    });
    setDirectionsRenderer(renderer);

    // Create markers
    const pickup = new google.maps.Marker({
      map,
      position: pickupLocation || map.getCenter()!,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#000000',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      draggable: !readonly && !!onPickupChange,
      title: 'Pickup Location',
    });

    const dropoff = new google.maps.Marker({
      map,
      position: dropoffLocation || map.getCenter()!,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#FF0000',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      draggable: !readonly && !!onDropoffChange,
      title: 'Dropoff Location',
    });


    // Add click listeners for map clicks
    if (!readonly) {
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();

          // Determine which marker to update based on which is closer
          if (pickupLocation && dropoffLocation) {
            const pickupDist = Math.abs(pickupLocation.lat - lat) + Math.abs(pickupLocation.lng - lng);
            const dropoffDist = Math.abs(dropoffLocation.lat - lat) + Math.abs(dropoffLocation.lng - lng);
            if (pickupDist < dropoffDist && onPickupChange) {
              updateLocation(lat, lng, 'pickup');
            } else if (onDropoffChange) {
              updateLocation(lat, lng, 'dropoff');
            }
          } else if (!pickupLocation && onPickupChange) {
            updateLocation(lat, lng, 'pickup');
          } else if (pickupLocation && !dropoffLocation && onDropoffChange) {
            updateLocation(lat, lng, 'dropoff');
          }
        }
      });
    }

    // Add drag listeners
    if (onPickupChange) {
      pickup.addListener('dragend', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          updateLocation(e.latLng.lat(), e.latLng.lng(), 'pickup');
        }
      });
    }

    if (onDropoffChange) {
      dropoff.addListener('dragend', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          updateLocation(e.latLng.lat(), e.latLng.lng(), 'dropoff');
        }
      });
    }

    // Update route if both locations are set
    if (pickupLocation && dropoffLocation) {
      updateRoute(pickupLocation, dropoffLocation);
    }

    return () => {
      pickup.setMap(null);
      dropoff.setMap(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isLoaded, pickupLocation, dropoffLocation, readonly, onPickupChange, onDropoffChange]);

  return <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-lg" />;
}

