import { User } from "../models/User.models";
export class UserService {
  public findUserById = async (id: string) => {
    const user = await User.findById(id);
    return user;
  };
}


export const userService=new UserService()