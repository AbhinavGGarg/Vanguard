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
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not model the attack scenario. Please try again.',
            });
            clearSimulation();
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
