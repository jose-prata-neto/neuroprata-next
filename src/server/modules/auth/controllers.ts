import { type NextRequest, NextResponse } from 'next/server';
import { jwtService } from '@/lib/jwt';
import type { UserCreate, UserLogin } from '@/server/db/schema';
import { AppError } from '@/utils/error/app-error';
import { AppErrorFactory } from '@/utils/error/error-factory';
import { authServices } from './factory';

export class AuthController {
  async register(request: NextRequest): Promise<NextResponse> {
    try {
      const body = (await request.json()) as UserCreate;

      if (!body.email) {
        throw AppErrorFactory.requiredField('email');
      }

      if (!body.password) {
        throw AppErrorFactory.requiredField('password');
      }

      const userId = await authServices.register.execute(body);

      if (!userId) {
        throw AppErrorFactory.internalServerError('Failed to create user');
      }

      const token = jwtService.signToken({
        userId,
        email: body.email,
        role: body.role || 'user',
      });

      const response = NextResponse.json(
        {
          success: true,
          message: 'User registered successfully',
          user: {
            id: userId,
            email: body.email,
            role: body.role || 'user',
          },
        },
        { status: 201 }
      );

      response.cookies.set('access-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60,
        path: '/',
      });

      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async login(request: NextRequest): Promise<NextResponse> {
    try {
      const body = (await request.json()) as UserLogin;

      if (!body.email) {
        throw AppErrorFactory.requiredField('email');
      }

      if (!body.password) {
        throw AppErrorFactory.requiredField('password');
      }

      // Call the service layer
      const userId = await authServices.login.execute(body);

      if (!userId) {
        throw AppErrorFactory.invalidCredentials();
      }

      const token = jwtService.signToken({
        userId,
        email: body.email,
      });

      const response = NextResponse.json(
        {
          success: true,
          message: 'Login successful',
          user: {
            id: userId,
            email: body.email,
          },
        },
        { status: 200 }
      );

      response.cookies.set('access-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60,
        path: '/',
      });

      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  logout(): NextResponse {
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logout successful',
      },
      { status: 200 }
    );

    response.cookies.set('access-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  }

  refresh(request: NextRequest): NextResponse {
    try {
      const token = request.cookies.get('access-token')?.value;

      if (!token) {
        throw AppErrorFactory.unauthorized('No token provided');
      }

      if (!jwtService.isExpiring(token)) {
        return NextResponse.json(
          {
            success: true,
            message: 'Token is still valid',
          },
          { status: 200 }
        );
      }

      const newToken = jwtService.refreshToken(token);

      const response = NextResponse.json(
        {
          success: true,
          message: 'Token refreshed successfully',
        },
        { status: 200 }
      );

      response.cookies.set('access-token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60,
        path: '/',
      });

      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get current user info
   */
  me(request: NextRequest): NextResponse {
    try {
      const token = request.cookies.get('access-token')?.value;

      if (!token) {
        throw AppErrorFactory.unauthorized('No token provided');
      }

      const payload = jwtService.verifyToken(token);

      return NextResponse.json(
        {
          success: true,
          user: {
            id: payload.userId,
            email: payload.email,
            role: payload.role,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: unknown): NextResponse {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
        },
        { status: error.httpStatus }
      );
    }

    // Log unexpected errors in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Add proper logging service
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Export singleton instance
export const authController = new AuthController();
