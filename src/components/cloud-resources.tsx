
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSimulation } from '@/context/simulation-context';
import { Server, Cloud, Shield, Database, HelpCircle } from 'lucide-react';
import type { CloudResource } from "@/ai/flows/types/simulate-attack-types";

const getProviderIcon = (provider: CloudResource['provider']) => {
    switch (provider) {
        case 'AWS':
            return <Cloud className="h-5 w-5 text-orange-400" />;
        case 'Azure':
            return <Cloud className="h-5 w-5 text-blue-500" />;
        case 'GCP':
            return <Cloud className="h-5 w-5 text-green-500" />;
        default:
            return <Cloud className="h-5 w-5" />;
    }
}

const getServiceIcon = (service: string) => {
    const s = service.toLowerCase();
    if (s.includes('instance') || s.includes('vm')) return <Server className="h-4 w-4" />;
    if (s.includes('storage') || s.includes('bucket')) return <Database className="h-4 w-4" />;
    if (s.includes('function')) return <Server className="h-4 w-4" />;
    return <HelpCircle className="h-4 w-4" />;
}

const getStatusVariant = (status: CloudResource['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'Compromised':
      return 'destructive';
    case 'Vulnerable':
      return 'secondary';
     case 'Investigating':
      return 'outline';
    default:
      return 'default';
  }
};


export function CloudResources() {
    const { data } = useSimulation();

    if (!data || !data.affectedResources || data.affectedResources.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold">No Affected Resources</h2>
                <p className="text-muted-foreground mt-2">Run a scenario in the Threat Sandbox to see which resources are impacted.</p>
            </div>
        );
    }
    
    return (
        <main className="flex-1 p-4 md:p-6">
            <header className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Affected Cloud Resources</h1>
                <p className="text-muted-foreground">
                    A list of cloud assets impacted by the simulated attack scenario.
                </p>
            </header>
            <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {data.affectedResources.map((resource) => (
                    <Card key={resource.resourceId}>
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-start gap-3 text-xl leading-snug">
                                {getProviderIcon(resource.provider)}
                                <span className="break-words">{resource.name}</span>
                            </CardTitle>
                             <CardDescription className="flex items-center gap-2 pt-1">
                                {getServiceIcon(resource.service)}
                                {resource.service} in {resource.region}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <div className="text-sm space-y-1">
                                <p className="font-medium">Resource ID:</p>
                                <p className="font-code text-xs text-muted-foreground break-all">{resource.resourceId}</p>
                            </div>
                            <div className="text-sm space-y-1">
                                <p className="font-medium">Status:</p>
                                <Badge variant={getStatusVariant(resource.status)}>{resource.status}</Badge>
                            </div>
                            <div className="text-sm space-y-1">
                                <p className="font-medium">Reason:</p>
                                <p className="text-muted-foreground break-words">{resource.reasonForStatus}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </main>
    );
}

    