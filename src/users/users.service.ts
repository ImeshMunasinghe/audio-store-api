import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(registerUserDto: RegisterUserDto) {
    const { email, password, name } = registerUserDto;

    // 1. Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    // 2. Hash the password securely (Cost factor 10)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Save to database
    const newUser = await this.prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
    });

    // 4. Strip the password hash before returning the object
    const { passwordHash: _, ...safeUser } = newUser;
    return safeUser;
  }
}
