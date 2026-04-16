'use client';

import { motion } from 'framer-motion';
import { Cloud, Server, Shield, Timer } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PageTransition } from '@/components/layout/page-transition';
import { useSimulation } from '@/context/simulation-context';

const providers = [
  { name: 'AWS', status: 'Healthy', coverage: '83 assets', lastScan: '3m ago' },
  { name: 'GCP', status: 'Warning', coverage: '47 assets', lastScan: '6m ago' },
  { name: 'Azure', status: 'Healthy', coverage: '59 assets', lastScan: '4m ago' },
];

function statusBadge(status: string) {
  if (status === 'Warning') return 'bg-amber-500/20 text-amber-300';
  if (status === 'Critical') return 'bg-red-500/20 text-red-300';
  return 'bg-green-500/20 text-green-300';
}

export default function CloudServicesPage() {
  const { data } = useSimulation();

  return (
    <PageTransition>
      <div className="grid gap-4 lg:grid-cols-3">
        {providers.map((provider) => (
          <motion.div key={provider.name} whileHover={{ y: -3 }}>
            <Card className="surface h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Cloud className="h-5 w-5 text-primary" />
                  {provider.name}
                </CardTitle>
                <CardDescription>Environment status and scan coverage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge className={statusBadge(provider.status)}>{provider.status}</Badge>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Server className="h-4 w-4" /> {provider.coverage}
                  </p>
                  <p className="flex items-center gap-2">
                    <Timer className="h-4 w-4" /> Last scan {provider.lastScan}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="surface">
        <CardHeader>
          <CardTitle>Connected Asset Summary</CardTitle>
          <CardDescription>Service-level visibility and runtime security posture.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(data?.affectedResources ?? []).length ? (
            data!.affectedResources.map((resource) => (
              <div key={resource.name} className="rounded-xl border border-border bg-background/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{resource.name}</p>
                    <p className="text-sm text-muted-foreground">{resource.type}</p>
                  </div>
                  <Badge variant="outline" className={statusBadge(resource.status === 'Compromised' ? 'Critical' : 'Healthy')}>
                    {resource.status}
                  </Badge>
                </div>
                <Separator className="my-3" />
                <p className="text-sm text-muted-foreground">{resource.reason}</p>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
              Run a simulation to populate cloud resource impact and service status details.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="surface">
        <CardHeader>
          <CardTitle>Coverage Controls</CardTitle>
          <CardDescription>Recommended next actions to maintain cloud visibility.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {[
            'Enable IAM drift monitoring across all accounts',
            'Enforce workload identity and remove static credentials',
            'Schedule 15-minute posture scans for critical services',
          ].map((item) => (
            <div key={item} className="rounded-xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
              <Shield className="mb-2 h-4 w-4 text-primary" />
              {item}
            </div>
          ))}
        </CardContent>
      </Card>
    </PageTransition>
  );
}
