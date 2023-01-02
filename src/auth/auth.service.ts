import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { User } from "src/users/entities/user.entity";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

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
  //JWT 로그인
  async login(loginUser: User): Promise<any> {
    try {
      const user = await this.usersService.findOne(loginUser.email);
      //exception filter 설정 필요
      if (!user) {
        const errorMsg = "가입된 유저정보를 확인 할 수 없습니다!";
        const error = new Error(errorMsg);
        error.name = "noUser";
        throw error;
      }
      //JWT로 넘겨주기 위한 User 정보
      const payload = {
        sub: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
      console.log("Token 정보 값 :", payload);
      return {
        code: 111,
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      if (error.name === "noUser") {
        console.log("user 조회 실패");
        console.error(error);
        return { code: 202, result: error.message };
      }
    }
  }
}
