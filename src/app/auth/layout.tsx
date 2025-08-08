import { Card } from "@/components/ui/card";
import { User } from "@/server/db/schema";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  async function getUsers() {
    const res = await fetch("http://localhost:3000/api/users");
    return res.json() as Promise<User[]>;
  }

  const users = await getUsers();

  return (
    <main className="h-screen w-full flex items-center justify-center p-4">
      {children}
      <div className="absolute top-5 right-5">
        <h2 className="text-lg font-semibold">Users</h2>
        <ul className="space-y-2">
          {users.map((user) => (
            <li key={user.id} className="border-b py-2">
              {user.email}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
