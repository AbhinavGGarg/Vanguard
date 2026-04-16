'use client';
import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import type { ModelAttackScenarioOutput } from '@/ai/flows/types/simulate-attack-types';
import type { AnalyzeInteractionOutput } from '@/ai/flows/analyze-interaction-flow';
import { modelAttackScenario } from '@/ai/flows/simulate-attack-flow';
import { useToast } from '@/hooks/use-toast';

export interface SessionData extends ModelAttackScenarioOutput {
    // Countermeasure interaction result
    interactionResult: AnalyzeInteractionOutput | null;
    // The script that was modeled
    script: string;
    // The description used to generate the script
    description: string;
}

export interface Session extends SessionData {
    id: string;
    timestamp: number;
    name: string;
}

interface SimulationState {
    data: Session | null;
    isLoading: boolean;
    history: Session[];
    
    // Actions
    startSimulation: (script: string, description: string) => Promise<void>;
    clearSimulation: () => void;
    loadFromHistory: (id: string) => void;
    clearHistory: () => void;

    // State setters that components can use
    setScript: (script: string) => void;
    setDescription: (description: string) => void;
    setInteractionResult: (result: AnalyzeInteractionOutput | null) => void;

    // Derived state for convenience
    script: string;
    description: string;
    interactionResult: AnalyzeInteractionOutput | null;
}

const SimulationContext = createContext<SimulationState | undefined>(undefined);

function formatTimestamp(offsetMinutes = 0) {
    const date = new Date(Date.now() - offsetMinutes * 60_000);
    return date.toISOString();
}

function inferProvider(script: string, description: string) {
    const source = `${script}\n${description}`.toLowerCase();
    if (source.includes('gcp') || source.includes('gcloud')) return 'GCP' as const;
    if (source.includes('azure') || source.includes('az vm') || source.includes('blob')) return 'Azure' as const;
    return 'AWS' as const;
}

function inferRiskScore(script: string, description: string) {
    const source = `${script}\n${description}`.toLowerCase();
    let score = 42;
    if (source.includes('exfiltration') || source.includes('credential')) score += 18;
    if (source.includes('persistence') || source.includes('rce')) score += 16;
    if (source.includes('admin') || source.includes('privilege') || source.includes('token')) score += 10;
    return Math.min(95, Math.max(25, score));
}

