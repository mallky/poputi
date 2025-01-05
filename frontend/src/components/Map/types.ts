import { User } from "../../services/websocket/types";

export interface MapState {
  isLoading: boolean;
  selectedUser: {
    user: User | null;
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
