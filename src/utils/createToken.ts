import jwt from "jsonwebtoken";

export interface JWTPayload {
  id: string;
  email: string;
}

export const createToken = (payload: JWTPayload, secret: string) => {
  const token = jwt.sign(payload, secret, {
    expiresIn: "7d",
  });
  return token
};
