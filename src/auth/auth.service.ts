import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AuthToken } from './entities/authToken.entity';
import * as moment from 'moment-timezone';
import { jwtConstants } from './constants';
import { v4 as uuidv4 } from 'uuid';
import { CreateAuthDto } from './dto/create-auth.dto';
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
  async genAccessToken(user_id: number): Promise<string | any> {
    const accessToken = this.jwtService.sign(
      { id: user_id },
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
      const now = new Date();
      const refreshToken = this.jwtService.sign(
        { id: user.user_id },
        {
          secret: jwtConstants.refresh,
          expiresIn: '30m',
        },
      );
      //DB에도 저장(expire_date는 GMT 00:00시 기준으로 저장해야 하나?)
      const coupleWeeks = new Date(now.setDate(now.getDate() + 14));

      const saveToken = await this.authRepository.save({
        token: refreshToken,
        email: user.email,
        expire_date: coupleWeeks,
      });
      console.log(saveToken);
      return refreshToken;
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  }
  //refresh token 정보 조회
  async findOneRefreshToken(refreshToken: string, id: number) {
    //ID로 유저부터 조회
    const user = await this.userRepository.findOne({ where: { user_id: id } });
    if (!user) {
      return { success: false, message: 'User 정보가 없습니다!' };
    }
    //유저 정보로 데이터 조회
    const tokenCheckExpire = await this.authRepository.findOne({ where: { email: user.email } });
    if (!tokenCheckExpire) {
      return { success: false, message: 'Token 정보가 없습니다!' };
    }
    const isRefreshTokenVerfiy = await this.jwtService.verify(refreshToken, {
      secret: jwtConstants.refresh,
    });
    if (!isRefreshTokenVerfiy) {
      throw new HttpException('Token 정보 미일치!', HttpStatus.UNAUTHORIZED);
    }
    return { success: true, user_id: user.user_id };
  }
  //로그아웃, 만료시 refresh token 정보 삭제
  async removeRefreshToken(user_id: number) {
    //유저 정보 조회
    const user = await this.userRepository.findOne({ where: { user_id: user_id } });
    //데이터 삭제
    const removeRefreshToken = await this.authRepository
      .createQueryBuilder('auth_token')
      .update()
      .set({ token: '' })
      .where('email = :email', { email: user.email })
      .execute();
    console.log(removeRefreshToken);
    return { success: true, message: 'refresh 정보 삭제 완료' };
  }
  //refresh-token DB에서 삭제(로그아웃시)

  //계정 조회
  async findOne(email: string, password: string) {
    try {
      const user = await this.userRepository.findOne({ where: { email: email } });
      const comparePassword = await user.checkPassword(password);
      if (!user) {
        //typeORM null(DB 조회 실패시)일때 메시지 수정(인터셉터, exception filter 작성해야함)
        throw new HttpException('가입된 유저가 아닙니다.', HttpStatus.BAD_REQUEST);
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
