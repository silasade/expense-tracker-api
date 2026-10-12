import { Response, Request, NextFunction } from "express";
import { success } from "zod";
import { userService } from "../services/user.services";
import bcrypt from "bcryptjs";
import { ZodMiniEmail } from "zod/mini";
import { createToken } from "../utils/createToken";
import dotenv from "dotenv";
dotenv.config();
const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, firstName, lastName, password } = req.body;
    const duplicateUser = await userService.findUserByEmail(email);
    if (duplicateUser) {
      res.status(409).json({
        success: false,
        message: "User with email already exist",
      });
      return;
    }
    const user = await userService.createUser({
      email,
      firstName,
      lastName,
      password,
    });
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await userService.findUserByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }
    const secretKey = process.env.JWT_SECRET || "fallBackSecret";

    const token = createToken({ email, id: String(user._id) }, secretKey);
    res.status(201).json({
      success: true,
      message: "User logged in successfully",
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { register, login };
