// Map default settings
export const MOSCOW_COORDINATES: [number, number] = [37.6156, 55.7522];
export const DEFAULT_ZOOM = 11;
export const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

// SVG markers
export const MARKER_SVG = `
  <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2C10.477 2 6 6.477 6 12c0 7.018 8.75 16.713 9.133 17.137a1.25 1.25 0 0 0 1.734 0C17.25 28.713 26 19.018 26 12c0-5.523-4.477-10-10-10zm0 13a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" 
          fill="#E31E24" 
          stroke="#FFFFFF" 
          stroke-width="1"/>
  </svg>
`;

export const DRIVER_MARKER_SVG = `
  <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2C10.477 2 6 6.477 6 12c0 7.018 8.75 16.713 9.133 17.137a1.25 1.25 0 0 0 1.734 0C17.25 28.713 26 19.018 26 12c0-5.523-4.477-10-10-10zm0 13a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" 
          fill="#4CAF50" 
          stroke="#FFFFFF" 
          stroke-width="1"/>
  </svg>
`;

export const PASSENGER_MARKER_SVG = `
  <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2C10.477 2 6 6.477 6 12c0 7.018 8.75 16.713 9.133 17.137a1.25 1.25 0 0 0 1.734 0C17.25 28.713 26 19.018 26 12c0-5.523-4.477-10-10-10zm0 13a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" 
          fill="#2196F3" 
          stroke="#FFFFFF" 
          stroke-width="1"/>
  </svg>
`;
