import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy'; // <-- 1. Import the new strategy

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}), 
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // <-- 2. Add it to this array
})
export class AuthModule {}