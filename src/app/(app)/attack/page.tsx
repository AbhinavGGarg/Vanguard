'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Crosshair, Loader2, ShieldAlert } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { generateAttackScript } from '@/ai/flows/generate-attack-script-flow';
import { useSimulation } from '@/context/simulation-context';
import { PageTransition } from '@/components/layout/page-transition';

const templates = [
  {
    id: 'aws-s3-exfil',
    title: 'AWS S3 Data Exfiltration',
    provider: 'AWS',
    type: 'Exfiltration',
    description: 'Simulate an actor discovering and abusing misconfigured S3 access paths.',
  },
  {
    id: 'gcp-iam-persistence',
    title: 'GCP IAM Persistence',
    provider: 'GCP',
    type: 'Persistence',
    description: 'Model unauthorized service-account creation with elevated privilege grants.',
  },
  {
    id: 'azure-rce',
    title: 'Azure VM Remote Code Execution',
    provider: 'Azure',
    type: 'RCE',
    description: 'Simulate exploit chain resulting in remote shell access on a compute instance.',
  },
  {
    id: 'k8s-cred-access',
    title: 'Kubernetes Token Theft',
    provider: 'Multi-Cloud',
    type: 'Credential Access',
    description: 'Discover insecure pods and extract service account tokens for lateral movement.',
  },
] as const;

export default function AttackPage() {
  const { toast } = useToast();
  const { description, setDescription, setScript, script } = useSimulation();
  const [provider, setProvider] = useState<string>('AWS');
  const [attackType, setAttackType] = useState<string>('Exfiltration');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const helperText = useMemo(
    () => `Provider: ${provider} • Attack Type: ${attackType}. Include objective, entry point, and expected impact.`,
    [provider, attackType]
  );

  const applyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    setSelectedTemplate(template.id);
    setProvider(template.provider);
    setAttackType(template.type);
    setDescription(template.description);
  };

  const onGenerate = async () => {
    if (!description.trim()) return;
    setIsGenerating(true);
    setScript('');

    try {
      const prompt = `${description}\nCloud Provider: ${provider}\nAttack Type: ${attackType}`;
      const result = await generateAttackScript({ description: prompt });
      setScript(result.script);
      toast({ title: 'Script Generated', description: 'Attack script is ready in the sandbox.' });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Unable to generate script. Please refine the scenario and try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <PageTransition>
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card className="surface">
          <CardHeader>
            <CardTitle>Create Attack Scenario</CardTitle>
            <CardDescription>
              Step 1: Define attack intent. Step 2: Generate script. Step 3: Run simulation in Sandbox.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="scenario">Scenario Description</Label>
              <Textarea
                id="scenario"
                value={description}
                onChange={(e) => {
                  setSelectedTemplate(null);
                  setDescription(e.target.value);
                }}
                className="min-h-[180px] resize-none"
                placeholder="Example: Simulate a persistence attack where an adversary creates shadow IAM access and schedules exfiltration tasks across cloud storage."
              />
              <p className="text-xs text-muted-foreground">{helperText}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Cloud Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AWS">AWS</SelectItem>
                    <SelectItem value="GCP">GCP</SelectItem>
                    <SelectItem value="Azure">Azure</SelectItem>
                    <SelectItem value="Multi-Cloud">Multi-Cloud</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Attack Type</Label>
                <Select value={attackType} onValueChange={setAttackType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select attack type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Exfiltration">Exfiltration</SelectItem>
                    <SelectItem value="Persistence">Persistence</SelectItem>
                    <SelectItem value="RCE">RCE</SelectItem>
                    <SelectItem value="Impact">Impact</SelectItem>
                    <SelectItem value="Credential Access">Credential Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
              <Button onClick={onGenerate} disabled={isGenerating || !description.trim()} className="gap-2">
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                Generate Attack Script
              </Button>
            </motion.div>

            <Separator />

            <div className="rounded-xl border border-border bg-background/70 p-4">
              <p className="mb-2 text-sm font-medium">Generated Script Preview</p>
              {isGenerating ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : script ? (
                <pre className="max-h-36 overflow-auto rounded-lg bg-[#090d16] p-3 font-mono text-xs text-muted-foreground">
                  {script}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">No script generated yet. Use templates or describe an attack to begin.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="surface">
          <CardHeader>
            <CardTitle>Attack Library</CardTitle>
            <CardDescription>Use a prebuilt scenario and refine from there.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {templates.map((template) => (
              <motion.div key={template.id} whileHover={{ y: -2 }}>
                <Card
                  className={`rounded-xl border p-4 transition-colors ${
                    selectedTemplate === template.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-background/70 hover:bg-background'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{template.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
                    </div>
                    <Crosshair className="h-4 w-4 text-primary" />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Badge variant="outline">{template.provider}</Badge>
                    <Badge variant="outline">{template.type}</Badge>
                  </div>
                  <Button
                    size="sm"
                    variant={selectedTemplate === template.id ? 'default' : 'secondary'}
                    onClick={() => applyTemplate(template.id)}
                    className="mt-3 w-full"
                  >
                    Use Template
                  </Button>
                </Card>
              </motion.div>
            ))}

            {!selectedTemplate && !description && (
              <div className="rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
                <ShieldAlert className="mb-2 h-4 w-4" />
                Select a template to pre-fill fields and accelerate scenario generation.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
