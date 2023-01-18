import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment';
import { AuthService } from '../auth/auth.service';
import { SigninDto } from './dto/login.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private authService: AuthService,
  ) { }
  //회원가입
  async createAccount({ email, name, password }: CreateUserDto) {
    try {
      //check E-mail
      const isEmail = await this.userRepository.findOne({ where: { email: email } });
      if (isEmail) {
        return { success: false, message: '이미 가입 처리된 e-mail입니다.' };
      }
      //Q. @BeforeInsert 사용하면 안먹힘 create -> save 해야함 원인 파악
      const user: User = this.userRepository.create({ email, name, password });
      await this.userRepository.save(user);
      return { success: true, message: '회원가입 완료!' };
    } catch (error) {
      return { success: false, message: '회원 가입에 실패 하였습니다. 입력한 정보를 확인해 주세요.' };
    }
  }
  //로그인(Passport에서 검증 완료하면 진입)
  /* 
    시나리오
    1. 토큰 2개 모두 만료시 : 에러
    2. access token은 유효, refresh token은 만료 => 로그아웃 처리??
    3. access token은 만료, refresh token은 유효 => access token 재발급
    4. access token은 유효, refresh token은 유효 => 다음 로직으로 넘어감
  */
  async login(user: User) {
    try {
      const access_token = await this.authService.genAccessToken(user.user_id);

      //refresh token 검증
      //로그인을 또 했는데 3번 case일 경우를 가정. 생각해보면 refresh token을 로그인 할때마다 또 발급하는거는 보안상 의미가 없다.
      //passport에서 추가하면 어떻게 체크하게 될지는 모르지만 의식의 흐름대로 작성 후 수정.

      //가만 생각해보면 wave 로그인 생각해보면 될 것 같다.
      //kakao 로그인이 자주 풀리는데 사이트 접근 -> access token 정보 확인 ->
      //만료 -> 로그인 -> refreshtoken 확인 -> access token 재발급 || 강제 로그아웃 후 계정 정보(입력 받은 IP, PW)로 다시 로그인
      //유효 -> 그냥 로그아웃 될 이유가 없다.
      const checkRefreshToken = await this.authService.findOneRefreshToken(user);
      console.log(checkRefreshToken);
      //refresh token 발급
      const refresh_token = await this.authService.genRefreshToken(user);
      return {
        success: true,
        access_token: access_token,
        refresh_token: refresh_token,
      };
    } catch (error) {
      return { success: false, message: '로그인 정보를 찾을 수 없습니다.' };
    }
  }
  //회원 정보 수정
}
