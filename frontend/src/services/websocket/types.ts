export type Coordinates = [number, number];  // [longitude, latitude]

export type UserType = 'self' | 'driver' | 'passenger';

export interface User {
    id: string;
    coordinates: Coordinates;
    type: UserType;
}

export interface WebSocketMessage {
    type: 'user_location' | 'initial_users' | 'user_disconnect';
    users?: User[];
    user?: User;
    userId?: string;
}
