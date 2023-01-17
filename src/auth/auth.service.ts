import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { jwtConstants } from './constants';
import { Repository } from 'typeorm';
import { AuthToken } from './entities/authToken.entity';
import * as moment from 'moment-timezone';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthToken)
    private authRepository: Repository<AuthToken>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(userEmail: string, pass: string): Promise<any> {
    //user 정보 조회
    const user = await this.usersService.findOne({ email: userEmail });
    //user 정보 조회 후 가져온 PW와 입력받아 넘어온 PW를 bcrypt.compare로 비교
    const isMatch = await bcrypt.compare(pass, user.password);

    if (user && isMatch) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  //refresh-token DB에 저장
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
