import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule, JwtSecretRequestType } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { authTokenProviders } from './providers/authToken.providers';
import { DatabaseModule } from 'src/config/database/database.module';

@Module({
  //User service등 사용하기 위해서 import
  imports: [UsersModule, PassportModule, JwtModule, DatabaseModule],
  providers: [...authTokenProviders, AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
