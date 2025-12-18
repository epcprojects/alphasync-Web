/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef, useState } from "react";
import ThemeInput from "./ThemeInput";

// Singleton pattern for Google Maps script loading
let googleMapsPromise: Promise<void> | null = null;
let isScriptLoaded = false;
let isScriptLoading = false;

const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  // If already loaded, resolve immediately
  if (
    isScriptLoaded &&
    typeof window !== "undefined" &&
    (window as any).google?.maps?.places
  ) {
    return Promise.resolve();
  }

  // If currently loading, return the existing promise
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  // If script tag exists in DOM, wait for it to load
  if (typeof window !== "undefined") {
    const existingScript = document.querySelector(
      `script[src*="maps.googleapis.com/maps/api/js"]`
    );

    if (existingScript) {
      googleMapsPromise = new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if ((window as any).google?.maps?.places) {
            clearInterval(checkInterval);
            isScriptLoaded = true;
            resolve();
          }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          if ((window as any).google?.maps?.places) {
            isScriptLoaded = true;
            resolve();
          } else {
            reject(new Error("Timeout loading Google Maps"));
          }
        }, 10000);
      });
      return googleMapsPromise;
    }
  }

  // Create new script and load
  googleMapsPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window is not defined"));
      return;
    }

    isScriptLoading = true;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isScriptLoaded = true;
      isScriptLoading = false;
      resolve();
    };

    script.onerror = () => {
      isScriptLoading = false;
      googleMapsPromise = null;
      reject(new Error("Failed to load Google Maps script"));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

interface AddressComponents {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  fullAddress: string;
}

interface GoogleAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (address: AddressComponents) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
}

