import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    //중복 email 체크
    const isEmail = await this.isEmail(createUserDto.email);
    if (isEmail.success) {
      const saltOrRounds = 10;
      const hash = await bcrypt.hash(createUserDto.password, saltOrRounds);

      const saveUser = await this.userRepository.save({
        name: createUserDto.name,
        email: createUserDto.email,
        password: hash,
      });

      return { code: 101, success: true, message: '회원가입 완료!' };
    }
  }

  //중복 계정 조회
  async isEmail(email: string): Promise<any> {
    //email여부 조회(유저 정보)
    const getEmail = await this.userRepository.findOne({
      where: { email: email },
    });
    return { code: 102, success: true, message: '중복되는 E-Mail이 없습니다.' };
  }
}
