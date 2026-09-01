import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { config } from '../config.js';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  roleTitle?: string;
  preferredType?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export class AuthService {
  static async register(dto: RegisterDTO) {
    const existing = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      const error: any = new Error('An account with this email already exists.');
      error.statusCode = 400;
      throw error;
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
        roleTitle: dto.roleTitle || 'Screenwriter',
        preferredType: dto.preferredType || 'Screenplay',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(dto.name)}`,
      },
    });

    const token = this.generateToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleTitle: user.roleTitle,
        preferredType: user.preferredType,
        avatar: user.avatar,
      },
      token,
      refreshToken,
    };
  }

  static async login(dto: LoginDTO) {
    const user = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      const error: any = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const match = await bcrypt.compare(dto.password, user.passwordHash);
    if (!match) {
      const error: any = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const token = this.generateToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleTitle: user.roleTitle,
        preferredType: user.preferredType,
        avatar: user.avatar,
      },
      token,
      refreshToken,
    };
  }

  static async updateOnboarding(userId: string, data: { roleTitle?: string; preferredType?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        roleTitle: data.roleTitle,
        preferredType: data.preferredType,
      },
      select: {
        id: true,
        name: true,
        email: true,
        roleTitle: true,
        preferredType: true,
        avatar: true,
      },
    });
    return user;
  }

  static async getMe(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        roleTitle: true,
        preferredType: true,
        avatar: true,
        createdAt: true,
      },
    });
  }

  static generateToken(id: string, email: string) {
    return jwt.sign({ id, email }, config.jwtSecret, { expiresIn: '7d' });
  }

  static generateRefreshToken(id: string) {
    return jwt.sign({ id }, config.jwtRefreshSecret, { expiresIn: '30d' });
  }
}
