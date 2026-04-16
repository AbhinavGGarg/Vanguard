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

const fallbackScriptByProvider: Record<string, string> = {
  AWS: `#!/bin/bash
# Simulated cloud attack script (AWS)
# T1530: Data from Cloud Storage Object
# T1098: Account Manipulation

echo "[SIM] Starting AWS exfiltration simulation..."
echo "[SIM] Enumerating S3 buckets with loose ACLs..."
echo "aws s3api list-buckets --query 'Buckets[].Name'"

echo "[SIM] Targeting bucket: finance-archive-prod"
echo "aws s3 ls s3://finance-archive-prod --recursive | head -n 20"
echo "[SIM] Simulating staged copy of selected objects"
echo "aws s3 cp s3://finance-archive-prod ./staging --recursive --exclude '*' --include '*.csv'"

echo "[SIM] Attempting persistence via IAM user policy abuse"
echo "aws iam create-user --user-name shadow-ops-sim"
echo "aws iam attach-user-policy --user-name shadow-ops-sim --policy-arn arn:aws:iam::aws:policy/PowerUserAccess"

echo "[SIM] Exfiltration simulation complete (no destructive action taken)."`,
  GCP: `#!/bin/bash
# Simulated cloud attack script (GCP)
# T1098: Account Manipulation
# T1078: Valid Accounts

echo "[SIM] Starting GCP IAM persistence simulation..."
echo "[SIM] Enumerating project IAM policy bindings"
echo "gcloud projects get-iam-policy demo-project --format=json"

echo "[SIM] Creating unauthorized service account"
echo "gcloud iam service-accounts create stealth-backup-sim --display-name='Stealth Backup Sim'"

echo "[SIM] Granting elevated role to service account"
echo "gcloud projects add-iam-policy-binding demo-project --member='serviceAccount:stealth-backup-sim@demo-project.iam.gserviceaccount.com' --role='roles/editor'"

echo "[SIM] Generating key material (simulated only)"
echo "gcloud iam service-accounts keys create /tmp/stealth-key.json --iam-account='stealth-backup-sim@demo-project.iam.gserviceaccount.com'"

echo "[SIM] Persistence simulation complete (no destructive action taken)."`,
  Azure: `#!/bin/bash
# Simulated cloud attack script (Azure)
# T1059: Command and Scripting Interpreter
# T1210: Exploitation of Remote Services

echo "[SIM] Starting Azure VM RCE simulation..."
echo "[SIM] Enumerating exposed VMs and NSG rules"
echo "az vm list -d -o table"
echo "az network nsg list -o table"

echo "[SIM] Simulating remote command execution against target VM"
echo "az vm run-command invoke --resource-group rg-prod --name vm-payroll --command-id RunShellScript --scripts 'echo simulated-rce'"

echo "[SIM] Simulating credential collection from metadata endpoint"
echo "curl -H Metadata:true 'http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://management.azure.com/'"

echo "[SIM] RCE simulation complete (no destructive action taken)."`,
  'Multi-Cloud': `#!/bin/bash
# Simulated cloud attack script (Multi-Cloud Kubernetes)
# T1552: Unsecured Credentials
# T1550.001: Use of Stolen Session/Token

echo "[SIM] Starting Kubernetes token theft simulation..."
echo "[SIM] Enumerating pods and service accounts"
echo "kubectl get pods -A"
echo "kubectl get serviceaccounts -A"

echo "[SIM] Searching for mounted service-account tokens"
echo "kubectl exec -n default suspicious-pod -- ls /var/run/secrets/kubernetes.io/serviceaccount"

echo "[SIM] Simulating API use with stolen token"
echo "kubectl --token=<simulated-token> auth can-i '*' '*' --all-namespaces"

echo "[SIM] Simulating cross-cloud secret discovery hooks"
echo "[SIM] Querying cloud metadata endpoints from compromised workload context"

echo "[SIM] Token-theft simulation complete (no destructive action taken)."`,
};

function buildFallbackScript(provider: string, attackType: string, description: string) {
  const template = fallbackScriptByProvider[provider] || fallbackScriptByProvider['Multi-Cloud'];
  return `${template}

# Operator context:
# Provider: ${provider}
# Attack Type: ${attackType}
# Intent: ${description.replace(/\n/g, ' ').trim()}`;
}

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
      const fallbackScript = buildFallbackScript(provider, attackType, description);
      setScript(fallbackScript);
      toast({
        title: 'Sample Script Ready',
        description: 'Template-backed sample script generated successfully.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <PageTransition className="overflow-x-hidden">
      <div className="grid gap-6 min-[1700px]:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
        <Card className="surface min-w-0">
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
                <pre className="max-h-36 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-[#090d16] p-3 font-mono text-xs text-muted-foreground">
                  {script}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">No script generated yet. Use templates or describe an attack to begin.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="surface min-w-0">
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
                  <div className="mt-3 flex flex-wrap gap-2">
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
