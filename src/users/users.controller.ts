import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { LocalAuthGuard } from "../auth/local-auth.guard";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("signup")
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post("signin")
  async login(@Request() req) {
    return { code: 102, result: "로그인 성공!" };
  }
  /*   @Get()
    findAll() {
      return this.usersService.findAll();
    }
  
    @Get(":id")
    findOne(@Param("id") id: string) {
      return this.usersService.findOne(+id);
    }
  
    @Patch(":id")
    update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
      return this.usersService.update(+id, updateUserDto);
    }
  
    @Delete(":id")
    remove(@Param("id") id: string) {
      return this.usersService.remove(+id);
    } */
}
