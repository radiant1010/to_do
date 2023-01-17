import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto } from 'src/users/dto/login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email', userpassField: 'password' });
  }
  /* 
  Return 값
    올바른 정보 { success : success, user정보 }
    잘못된 정보 { success : false, error.message }
  */
  async validate(email: string, password: string): Promise<SigninDto> {
    //받아오는 결과는 에러시 success : false, 올바른 정보 : 유저 정보
    const result = await this.authService.validateUser(email, password);
    if (!result.success) {
      throw new UnauthorizedException(result.message);
    }
    return result;
  }
}
