import type { NextRequest } from 'next/server';
import { authController } from '@/server/modules/auth/controller';

export function GET(request: NextRequest) {
  return authController.me(request);
}
