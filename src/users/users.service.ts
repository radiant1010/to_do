import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthToken } from 'src/auth/entities/authToken.entity';
import moment from 'moment';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
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
  //로그인
  async login(email: string) {
    try {
      //authService에 있는 토큰 발급 호출
      return {
        success: true,
        message: '토큰 정보 입력',
      };
    } catch (error) {
      return { success: false, message: '로그인 정보를 찾을 수 없습니다.' };
    }
  }
  //회원 정보 수정

  //계정 조회
  async findOne(email: string, password: string) {
    //email여부 조회(유저 정보)
    const user = await this.userRepository.findOne({ where: { email: email } });
    if (!user) {
      return { success: false, message: '계정 정보를 찾을 수 없습니다.' };
    }
    const comparePassword = await user.checkPassword(password);
    if (!comparePassword) {
      return { success: false, error: '비밀번호를 확인해 주세요.' };
    }
    return { success: true, user };
  }
}
