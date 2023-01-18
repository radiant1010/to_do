import { AuthToken } from './entities/authToken.entity';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { RefreshStrategy } from './refresh.strategy';

@Module({
  //User service등 사용하기 위해서 import
  imports: [TypeOrmModule.forFeature([AuthToken, User]), PassportModule.register({}), JwtModule.register({})],
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy, RefreshStrategy, PassportModule],
})
export class AuthModule {}
