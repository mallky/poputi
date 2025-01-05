import { useCallback, useRef } from "react";
import OLMap from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import { webSocketService } from "../../../services/websocket/WebSocketService";
import { DEFAULT_ZOOM } from "../constants";
import { User } from "../../../types/user";
import { MapState } from "../types";
import { useMapMarkers } from "./useMapMarkers";

interface UseMapInitializationProps {
  mapRef: React.RefObject<HTMLDivElement>;
  updateUserLocation: (user: User) => void;
  removeUser: (userId: string) => void;
  getCurrentPosition: () => Promise<[number, number]>;
  setState: React.Dispatch<React.SetStateAction<MapState>>;
  setBottomSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  user: User | null;
}

export const useMapInitialization = ({
  mapRef,
  updateUserLocation,
  removeUser,
  getCurrentPosition,
  setState,
  setBottomSheetOpen,
  user,
}: UseMapInitializationProps) => {
  const mapInstance = useRef<OLMap | null>(null);
  const markersSource = useRef<VectorSource | null>(null);

  const { updateUserMarker, removeUserMarker, addDefaultMarker } =
    useMapMarkers(markersSource);

  const handleMapClick = useCallback(
    (event: any) => {
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
              user,
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

        setBottomSheetOpen(true);
      } else {
        setState((prev) => ({ ...prev, selectedUser: null }));
      }
    },
    [setBottomSheetOpen, setState, user]
  );

  const initializeMap = useCallback(async () => {
    if (!mapRef.current) return;

    try {
      if (!user) {
        console.log("user not found", user);
        return;
      }

      webSocketService.initialize(user);

      const coordinates = await getCurrentPosition();

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

      addDefaultMarker(coordinates, user.type);

      mapInstance.current.on("click", handleMapClick);

      webSocketService.connect({
        onUserLocation: (user) => {
          updateUserMarker(user);
          updateUserLocation(user);
        },
        onUserDisconnect: (userId) => {
          removeUserMarker(userId);
          removeUser(userId);
        },
        onOpen: async () => {
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
  }, [
    addDefaultMarker,
    getCurrentPosition,
    mapRef,
    removeUser,
    removeUserMarker,
    setState,
    updateUserLocation,
    updateUserMarker,
    user,
    handleMapClick,
  ]);

  return { mapInstance, initializeMap };
};
