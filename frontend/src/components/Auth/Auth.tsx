import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../../services/auth/AuthService";
import "./Auth.css";

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState<"driver" | "passenger">("passenger");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      let response;
      if (isLogin) {
        response = await AuthService.login(phoneNumber, password);
      } else {
        response = await AuthService.register(phoneNumber, password, type);
      }

      AuthService.setToken(response.token);
      AuthService.setUser(response.user);
      navigate("/map");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{isLogin ? "Вход" : "Регистрация"}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Номер телефона:</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+7 (999) 999-99-99"
              required
            />
          </div>
          <div className="form-group">
            <label>Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {!isLogin && (
            <div className="form-group">
              <label>Тип пользователя:</label>
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as "driver" | "passenger")
                }
              >
                <option value="passenger">Пассажир</option>
                <option value="driver">Водитель</option>
              </select>
            </div>
          )}
          <button type="submit" className="submit-button">
            {isLogin ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>
        <button className="toggle-button" onClick={() => setIsLogin(!isLogin)}>
          {isLogin
            ? "Нет аккаунта? Зарегистрируйтесь"
            : "Уже есть аккаунт? Войдите"}
        </button>
      </div>
    </div>
  );
};
