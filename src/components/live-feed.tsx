
'use client';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Video, VideoOff, Mic, AlertCircle, Siren, ShieldAlert, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAlerts } from '@/context/alert-context';
import type { Alert as AlertType } from '@/context/alert-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from './ui/separator';

const getSeverityVariant = (severity: AlertType['severity']): 'default' | 'secondary' | 'destructive' | 'outline' => {
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

const getSeverityIcon = (severity: AlertType['severity']) => {
    switch(severity) {
        case 'Critical': return <Siren className="h-4 w-4" />;
        case 'High': return <ShieldAlert className="h-4 w-4" />;
        case 'Medium': return <AlertCircle className="h-4 w-4" />;
        default: return <Bot className="h-4 w-4" />;
    }
}


export function LiveFeed() {
    const { toast } = useToast();
    const { alerts, addAlert, clearAlerts } = useAlerts();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

    useEffect(() => {
      // Dummy alert generator for demonstration purposes
      let intervalId: NodeJS.Timeout;
      if (isCameraOn) {
        intervalId = setInterval(() => {
          const dummyAlerts = [
            { type: 'Sound', severity: 'Medium', description: 'Loud noise detected', details: { decibels: '85dB' } },
            { type: 'Object', severity: 'High', description: 'Unauthorized object detected', details: { object: 'Backpack', confidence: '92%' } },
            { type: 'Verbal', severity: 'Critical', description: 'Aggressive tone and keywords detected', details: { sentiment: -0.8, keywords: ['threat', 'warning'] } },
            { type: 'Sound', severity: 'Critical', description: 'Glass breaking sound detected', details: { confidence: '98%' } },
          ];
          const randomAlert = dummyAlerts[Math.floor(Math.random() * dummyAlerts.length)] as Omit<AlertType, 'id' | 'timestamp'>;
          addAlert(randomAlert);
        }, 5000);
      }
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }, [isCameraOn, addAlert]);

    const toggleCamera = async () => {
        if (isCameraOn) {
            // Turn camera off
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
            setIsCameraOn(false);
            clearAlerts(); // Clear alerts when camera is turned off
        } else {
            // Turn camera on
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setHasCameraPermission(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setIsCameraOn(true);
            } catch (error) {
                console.error('Error accessing camera/mic:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Hardware Access Denied',
                    description: 'Please enable camera and microphone permissions in your browser settings.',
                });
            }
        }
    };

    return (
        <main className="flex flex-1 flex-col p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
                <header>
                    <h1 className="text-2xl font-bold tracking-tight">Live Security Feed</h1>
                    <p className="text-muted-foreground">Real-time monitoring and threat analysis.</p>
                </header>
                <Button onClick={toggleCamera} size="lg">
                    {isCameraOn ? <VideoOff className="mr-2 h-5 w-5" /> : <Video className="mr-2 h-5 w-5" />}
                    {isCameraOn ? 'Stop Session' : 'Start Session'}
                </Button>
            </div>
            <div className="grid gap-6 lg:grid-cols-3 flex-1">
                <Card className="lg:col-span-2 flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Camera Feed</span>
                             <Badge variant={isCameraOn ? "default" : "secondary"} className="flex items-center gap-2">
                                <span className={`relative flex h-2.5 w-2.5`}>
                                    {isCameraOn && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isCameraOn ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                </span>
                                {isCameraOn ? 'RECORDING' : 'OFFLINE'}
                             </Badge>
                        </CardTitle>
                        <CardDescription>The AI is monitoring this feed for visual and auditory threats.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex items-center justify-center bg-muted/50 rounded-b-lg overflow-hidden">
                        <div className="w-full h-full relative">
                            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                            {!isCameraOn && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                                    <VideoOff className="h-24 w-24 text-muted-foreground" />
                                    <p className="mt-4 text-lg font-medium text-muted-foreground">Camera is off</p>
                                    <p className="text-sm text-muted-foreground">Click &quot;Start Session&quot; to begin monitoring.</p>
                                </div>
                            )}
                             {hasCameraPermission === false && !isCameraOn && (
                                <div className="absolute inset-0 flex items-center justify-center p-4">
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Camera Access Required</AlertTitle>
                                        <AlertDescription>
                                            Please allow camera and microphone access to use this feature.
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Real-Time Alerts</CardTitle>
                        <CardDescription>Incidents detected by the AI will appear here instantly.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-0">
                         <ScrollArea className="flex-1 pr-4 -mr-4">
                             <div className="space-y-4">
                                {alerts.map((alert) => (
                                     <div key={alert.id} className="flex items-start gap-3">
                                        <div className="pt-1">
                                            {getSeverityIcon(alert.severity)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-semibold text-sm">{alert.type} Detected</p>
                                                <Badge variant={getSeverityVariant(alert.severity)}>{alert.severity}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{alert.description}</p>
                                            <p className="text-xs text-muted-foreground/70 mt-1">
                                                {new Date(alert.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                     </div>
                                ))}
                                {alerts.length === 0 && (
                                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full py-16">
                                        <ShieldAlert className="h-12 w-12 mb-4" />
                                        <p className="font-semibold">No alerts yet</p>
                                        <p className="text-sm">System is waiting for events.</p>
                                    </div>
                                )}
                             </div>
                         </ScrollArea>
                    </CardContent>
                    <CardFooter>
                         <Button variant="outline" className="w-full" disabled={alerts.length === 0}>Export Session Report</Button>
                    </CardFooter>
                </Card>
            </div>
        </main>
    );
}
