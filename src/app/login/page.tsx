import { Suspense } from "react";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import { getSession } from "@/lib/session";

export default async function LoginPage() {
  const session = await getSession();

  if (session?.user) {
    redirect(session.user.role === "AI_TECH_TEAM" ? "/dashboard" : "/champion");
  }

  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
