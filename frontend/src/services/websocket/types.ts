import { User as AuthUser } from "../../types/user";

export type User = AuthUser;

export interface WebSocketMessage {
  type: "user_location" | "initial_users" | "user_disconnect";
  users?: User[];
  user?: User;
  userId?: string;
}
