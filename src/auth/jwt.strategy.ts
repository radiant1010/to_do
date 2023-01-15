import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          return request?.cookies?.Authorization;
        },
      ]),
      //JWT 만료 무시여부
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    console.log('User 정보 :', payload);
    const userInfo = payload.sub;
    //user 정보가 있는지 여부 체크
    if (userInfo) {
      return payload;
    } else {
      console.log('Refresh Token으로 Access Token 재발급 요망');
      throw new UnauthorizedException('유저 정보를 찾을 수 없음!(토큰 유효기간 만료)');
    }
  }
}
