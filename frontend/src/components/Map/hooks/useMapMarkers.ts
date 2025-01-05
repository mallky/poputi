import { useCallback } from "react";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Style, Icon } from "ol/style";
import { fromLonLat } from "ol/proj";
import { User } from "../../../services/websocket/types";
import {
  DRIVER_MARKER_SVG,
  MARKER_SVG,
  PASSENGER_MARKER_SVG,
} from "../constants";

export const useMapMarkers = (
  markersSource: React.MutableRefObject<VectorSource | null>
) => {
  const getMarkerSvg = (userType?: User["type"]) => {
    switch (userType) {
      case "driver":
        return DRIVER_MARKER_SVG;
      case "passenger":
        return PASSENGER_MARKER_SVG;
      default:
        return MARKER_SVG;
    }
  };

  const createMarkerStyle = useCallback((svgContent: string) => {
    const svgUrl =
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgContent);
    return new Style({
      image: new Icon({
        src: svgUrl,
        anchor: [0.5, 1],
        scale: 1.5,
        size: [32, 32],
      }),
    });
  }, []);

  const updateUserMarker = useCallback((user: User) => {
    console.log("user", user);
    console.log("markersSource.current", markersSource.current);
    if (!markersSource.current || !user.coordinates) return;

    // Remove existing marker for this user if it exists
    const existingFeature = markersSource.current
      .getFeatures()
      .find((feature) => feature.get("userId") === user.id);
    if (existingFeature) {
      markersSource.current.removeFeature(existingFeature);
    }

    // Create new marker
    const coordinates = fromLonLat(user.coordinates);
    const marker = new Feature({
      geometry: new Point(coordinates),
    });

    // Set user data on the marker
    marker.set("userId", user.id);
    marker.set("user", user);

    // Style based on user type
    const markerSvg = getMarkerSvg(user.type);
    marker.setStyle(createMarkerStyle(markerSvg));

    markersSource.current.addFeature(marker);
  }, []);

  const removeUserMarker = useCallback((userId: string) => {
    if (!markersSource.current) return;

    const feature = markersSource.current
      .getFeatures()
      .find((feature) => feature.get("userId") === userId);
    if (feature) {
      markersSource.current.removeFeature(feature);
    }
  }, []);

  const addDefaultMarker = useCallback(
    (coordinates: [number, number], userType: User["type"]) => {
      if (!markersSource.current) return;

      const marker = new Feature({
        geometry: new Point(fromLonLat(coordinates)),
      });

      marker.set("markerType", "default");
      marker.setStyle(
        createMarkerStyle(
          userType === "driver" ? DRIVER_MARKER_SVG : PASSENGER_MARKER_SVG
        )
      );

      markersSource.current.addFeature(marker);
    },
    []
  );

  return {
    updateUserMarker,
    removeUserMarker,
    addDefaultMarker,
  };
};
