import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { User } from "../types/user";

interface UserState {
  currentUser: User | null;
  connectedUsers: Map<string, User>;
  setCurrentUser: (user: User | null) => void;
  updateUserLocation: (user: User) => void;
  removeUser: (userId: string) => void;
  clearUsers: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set) => ({
      currentUser: null,
      connectedUsers: new Map(),

      setCurrentUser: (user) =>
        set({ currentUser: user }, false, "setCurrentUser"),

      updateUserLocation: (user) =>
        set(
          (state) => ({
            connectedUsers: new Map(state.connectedUsers).set(user.id, user),
          }),
          false,
          "updateUserLocation"
        ),

      removeUser: (userId) =>
        set(
          (state) => {
            const newUsers = new Map(state.connectedUsers);
            newUsers.delete(userId);
            return { connectedUsers: newUsers };
          },
          false,
          "removeUser"
        ),

      clearUsers: () => set({ connectedUsers: new Map() }, false, "clearUsers"),
    }),
    { name: "UserStore" }
  )
);
