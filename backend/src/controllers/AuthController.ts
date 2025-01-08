import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { phoneNumber, password, type } = req.body;
      const result = await authService.register({
        phoneNumber,
        password,
        type,
      });
      res.status(201).json(result);
    } catch (error) {
      res
        .status(400)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { phoneNumber, password } = req.body;
      const result = await authService.login(phoneNumber, password);
      res.status(200).json(result);
    } catch (error) {
      res
        .status(401)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
    }
  }
  async getUsers(req: Request, res: Response) {
    try {
      const users = await authService.getUsers();
      res.status(200).json(users);
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
    }
  }
}
