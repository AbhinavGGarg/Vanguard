'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Cloud,
  Cpu,
  Crosshair,
  Radar,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Zap,
} from 'lucide-react';

import { useSimulation } from '@/context/simulation-context';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PageTransition } from '@/components/layout/page-transition';
import { cn } from '@/lib/utils';

type SeverityTone = {
  chip: string;
  ring: string;
  text: string;
  pulse: string;
};

const Ballpit = dynamic(() => import('@/components/reactbits/Ballpit'), { ssr: false });

type ThreatEventItem = {
  id: string;
  timestamp: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  status: 'Investigating' | 'Contained' | 'Resolved' | 'Action Required';
};

type AssetItem = {
  name: string;
  resourceId: string;
  provider: 'AWS' | 'GCP' | 'Azure';
  service: string;
  region: string;
  status: 'Compromised' | 'Vulnerable' | 'Investigating' | 'Protected';
  reasonForStatus: string;
};

const fallbackThreats: ThreatEventItem[] = [
  {
    id: 'EVT-FALLBACK-001',
    timestamp: 'Now',
    severity: 'Critical',
    description: 'Credential harvesting beacon identified in identity gateway segment.',
    status: 'Action Required',
  },
  {
    id: 'EVT-FALLBACK-002',
    timestamp: '2m ago',
    severity: 'High',
    description: 'Lateral movement attempt detected between container hosts.',
    status: 'Investigating',
  },
  {
    id: 'EVT-FALLBACK-003',
    timestamp: '5m ago',
    severity: 'Medium',
    description: 'Anomalous data egress pattern observed from object storage.',
    status: 'Contained',
  },
] as const;

const fallbackAssets: AssetItem[] = [
  {
    name: 'auth-gateway-prod',
    resourceId: 'res-auth-gateway-prod',
    provider: 'AWS',
    service: 'EKS Service',
    region: 'us-east-1',
    status: 'Compromised',
    reasonForStatus: 'Exposed token relay observed from compromised pod.',
  },
  {
    name: 'payments-ledger-bucket',
    resourceId: 'res-payments-ledger-bucket',
    provider: 'GCP',
    service: 'Cloud Storage',
    region: 'us-central1',
    status: 'Vulnerable',
    reasonForStatus: 'Public read path still enabled for temporary analytics.',
  },
  {
    name: 'identity-sync-worker',
    resourceId: 'res-identity-sync-worker',
    provider: 'Azure',
    service: 'Container App',
    region: 'eastus',
    status: 'Investigating',
    reasonForStatus: 'Unexpected privilege escalation script execution.',
  },
] as const;

function toneForSeverity(severity: string): SeverityTone {
  switch (severity) {
    case 'Critical':
    case 'Compromised':
      return {
        chip: 'border-red-400/35 bg-red-500/10',
        ring: 'shadow-[0_0_0_1px_rgba(248,113,113,0.24)]',
        text: 'text-red-300',
        pulse: 'bg-red-400',
      };
    case 'High':
    case 'Vulnerable':
      return {
        chip: 'border-amber-400/35 bg-amber-500/10',
        ring: 'shadow-[0_0_0_1px_rgba(251,191,36,0.2)]',
        text: 'text-amber-300',
        pulse: 'bg-amber-400',
      };
    case 'Medium':
    case 'Investigating':
      return {
        chip: 'border-blue-400/35 bg-blue-500/10',
        ring: 'shadow-[0_0_0_1px_rgba(96,165,250,0.2)]',
        text: 'text-blue-300',
        pulse: 'bg-blue-400',
      };
    default:
      return {
        chip: 'border-emerald-400/35 bg-emerald-500/10',
        ring: 'shadow-[0_0_0_1px_rgba(74,222,128,0.2)]',
        text: 'text-emerald-300',
        pulse: 'bg-emerald-400',
      };
  }
}

function ProviderPill({ provider }: { provider: string }) {
  const color =
    provider === 'AWS'
      ? 'bg-orange-500/15 text-orange-300 border-orange-400/20'
      : provider === 'GCP'
        ? 'bg-blue-500/15 text-blue-300 border-blue-400/20'
        : 'bg-cyan-500/15 text-cyan-300 border-cyan-400/20';

  return (
    <span className={cn('rounded-md border px-2 py-1 text-[11px] font-medium', color)}>
      {provider}
    </span>
  );
}

