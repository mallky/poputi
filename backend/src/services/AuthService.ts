import { User, UserDTO } from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// В реальном приложении здесь должна быть база данных
const users: User[] = [
  {
    id: "1",
    phoneNumber: "9120153594",
    password: bcrypt.hashSync("1", 10),
    type: "driver",
  },
];
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export class AuthService {
  async register(
    userData: UserDTO
  ): Promise<{ token: string; user: Omit<User, "password"> }> {
    const existingUser = users.find(
      (user) => user.phoneNumber === userData.phoneNumber
    );
    if (existingUser) {
      throw new Error("Пользователь с таким номером телефона уже существует");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      phoneNumber: userData.phoneNumber,
      password: hashedPassword,
      type: userData.type || "passenger",
    };

    users.push(newUser);

    const token = jwt.sign(
      { id: newUser.id, phoneNumber: newUser.phoneNumber, type: newUser.type },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { password, ...userWithoutPassword } = newUser;
    return { token, user: userWithoutPassword };
  }

  async login(
    phoneNumber: string,
    password: string
  ): Promise<{ token: string; user: Omit<User, "password"> }> {
    const user = users.find((u) => u.phoneNumber === phoneNumber);
    if (!user) {
      throw new Error("Пользователь не найден");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Неверный пароль");
    }

    const token = jwt.sign(
      { id: user.id, phoneNumber: user.phoneNumber, type: user.type },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }
}
