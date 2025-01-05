import React from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../../services/auth/AuthService";
import { useUserStore } from "../../store/userStore";
import { webSocketService } from "../../services/websocket/WebSocketService";
import "./Logout.css";

export const Logout: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentUser, clearUsers } = useUserStore();

  const handleLogout = () => {
    webSocketService.disconnect();
    AuthService.logout();
    setCurrentUser(null);
    clearUsers();
    navigate("/auth");
  };

  return (
    <button className="logout-button" onClick={handleLogout}>
      Выйти
    </button>
  );
};
