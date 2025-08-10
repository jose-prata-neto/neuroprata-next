import jwt from 'jsonwebtoken';
import { env } from '@/lib/env';
import { AppErrorFactory } from '@/utils/error/error-factory';

interface Payload {
  userId: string;
  email: string;
  role?: string;
  [key: string]: unknown;
}

export class JWTMethods {
  private readonly expiryWarningTime = 60 * 15;

  isExpiring(token: string): boolean {
    try {
      const decoded = this.verifyToken(token);
      const now = Math.floor(Date.now() / 1000);

      if (typeof decoded.exp !== 'number') {
        throw AppErrorFactory.invalidFormat(
          'token',
          'JWT with exp claim',
          token
        );
      }

      return decoded.exp - now < this.expiryWarningTime;
    } catch {
      return true;
    }
  }

  refreshToken(token: string): string {
    try {
      const decoded = this.verifyToken(token);

      const refreshPayload: Payload = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        ...Object.fromEntries(
          Object.entries(decoded).filter(
            ([key]) =>
              ![
                'sub',
                'aud',
                'exp',
                'iat',
                'iss',
                'jti',
                'nbf',
                'userId',
                'email',
                'role',
              ].includes(key)
          )
        ),
      };

      return this.signToken(refreshPayload);
    } catch {
      throw AppErrorFactory.sessionExpired();
    }
  }

  signToken(payload: Payload): string {
    try {
      return jwt.sign(payload, env.JWT_SECRET as string, {
        expiresIn: '1h',
        issuer: 'neuroprata',
        audience: 'neuroprata-client',
      });
    } catch (error) {
      throw AppErrorFactory.internalServerError(
        `Failed to sign JWT token: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  verifyToken(token: string): jwt.JwtPayload & Payload {
    try {
      return jwt.verify(token, env.JWT_SECRET, {
        issuer: 'neuroprata',
        audience: 'neuroprata-client',
      }) as jwt.JwtPayload & Payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw AppErrorFactory.sessionExpired();
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw AppErrorFactory.unauthorized('Invalid token');
      }
      throw AppErrorFactory.unauthorized('Token verification failed');
    }
  }

  decodeToken(token: string): (jwt.JwtPayload & Payload) | null {
    try {
      const decoded = jwt.decode(token);
      return decoded as jwt.JwtPayload & Payload;
    } catch {
      return null;
    }
  }

  extractUserId(token: string): string | null {
    const decoded = this.decodeToken(token);
    return decoded?.userId ?? null;
  }

  isExpired(token: string): boolean {
    try {
      this.verifyToken(token);
      return false;
    } catch {
      return true;
    }
  }
}

export const jwtService = new JWTMethods();
