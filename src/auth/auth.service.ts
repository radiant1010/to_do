import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { jwtConstants } from './constants';
import { Repository } from 'typeorm';
import { AuthToken } from './entities/authToken.entity';
import * as moment from 'moment-timezone';
import { SigninDto } from 'src/users/dto/login.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthToken)
    private authRepository: Repository<AuthToken>,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    //user 정보 조회
    const user = await this.userService.findOne(email, password);

    if (user) {
      return user;
    }

    return null;
  }
  //access-token 발급
  async genAccessToken(email: string) {
    return 'Token';
  }
  //refresh-token 발급, DB에 저장
  async genRefreshToken(email: string) {
    return 'Token';
  }
  async saveRefreshToken(email: string, refreshToken: string, expire: string) {
    const saveToken = await this.authRepository.save({
      token: refreshToken,
      email: email,
      expire_date: expire,
    });

    console.log('결과 값 :', saveToken);

    return { code: 101, result: 'success' };
  }
  //refresh-token DB에서 삭제
  //refresh-token DB에서 업데이트
}
