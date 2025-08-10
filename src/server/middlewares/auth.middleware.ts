import { type NextRequest, NextResponse } from 'next/server';
import { jwtService } from '@/lib/jwt';
import { userServices } from '@/server/modules/user';
import { AppError } from '@/utils/error/app-error';

export async function authenticate(
  request: NextRequest,
  response?: NextResponse
): Promise<NextResponse> {
  try {
    let reply = response;

    const cookieToken = request.cookies.get('access-token')?.value;
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    const token = cookieToken || bearerToken;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { userId } = jwtService.verifyToken(token);

    const userExists = await userServices.findById.execute(userId);

    if (!userExists) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    reply = reply ?? NextResponse.next();

    return reply;
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.httpStatus }
      );
    }

    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
