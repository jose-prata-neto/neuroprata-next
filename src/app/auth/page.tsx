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
import { AddDocumentDialog } from "@/components/new-components/add-document-dialog";

export default function AuthPage() {
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
    </main>
  );
}
