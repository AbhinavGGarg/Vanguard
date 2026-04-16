'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Copy, Play, TerminalSquare } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useSimulation } from '@/context/simulation-context';
import { useToast } from '@/hooks/use-toast';
import { PageTransition } from '@/components/layout/page-transition';

export default function SandboxPage() {
  const { toast } = useToast();
  const { script, setScript, description, startSimulation, data, isLoading } = useSimulation();
  const [activeTab, setActiveTab] = useState('logs');

  const runSimulation = async () => {
    await startSimulation(script, description || 'Sandbox execution');
    setActiveTab('impact');
  };

  const copyScript = async () => {
    await navigator.clipboard.writeText(script);
    toast({ title: 'Copied', description: 'Script copied to clipboard.' });
  };

  if (!script) {
    return (
      <PageTransition>
        <Card className="surface mx-auto max-w-2xl p-10 text-center">
          <TerminalSquare className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No script loaded in sandbox</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Generate an attack scenario first, then come back to run and inspect execution.
          </p>
          <Button asChild className="mt-6">
            <Link href="/attack" className="gap-2">
              Go to Attack Generator
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Card className="surface">
          <CardHeader>
            <CardTitle>Generated Script</CardTitle>
            <CardDescription>Review and execute in sandbox environment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="min-h-[360px] resize-none border-border bg-[#090d16] font-mono text-xs leading-relaxed"
            />
            <div className="flex flex-wrap gap-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button onClick={runSimulation} disabled={!script || isLoading} className="gap-2">
                  <Play className="h-4 w-4" />
                  {isLoading ? 'Running...' : 'Run Simulation'}
                </Button>
              </motion.div>
              <Button variant="secondary" onClick={copyScript} className="gap-2">
                <Copy className="h-4 w-4" />
                Copy Script
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="surface">
          <CardHeader>
            <CardTitle>Execution Results</CardTitle>
            <CardDescription>Inspect logs, impact and attack path.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="logs">Logs</TabsTrigger>
                <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
                <TabsTrigger value="path">Attack Path</TabsTrigger>
              </TabsList>

              <TabsContent value="logs" className="mt-4 space-y-2">
                {data?.events?.length ? (
                  data.events.slice(0, 8).map((event) => (
                    <div key={event.id} className="rounded-lg border border-border bg-background/60 p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <Badge variant="outline">{event.severity}</Badge>
                        <span className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    Run simulation to populate live execution logs.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="impact" className="mt-4 space-y-3">
                {data ? (
                  <>
                    <div className="rounded-lg border border-border bg-background/60 p-3">
                      <p className="text-xs text-muted-foreground">Executive Summary</p>
                      <p className="mt-1 text-sm text-foreground">{data.analysis.executiveSummary}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-border bg-background/60 p-3">
                        <p className="text-xs text-muted-foreground">Risk Score</p>
                        <p className="mt-1 text-xl font-semibold text-amber-400">{data.analysis.riskScore}/100</p>
                      </div>
                      <div className="rounded-lg border border-border bg-background/60 p-3">
                        <p className="text-xs text-muted-foreground">Affected Resources</p>
                        <p className="mt-1 text-xl font-semibold">{data.affectedResources.length}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    No impact report yet.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="path" className="mt-4">
                {data?.topProcesses?.length ? (
                  <div className="space-y-2">
                    {data.topProcesses.map((process, index) => (
                      <div key={`${process.name}-${index}`} className="rounded-lg border border-border bg-background/60 p-3">
                        <p className="text-sm font-medium">{index + 1}. {process.name}</p>
                        <p className="text-xs text-muted-foreground">{process.events} related events</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    Attack path visualization appears after execution.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
