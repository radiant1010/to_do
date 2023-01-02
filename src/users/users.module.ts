import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { DatabaseModule } from "src/config/database/database.module";
import { userProviders } from "./providers/user.providers";
import { AuthService } from "src/auth/auth.service";

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [...userProviders, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
