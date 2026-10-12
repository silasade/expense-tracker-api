import z from "zod";
import express from "express";
import { login, register } from "../controllers/auth.controllers";
import { validate } from "../middlewares/validateRequest.middlewares";
const routes = express.Router();
const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Enter a valid email").min(1, "Email is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Lass name is required"),
    password: z.string().min(6, "Password is required"),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Enter a valid email").min(1, "Email is required"),
    password: z.string().min(6, "Password is required"),
  }),
});

routes.post("/register", validate(registerSchema), register);
routes.post("/login", validate(loginSchema), login);

export type RegisterSchemaType = z.infer<typeof registerSchema>;
export default routes