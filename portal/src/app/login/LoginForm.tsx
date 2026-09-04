'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string; redirectTo?: string };

      if (!res.ok) {
        setError(data.error ?? 'Could not sign you in.');
        setBusy(false);
        return;
      }

      router.replace(data.redirectTo ?? '/');
      router.refresh();
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-[400px] animate-fade-up">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-5 grid h-11 w-11 place-items-center rounded-xl border border-accent/35 bg-surface">
            <span className="h-2.5 w-2.5 rounded-full bg-accent-gradient" />
          </span>
          <h1 className="text-2xl font-medium tracking-tight text-ink">
            AI<span className="accent-text">.Next</span> Portal
          </h1>
          <p className="mt-2.5 text-[13px] text-ink-muted">
            Sign in with the credentials issued by the AI / Tech Team.
          </p>
        </div>

        <form onSubmit={submit} className="card space-y-5 p-7">
          <div>
            <label htmlFor="email" className="label">
              Work email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
              placeholder="••••••••••"
            />
          </div>

          {error && <Alert tone="error">{error}</Alert>}

          <Button type="submit" icon={LogIn} loading={busy} className="w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-[11.5px] leading-relaxed text-ink-faint">
          Accounts are provisioned centrally. Contact the AI / Tech Team if you cannot sign in.
        </p>
      </div>
    </main>
  );
}
