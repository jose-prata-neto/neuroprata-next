import { authController } from '@/server/modules/auth/controller';

export function POST() {
  return authController.logout();
}
