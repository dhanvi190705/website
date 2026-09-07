import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { requireSession } from "@/lib/session";

export default async function AccountPage() {
  const session = await requireSession();

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-12 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-50">Account</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Signed in as {session.user.name} ({session.user.email})
        </p>
      </div>

      <ChangePasswordForm />
    </div>
  );
}
