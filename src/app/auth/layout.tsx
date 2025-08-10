import { env } from '@/lib/env';
import type { User } from '@/server/db/schema';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  async function getUsers() {
    const res = await fetch(`${env.NEXT_PUBLIC_BASE_URL}/api/users`);
    return res.json() as Promise<User[]>;
  }

  const users = await getUsers();

  return (
    <main className="flex h-screen w-full items-center justify-center p-4">
      {children}
      <div className="absolute top-5 right-5 rounded border p-2">
        <h2 className="font-semibold text-lg">Users</h2>
        <div className="space-y-2">
          {users.map((user) => (
            <div className="border-b py-2 last:border-none" key={user.id}>
              <p>Email: {user.email}</p>
              <p>Name: {user.name}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
