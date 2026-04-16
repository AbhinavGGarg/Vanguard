
'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Clipboard, FileCheck2, Loader2, Send, ShieldCheck, FlaskConical, AlertTriangle, Lightbulb, RotateCcw, CheckCircle2, ListChecks } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useSimulation } from '@/context/simulation-context';
import { generateAttackScript } from '@/ai/flows/generate-attack-script-flow';
import { analyzeInteraction, type InteractionStep } from '@/ai/flows/analyze-interaction-flow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

const attackExamples = [
  {
    id: "aws-s3-exfil",
    title: "AWS S3 Data Exfiltration",
    provider: "AWS",
    tactic: "Exfiltration",
    description: "A powershell script that exfiltrates data from an AWS S3 bucket by finding publicly accessible buckets and downloading their contents."
  },
  {
    id: "gcp-iam-persistence",
    title: "GCP IAM Persistence",
    provider: "GCP",
    tactic: "Persistence",
    description: "A shell script to achieve persistence in a GCP environment by creating a new service account, assigning it project editor rights, and generating keys for it."
  },
  {
    id: "azure-vm-rce",
    title: "Azure VM Remote Code Execution",
    provider: "Azure",
    tactic: "Execution",
    description: "Simulate remote code execution on an Azure VM by exploiting a vulnerable web application to run a reverse shell."
  },
  {
    id: "aws-lambda-dos",
    title: "AWS Lambda Denial of Service",
    provider: "AWS",
    tactic: "Impact",
    description: "Model a denial of service attack by triggering a recursive AWS Lambda function invocation that rapidly consumes resources."
  },
  {
    id: "k8s-token-theft",
    title: "Kubernetes Service Account Token Theft",
    provider: "Multi-Cloud",
    tactic: "Credential Access",
    description: "Generate a script that scans for unsecured Kubernetes pods within a cluster and extracts service account tokens from them."
  },
];


