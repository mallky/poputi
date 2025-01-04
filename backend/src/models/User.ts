export interface User {
    id: string;
    phoneNumber: string;
    password: string;
    type: 'driver' | 'passenger';
    location?: [number, number];
}

export interface UserDTO {
    phoneNumber: string;
    password: string;
    type?: 'driver' | 'passenger';
}
