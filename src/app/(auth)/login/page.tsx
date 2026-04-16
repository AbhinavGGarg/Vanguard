'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSessionCookie } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    createSessionCookie();
    const nextPath =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('next')
        : null;
    router.replace(nextPath ?? '/dashboard');
  };

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-2xl border border-border bg-card/70 shadow-md backdrop-blur md:grid-cols-2">
        <div className="hidden border-r border-border p-10 md:flex md:flex-col md:justify-between">
          <div>
            <img src="/vanguard-logo.svg" alt="Vanguard" className="h-9 w-auto" />
            <h1 className="mt-8 text-3xl font-semibold leading-tight">
              Cloud-native threat modeling for modern security teams.
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Simulate attacks, measure impact, and validate defenses in one AI-native workspace.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">Trusted by security teams building resilient cloud systems.</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center p-6 md:p-10">
          <Card className="w-full max-w-md border-border bg-background/70">
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>Access your Vanguard workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button className="w-full" type="submit" disabled={loading || !email || !password}>
                  {loading ? 'Signing in...' : 'Login'}
                </Button>
              </form>
              <p className="mt-4 text-sm text-muted-foreground">
                Need an account?{' '}
                <Link className="text-primary hover:underline" href="/signup">
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
