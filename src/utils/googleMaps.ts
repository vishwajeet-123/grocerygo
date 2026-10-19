/**
 * Google Maps Platform Key validation and state helper
 *
 * Valid Google Maps Platform API keys start with "AIza" and are 39 characters.
 * Arbitrary tokens or malformed strings cause the Google Maps JS SDK to throw
 * InvalidKeyMapError and halt script execution.
 */

export function isValidGoogleMapsApiKey(key?: string | null): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  return trimmed.startsWith('AIza') && trimmed.length >= 35;
}

export function getEffectiveGoogleMapsApiKey(): string {
  const envKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  if (isValidGoogleMapsApiKey(envKey)) {
    return envKey.trim();
  }
  if (typeof window !== 'undefined') {
    const userStored = localStorage.getItem('grocerygo_gmp_api_key');
    if (isValidGoogleMapsApiKey(userStored)) {
      return userStored!.trim();
    }
  }
  return '';
}

export function saveUserGoogleMapsApiKey(key: string): boolean {
  if (!isValidGoogleMapsApiKey(key)) return false;
  if (typeof window !== 'undefined') {
    localStorage.setItem('grocerygo_gmp_api_key', key.trim());
    window.dispatchEvent(new CustomEvent('gmp-key-updated', { detail: key.trim() }));
  }
  return true;
}

export function clearUserGoogleMapsApiKey(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('grocerygo_gmp_api_key');
    window.dispatchEvent(new CustomEvent('gmp-key-updated', { detail: '' }));
  }
}