export function MissionControlDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { data, history, script, description, startSimulation, isLoading } = useSimulation();

  const activeSession = data ?? history[0] ?? null;
  const sourceEvents: ThreatEventItem[] = activeSession?.events?.length
    ? activeSession.events
    : fallbackThreats;
  const sourceAssets: AssetItem[] = activeSession?.affectedResources?.length
    ? activeSession.affectedResources
    : fallbackAssets;

  const missionRisk = activeSession?.analysis.riskScore ?? 68;
  const riskTone = toneForSeverity(
    missionRisk >= 80 ? 'Critical' : missionRisk >= 60 ? 'High' : missionRisk >= 35 ? 'Medium' : 'Low'
  );
  const activeIncidents = sourceEvents.filter((event) =>
    ['Critical', 'High'].includes(event.severity)
  ).length;
  const openAlerts = sourceEvents.filter((event) =>
    ['Investigating', 'Action Required'].includes(event.status)
  ).length;
  const blockedAttacks = activeSession?.metrics.blockedAttacks ?? 0;
  const totalEvents = activeSession?.metrics.totalEvents ?? sourceEvents.length;
  const detectionAccuracy = Number.parseFloat(
    String(activeSession?.metrics.detectionAccuracy ?? '92').replace('%', '')
  );
  const confidence = Number.isNaN(detectionAccuracy) ? 92 : detectionAccuracy;

  const providerCount = sourceAssets.reduce(
    (acc, resource) => {
      acc[resource.provider] = (acc[resource.provider] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const threatFeed = sourceEvents.slice(0, 7);
  const vulnerableAssets = sourceAssets.slice(0, 5);
  const recommendedActions = activeSession?.analysis.recommendedActions?.length
    ? activeSession.analysis.recommendedActions.slice(0, 4)
    : [
        'Rotate high-privilege IAM credentials and force key invalidation.',
        'Apply egress lockdown policy for compromised workloads immediately.',
        'Activate workload isolation on assets marked Compromised.',
        'Launch targeted scan on identity and object storage control planes.',
      ];

  const runCommandScenario = async () => {
    if (!script.trim()) {
      toast({
        variant: 'destructive',
        title: 'No Scenario Loaded',
        description: 'Generate an attack script first, then run full mission simulation.',
      });
      return;
    }

    await startSimulation(script, description || 'Mission control initiated scenario');
    router.push('/analysis');
  };

  return (
    <PageTransition className="space-y-5">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className={cn(
          'relative overflow-hidden rounded-[28px] border border-slate-700/70 bg-slate-950/85 p-6 shadow-[0_18px_55px_rgba(2,6,23,0.45)] md:p-7',
          riskTone.ring
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-blue-500/10 to-transparent" />
        <div className="pointer-events-none absolute -right-10 top-8 h-44 w-44 rounded-full bg-red-500/10 blur-3xl" />

        <div className="relative grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={cn('border text-[11px] uppercase tracking-[0.14em]', riskTone.chip, riskTone.text)}>
                Command Status
              </Badge>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className={cn('h-2 w-2 rounded-full animate-pulse', riskTone.pulse)} />
                Live telemetry
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-100 md:text-3xl">
                Mission Control: Cloud Defense Posture
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-300">
                Centralize active incidents, containment operations, and infrastructure risk in one tactical workflow.
                Prioritize the highlighted incident, dispatch response actions, and validate outcomes in real time.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Risk posture</p>
                <p className="mt-2 text-3xl font-semibold text-slate-100">{missionRisk}</p>
                <p className="mt-1 text-xs text-slate-400">Composite mission score</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Open incidents</p>
                <p className="mt-2 text-3xl font-semibold text-amber-300">{activeIncidents}</p>
                <p className="mt-1 text-xs text-slate-400">Critical and high severity</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Detection confidence</p>
                <p className="mt-2 text-3xl font-semibold text-emerald-300">{confidence.toFixed(1)}%</p>
                <p className="mt-1 text-xs text-slate-400">Current telemetry confidence</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button onClick={runCommandScenario} disabled={isLoading || !script.trim()} className="gap-2">
                  <Radar className="h-4 w-4" />
                  Run Containment Simulation
                </Button>
              </motion.div>
              <Button asChild variant="outline" className="gap-2 border-slate-700 bg-slate-900/70">
                <Link href="/attack">
                  Stage New Attack
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.12em] text-red-200/80">Incident spotlight</p>
                <ShieldAlert className="h-4 w-4 text-red-300" />
              </div>
              <p className="mt-2 text-sm font-medium text-slate-100">{threatFeed[0]?.description}</p>
              <p className="mt-2 text-xs text-red-200/80">
                Status: {threatFeed[0]?.status} • {threatFeed[0]?.timestamp}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Mission pulse</p>
                <TimerReset className="h-4 w-4 text-slate-300" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-100">{openAlerts}</p>
              <p className="text-xs text-slate-400">alerts requiring analyst action</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:col-span-2 xl:col-span-1">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Cloud footprint</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(providerCount).map(([provider, count]) => (
                  <div key={provider} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs">
                    <span className="text-slate-400">{provider}</span>
                    <span className="ml-2 font-medium text-slate-100">{count} assets</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-5 2xl:grid-cols-[1.45fr_1fr]">
        <div className="space-y-5">
          <motion.section
            whileHover={{ y: -1 }}
            transition={{ duration: 0.18 }}
            className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Primary command focus</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-100">Active Incident Command</h3>
              </div>
              <Badge className={cn('border text-xs', riskTone.chip, riskTone.text)}>
                {missionRisk >= 80 ? 'Critical posture' : missionRisk >= 60 ? 'Elevated posture' : 'Guarded posture'}
              </Badge>
            </div>
            <Separator className="my-4 bg-slate-800" />
            <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <p className="text-sm font-medium text-slate-100">Threat narrative</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {activeSession?.analysis.executiveSummary ||
                    'Adversary activity indicates identity compromise followed by attempted cloud data exfiltration and lateral movement across workload clusters.'}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-slate-700 bg-slate-900/70 text-slate-300">
                    {totalEvents} event signals
                  </Badge>
                  <Badge variant="outline" className="border-slate-700 bg-slate-900/70 text-slate-300">
                    {blockedAttacks} blocked actions
                  </Badge>
                  <Badge variant="outline" className="border-slate-700 bg-slate-900/70 text-slate-300">
                    Live workflow
                  </Badge>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <p className="text-sm font-medium text-slate-100">Containment queue</p>
                <ul className="mt-3 space-y-3">
                  {recommendedActions.slice(0, 3).map((action) => (
                    <li key={action} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-300" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.section>

          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <motion.section
              whileHover={{ y: -1 }}
              transition={{ duration: 0.18 }}
              className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-100">Threat Stream Timeline</h3>
                <Badge variant="outline" className="border-slate-700 bg-slate-900 text-slate-300">
                  Live feed
                </Badge>
              </div>
              <div className="mt-4 space-y-3">
                {threatFeed.map((event) => {
                  const tone = toneForSeverity(event.severity);
                  return (
                    <div key={event.id} className="flex gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                      <div className={cn('mt-1 h-2.5 w-2.5 shrink-0 rounded-full', tone.pulse)} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cn('text-xs font-medium', tone.text)}>{event.severity}</span>
                          <span className="text-[11px] text-slate-500">{event.timestamp}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-300">{event.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>

            <motion.section
              whileHover={{ y: -1 }}
              transition={{ duration: 0.18 }}
              className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-5"
            >
              <h3 className="text-base font-semibold text-slate-100">Response Dock</h3>
              <p className="mt-1 text-xs text-slate-400">Fast actions for containment, simulation, and review.</p>
              <div className="mt-4 space-y-2.5">
                {[
                  { href: '/attack', label: 'Craft Attack Scenario', icon: Sparkles, tone: 'text-blue-300' },
                  { href: '/sandbox', label: 'Open Threat Sandbox', icon: Crosshair, tone: 'text-cyan-300' },
                  { href: '/analysis', label: 'Review Defense Analysis', icon: ShieldCheck, tone: 'text-emerald-300' },
                  { href: '/security-events', label: 'Investigate Event Log', icon: AlertTriangle, tone: 'text-amber-300' },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm transition-colors hover:border-slate-500 hover:bg-slate-800/80"
                    >
                      <span className="flex items-center gap-2 text-slate-200">
                        <Icon className={cn('h-4 w-4', action.tone)} />
                        {action.label}
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-500" />
                    </Link>
                  );
                })}
              </div>
            </motion.section>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <motion.section
              whileHover={{ y: -1 }}
              transition={{ duration: 0.18 }}
              className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-5"
            >
              <h3 className="text-base font-semibold text-slate-100">Vulnerable Asset Intelligence</h3>
              <div className="mt-4 space-y-3">
                {vulnerableAssets.map((asset) => {
                  const tone = toneForSeverity(asset.status);
                  return (
                    <div key={asset.resourceId ?? asset.name} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-100">{asset.name}</p>
                        <Badge className={cn('border text-xs', tone.chip, tone.text)}>{asset.status}</Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <ProviderPill provider={asset.provider} />
                        <span className="text-xs text-slate-400">
                          {asset.service} • {asset.region}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-300">{asset.reasonForStatus}</p>
                    </div>
                  );
                })}
              </div>
            </motion.section>

            <motion.section
              whileHover={{ y: -1 }}
              transition={{ duration: 0.18 }}
              className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-100">Threat Field Simulation</h3>
                <Cloud className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <div
                  className="relative w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950"
                  style={{ minHeight: '260px', maxHeight: '260px' }}
                >
                  <Ballpit
                    className="opacity-85"
                    count={170}
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
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950/60" />
                  <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-slate-600 bg-slate-900/75 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-slate-300">
                    Live particle threat model
                  </div>
                  <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-2">
                    <span className="rounded-md border border-orange-400/30 bg-orange-500/15 px-2 py-1 text-[10px] text-orange-200">
                      AWS {providerCount.AWS ?? 0}
                    </span>
                    <span className="rounded-md border border-blue-400/30 bg-blue-500/15 px-2 py-1 text-[10px] text-blue-200">
                      GCP {providerCount.GCP ?? 0}
                    </span>
                    <span className="rounded-md border border-cyan-400/30 bg-cyan-500/15 px-2 py-1 text-[10px] text-cyan-200">
                      Azure {providerCount.Azure ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        </div>

        <div className="space-y-5">
          <motion.section
            whileHover={{ y: -1 }}
            transition={{ duration: 0.18 }}
            className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-5"
          >
            <h3 className="text-base font-semibold text-slate-100">Risk Distribution</h3>
            <div className="mt-4 space-y-3">
              {[
                { label: 'Critical', value: sourceEvents.filter((item) => item.severity === 'Critical').length, color: 'bg-red-400' },
                { label: 'High', value: sourceEvents.filter((item) => item.severity === 'High').length, color: 'bg-amber-400' },
                { label: 'Medium', value: sourceEvents.filter((item) => item.severity === 'Medium').length, color: 'bg-blue-400' },
                { label: 'Low', value: sourceEvents.filter((item) => item.severity === 'Low').length, color: 'bg-emerald-400' },
              ].map((bucket) => {
                const percent = Math.max(6, Math.round((bucket.value / Math.max(1, sourceEvents.length)) * 100));
                return (
                  <div key={bucket.label}>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                      <span>{bucket.label}</span>
                      <span>{bucket.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800">
                      <div className={cn('h-2 rounded-full', bucket.color)} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>

          <motion.section
            whileHover={{ y: -1 }}
            transition={{ duration: 0.18 }}
            className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-100">Telemetry & Scan State</h3>
              <Zap className="h-4 w-4 text-amber-300" />
            </div>
            <div className="mt-4 space-y-3">
              {[
                { label: 'Endpoint sweep', value: Math.min(100, confidence + 2), color: 'bg-emerald-400' },
                { label: 'Cloud control-plane scan', value: Math.min(100, Math.max(30, confidence - 9)), color: 'bg-blue-400' },
                { label: 'Containment automation', value: Math.min(100, missionRisk > 75 ? 61 : 78), color: 'bg-amber-400' },
              ].map((scan) => (
                <div key={scan.label}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                    <span>{scan.label}</span>
                    <span>{scan.value.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div className={cn('h-2 rounded-full', scan.color)} style={{ width: `${scan.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            whileHover={{ y: -1 }}
            transition={{ duration: 0.18 }}
            className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-100">AI Analyst Briefing</h3>
              <Bot className="h-4 w-4 text-blue-300" />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {activeSession?.analysis.technicalBreakdown ||
                'Current threat chain suggests credential abuse with sustained persistence attempts. Immediate focus: identity hardening, egress policy lock, and workload isolation.'}
            </p>
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Recommended next move</p>
              <p className="mt-1 text-sm text-slate-200">{recommendedActions[0]}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm" className="gap-2">
                <Link href="/analysis">
                  Open Defense Plan
                  <ShieldCheck className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="gap-2 border-slate-700 bg-slate-900">
                <Link href="/sandbox">
                  Validate in Sandbox
                  <Cpu className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </motion.section>
        </div>
      </section>
    </PageTransition>
  );
}
