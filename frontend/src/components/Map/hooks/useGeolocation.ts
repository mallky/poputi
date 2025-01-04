import { useCallback } from 'react';
import { GEOLOCATION_OPTIONS, MOSCOW_COORDINATES } from '../constants';

export const useGeolocation = () => {
  const getCurrentPosition = useCallback((): Promise<[number, number]> => {
    return new Promise((resolve) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve([position.coords.longitude, position.coords.latitude]);
          },
          () => resolve(MOSCOW_COORDINATES),
          GEOLOCATION_OPTIONS
        );
      } else {
        resolve(MOSCOW_COORDINATES);
      }
    });
  }, []);

  return {
    getCurrentPosition,
  };
};
