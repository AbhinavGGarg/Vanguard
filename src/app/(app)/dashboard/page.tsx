'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, CalendarClock, PauseCircle, PlayCircle, Radar, RotateCcw, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useSimulation } from '@/context/simulation-context';
import { PageTransition } from '@/components/layout/page-transition';

const quickActions = [
  { href: '/attack', title: 'Generate Attack', icon: Sparkles, description: 'Create a new threat scenario.' },
  { href: '/sandbox', title: 'Open Sandbox', icon: ShieldCheck, description: 'Run and inspect generated scripts.' },
  { href: '/analysis', title: 'View Analysis', icon: ArrowUpRight, description: 'Review risk and defense recommendations.' },
  { href: '/security-events', title: 'Review Events', icon: ShieldAlert, description: 'Inspect event stream and severities.' },
] as const;

const simulatorPhases = [
  { label: 'Recon activity detected on external gateway', tone: 'text-blue-300' },
  { label: 'Credential probing attempts increasing', tone: 'text-amber-300' },
  { label: 'Suspicious role escalation observed', tone: 'text-orange-300' },
  { label: 'Containment controls applied by policy', tone: 'text-emerald-300' },
] as const;

export default function DashboardPage() {
  const { history, data, isLoading } = useSimulation();
  const [simRunning, setSimRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeline, setTimeline] = useState<
    Array<{ id: string; timestamp: string; message: string; tone: string }>
  >([]);

  const simulationsRun = history.length;
  const threatsDetected = history.reduce((sum, item) => sum + item.events.length, 0);
  const currentRisk = data?.analysis.riskScore ?? 0;
  const lastActivity = history[0]?.timestamp
    ? new Date(history[0].timestamp).toLocaleString()
    : 'No activity yet';

  useEffect(() => {
    if (!simRunning) return;

    const interval = window.setInterval(() => {
      setPhaseIndex((current) => {
        const next = Math.min(current + 1, simulatorPhases.length - 1);
        const phase = simulatorPhases[next];
        const timestamp = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        setTimeline((existing) =>
          [
            {
              id: `${Date.now()}-${next}`,
              timestamp,
              message: phase.label,
              tone: phase.tone,
            },
            ...existing,
          ].slice(0, 5)
        );

        if (next === simulatorPhases.length - 1) {
          setSimRunning(false);
        }

        return next;
      });
    }, 1400);

    return () => window.clearInterval(interval);
  }, [simRunning]);

  const simulatorProgress = Math.round(((phaseIndex + 1) / simulatorPhases.length) * 100);

  const startOrPauseSimulation = () => {
    if (phaseIndex === simulatorPhases.length - 1 && !simRunning) {
      setPhaseIndex(0);
      setTimeline([]);
    }
    setSimRunning((prev) => !prev);
  };

  const resetSimulation = () => {
    setSimRunning(false);
    setPhaseIndex(0);
    setTimeline([]);
  };

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

          <Card className="surface">
            <CardHeader>
              <CardTitle>Live Threat Simulator</CardTitle>
              <CardDescription>Run a fast incident simulation preview directly from dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border bg-background/70 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Simulation progress</span>
                  <Badge variant="outline">{simRunning ? 'Running' : 'Idle'}</Badge>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${simulatorProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{simulatorPhases[phaseIndex].label}</p>
              </div>

              <div className="space-y-2 rounded-xl border border-border bg-background/70 p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Radar className="h-4 w-4 text-primary" />
                  Threat Timeline
                </div>
                {timeline.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Run simulation to populate live threat timeline.</p>
                ) : (
                  timeline.map((item) => (
                    <div key={item.id} className="rounded-lg border border-border bg-background p-2">
                      <p className={`text-xs font-medium ${item.tone}`}>{item.message}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{item.timestamp}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={startOrPauseSimulation} size="sm" className="gap-2">
                  {simRunning ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                  {simRunning ? 'Pause' : 'Run Simulation'}
                </Button>
                <Button onClick={resetSimulation} size="sm" variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