function buildFallbackModel(script: string, description: string): ModelAttackScenarioOutput {
    const provider = inferProvider(script, description);
    const riskScore = inferRiskScore(script, description);

    const resourceByProvider = {
        AWS: [
            { name: 'auth-gateway-prod', resourceId: 'i-0a1b2c3d4e5f6g7h8', service: 'EC2 Instance', region: 'us-east-1' },
            { name: 'customer-data-archive', resourceId: 'arn:aws:s3:::customer-data-archive', service: 'S3 Bucket', region: 'us-east-1' },
            { name: 'payments-lambda', resourceId: 'arn:aws:lambda:us-east-1:123456789012:function:payments-lambda', service: 'Lambda', region: 'us-east-1' },
        ],
        GCP: [
            { name: 'identity-sync-job', resourceId: 'projects/demo/locations/us-central1/functions/identity-sync', service: 'Cloud Function', region: 'us-central1' },
            { name: 'ledger-warehouse', resourceId: 'projects/demo/buckets/ledger-warehouse', service: 'Cloud Storage', region: 'us-central1' },
            { name: 'api-gateway-cluster', resourceId: 'projects/demo/locations/us-central1/clusters/api-gateway', service: 'GKE Cluster', region: 'us-central1' },
        ],
        Azure: [
            { name: 'payments-vm-01', resourceId: '/subscriptions/demo/resourceGroups/rg-prod/providers/Microsoft.Compute/virtualMachines/payments-vm-01', service: 'Virtual Machine', region: 'eastus' },
            { name: 'identity-blob-store', resourceId: '/subscriptions/demo/resourceGroups/rg-prod/providers/Microsoft.Storage/storageAccounts/idblobstore', service: 'Blob Storage', region: 'eastus' },
            { name: 'orchestration-app', resourceId: '/subscriptions/demo/resourceGroups/rg-prod/providers/Microsoft.Web/sites/orchestration-app', service: 'App Service', region: 'eastus' },
        ],
    } as const;

    const resources = resourceByProvider[provider];

    return {
        analysis: {
            executiveSummary: `Simulated ${provider} attack path indicates elevated risk with signs of unauthorized access, privilege abuse, and potential data exposure.`,
            technicalBreakdown: `The scenario includes command execution, identity misuse, and lateral movement indicators based on the provided script context. Detection events were synthesized to model realistic cloud telemetry and incident progression.`,
            riskScore,
            recommendedActions: [
                'Rotate high-privilege credentials and enforce short-lived session tokens.',
                'Apply least-privilege IAM policies and remove wildcard permissions.',
                'Enable anomaly detection on authentication and storage access logs.',
                'Isolate affected workloads and increase log retention for incident review.',
            ],
            suggestedCountermeasure: `#!/bin/bash
# Defensive containment script (simulated)
echo "[DEFENSE] Enabling high-risk account lock and session revocation"
echo "[DEFENSE] Applying restrictive IAM policy set"
echo "[DEFENSE] Blocking suspicious egress paths and isolating impacted workloads"
echo "[DEFENSE] Triggering enhanced audit collection for forensic review"`,
        },
        events: [
            {
                id: 'EVT-001',
                timestamp: formatTimestamp(8),
                severity: 'Medium',
                description: 'Suspicious cloud API enumeration detected from unusual source.',
                status: 'Investigating',
            },
            {
                id: 'EVT-002',
                timestamp: formatTimestamp(6),
                severity: 'High',
                description: 'Privilege escalation pattern observed in identity management actions.',
                status: 'Action Required',
            },
            {
                id: 'EVT-003',
                timestamp: formatTimestamp(4),
                severity: riskScore >= 70 ? 'Critical' : 'High',
                description: 'Potential exfiltration workflow initiated against sensitive storage.',
                status: 'Investigating',
            },
            {
                id: 'EVT-004',
                timestamp: formatTimestamp(2),
                severity: 'Medium',
                description: 'Containment guardrails partially applied by policy controls.',
                status: 'Contained',
            },
            {
                id: 'EVT-005',
                timestamp: formatTimestamp(0),
                severity: 'Low',
                description: 'Post-incident monitoring elevated for affected resources.',
                status: 'Resolved',
            },
        ],
        metrics: {
            totalEvents: 24,
            activeThreats: riskScore >= 70 ? 4 : 2,
            blockedAttacks: 1,
            detectionAccuracy: '93.5%',
        },
        affectedResources: resources.map((resource, idx) => ({
            ...resource,
            provider,
            status: idx === 0 ? 'Compromised' : idx === 1 ? 'Vulnerable' : 'Investigating',
            reasonForStatus:
                idx === 0
                    ? 'Detected suspicious control-plane actions mapped to this resource.'
                    : idx === 1
                        ? 'Policy posture indicates exploitable access path requiring mitigation.'
                        : 'Resource linked to incident path and currently under investigation.',
        })),
        topProcesses: [
            { name: 'cloudctl-auth-refresh', count: 14 },
            { name: 'storage-policy-read', count: 11 },
            { name: 'identity-role-update', count: 9 },
            { name: 'network-egress-check', count: 7 },
        ],
        topEvents: [
            { name: 'auth.anomaly.detected', count: 12 },
            { name: 'iam.policy.modified', count: 10 },
            { name: 'storage.access.spike', count: 8 },
            { name: 'workload.isolation.triggered', count: 6 },
        ],
    };
}

