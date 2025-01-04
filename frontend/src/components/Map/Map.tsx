import React, { useEffect, useRef, useState } from "react";
import OLMap from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import { webSocketService } from "../../services/websocket/WebSocketService";
import Popup from "../Popup/Popup";
import { useMapMarkers } from "./hooks/useMapMarkers";
import { useGeolocation } from "./hooks/useGeolocation";
import { MapState } from "./types";
import { DEFAULT_ZOOM } from "./constants";
import "ol/ol.css";
import "./Map.css";

const Map: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<OLMap | null>(null);
  const markersSource = useRef<VectorSource | null>(null);
  const [{ isLoading, selectedUser }, setState] = useState<MapState>({
    isLoading: true,
    selectedUser: null,
  });

  const { getCurrentPosition } = useGeolocation();
  const { updateUserMarker, removeUserMarker, addDefaultMarker } = useMapMarkers(markersSource);

  const initializeMap = async () => {
    if (!mapRef.current) return;

    try {
      // Get coordinates (will fallback to Moscow if needed)
      const coordinates = await getCurrentPosition();

      // Create vector source and layer for markers
      markersSource.current = new VectorSource();
      const markersLayer = new VectorLayer({
        source: markersSource.current,
        zIndex: 1,
      });

      mapInstance.current = new OLMap({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
            zIndex: 0,
          }),
          markersLayer,
        ],
        view: new View({
          center: fromLonLat(coordinates),
          zoom: DEFAULT_ZOOM,
        }),
      });

      // Add default marker
      addDefaultMarker(coordinates);

      // Add click handler for markers
      mapInstance.current.on("click", (event) => {
        const feature = mapInstance.current?.forEachFeatureAtPixel(
          event.pixel,
          (feature) => feature
        );

        if (feature) {
          const markerType = feature.get("markerType");
          if (markerType === "default") {
            setState((prev) => ({
              ...prev,
              selectedUser: {
                user: {
                  id: "default",
                  coordinates: [event.coordinate[0], event.coordinate[1]],
                  type: "passenger"
                },
                position: { x: event.pixel[0], y: event.pixel[1] },
              },
            }));
          } else {
            const user = feature.get("user");
            setState((prev) => ({
              ...prev,
              selectedUser: {
                user,
                position: { x: event.pixel[0], y: event.pixel[1] },
              },
            }));
          }
        } else {
          setState((prev) => ({ ...prev, selectedUser: null }));
        }
      });

      // Initialize WebSocket connection
      webSocketService.connect({
        onUserLocation: updateUserMarker,
        onUserDisconnect: removeUserMarker,
        onOpen: async () => {
          // Send initial location once WebSocket is connected
          const currentCoords = await getCurrentPosition();
          webSocketService.sendLocation(currentCoords);
        },
        onError: (error) => console.error("WebSocket error:", error),
        onClose: () => console.log("WebSocket connection closed"),
      });

      setState({ isLoading: false, selectedUser: null });
    } catch (error) {
      console.error("Error initializing map:", error);
      setState({ isLoading: false, selectedUser: null });
    }
  };

  useEffect(() => {
    // Only cleanup if there's an existing instance
    if (mapInstance.current) {
      mapInstance.current.setTarget(undefined);
      mapInstance.current = null;
    }

    // Initialize map after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(initializeMap, 100);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
        mapInstance.current = null;
      }
      webSocketService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isLoading && mapInstance.current) {
      const updateLocation = async () => {
        try {
          const coordinates = await getCurrentPosition();
          webSocketService.sendLocation(coordinates);
        } catch (error) {
          console.error("Error updating location:", error);
        }
      };

      // Removed sending initial location here

      // Set up periodic location updates
      const intervalId = setInterval(() => {
        updateLocation().catch((error) => console.error("Error updating location:", error));
      }, 10000); // every 10 seconds

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [isLoading]);

  return (
    <div ref={mapRef} className="map-container">
      {isLoading && <div className="loading">Loading map...</div>}
      {selectedUser && (
        <Popup
          content={`User ID: ${selectedUser.user.id}\nType: ${selectedUser.user.type}`}
          position={selectedUser.position}
          onClose={() => setState((prev) => ({ ...prev, selectedUser: null }))}
        />
      )}
    </div>
  );
};

export default Map;
