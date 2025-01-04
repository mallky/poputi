export type Coordinates = [number, number];

export type UserType = 'driver' | 'passenger';

export interface User {
  id: string;
  coordinates: Coordinates;
  type: UserType;
}

export type WebSocketMessageType = 'user_location' | 'user_disconnect';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  user?: User;
  userId?: string;
}

export interface WebSocketHandlers {
  onUserLocation?: (user: User) => void;
  onUserDisconnect?: (userId: string) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}
