import { Inject, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import * as bcrypt from "bcrypt";
@Injectable()
export class UsersService {
  constructor(
    @Inject("USER_REPOSITORY")
    private userRepository: Repository<User>
  ) {
    this.userRepository = userRepository;
  }

  async create(createUserDto: CreateUserDto) {
    try {
      //중복 email 체크
      const isEmail = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (isEmail) {
        //email이 중복이면
        const errorMsg = "이미 가입된 E-mail이 존재합니다.";
        const error = new Error(errorMsg);
        error.name = "isEmail";
        throw error;
      } else {
        const saltOrRounds = 10;
        const hash = await bcrypt.hash(createUserDto.password, saltOrRounds);

        const saveUser = await this.userRepository.save({
          name: createUserDto.name,
          email: createUserDto.email,
          password: hash,
        });

        //console.log("회원 가입 결과 :", saveUser);

        return {
          code: 101,
          result: `${saveUser.name}님 회원가입을 축하드립니다.`,
        };
      }
    } catch (error) {
      if (error.name === "isEmail") {
        console.error(error);
        return { code: 201, result: error.message };
      }
    }
  }

  /*   async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(email: string): Promise<User | undefined> {
    //TypeORM 문법으로 수정(user table email column 조회)
    return await this.userRepository.findOne({ email: email });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  } */
}
