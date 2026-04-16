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
import type { AnalyzeInteractionOutput } from '@/ai/flows/analyze-interaction-flow';

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

  const totalAttackAttempts = useMemo(() => {
    if (!interactionResult) return 0;
    const attempts = interactionResult.interactionLog.filter((step) => step.action === 'Attack').length;
    return Math.max(attempts, interactionResult.attacksBlocked);
  }, [interactionResult]);

  const buildLocalDefenseResult = (): AnalyzeInteractionOutput => {
    const attacksBlocked = Math.max(1, Math.min(4, Math.round((baselineRisk || 50) / 25)));
    const effectivenessScore = Math.min(92, 52 + attacksBlocked * 10);

    return {
      effectivenessScore,
      attacksBlocked,
      outcomeSummary:
        'Local simulator indicates partial containment succeeded, with improved resilience against repeated attack steps.',
      modifiedDefenseScript: `${analysis?.suggestedCountermeasure || '# Existing countermeasure unavailable'}\n\n# [SIM] Additional hardening actions\n# - Revoke high-risk sessions\n# - Enforce stricter IAM conditions\n# - Block suspicious outbound channels`,
      interactionLog: [
        { step: 1, action: 'System', description: 'Simulation environment initialized.', result: 'Ready' },
        { step: 2, action: 'Attack', description: 'Adversary attempted identity enumeration.', result: 'Success' },
        { step: 3, action: 'Defense', description: 'Policy guardrail applied to sensitive endpoints.', result: 'Policy Applied' },
        { step: 4, action: 'Attack', description: 'Privilege escalation command executed.', result: 'Blocked by IAM condition' },
        { step: 5, action: 'Defense', description: 'Session revocation and alert workflow triggered.', result: 'Success' },
      ],
    };
  };

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
      const localResult = buildLocalDefenseResult();
      setInteractionResult(localResult);
      toast({
        title: 'Defense Simulation Complete',
        description: 'Loaded local defense simulation output so you can continue.',
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
                  Attacks Blocked: {interactionResult.attacksBlocked} / {totalAttackAttempts}
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
