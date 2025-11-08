'use client';

import { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { MapPin } from 'lucide-react';

interface AutocompleteInputProps {
  label: string;
  value: string;
  onChange: (location: { lat: number; lng: number; address: string }) => void;
  placeholder?: string;
}

export default function AutocompleteInput({
  label,
  value,
  onChange,
  placeholder = 'Enter location',
}: AutocompleteInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value);

  // Sync input value with prop value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const initAutocomplete = async () => {
      setOptions({
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        v: 'weekly',
      });

      await importLibrary('places');

      if (inputRef.current && typeof google !== 'undefined') {
        const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
        });

        autocompleteInstance.addListener('place_changed', () => {
          const place = autocompleteInstance.getPlace();
          if (place.geometry?.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const address = place.formatted_address || '';
            setInputValue(address);
            onChange({ lat, lng, address });
          }
        });
      }
    };

    initAutocomplete().catch((error) => {
      console.error('Error loading Google Maps:', error);
    });
  }, [onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
        />
      </div>
    </div>
  );
}

