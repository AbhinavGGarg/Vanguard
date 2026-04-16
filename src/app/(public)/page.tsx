'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Cloud,
  Radar,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const featureCards = [
  {
    title: 'Attack Simulation',
    description: 'Generate realistic cloud-native attack scenarios with AI-guided precision.',
    icon: Sparkles,
  },
  {
    title: 'Threat Sandbox',
    description: 'Execute and inspect scenario behavior in a controlled environment.',
    icon: Radar,
  },
  {
    title: 'AI Countermeasures',
    description: 'Receive prioritized mitigation guidance and defense scripts instantly.',
    icon: ShieldCheck,
  },
  {
    title: 'Multi-Cloud Coverage',
    description: 'Analyze workloads and risks across AWS, GCP, and Azure from one view.',
    icon: Cloud,
  },
] as const;

const steps = [
  { title: 'Create Attack', icon: Sparkles, text: 'Describe a cloud threat scenario in plain language.' },
  { title: 'Generate Script', icon: Workflow, text: 'Vanguard transforms intent into executable simulation logic.' },
  { title: 'Run Simulation', icon: Zap, text: 'Launch in sandbox and monitor behavior in real time.' },
  { title: 'Analyze Impact', icon: Radar, text: 'Review affected services, event trails, and risk posture.' },
  { title: 'Apply Defense', icon: ShieldCheck, text: 'Test AI-generated mitigations and compare before/after outcomes.' },
] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22 } },
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 subtle-grid opacity-30" />
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-24 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col px-6 pb-20 pt-8 md:px-8 lg:px-10">
        <header className="mb-14 flex items-center justify-between">
          <img src="/vanguard-logo.svg" alt="Vanguard" className="h-9 w-auto" />
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </header>

        <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            <motion.div variants={item}>
              <Badge className="bg-primary/20 text-primary hover:bg-primary/20">AI-native Security Platform</Badge>
            </motion.div>
            <motion.h1 variants={item} className="text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              AI-Powered Cloud Threat Modeling
            </motion.h1>
            <motion.p variants={item} className="max-w-xl text-base text-muted-foreground md:text-lg">
              Vanguard helps security teams simulate, analyze, and defend against cloud-native attacks with an end-to-end workflow from attack creation to mitigation validation.
            </motion.p>
            <motion.div variants={item} className="flex flex-wrap items-center gap-3">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button asChild size="lg" className="gap-2">
                  <Link href="/signup">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button asChild variant="outline" size="lg">
                  <Link href="/login">View Demo</Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Card className="surface overflow-hidden rounded-2xl border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Operational Security Overview</CardTitle>
                <p className="text-sm text-muted-foreground">Live simulation preview</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Card className="rounded-xl border-border bg-background/80 p-3">
                    <p className="text-xs text-muted-foreground">Active Simulations</p>
                    <p className="mt-1 text-2xl font-semibold">14</p>
                  </Card>
                  <Card className="rounded-xl border-border bg-background/80 p-3">
                    <p className="text-xs text-muted-foreground">Threats Detected</p>
                    <p className="mt-1 text-2xl font-semibold text-red-400">38</p>
                  </Card>
                </div>
                <div className="rounded-xl border border-border bg-background/80 p-4">
                  <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Risk Trend</span>
                    <span>Last 24h</span>
                  </div>
                  <div className="h-24 rounded-lg bg-gradient-to-r from-primary/20 via-secondary/20 to-transparent" />
                </div>
                <div className="space-y-2 rounded-xl border border-border bg-background/80 p-3">
                  {[
                    'IAM anomaly detected in us-east-1',
                    'Exfiltration path flagged in S3 policy chain',
                    'Countermeasure simulation reduced risk by 42%',
                  ].map((entry) => (
                    <div key={entry} className="flex items-center justify-between rounded-lg bg-card px-3 py-2 text-sm">
                      <span className="text-muted-foreground">{entry}</span>
                      <Badge variant="outline">Live</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section className="mt-24">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Core Capabilities</h2>
            <p className="text-sm text-muted-foreground">Everything needed to move from simulated attack to validated defense.</p>
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={item} whileHover={{ y: -3 }}>
                  <Card className="surface h-full p-6">
                    <div className="mb-4 inline-flex rounded-lg bg-primary/20 p-2 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        <section className="mt-24">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold">How Vanguard Works</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-5">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={step.title} className="surface p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Step {index + 1}</span>
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold">{step.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground">{step.text}</p>
                  {index < steps.length - 1 && <Separator className="mt-4" />}
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mt-24">
          <Card className="surface overflow-hidden p-8 text-center md:p-12">
            <p className="text-sm text-primary">Built for modern security teams</p>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Start securing your cloud attack surface today</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
              Move from reactive triage to proactive defense with AI-guided simulations and mitigation intelligence.
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="mt-6 inline-block">
              <Button asChild size="lg" className="px-8">
                <Link href="/signup">Create Free Account</Link>
              </Button>
            </motion.div>
          </Card>
        </section>
      </div>
    </div>
  );
}
