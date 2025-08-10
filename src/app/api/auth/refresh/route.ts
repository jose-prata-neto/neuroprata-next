import type { NextRequest } from 'next/server';
import { authController } from '@/server/modules/auth/controllers';

export function POST(request: NextRequest) {
  return authController.refresh(request);
}
