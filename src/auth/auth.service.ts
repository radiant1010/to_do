import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AuthToken } from './entities/authToken.entity';
import * as moment from 'moment-timezone';
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
    return user;
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
  //refresh-token DB에서 삭제(로그아웃시)
  //refresh-token DB에서 업데이트(재발급 요청시)

  //계정 조회
  async findOne(email: string, password: string) {
    try {
      //email여부 조회(유저 정보)
      const user = await this.userRepository.findOne({ where: { email: email } });
      const comparePassword = await user.checkPassword(password);
      if (!user) {
        //typeORM null(DB 조회 실패시)일때 메시지 수정(인터셉터, exception filter 작성해야함)
        //throw new HttpException('가입된 유저가 아닙니다.', HttpStatus.BAD_REQUEST);
        throw Error();
      }

      if (!comparePassword) {
        throw new HttpException('유효한 비밀번호가 아닙니다.', HttpStatus.BAD_REQUEST);
      }

      if (user && comparePassword) {
        //password는 넘겨주면 안되니까 따로 빼둠
        const { password, ...result } = user;
        return { success: true, result };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
