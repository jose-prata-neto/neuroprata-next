import type { NextRequest } from 'next/server';
import { authController } from '@/server/modules/auth/controller';

export function POST(request: NextRequest) {
  return authController.login(request);
}
