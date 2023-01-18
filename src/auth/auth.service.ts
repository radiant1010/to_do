import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AuthToken } from './entities/authToken.entity';
import * as moment from 'moment-timezone';
import { jwtConstants } from './constants';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthToken)
    private authRepository: Repository<AuthToken>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    //user 정보 조회
    const user = await this.findOne(email, password);
    return user;
  }
  //access-token 발급
  async genAccessToken(user: User): Promise<string | any> {
    const accessToken = this.jwtService.sign(
      {
        id: user.user_id,
        name: user.name,
        role: user.role,
      },
      {
        secret: jwtConstants.secret,
        expiresIn: '30m',
      },
    );
    return accessToken;
  }
  //refresh-token 발급, DB에 저장
  async genRefreshToken(user: User): Promise<string | any> {
    try {
      const REFRESH_EXPIRY_DATE = moment().add('2', 'w').format('YYYY-MM-DD HH:MM:SS');
      //로그인을 또 했을 수 있으니까 토큰 정보부터 조회한다(email이 unique로 등록되어 있어서 duplicate 에러날거임)
      //중복 : 꺼내서 확인하고 번거로우니까 그냥 재발급(DB 업데이트)
      //미중복 : 그냥 발급 후 DB에 저장
      //아니면 그냥 upsert처리?
      const refreshToken = this.jwtService.sign(
        {
          id: user.user_id,
          name: user.name,
          role: user.role,
        },
        {
          secret: jwtConstants.refresh,
          expiresIn: '2w',
        },
      );
      console.log('refreshToken :', refreshToken);
      //DB에도 저장(expire_date는 GMT 00:00시 기준으로 저장해야 하나?)
      const saveToken = await this.authRepository.save({
        token: refreshToken,
        email: user.email,
        expire_date: REFRESH_EXPIRY_DATE,
      });
      if (!saveToken) {
        return { success: false, message: 'refresh_token 생성 에러' };
      }
      return refreshToken;
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  }
  //refresh-token DB에서 삭제(로그아웃시)
  //refresh-token DB에서 업데이트(재발급 요청시)

  //계정 조회
  async findOne(email: string, password: string) {
    try {
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
        return { success: true, user: result };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
