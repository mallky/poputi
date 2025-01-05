import { User } from "../../services/websocket/types";

export interface MapState {
  isLoading: boolean;
  selectedUser: {
    user:
      | User
      | {
          id: string;
          coordinates: [number, number];
          type: "passenger";
          phoneNumber: string;
        };
    position: { x: number; y: number };
  } | null;
}

export interface Position {
  x: number;
  y: number;
}

export interface MarkerClickEvent {
  coordinate: [number, number];
  pixel: [number, number];
}
