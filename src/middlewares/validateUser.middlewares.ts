import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/User.models";
import { userService } from "../services/user.services";
dotenv.config();

export interface JWTPayload {
  id: string;
  email: string;
}
export const validateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const headers = req.headers;
    let token: string;
    if (headers.authorization && headers.authorization.startsWith("Bearer")) {
      token = headers.authorization.split(" ")[1];
    } else {
      res.status(500).json({
        success: false,
        message: "Request must be Authorized",
      });
      return;
    }
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication token missing or invalid",
      });
      return;
    }

    const secretKey = process.env.JWT_SECRET || "fallBackSecret";
    const decodedUser = jwt.verify(token, secretKey) as JWTPayload;
    if (!decodedUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }
    const user = await userService.findUserById(decodedUser.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }
    return user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: (error as Error).message,
    });
  }
};
