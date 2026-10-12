import {  User } from "../models/User.models";
import { RegisterSchemaType } from "../routes/auth.routes";
export class UserService {
  public findUserById = async (id: string) => {
      const user = await User.findById(id);
      return user;
  };
  public findUserByEmail = async (email: string) => {
    const duplicateUser = await User.findOne({ email });

    return duplicateUser;
  };

  public createUser = async (body: RegisterSchemaType["body"]) => {
    const { email, firstName, lastName, password } = body;
    const user = await User.create({
      email,
      firstName,
      lastName,
      password,
    });
    return user
  };
}

export const userService = new UserService();
