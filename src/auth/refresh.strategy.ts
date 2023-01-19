import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { jwtConstants } from './constants';
import { AuthService } from './auth.service';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          const token = request?.cookies?.Refresh;
          if (!token) {
            return null;
          }
          return token;
        },
      ]),
      passReqToCallback: true,
      secretOrKey: jwtConstants.refresh,
    });
  }
  //쿠키 파서에서 Refresh토큰 정보를 가져오는데.... 왜 인식을 못하지?
  //### UUID는 Secrit Key에서 인식을 못함 별도로 처리해줘야 하나봄
  async validate(request: any, payload: any) {
    //JWT 토큰 정보 만료 ==> payload 없음
    if (!payload) {
      throw new HttpException('payload 정보가 없음', HttpStatus.UNAUTHORIZED);
    }
    //강제 로그아웃 처리
    const tokenData = request?.cookies?.Refresh;
    if (!tokenData) {
      throw new BadRequestException('RefreshToken 정보가 없음');
    }
    //토큰이 올바른지 검증
    const user = await this.authService.findOneRefreshToken(tokenData, payload.id);
    if (!user) {
      throw new HttpException('RefreshToken 정보가 없음', HttpStatus.BAD_REQUEST);
    }
    return user;
  }
}
