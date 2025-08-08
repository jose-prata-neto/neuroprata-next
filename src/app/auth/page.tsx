import { Button } from "@/components/ui/button";
import {
  Card,
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { type User } from "@prisma/client";

export default async function AuthPage() {
  async function getUsers() {
    const res = await fetch("http://localhost:3000/api/users");
    return res.json() as Promise<User[]>;
  }

  const users = await getUsers();

  return (
    <main className="h-screen w-full flex items-center justify-center p-4">
      <Card className="w-96">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Please enter your credentials to log in.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="Enter your email" />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" placeholder="Enter your password" />
          </div>
          <Button className="w-full">Login</Button>
        </CardContent>
        <CardFooter className="flex-col gap-1">
          <p className="text-sm text-muted-foreground mx-auto">
            Forgot your password?{" "}
            <Link
              href="/auth/reset-password"
              className="text-primary hover:underline"
            >
              Reset it here
            </Link>
          </p>
          <p className="text-sm text-muted-foreground mx-auto">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
      <div className="absolute top-5 right-5">
        {users.map((user) => (
          <div key={user.id}>
            <p>{user.email}</p>
            <p>{user.passwordHash}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
