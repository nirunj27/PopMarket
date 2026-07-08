declare namespace google.maps.places {
  interface Autocomplete {
    getPlace(): PlaceResult;
    addListener(eventName: string, handler: () => void): void;
  }

  interface PlaceResult {
    formatted_address?: string;
    name?: string;
    geometry?: {
      location?: {
        lat: () => number;
        lng: () => number;
      };
    };
    address_components?: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  }

  class Autocomplete {
    constructor(input: HTMLInputElement, opts?: Record<string, unknown>);
  }
}

declare namespace google.maps {
  const places: {
    Autocomplete: typeof google.maps.places.Autocomplete;
  };
}

interface Window {
  google?: typeof google;
}

declare const google: {
  maps: {
    places: typeof google.maps.places;
  };
};
