'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import { RequiredLabel } from '@/components/ui/required-label';
import { cn } from '@/lib/utils';

export interface AddressAutocompleteProps {
  value?: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: {
    address: string;
    city?: string;
    venueName?: string;
    lat?: number;
    lng?: number;
  }) => void;
  error?: string;
  label?: string;
  hint?: string;
  required?: boolean;
  name?: string;
  placeholder?: string;
}

export interface AddressAutocompleteRef {
  focus: () => void;
}

export const AddressAutocomplete = forwardRef<AddressAutocompleteRef, AddressAutocompleteProps>(
  ({ value, onChange, onPlaceSelect, error, label, hint, required, name, placeholder }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const { isConfigured, isLoaded } = useGoogleMaps();
    const inputId = name || 'venueAddress';

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
    }));

    useEffect(() => {
      if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'in' },
        fields: ['formatted_address', 'address_components', 'name', 'geometry'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        const address = place.formatted_address ?? inputRef.current?.value ?? '';
        onChange(address);

        let city: string | undefined;
        let venueName: string | undefined;

        place.address_components?.forEach((component) => {
          if (component.types.includes('locality')) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_2') && !city) {
            city = component.long_name;
          }
        });

        if (place.name && place.name !== address) {
          venueName = place.name;
        }

        const lat = place.geometry?.location?.lat?.();
        const lng = place.geometry?.location?.lng?.();

        onPlaceSelect?.({ address, city, venueName, lat, lng });
      });

      autocompleteRef.current = autocomplete;
    }, [isLoaded, onChange, onPlaceSelect]);

    return (
      <div className="space-y-1.5">
        {label && (
          <RequiredLabel htmlFor={inputId} required={required}>
            {label}
          </RequiredLabel>
        )}
        <div className="relative">
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary">
            <MapPin className="h-4 w-4" />
          </div>
          <input
            ref={inputRef}
            id={inputId}
            name={name}
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? 'Start typing your venue address...'}
            required={required}
            autoComplete="street-address"
            className={cn(
              'flex h-11 w-full rounded-xl border-2 border-input bg-background px-4 py-2 pl-11 text-sm transition-colors',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
              error &&
                'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          />
        </div>
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}
        {!isConfigured && !error && (
          <p className="text-xs text-muted-foreground">
            Address search will be enhanced when Google Maps is enabled
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="text-xs font-medium text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
AddressAutocomplete.displayName = 'AddressAutocomplete';
