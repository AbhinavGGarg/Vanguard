'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowUpRight, CalendarClock, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useSimulation } from '@/context/simulation-context';
import { PageTransition } from '@/components/layout/page-transition';

const Ballpit = dynamic(() => import('@/components/reactbits/Ballpit'), { ssr: false });

const quickActions = [
  { href: '/attack', title: 'Generate Attack', icon: Sparkles, description: 'Create a new threat scenario.' },
  { href: '/sandbox', title: 'Open Sandbox', icon: ShieldCheck, description: 'Run and inspect generated scripts.' },
  { href: '/analysis', title: 'View Analysis', icon: ArrowUpRight, description: 'Review risk and defense recommendations.' },
  { href: '/security-events', title: 'Review Events', icon: ShieldAlert, description: 'Inspect event stream and severities.' },
] as const;

export default function DashboardPage() {
  const { history, data, isLoading } = useSimulation();

  const simulationsRun = history.length;
  const threatsDetected = history.reduce((sum, item) => sum + item.events.length, 0);
  const currentRisk = data?.analysis.riskScore ?? 0;
  const lastActivity = history[0]?.timestamp
    ? new Date(history[0].timestamp).toLocaleString()
    : 'No activity yet';

  return (
    <PageTransition className="overflow-x-hidden">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">Welcome back</h2>
        <p className="text-sm text-muted-foreground">
          Run through the Vanguard workflow: create an attack, execute simulation, then apply defense.
        </p>
      </div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.06 } },
        }}
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        {[
          { label: 'Simulations Run', value: simulationsRun.toString(), tone: 'text-foreground' },
          { label: 'Threats Detected', value: threatsDetected.toString(), tone: 'text-red-400' },
          { label: 'Current Risk Score', value: `${currentRisk}/100`, tone: 'text-amber-400' },
          { label: 'Last Activity', value: lastActivity, tone: 'text-muted-foreground' },
        ].map((metric) => (
          <motion.div key={metric.label} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
            <Card className="surface p-6">
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              {isLoading ? (
                <Skeleton className="mt-2 h-8 w-28" />
              ) : (
                <p className={`mt-2 text-2xl font-semibold ${metric.tone}`}>{metric.value}</p>
              )}
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="surface min-w-0 xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest simulations and outcomes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <CalendarClock className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">No simulation history yet. Start with Attack Generator.</p>
                <Button asChild className="mt-4">
                  <Link href="/attack">Create First Attack</Link>
                </Button>
              </div>
            ) : (
              history.slice(0, 5).map((entry) => (
                <motion.div
                  key={entry.id}
                  whileHover={{ y: -2 }}
                  className="rounded-xl border border-border bg-background/70 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{entry.name || 'Untitled Scenario'}</p>
                      <p className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>
                    </div>
                    <Badge variant="outline">Risk {entry.analysis.riskScore}</Badge>
                  </div>
                  <Separator className="my-3" />
                  <p className="line-clamp-2 text-sm text-muted-foreground">{entry.analysis.executiveSummary}</p>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="min-w-0 space-y-4">
          <Card className="surface">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Move through the workflow with one click.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <motion.div key={action.href} whileHover={{ y: -2 }}>
                    <Link
                      href={action.href}
                      className="block rounded-xl border border-border bg-background/70 p-4 transition-colors hover:bg-background"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-primary" />
                          <p className="text-sm font-medium">{action.title}</p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{action.description}</p>
                    </Link>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="surface overflow-hidden">
            <CardHeader>
              <CardTitle>Threat Field</CardTitle>
              <CardDescription>Live ballpit telemetry reacting to cursor motion.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="relative isolate h-44 w-full max-w-full overflow-hidden rounded-xl border border-border bg-slate-950">
                <div className="absolute inset-0">
                  <Ballpit
                    className="h-full w-full opacity-85"
                    count={120}
                    gravity={0.7}
                    friction={0.8}
                    wallBounce={0.95}
                    followCursor
                    colors={[0x3b82f6, 0x8b5cf6, 0xef4444]}
                    ambientIntensity={0.8}
                    lightIntensity={170}
                    minSize={0.45}
                    maxSize={0.95}
                    maxVelocity={0.16}
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/25 via-transparent to-slate-950/65" />
                <div className="pointer-events-none absolute bottom-2 left-2 rounded-lg border border-red-500/30 bg-red-500/15 px-2 py-1 text-[10px] text-red-200">
                  {threatsDetected} threats
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
