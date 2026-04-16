
'use client';
import { useState } from 'react';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulation } from '@/context/simulation-context';
import type { SecurityEvent } from '@/ai/flows/types/simulate-attack-types';
import { AlertTriangle, Bot, CircleDashed, Loader2, ShieldCheck, ShieldQuestion } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from '@/hooks/use-toast';
import { generateResponsePlan } from '@/ai/flows/generate-response-plan-flow';
import type { GenerateResponsePlanOutput } from '@/ai/flows/types/generate-response-plan-types';
import { Card, CardContent } from '@/components/ui/card';


const getSeverityVariant = (severity: SecurityEvent['severity']): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (severity) {
    case 'Critical':
      return 'destructive';
    case 'High':
      return 'secondary';
     case 'Medium':
      return 'outline';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: SecurityEvent['status']) => {
    switch (status) {
        case 'Contained': return <ShieldCheck className="h-4 w-4 text-green-500" />;
        case 'Investigating': return <ShieldQuestion className="h-4 w-4 text-yellow-500" />;
        case 'Resolved': return <ShieldCheck className="h-4 w-4 text-blue-500" />;
        default: return <CircleDashed className="h-4 w-4 text-muted-foreground"/>;
    }
}

function ResponsePlanDialog({ event }: { event: SecurityEvent }) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [responsePlan, setResponsePlan] = useState<GenerateResponsePlanOutput | null>(null);

    const handleGenerateResponse = async () => {
        setIsLoading(true);
        setResponsePlan(null);
        try {
            const plan = await generateResponsePlan(event);
            setResponsePlan(plan);
        } catch (error) {
            console.error("Failed to generate response plan:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not generate a response plan. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">Respond</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>AI-Generated Response Plan</DialogTitle>
                    <DialogDescription>
                        A suggested response plan for event: <span className="font-semibold">{event.id} - {event.description}</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="my-4">
                    {!responsePlan && !isLoading && (
                        <div className="flex flex-col items-center justify-center text-center gap-4 h-64 border-dashed border-2 rounded-lg">
                            <Bot className="h-12 w-12 text-muted-foreground"/>
                            <h3 className="text-xl font-semibold">Ready to Assist</h3>
                            <p className="text-muted-foreground">Click the button below to generate a response plan using AI.</p>
                        </div>
                    )}
                    {isLoading && (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-16 w-16 animate-spin text-primary" />
                        </div>
                    )}
                    {responsePlan && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Suggested Steps:</h4>
                                <ul className="list-decimal list-outside pl-5 space-y-2 text-sm text-muted-foreground">
                                    {responsePlan.suggestedSteps.map((step, i) => <li key={i}>{step}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Suggested Status Update:</h4>
                                <Badge variant="outline">{responsePlan.suggestedStatus}</Badge>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Justification:</h4>
                                <p className="text-sm text-muted-foreground">{responsePlan.justification}</p>
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
                    <Button onClick={handleGenerateResponse} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                        {responsePlan ? 'Regenerate Plan' : 'Generate Plan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function SecurityEvents() {
    const { data } = useSimulation();

    if (!data || !data.events || data.events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <AlertTriangle className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold">No Security Events</h2>
                <p className="text-muted-foreground mt-2">Run a scenario in the Threat Sandbox to generate security events.</p>
            </div>
        );
    }
    
    return (
        <main className="flex-1 p-4 md:p-6">
            <header className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Security Events</h1>
                <p className="text-muted-foreground">
                    A log of all security incidents detected during the simulation.
                </p>
            </header>
             <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">Event ID</TableHead>
                                <TableHead className="w-[180px]">Timestamp</TableHead>
                                <TableHead className="w-[120px]">Severity</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-[150px]">Status</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.events.map((event) => (
                                <TableRow key={event.id}>
                                    <TableCell className="font-mono text-xs">{event.id}</TableCell>
                                    <TableCell className="font-mono text-xs">{new Date(event.timestamp).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={getSeverityVariant(event.severity)}>
                                            {event.severity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{event.description}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(event.status)}
                                            <span>{event.status}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ResponsePlanDialog event={event} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    );
}

    