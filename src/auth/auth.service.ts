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
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    //user 정보 조회
    const user = await this.findOne(email, password);

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

  //계정 조회
  async findOne(email: string, password: string) {
    //email여부 조회(유저 정보)
    const user = await this.userRepository.findOne({ where: { email: email } });
    if (!user) {
      return { success: false, message: '계정 정보를 찾을 수 없습니다.' };
    }
    const comparePassword = await user.checkPassword(password);
    if (!comparePassword) {
      return { success: false, error: '비밀번호를 확인해 주세요.' };
    }
    return { success: true, user };
  }
}
