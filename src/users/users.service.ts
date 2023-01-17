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
  async login(user: any) {
    try {
      //env 추가(cross-env) -> JWT 토큰 시간 넣기(maxAge? expire?) 뭐로하지?
      //payload 인터페이스? class 생성
      //user정보로 JWT payload 객체 만들기
      //토큰 생성 함수 호출
      const access_token = '';
      const refresh_token = '';
      return {
        success: true,
        access_token,
        refresh_token,
      };
    } catch (error) {
      return { success: false, message: '로그인 정보를 찾을 수 없습니다.' };
    }
  }
  //회원 정보 수정
}
