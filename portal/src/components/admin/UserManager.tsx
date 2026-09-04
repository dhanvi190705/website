'use client';

import { useState } from 'react';
import { Building2, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'CHAMPION' | 'TECH_TEAM';
  active: boolean;
  businessUnitName: string | null;
  lastLoginAt: string | null;
};

export type AdminUnit = { id: string; name: string };

const BLANK = {
  name: '',
  email: '',
  password: '',
  role: 'CHAMPION' as 'CHAMPION' | 'TECH_TEAM',
  businessUnitId: '',
};

/**
 * Account provisioning — the stand-in for Internal IAM. An administrator
 * creates the account, sets the role, and maps champions to a business unit.
 */
export function UserManager({
  initialUsers,
  initialUnits,
  currentUserId,
}: {
  initialUsers: AdminUser[];
  initialUnits: AdminUnit[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [units, setUnits] = useState(initialUnits);

  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const [unitName, setUnitName] = useState('');
  const [unitError, setUnitError] = useState('');
  const [unitBusy, setUnitBusy] = useState(false);

  const createUnit = async (event: React.FormEvent) => {
    event.preventDefault();
    setUnitError('');
    setUnitBusy(true);
    try {
      const res = await fetch('/api/admin/business-units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: unitName.trim() }),
      });
      const data = (await res.json()) as { error?: string; businessUnit?: AdminUnit };
      if (!res.ok || !data.businessUnit) {
        setUnitError(data.error ?? 'Could not create the business unit.');
        return;
      }
      setUnits((prev) => [...prev, data.businessUnit!].sort((a, b) => a.name.localeCompare(b.name)));
      setUnitName('');
    } catch {
      setUnitError('Could not reach the server.');
    } finally {
      setUnitBusy(false);
    }
  };

  const createUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          businessUnitId: form.businessUnitId || null,
        }),
      });
      const data = (await res.json()) as { error?: string; user?: AdminUser };
      if (!res.ok || !data.user) {
        setError(data.error ?? 'Could not create the account.');
        return;
      }
      setUsers((prev) => [{ ...data.user!, lastLoginAt: null }, ...prev]);
      setNotice(
        `Account created for ${data.user.email}. Share the password with them over a secure channel — it is not recoverable from here.`,
      );
      setForm(BLANK);
    } catch {
      setError('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (user: AdminUser) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, active: !user.active }),
    });
    const data = (await res.json()) as { error?: string; user?: AdminUser };
    if (!res.ok || !data.user) {
      setError(data.error ?? 'Could not update the account.');
      return;
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, active: data.user!.active } : u)),
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        {/* Business units first — a champion cannot exist without one. */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              eyebrow="Step 1"
              title="Business units"
              description="Champions are mapped to a unit. Create these before creating champion accounts."
            />
            <form onSubmit={createUnit} className="space-y-4 p-6">
              <div>
                <label htmlFor="unit-name" className="label">
                  Unit name
                </label>
                <input
                  id="unit-name"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  className="field"
                  placeholder="e.g. Marketing"
                  required
                />
              </div>
              {unitError && <Alert tone="error">{unitError}</Alert>}
              <Button type="submit" variant="outline" icon={Building2} loading={unitBusy}>
                Add unit
              </Button>
            </form>

            <div className="border-t border-line/60 p-6">
              {units.length === 0 ? (
                <p className="text-[13px] text-ink-faint">No business units yet.</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {units.map((unit) => (
                    <li key={unit.id}>
                      <Badge tone="neutral">{unit.name}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              eyebrow="Step 2"
              title="Create an account"
              description="Sets the role and, for champions, the business unit they are mapped to."
            />
            <form onSubmit={createUser} className="space-y-4 p-6">
              <div>
                <label htmlFor="user-name" className="label">
                  Full name
                </label>
                <input
                  id="user-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="field"
                  required
                />
              </div>

              <div>
                <label htmlFor="user-email" className="label">
                  Work email
                </label>
                <input
                  id="user-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="field"
                  required
                />
              </div>

              <div>
                <label htmlFor="user-role" className="label">
                  Role
                </label>
                <select
                  id="user-role"
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value as 'CHAMPION' | 'TECH_TEAM' })
                  }
                  className="field cursor-pointer"
                >
                  <option value="CHAMPION">AI Champion</option>
                  <option value="TECH_TEAM">AI / Tech Team</option>
                </select>
              </div>

              {form.role === 'CHAMPION' && (
                <div>
                  <label htmlFor="user-unit" className="label">
                    Business unit
                  </label>
                  <select
                    id="user-unit"
                    value={form.businessUnitId}
                    onChange={(e) => setForm({ ...form, businessUnitId: e.target.value })}
                    className="field cursor-pointer"
                    required
                  >
                    <option value="">Select a unit…</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="user-password" className="label">
                  Initial password
                </label>
                <input
                  id="user-password"
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="field font-mono"
                  placeholder="At least 10 characters, with a number"
                  required
                />
              </div>

              {error && <Alert tone="error">{error}</Alert>}
              {notice && <Alert tone="success">{notice}</Alert>}

              <Button type="submit" icon={UserPlus} loading={busy}>
                Create account
              </Button>
            </form>
          </Card>
        </div>

        {/* Roster */}
        <Card>
          <CardHeader
            eyebrow="Accounts"
            title="Who has access"
            description="Deactivating an account takes effect on their next request, not their next login."
            action={<Badge tone="neutral">{users.length} accounts</Badge>}
          />

          {users.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No accounts yet"
              description="Create the first champion account using the form on the left."
            />
          ) : (
            <ul className="divide-y divide-line/50">
              {users.map((user) => (
                <li key={user.id} className="flex flex-wrap items-center gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-[13.5px] text-ink">
                      {user.name}
                      {user.role === 'TECH_TEAM' && (
                        <ShieldCheck size={13} strokeWidth={2} aria-hidden className="text-accent" />
                      )}
                    </p>
                    <p className="mt-1 truncate font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-faint">
                      {user.email} · {user.role === 'TECH_TEAM' ? 'AI / Tech Team' : (user.businessUnitName ?? 'No unit')}
                    </p>
                  </div>

                  <Badge tone={user.active ? 'ok' : 'risk'}>
                    {user.active ? 'Active' : 'Disabled'}
                  </Badge>

                  {user.id !== currentUserId && (
                    <Button
                      size="sm"
                      variant={user.active ? 'ghost' : 'outline'}
                      onClick={() => void toggleActive(user)}
                    >
                      {user.active ? 'Disable' : 'Enable'}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
