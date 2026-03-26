import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Criar conta — Fintra",
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Criar sua conta</h1>
        <p className="text-sm text-muted-foreground">
          Comece a controlar suas finanças hoje mesmo
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
