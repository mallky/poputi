import React, { useEffect, useRef, useState } from "react";
import { webSocketService } from "../../services/websocket/WebSocketService";
import BottomSheet from "../BottomSheet/BottomSheet";
import { useGeolocation } from "./hooks/useGeolocation";
import { useMapInitialization } from "./hooks/useMapInitialization";
import { MapState } from "./types";
import "ol/ol.css";
import "./Map.css";
import { useUserStore } from "../../store/userStore";
import { Logout } from "../Logout/Logout";

const Map: React.FC = () => {
  const isInitialized = useRef(0);

  const mapRef = useRef<HTMLDivElement>(null);
  const [{ isLoading, selectedUser }, setState] = useState<MapState>({
    isLoading: true,
    selectedUser: null,
  });
  const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);

  const { getCurrentPosition } = useGeolocation();
  const { updateUserLocation, removeUser, currentUser: user } = useUserStore();

  const { mapInstance, initializeMap } = useMapInitialization({
    mapRef,
    updateUserLocation,
    removeUser,
    getCurrentPosition,
    setState,
    setBottomSheetOpen,
    user,
  });

  useEffect(() => {
    console.log("Map mounting, user:", user?.id);
    console.log("isInitialized:", isInitialized.current);

    const init = async () => {
      try {
        if (user?.id && !isInitialized.current) {
          isInitialized.current = 1;
          await initializeMap();

          console.log("Map initialized");
          isInitialized.current = 2;
        }
      } catch (error) {
        console.error("Map initialization failed:", error);
        setState({ isLoading: false, selectedUser: null });
      }
    };

    init();
  }, [user?.id, initializeMap]);

  useEffect(() => {
    return () => {
      console.log("Map unmounting");
      if (mapInstance.current && isInitialized.current === 2) {
        mapInstance.current.setTarget(undefined);
        mapInstance.current = null;
      }
      webSocketService.disconnect();
    };
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (!isLoading && mapInstance.current && user) {
      const updateLocation = async () => {
        try {
          const coordinates = await getCurrentPosition();
          webSocketService.sendLocation(coordinates);
        } catch (error) {
          console.error("Error updating location:", error);
        }
      };

      updateLocation();
      intervalId = setInterval(updateLocation, 10000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoading, getCurrentPosition, user]);

  if (!user) {
    return null;
  }

  return (
    <div>
      <div ref={mapRef} className="map-container" />
      <Logout />
      <BottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
      >
        {selectedUser && (
          <div>
            <h2>{selectedUser.user?.id}</h2>
            <p>Type: {selectedUser.user?.type}</p>
            <p>Phone: {selectedUser.user?.phoneNumber}</p>
            <p>Coords: {selectedUser.user?.coordinates?.join(", ")}</p>
          </div>
        )}
      </BottomSheet>
      {isLoading && <div className="loading">Loading map...</div>}
    </div>
  );
};

export default Map;
