import { createBrowserRouter, Navigate } from "react-router-dom";
import { Auth } from "./components/Auth/Auth";
import Map from "./components/Map/Map";
import { AuthService } from "./services/auth/AuthService";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = AuthService.getToken();
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/map" replace />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/map",
    element: (
      <PrivateRoute>
        <Map />
      </PrivateRoute>
    ),
  },
]);
