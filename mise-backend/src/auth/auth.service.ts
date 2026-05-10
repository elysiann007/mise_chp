import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { compare } from 'bcryptjs';
import { User } from '../database/entities/user.entity';
import { BusinessException } from '../common/exceptions/business.exception';
import type { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string; role: string; restaurantId: string }> {
    const user = await this.userRepo.findOne({
      where: { email: dto.email, isActive: true },
    });

    if (!user || !(await compare(dto.password, user.passwordHash))) {
      throw new BusinessException('INVALID_CREDENTIALS', HttpStatus.UNAUTHORIZED);
    }

    const payload: JwtPayload = {
      sub: user.id,
      restaurantId: user.restaurantId,
      role: user.role,
      email: user.email,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      role: user.role,
      restaurantId: user.restaurantId,
    };
  }
}
