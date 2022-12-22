import { Inject, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @Inject("USER_REPOSITORY")
    private userRepository: Repository<User>
  ) {
    this.userRepository = userRepository;
  }

  async create(createUserDto: CreateUserDto) {
    console.log(createUserDto);
    return `This action adds a new user ${createUserDto.name}`;
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
