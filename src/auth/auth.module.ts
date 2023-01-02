import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersModule } from "src/users/users.module";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./local.strategy";
import { JwtModule } from "@nestjs/jwt";
import { jwtConstants } from "./constants";
import { AuthController } from "./auth.controller";

@Module({
  //User service등 사용하기 위해서 import
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "60s" },
    }),
  ],
  providers: [AuthService, LocalStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
