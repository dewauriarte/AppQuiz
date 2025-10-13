import prisma from '@config/database';
import { RegisterInput, LoginInput, AuthResponse, JWTPayload } from '@/types/auth.types';
import { hashPassword, comparePassword } from '@utils/password';
import { generateAccessToken, generateRefreshToken } from '@utils/jwt';
import { ConflictError, UnauthorizedError, BadRequestError } from '@utils/ApiError';

export class AuthService {
  async register(data: RegisterInput): Promise<AuthResponse> {
    // Check if username already exists
    const existingUser = await prisma.users.findUnique({
      where: { username: data.username },
    });

    if (existingUser) {
      throw new ConflictError('Username already exists');
    }

    // Check if email already exists (if provided)
    if (data.email) {
      const existingEmail = await prisma.users.findUnique({
        where: { email: data.email },
      });

      if (existingEmail) {
        throw new ConflictError('Email already exists');
      }
    }

    // Check age if birthdate provided
    let isMinor = false;
    if (data.birthdate) {
      const birthDate = new Date(data.birthdate);
      const age = this.calculateAge(birthDate);
      isMinor = age < 18;
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user and profile in transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.users.create({
        data: {
          username: data.username,
          email: data.email,
          password_hash: passwordHash,
          role: data.role,
          display_name: data.displayName,
          birthdate: data.birthdate ? new Date(data.birthdate) : null,
          is_minor: isMinor,
        },
      });

      // Create user profile
      await tx.user_profiles.create({
        data: {
          user_id: newUser.user_id,
        },
      });

      // Create user currencies
      await tx.user_currencies.create({
        data: {
          user_id: newUser.user_id,
        },
      });

      return newUser;
    });

    // Generate tokens
    const jwtPayload: JWTPayload = {
      userId: user.user_id,
      username: user.username,
      role: user.role,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    // Save session
    await prisma.user_sessions.create({
      data: {
        user_id: user.user_id,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 min
        refresh_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        displayName: user.display_name,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    // Find user
    const user = await prisma.users.findUnique({
      where: { username: data.username },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if account is active
    if (!user.is_active) {
      throw new UnauthorizedError('Account is inactive');
    }

    // Check if account is banned
    if (user.is_banned) {
      throw new UnauthorizedError('Account is banned');
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.password_hash);

    if (!isPasswordValid) {
      // Increment failed login attempts
      await prisma.users.update({
        where: { user_id: user.user_id },
        data: {
          failed_login_attempts: { increment: 1 },
        },
      });

      throw new UnauthorizedError('Invalid credentials');
    }

    // Reset failed login attempts and update last login
    await prisma.users.update({
      where: { user_id: user.user_id },
      data: {
        failed_login_attempts: 0,
        last_login: new Date(),
      },
    });

    // Generate tokens
    const jwtPayload: JWTPayload = {
      userId: user.user_id,
      username: user.username,
      role: user.role,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    // Save session
    await prisma.user_sessions.create({
      data: {
        user_id: user.user_id,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + 15 * 60 * 1000),
        refresh_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        displayName: user.display_name,
      },
      accessToken,
      refreshToken,
    };
  }

  async getProfile(userId: number) {
    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        username: true,
        email: true,
        role: true,
        display_name: true,
        is_active: true,
        created_at: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // ✅ CRÍTICO: Mapear user_id a id para consistencia con frontend
    return {
      id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
      displayName: user.display_name,
    };
  }

  async logout(userId: number, refreshToken: string) {
    await prisma.user_sessions.updateMany({
      where: {
        user_id: userId,
        refresh_token: refreshToken,
      },
      data: {
        is_active: false,
        revoked_at: new Date(),
        revoked_reason: 'user_logout',
      },
    });

    return { message: 'Logged out successfully' };
  }

  async updateProfile(userId: number, data: { displayName?: string; email?: string }) {
    const user = await prisma.users.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Check if email already exists (if changing email)
    if (data.email && data.email !== user.email) {
      const existingEmail = await prisma.users.findUnique({
        where: { email: data.email },
      });

      if (existingEmail) {
        throw new ConflictError('Email already in use');
      }
    }

    const updatedUser = await prisma.users.update({
      where: { user_id: userId },
      data: {
        display_name: data.displayName,
        email: data.email,
      },
      select: {
        user_id: true,
        username: true,
        email: true,
        role: true,
        display_name: true,
      },
    });

    // ✅ Mapear user_id a id para consistencia
    return {
      id: updatedUser.user_id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      displayName: updatedUser.display_name,
    };
  }

  async forgotPassword(email: string) {
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists
      return { message: 'If email exists, reset instructions were sent' };
    }

    // TODO: Generate reset token and send email
    // For now, just return success message
    return { message: 'If email exists, reset instructions were sent' };
  }

  async resetPassword(_token: string, _newPassword: string) {
    // TODO: Verify reset token
    // For now, just throw error
    throw new BadRequestError('Password reset not fully implemented yet');
  }

  async searchUserByUsername(username: string) {
    const user = await prisma.users.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive',
        },
        role: 'student', // Only search for students
      },
      select: {
        user_id: true,
        username: true,
        display_name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    if (!user) {
      return null;
    }

    // ✅ Mapear user_id a id para consistencia
    return {
      id: user.user_id,
      username: user.username,
      displayName: user.display_name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
    };
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }
}

export default new AuthService();

