
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAlerts } from '@/context/alert-context';
import { Info, BarChart3, PieChart, List } from 'lucide-react';

export function AlertsDashboard() {
    const { alerts } = useAlerts();

    // In a real app, you would have more sophisticated charting and data aggregation.
    const alertCounts = alerts.reduce((acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Alerts Dashboard</h1>
                    <p className="text-muted-foreground">
                        Aggregate view of all security incidents and trends.
                    </p>
                </div>
                <Button disabled>Export Full History</Button>
            </header>

            {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center gap-4 h-96 border-dashed border-2 rounded-lg">
                    <Info className="h-12 w-12 text-muted-foreground"/>
                    <h3 className="text-xl font-semibold">No Data to Display</h3>
                    <p className="text-muted-foreground">Run a monitoring session on the Live Feed page to generate alerts.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
                             <List className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{alerts.length}</div>
                            <p className="text-xs text-muted-foreground">from the last session</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Verbal Alerts</CardTitle>
                             <List className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{alertCounts['Verbal'] || 0}</div>
                             <p className="text-xs text-muted-foreground">bullying/aggression</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Object Alerts</CardTitle>
                             <List className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{alertCounts['Object'] || 0}</div>
                            <p className="text-xs text-muted-foreground">unauthorized items</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Sound Alerts</CardTitle>
                             <List className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{alertCounts['Sound'] || 0}</div>
                             <p className="text-xs text-muted-foreground">loud noises/breaks</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="col-span-1 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-muted-foreground"/>
                                Alerts Over Time
                            </CardTitle>
                            <CardDescription>This chart would show the distribution of alerts throughout the session.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64 flex items-center justify-center text-muted-foreground bg-muted/50 rounded-b-lg">
                            [Chart Placeholder]
                        </CardContent>
                    </Card>
                    <Card className="col-span-1 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PieChart className="h-5 w-5 text-muted-foreground"/>
                                Alert Severity Breakdown
                            </CardTitle>
                             <CardDescription>A breakdown of alerts by their assigned severity level.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64 flex items-center justify-center text-muted-foreground bg-muted/50 rounded-b-lg">
                           [Chart Placeholder]
                        </CardContent>
                    </Card>
                </div>
            )}
        </main>
    );
}
