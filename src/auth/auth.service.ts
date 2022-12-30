import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(userEmail: string, pass: string): Promise<any> {
    //user 정보 조회
    const user = await this.usersService.findOne(userEmail);
    //user 정보 조회 후 가져온 PW와 입력받아 넘어온 PW를 bcrypt.compare로 비교
    const isMatch = await bcrypt.compare(pass, user.password);

    if (user && isMatch) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
