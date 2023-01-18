import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto } from 'src/users/dto/login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passField: 'password',
      passReqToCallback: false,
    });
  }
  /* 
  Return 값
    올바른 정보 { success : success, user정보 }
    잘못된 정보 { success : false, error.message }
  */
  async validate(email: string, password: string): Promise<SigninDto> {
    //받아오는 결과는 에러시 success : false, 올바른 정보 : 유저 정보
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}