export function SimulationProvider({ children }: { children: ReactNode }) {
    const { toast } = useToast();
    const [data, setData] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<Session[]>([]);

     useEffect(() => {
        try {
            const storedHistory = localStorage.getItem('simulationHistory');
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error("Could not load history from localStorage", error);
        }
    }, []);

    const saveHistory = (newHistory: Session[]) => {
        try {
            localStorage.setItem('simulationHistory', JSON.stringify(newHistory));
            setHistory(newHistory);
        } catch (error) {
            console.error("Could not save history to localStorage", error);
        }
    };
    
    const setInteractionResult = (interactionResult: AnalyzeInteractionOutput | null) => {
        if (!data) return;
        
        const updatedData = {
            ...data,
            interactionResult,
            analysis: {
                ...data.analysis,
                suggestedCountermeasure: interactionResult?.modifiedDefenseScript || data.analysis.suggestedCountermeasure
            },
            metrics: {
                ...data.metrics,
                blockedAttacks: interactionResult?.attacksBlocked || 0,
            }
        };
        setData(updatedData);

        // Also update history if this session is in it
        const historyIndex = history.findIndex(s => s.id === data.id);
        if (historyIndex !== -1) {
            const newHistory = [...history];
            newHistory[historyIndex] = updatedData;
            saveHistory(newHistory);
        }
    };

    const setScript = (script: string) => {
        if (data) {
            setData({ ...data, script });
        } else {
             setData(prev => ({
                ...(prev || {
                    id: `transient-${Date.now()}`,
                    timestamp: Date.now(),
                    name: "New Scenario",
                    analysis: { executiveSummary: "", technicalBreakdown: "", riskScore: 0, recommendedActions: [], suggestedCountermeasure: ""},
                    events: [],
                    metrics: { totalEvents: 0, activeThreats: 0, blockedAttacks: 0, detectionAccuracy: "0%"},
                    affectedResources: [],
                    topProcesses: [],
                    topEvents: [],
                    interactionResult: null,
                    description: "",
                }),
                script
            }));
        }
    };
    
    const setDescription = (description: string) => {
        if (data) {
            setData({ ...data, description });
        } else {
             setData(prev => ({
                ...(prev || {
                    id: `transient-${Date.now()}`,
                    timestamp: Date.now(),
                    name: "New Scenario",
                    analysis: { executiveSummary: "", technicalBreakdown: "", riskScore: 0, recommendedActions: [], suggestedCountermeasure: ""},
                    events: [],
                    metrics: { totalEvents: 0, activeThreats: 0, blockedAttacks: 0, detectionAccuracy: "0%"},
                    affectedResources: [],
                    topProcesses: [],
                    topEvents: [],
                    interactionResult: null,
                    script: "",
                }),
                description,
            }));
        }
    };

    const startSimulation = useCallback(async (script: string, description: string) => {
        setIsLoading(true);
        // Clear previous results but keep script/description
        setData(prev => ({
             ...(prev || {
                id: `transient-${Date.now()}`,
                timestamp: Date.now(),
             }),
             script,
             description,
             name: description || "Running Scenario...",
             analysis: { executiveSummary: "", technicalBreakdown: "", riskScore: 0, recommendedActions: [], suggestedCountermeasure: ""},
             events: [],
             metrics: { totalEvents: 0, activeThreats: 0, blockedAttacks: 0, detectionAccuracy: "0%"},
             affectedResources: [],
             topProcesses: [],
             topEvents: [],
             interactionResult: null,
        }));

        try {
            const result = await modelAttackScenario({ script });
            
            const newSession: Session = {
                ...result,
                script,
                description,
                interactionResult: null,
                id: `SESSION-${Date.now()}`,
                timestamp: Date.now(),
                name: description || "Untitled Scenario",
            };

            const updatedHistory = [newSession, ...history].slice(0, 10);
            saveHistory(updatedHistory);
            setData(newSession);
            toast({
                title: 'Simulation Complete',
                description: 'The attack scenario has been successfully modeled.',
            });
        } catch (error) {
            console.error("Failed to model attack scenario:", error);
            const fallbackResult = buildFallbackModel(script, description);
            const fallbackSession: Session = {
                ...fallbackResult,
                script,
                description,
                interactionResult: null,
                id: `SESSION-${Date.now()}`,
                timestamp: Date.now(),
                name: description || "Untitled Scenario",
            };

            const updatedHistory = [fallbackSession, ...history].slice(0, 10);
            saveHistory(updatedHistory);
            setData(fallbackSession);
            toast({
                title: 'Simulation Ready',
                description: 'Loaded a local simulation model so you can continue in Sandbox and Analysis.',
            });
        } finally {
            setIsLoading(false);
        }
    }, [history, toast]);


    const loadFromHistory = useCallback((id: string) => {
        const session = history.find(s => s.id === id);
        if (session) {
            setData(session);
            toast({
                title: 'Scenario Loaded',
                description: `Loaded "${session.name}" from history.`,
            });
        }
    }, [history, toast]);

    const clearHistory = useCallback(() => {
        saveHistory([]);
        toast({
            title: 'History Cleared',
            description: 'All saved simulation sessions have been removed.',
        });
    }, [toast]);
    
    const clearSimulation = useCallback(() => {
        setData(null);
    }, []);
    
    const value = useMemo(() => ({
        data,
        isLoading,
        history,
        startSimulation,
        clearSimulation,
        loadFromHistory,
        clearHistory,
        setScript,
        setDescription,
        setInteractionResult,
        script: data?.script || '',
        description: data?.description || '',
        interactionResult: data?.interactionResult || null,
    }), [data, isLoading, history, startSimulation, clearSimulation, loadFromHistory, clearHistory, setInteractionResult]);

    return (
        <SimulationContext.Provider value={value}>
            {children}
        </SimulationContext.Provider>
    );
}

export function useSimulation() {
    const context = useContext(SimulationContext);
    if (context === undefined) {
        throw new Error('useSimulation must be used within a SimulationProvider');
    }
    return context;
}
