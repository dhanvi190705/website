"use client";

import type { BusinessUnit, Role } from "@prisma/client";
import { Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import type { SafeUser } from "@/components/admin/AdminPanel";
import { cn } from "@/lib/utils";

export function UsersTab({
  users,
  businessUnits,
}: {
  users: SafeUser[];
  businessUnits: BusinessUnit[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("AI_CHAMPION");
  const [businessUnitId, setBusinessUnitId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        businessUnitId: businessUnitId || null,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(typeof body?.error === "string" ? body.error : "Failed to create user.");
      return;
    }

    setName("");
    setEmail("");
    setPassword("");
    setBusinessUnitId("");
    router.refresh();
  }

  async function toggleActive(userId: string, isActive: boolean) {
    setBusyId(userId);
    await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function reassignBu(userId: string, buId: string) {
    setBusyId(userId);
    await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessUnitId: buId || null }),
    });
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <form onSubmit={handleCreate} className="card space-y-3 p-5 lg:col-span-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
          <UserPlus className="h-4 w-4 text-gold-500" />
          Create User
        </h2>

        <div>
          <label className="label">Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="input-field" />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div>
          <label className="label">Temporary password</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="input-field"
          />
        </div>
        <div>
          <label className="label">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="input-field">
            <option value="AI_CHAMPION">AI Champion</option>
            <option value="AI_TECH_TEAM">AI Tech Team (Admin)</option>
          </select>
        </div>
        <div>
          <label className="label">Business unit {role === "AI_CHAMPION" && "(required)"}</label>
          <select
            value={businessUnitId}
            onChange={(e) => setBusinessUnitId(e.target.value)}
            required={role === "AI_CHAMPION"}
            className="input-field"
          >
            <option value="">— None —</option>
            {businessUnits.map((bu) => (
              <option key={bu.id} value={bu.id}>
                {bu.name}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-gold w-full">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create User
        </button>
      </form>

      <div className="card overflow-hidden p-5 lg:col-span-3">
        <h2 className="mb-4 text-sm font-semibold text-neutral-100">All Users ({users.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs font-medium uppercase text-neutral-500">
                <th className="border-b border-surface-border px-2 py-2">Name</th>
                <th className="border-b border-surface-border px-2 py-2">Role</th>
                <th className="border-b border-surface-border px-2 py-2">Business Unit</th>
                <th className="border-b border-surface-border px-2 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-surface-border/60">
                  <td className="px-2 py-2">
                    <p className="font-medium text-neutral-100">{u.name}</p>
                    <p className="text-xs text-neutral-600">{u.email}</p>
                  </td>
                  <td className="px-2 py-2 text-xs text-neutral-400">
                    {u.role === "AI_TECH_TEAM" ? "AI Tech Team" : "AI Champion"}
                  </td>
                  <td className="px-2 py-2">
                    <select
                      disabled={busyId === u.id}
                      value={u.businessUnitId ?? ""}
                      onChange={(e) => reassignBu(u.id, e.target.value)}
                      className="input-field w-auto text-xs"
                    >
                      <option value="">—</option>
                      {businessUnits.map((bu) => (
                        <option key={bu.id} value={bu.id}>
                          {bu.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <button
                      disabled={busyId === u.id}
                      onClick={() => toggleActive(u.id, u.isActive)}
                      className={cn(
                        "badge",
                        u.isActive
                          ? "border-emerald-800 bg-emerald-950/60 text-emerald-300"
                          : "border-red-900 bg-red-950/60 text-red-300"
                      )}
                    >
                      {u.isActive ? "Active" : "Disabled"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
