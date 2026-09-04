'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';

/**
 * First-run screen. The portal ships with no data, so the very first action is
 * creating the AI/Tech Team administrator who will provision everyone else.
 */
export function SetupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { error?: string; redirectTo?: string };

      if (!res.ok) {
        setError(data.error ?? 'Could not complete setup.');
        setBusy(false);
        return;
      }

      router.replace(data.redirectTo ?? '/dashboard');
      router.refresh();
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-[440px] animate-fade-up">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-5 grid h-11 w-11 place-items-center rounded-xl border border-accent/35 bg-surface text-accent">
            <ShieldCheck size={19} strokeWidth={1.6} aria-hidden />
          </span>
          <h1 className="text-2xl font-medium tracking-tight text-ink">First-run setup</h1>
          <p className="mt-2.5 text-[13px] leading-relaxed text-ink-muted">
            The portal is empty. Create the first AI / Tech Team administrator — this screen
            disables itself immediately afterwards.
          </p>
        </div>

        <form onSubmit={submit} className="card space-y-5 p-7">
          <div>
            <label htmlFor="name" className="label">
              Full name
            </label>
            <input id="name" required value={form.name} onChange={set('name')} className="field" />
          </div>

          <div>
            <label htmlFor="email" className="label">
              Work email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={form.email}
              onChange={set('email')}
              className="field"
              placeholder="name@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={form.password}
              onChange={set('password')}
              className="field"
              placeholder="At least 10 characters"
            />
            <p className="mt-2 text-[11.5px] text-ink-faint">
              Minimum 10 characters, including a letter and a number.
            </p>
          </div>

          {error && <Alert tone="error">{error}</Alert>}

          <Button type="submit" icon={ShieldCheck} loading={busy} className="w-full">
            Create administrator
          </Button>
        </form>
      </div>
    </main>
  );
}
