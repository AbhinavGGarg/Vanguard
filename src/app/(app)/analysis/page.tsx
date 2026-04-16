'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldAlert, ShieldCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useSimulation } from '@/context/simulation-context';
import { analyzeInteraction } from '@/ai/flows/analyze-interaction-flow';
import { useToast } from '@/hooks/use-toast';
import { PageTransition } from '@/components/layout/page-transition';

function riskTone(score: number) {
  if (score >= 70) return { label: 'High', className: 'bg-red-500/20 text-red-300' };
  if (score >= 40) return { label: 'Medium', className: 'bg-amber-500/20 text-amber-300' };
  return { label: 'Low', className: 'bg-green-500/20 text-green-300' };
}

export default function AnalysisPage() {
  const { toast } = useToast();
  const { data, script, interactionResult, setInteractionResult } = useSimulation();
  const [isTesting, setIsTesting] = useState(false);

  const analysis = data?.analysis;
  const tone = riskTone(analysis?.riskScore ?? 0);

  const baselineRisk = analysis?.riskScore ?? 0;
  const postDefenseRisk = useMemo(() => {
    if (!interactionResult) return baselineRisk;
    const improvement = Math.round((interactionResult.effectivenessScore / 100) * 30);
    return Math.max(0, baselineRisk - improvement);
  }, [interactionResult, baselineRisk]);

  const runDefenseSimulation = async () => {
    if (!analysis?.suggestedCountermeasure || !script) return;
    setIsTesting(true);
    try {
      const result = await analyzeInteraction({
        attackScript: script,
        defenseScript: analysis.suggestedCountermeasure,
      });
      setInteractionResult(result);
      toast({ title: 'Defense Simulation Complete', description: 'Comparison has been updated.' });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Simulation Failed',
        description: 'Could not run defense simulation right now.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (!data) {
    return (
      <PageTransition>
        <Card className="surface mx-auto max-w-2xl p-10 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No analysis available yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Run a simulation in Sandbox first, then return for AI defense analysis.
          </p>
          <Button asChild className="mt-6">
            <Link href="/sandbox" className="gap-2">
              Open Sandbox
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="surface">
          <CardHeader>
            <CardTitle>AI Countermeasure</CardTitle>
            <CardDescription>Prioritized mitigation guidance based on current scenario risk.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className={tone.className}>Risk Level: {tone.label}</Badge>
              <Badge variant="outline">Score: {analysis?.riskScore}/100</Badge>
            </div>

            <div className="rounded-xl border border-border bg-background/70 p-4">
              <p className="text-xs text-muted-foreground">Summary</p>
              <p className="mt-2 text-sm leading-relaxed">{analysis?.executiveSummary}</p>
            </div>

            <div className="rounded-xl border border-border bg-background/70 p-4">
              <p className="text-xs text-muted-foreground">Recommended Fixes</p>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                {(analysis?.recommendedActions ?? []).map((action, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-green-400" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-background/70 p-4">
              <p className="text-xs text-muted-foreground">Suggested Countermeasure Script</p>
              <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-[#090d16] p-3 font-mono text-xs text-muted-foreground">
                {analysis?.suggestedCountermeasure}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card className="surface">
          <CardHeader>
            <CardTitle>Defense Testing</CardTitle>
            <CardDescription>Measure mitigation effectiveness before and after defense simulation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
              <Button onClick={runDefenseSimulation} disabled={isTesting || !analysis?.suggestedCountermeasure}>
                {isTesting ? 'Simulating Defense...' : 'Simulate Defense'}
              </Button>
            </motion.div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-background/70 p-4">
                <p className="text-xs text-muted-foreground">Before</p>
                <p className="mt-1 text-2xl font-semibold text-amber-300">{baselineRisk}/100</p>
                <Progress value={baselineRisk} className="mt-3" />
              </div>

              <div className="rounded-xl border border-border bg-background/70 p-4">
                <p className="text-xs text-muted-foreground">After</p>
                <p className="mt-1 text-2xl font-semibold text-green-300">{postDefenseRisk}/100</p>
                <Progress value={postDefenseRisk} className="mt-3" />
              </div>
            </div>

            {interactionResult ? (
              <div className="rounded-xl border border-border bg-background/70 p-4">
                <p className="text-xs text-muted-foreground">Simulation Outcome</p>
                <p className="mt-1 text-sm">
                  Effectiveness: <span className="font-medium">{interactionResult.effectivenessScore}%</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Attacks Blocked: {interactionResult.attacksBlocked} / {interactionResult.totalAttackAttempts}
                </p>
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                Run defense simulation to generate before/after comparison.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