const GoogleAutocompleteInput: React.FC<GoogleAutocompleteInputProps> = ({
  value,
  onChange,
  onAddressSelect,
  label = "Street Address",
  placeholder = "Enter street address",
  required = false,
  error = false,
  errorMessage = "",
  name = "street1",
  id = "street1",
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_KEY || "";

  useEffect(() => {
    if (!apiKey) {
      console.error("Google Maps API key is not configured");
      setLoadError("API key not configured");
      return;
    }

    loadGoogleMapsScript(apiKey)
      .then(() => {
        setIsReady(true);
        setLoadError(null);
      })
      .catch((error) => {
        console.error("Error loading Google Maps script:", error);
        setLoadError(error.message);
      });
  }, [apiKey]);

  useEffect(() => {
    if (!isReady || !inputRef.current || disabled) return;

    // If already initialized, skip
    if (autocompleteRef.current) return;

    let retryCount = 0;
    const maxRetries = 20; // Try for up to 2 seconds (20 * 100ms)

    // Retry logic to wait for Google Maps to be fully loaded
    const initializeAutocomplete = () => {
      const google = (window as any).google;

      if (!google?.maps?.places) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(initializeAutocomplete, 100);
          return;
        } else {
          console.error("Google Maps Places API failed to load after retries");
          return;
        }
      }

      if (!inputRef.current) return;

      try {
        // Initialize autocomplete with explicit fields
        autocompleteRef.current = new google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ["address"], // Only complete addresses, not just street names
            componentRestrictions: { country: "us" }, // Restrict to US addresses
            fields: ["address_components", "formatted_address", "geometry"],
          }
        );

        // Set additional options for better address matching
        autocompleteRef.current.setOptions({
          strictBounds: false,
        });

        console.log("✅ Autocomplete initialized successfully for:", name);
      } catch (error) {
        console.error("Error initializing autocomplete:", error);
      }
    };

    // Start initialization with small delay
    const timeoutId = setTimeout(initializeAutocomplete, 100);

    return () => clearTimeout(timeoutId);
  }, [isReady, disabled, name]);

  // Separate effect for attaching the event listener
  useEffect(() => {
    if (!isReady) return;

    let listener: any = null;
    let isListenerAttached = false;
    let checkCount = 0;
    const maxChecks = 50; // Try for up to 5 seconds (50 * 100ms)

    // Wait for autocomplete to be ready
    const checkInterval = setInterval(() => {
      checkCount++;

      if (isListenerAttached) {
        clearInterval(checkInterval);
        return;
      }

      if (checkCount > maxChecks) {
        console.error("Autocomplete not ready after 5 seconds");
        clearInterval(checkInterval);
        return;
      }

      if (!autocompleteRef.current) return;

      clearInterval(checkInterval);
      isListenerAttached = true;

      // Listen for place selection
      listener = autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();

        if (!place.address_components) {
          console.warn("No address_components in place object");
          return;
        }

        // Extract address components
        const addressComponents: any = {
          street1: "",
          city: "",
          state: "",
          postalCode: "",
          fullAddress: place.formatted_address || "",
        };

        let streetNumber = "";
        let route = "";

        place.address_components.forEach((component: any) => {
          const types = component.types;

          if (types.includes("street_number")) {
            streetNumber = component.long_name;
          }
          if (types.includes("route")) {
            route = component.long_name;
          }
          // Extract city - check multiple possible types
          if (types.includes("locality")) {
            addressComponents.city = component.long_name;
          }
          // Fallback to sublocality if locality not found
          if (
            !addressComponents.city &&
            types.includes("sublocality_level_1")
          ) {
            addressComponents.city = component.long_name;
          }
          if (!addressComponents.city && types.includes("sublocality")) {
            addressComponents.city = component.long_name;
          }
          // Fallback to postal_town if still not found (used in some countries)
          if (!addressComponents.city && types.includes("postal_town")) {
            addressComponents.city = component.long_name;
          }
          // Fallback to administrative_area_level_2 (county level, but better than nothing)
          if (
            !addressComponents.city &&
            types.includes("administrative_area_level_2")
          ) {
            addressComponents.city = component.long_name;
          }
          if (types.includes("administrative_area_level_1")) {
            addressComponents.state = component.short_name;
          }
          if (types.includes("postal_code")) {
            addressComponents.postalCode = component.long_name;
          }
          // Handle postal code suffix if available
          if (
            types.includes("postal_code_suffix") &&
            addressComponents.postalCode
          ) {
            addressComponents.postalCode += `-${component.long_name}`;
          }
        });

        // If postal code is still empty, try to extract from formatted address
        if (!addressComponents.postalCode && place.formatted_address) {
          const zipMatch = place.formatted_address.match(/\b\d{5}(-\d{4})?\b/);
          if (zipMatch) {
            addressComponents.postalCode = zipMatch[0];
          }
        }

        // Combine street number and route
        addressComponents.street1 = `${streetNumber} ${route}`.trim();

        // Log extracted components for debugging
        // console.log("✅ Google Autocomplete - Extracted Address:", {
        //   street1: addressComponents.street1,
        //   city: addressComponents.city,
        //   state: addressComponents.state,
        //   postalCode: addressComponents.postalCode,
        //   fullAddress: addressComponents.fullAddress,
        // });

        // Update the input value
        onChange(addressComponents.street1);

        // Call the callback with all address components
        if (onAddressSelect) {
          onAddressSelect(addressComponents);
        }
      });
    }, 50); // Check every 50ms

    return () => {
      clearInterval(checkInterval);
      if (listener) {
        const google = (window as any).google;
        if (google?.maps?.event) {
          google.maps.event.removeListener(listener);
        }
      }
    };
  }, [isReady, onChange, onAddressSelect]);

  return (
    <div>
      <ThemeInput
        ref={inputRef}
        label={label}
        placeholder={placeholder}
        name={name}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        error={error}
        errorMessage={errorMessage}
        type="text"
        disabled={disabled}
        autoComplete="off"
      />
      {!apiKey && (
        <p className="text-xs text-yellow-600 mt-1">
          Google Maps API key not configured
        </p>
      )}
      {loadError && apiKey && (
        <p className="text-xs text-red-600 mt-1">
          Error loading address autocomplete: {loadError}
        </p>
      )}
      {isReady && !disabled && !loadError && apiKey && (
        <p className="text-xs text-gray-500 mt-1">
          💡 Enter a complete address with street number
        </p>
      )}
    </div>
  );
};

GoogleAutocompleteInput.displayName = "GoogleAutocompleteInput";

export default GoogleAutocompleteInput;