export function ThreatSandbox() {
    const { toast } = useToast();
    const { 
      data, 
      isLoading, 
      startSimulation, 
      clearSimulation, 
      interactionResult,
      setInteractionResult,
      script,
      setScript,
      description,
      setDescription
    } = useSimulation();

    const [isGenerating, setIsGenerating] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    
    const [selectedAttackId, setSelectedAttackId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('countermeasure');

    const handleGenerateScript = async () => {
        if (!description) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please provide an attack description.' });
            return;
        }
        setIsGenerating(true);
        setScript('');
        try {
            const result = await generateAttackScript({ description });
            setScript(result.script);
        } catch (error) {
            console.error("Failed to generate script:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not generate script. Please try again.' });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleModelScenario = async () => {
        if (!script) {
            toast({ variant: 'destructive', title: 'Error', description: 'There is no script to model.' });
            return;
        }
        setInteractionResult(null);
        setActiveTab('countermeasure');
        await startSimulation(script, description);
    };

    const handleClearScenario = () => {
        clearSimulation();
        setSelectedAttackId(null);
        setActiveTab('countermeasure');
        toast({ title: 'Sandbox Cleared', description: 'The simulation has been reset.' });
    };

    const handleTestCountermeasure = async () => {
        if (!script || !data?.analysis.suggestedCountermeasure) {
            toast({ variant: 'destructive', title: 'Error', description: 'Attack script or countermeasure is missing.' });
            return;
        }
        setIsTesting(true);
        setInteractionResult(null);
        try {
            const result = await analyzeInteraction({
                attackScript: script,
                defenseScript: data.analysis.suggestedCountermeasure
            });
            setInteractionResult(result);
            setActiveTab('engagement');
            if(result.modifiedDefenseScript && data?.analysis) {
                toast({
                    title: 'Defense Improved!',
                    description: 'The AI has updated the countermeasure script with improvements.',
                });
            }
        } catch (error) {
            console.error("Failed to test countermeasure:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not test countermeasure. Please try again.' });
        } finally {
            setIsTesting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied!', description: 'Script copied to clipboard.' });
    };

    const getActionIcon = (action: InteractionStep['action']) => {
        switch (action) {
            case 'Attack': return <AlertTriangle className="h-5 w-5 text-red-500" />;
            case 'Defense': return <ShieldCheck className="h-5 w-5 text-green-500" />;
            case 'System': return <Bot className="h-5 w-5 text-blue-500" />;
            default: return null;
        }
    }


    return (
        <main className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left Column */}
            <div className="flex flex-col gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Bot className="h-6 w-6"/> AI Attack Generator
                        </CardTitle>
                        <CardDescription>Describe a cloud-native attack scenario in the text area below, or select a pre-built scenario from the library to get started.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            placeholder="e.g., 'A powershell script that exfiltrates data from an AWS S3 bucket...'"
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value);
                                setSelectedAttackId(null);
                            }}
                            className="h-24 font-code"
                        />
                         
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button onClick={handleGenerateScript} disabled={isGenerating || !description}>
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Generate Script
                        </Button>
                        <Button onClick={handleClearScenario} variant="outline" >
                            <RotateCcw className="mr-2 h-4 w-4" /> Clear Scenario
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Attack Library</CardTitle>
                        <CardDescription>Select a pre-built scenario to load it into the generator.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {attackExamples.map((ex) => (
                           <Card key={ex.id} className={`flex flex-col justify-between ${selectedAttackId === ex.id ? 'border-primary' : ''}`}>
                               <CardHeader className="pb-2">
                                   <CardTitle className="text-base leading-snug">{ex.title}</CardTitle>
                                   <div className="flex gap-2 pt-1">
                                       <Badge variant="secondary">{ex.provider}</Badge>
                                       <Badge variant="outline">{ex.tactic}</Badge>
                                   </div>
                               </CardHeader>
                               <CardFooter>
                                    <Button 
                                        variant={selectedAttackId === ex.id ? "default" : "secondary"}
                                        className="w-full"
                                        onClick={() => {
                                            setDescription(ex.description)
                                            setSelectedAttackId(ex.id)
                                        }}>
                                        {selectedAttackId === ex.id ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
                                        {selectedAttackId === ex.id ? 'Selected' : 'Select'}
                                    </Button>
                               </CardFooter>
                           </Card>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6 sticky top-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FlaskConical className="h-6 w-6" />
                            Threat Sandbox
                        </CardTitle>
                        <CardDescription>
                             The generated script will appear here. Run a "Full Scenario" to analyze its impact.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Textarea
                            placeholder="Your generated or pasted script will appear here..."
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                            className="h-64 font-code text-xs"
                        />
                    </CardContent>
                     <CardFooter className="flex justify-between">
                         <div className="flex gap-2">
                             <Button onClick={handleModelScenario} disabled={!script || isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Model Full Scenario'}
                            </Button>
                        </div>
                        <Button onClick={() => copyToClipboard(script)} variant="ghost" size="icon" disabled={!script}>
                            <Clipboard className="h-5 w-5" />
                        </Button>
                    </CardFooter>
                </Card>
               <Card>
                    <CardHeader>
                        <CardTitle>Analysis & Defense</CardTitle>
                         <CardDescription>
                             View the AI-generated countermeasure and test its effectiveness against the attack script.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="countermeasure">Countermeasure</TabsTrigger>
                                <TabsTrigger value="engagement" disabled={!data}>Test & Improve</TabsTrigger>
                            </TabsList>
                            <TabsContent value="countermeasure" className="mt-4">
                                {data?.analysis.suggestedCountermeasure ? (
                                    <>
                                        <div className="relative">
                                            <Textarea
                                                readOnly
                                                value={data.analysis.suggestedCountermeasure}
                                                className="h-64 font-code text-xs bg-muted"
                                            />
                                            <Button
                                                onClick={() => copyToClipboard(data.analysis.suggestedCountermeasure)}
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2"
                                            >
                                                <Clipboard className="h-5 w-5" />
                                            </Button>
                                        </div>
                                         <Alert className="mt-4">
                                            <Lightbulb className="h-4 w-4" />
                                            <AlertTitle>AI-Generated Defense</AlertTitle>
                                            <AlertDescription>
                                                This is the AI's suggested defense script. Click the "Test & Improve" tab to run a simulated engagement and generate an even better version.
                                            </AlertDescription>
                                        </Alert>
                                    </>
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                        <p>Run a full scenario to generate a countermeasure.</p>
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="engagement" className="mt-4">
                                {isTesting && (
                                     <div className="h-64 flex items-center justify-center">
                                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                                    </div>
                                )}
                                {interactionResult && (
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium">Defense Effectiveness Score</span>
                                            <span className="text-sm font-bold text-primary">{interactionResult.effectivenessScore} / 100</span>
                                            </div>
                                            <Progress value={interactionResult.effectivenessScore} aria-label={`${interactionResult.effectivenessScore}% effectiveness score`} />
                                        </div>
                                        
                                        <Alert>
                                            <ListChecks className="h-4 w-4" />
                                            <AlertTitle>AI Improvement Analysis</AlertTitle>
                                            <AlertDescription>
                                                <p className="mb-2">{interactionResult.outcomeSummary}</p>
                                                <p>The updated defense script in the "Countermeasure" tab was modified to better address the attack.</p>
                                            </AlertDescription>
                                        </Alert>
                                        
                                        <div className="space-y-2">
                                            <h4 className="font-semibold text-sm">Engagement Log:</h4>
                                            <div className="border rounded-lg p-2 max-h-60 overflow-y-auto">
                                                {interactionResult.interactionLog.map(log => (
                                                    <div key={log.step} className="text-xs p-2 flex items-start gap-3 hover:bg-muted/50 rounded-md">
                                                        <div className="pt-0.5">{getActionIcon(log.action)}</div>
                                                        <div className="flex-1">
                                                            <p className="break-words"><span className="font-bold">{log.action}:</span> {log.description}</p>
                                                            <p className="text-muted-foreground"><span className="font-semibold">Result:</span> {log.result}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                         
                                    </div>
                                )}
                                 {!interactionResult && !isTesting && data && (
                                     <div className="h-64 flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg p-4">
                                        <h3 className="text-lg font-semibold">Ready to Test</h3>
                                        <p className="text-sm text-muted-foreground mb-4">Simulate an engagement between the attack and defense scripts to score effectiveness and generate an improved countermeasure.</p>
                                        <Button className="mt-4" onClick={handleTestCountermeasure} variant="secondary" disabled={isTesting}>
                                            {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                                            Test & Improve Defense
                                        </Button>
                                    </div>
                                 )}
                                 {!data && !isTesting && (
                                    <div className="h-64 flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                        <p>Run a scenario first to test its countermeasure.</p>
                                    </div>
                                 )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                     {data && (
                        <CardFooter>
                             <Button 
                                onClick={handleTestCountermeasure} 
                                className="w-full" 
                                disabled={isTesting || !data?.analysis.suggestedCountermeasure}
                                >
                                {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                                {interactionResult ? "Re-Test & Improve" : "Test & Improve Countermeasure"}
                            </Button>
                        </CardFooter>
                    )}
               </Card>
            </div>
        </main>
    );
}

    