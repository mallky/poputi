export interface User {
  id: string;
  phoneNumber: string;
  type: "driver" | "passenger";
  coordinates?: [number, number];
}

export interface AuthResponse {
  token: string;
  user: User;
}
