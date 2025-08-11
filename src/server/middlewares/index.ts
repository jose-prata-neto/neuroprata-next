import type { NextRequest, NextResponse } from 'next/server';
import { authenticate } from './auth.middleware';

const protectedRoutes = ['/dashboard', '/settings', '/profile'];
const publicRoutes = ['/login', '/register', '/home'];

export const routes = {
  protected: protectedRoutes,
  public: publicRoutes,
};

export default class Middleware {
  private path: string;

  constructor(path: string) {
    this.path = path;
  }

  isProtected(): boolean {
    const res = protectedRoutes.find((route) => route.startsWith(this.path));

    return Boolean(res);
  }

  isPublic(): boolean {
    const res = publicRoutes.find((route) => route.startsWith(this.path));

    return Boolean(res);
  }

  isRoute(): boolean {
    const res =
      protectedRoutes.find((route) => route === this.path) ||
      publicRoutes.find((route) => route === this.path);

    return Boolean(res);
  }

  async auth(
    request: NextRequest,
    response: NextResponse
  ): Promise<NextResponse<unknown>> {
    return await authenticate(request, response);
  }
}
