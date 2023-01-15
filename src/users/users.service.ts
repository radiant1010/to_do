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
    try {
      //중복 email 체크
      const isEmail = await this.isEmail(createUserDto.email);
      if (!isEmail) {
        const saltOrRounds = 10;
        const hash = await bcrypt.hash(createUserDto.password, saltOrRounds);

        const saveUser = await this.userRepository.save({
          name: createUserDto.name,
          email: createUserDto.email,
          password: hash,
        });

        return { code: 101, success: true, message: '회원가입 완료!' };
      }
    } catch (error) {
      return { code: 201, success: false, message: error.message };
    }
  }

  //email Check
  async isEmail(email: string): Promise<User> {
    //email여부 조회(유저 정보)
    const getEmail = await this.userRepository.findOne({
      where: { email: email },
    });
    return getEmail;
  }
}
