import { authController } from '@/server/modules/auth/controllers';

export function POST() {
  return authController.logout();
}
