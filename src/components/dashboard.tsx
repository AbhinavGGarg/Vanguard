
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, Sector } from 'recharts';
import { FileWarning, ShieldCheck, ListTodo, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSimulation } from '@/context/simulation-context';
import type { SecurityEvent, CloudResource } from "@/ai/flows/types/simulate-attack-types";
import { useState } from "react";

const chartColors = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
];

const severityColors: Record<string, string> = {
    'Critical': 'hsl(var(--destructive))',
    'High': 'hsl(30, 90%, 55%)', // A vibrant orange for high
    'Medium': 'hsl(205, 80%, 55%)', // A clear blue for medium
    'Low': 'hsl(180, 75%, 45%)',    // A calm teal for low
}

const statusColors: Record<string, string> = {
    'Compromised': 'hsl(var(--destructive))',
    'Vulnerable': 'hsl(30, 90%, 55%)', // A vibrant orange for vulnerable
    'Investigating': 'hsl(205, 80%, 55%)', // A clear blue for investigating
    'Protected': 'hsl(180, 75%, 45%)',    // A reassuring teal for protected
}

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold text-lg">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))" className="text-sm">{`${value} Instances`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))" className="text-xs">
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


export function Dashboard() {
    const { data } = useSimulation();
    const [activeIndexSeverity, setActiveIndexSeverity] = useState(0);
    const [activeIndexStatus, setActiveIndexStatus] = useState(0);

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <AlertTriangle className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold">No Data to Display</h2>
                <p className="text-muted-foreground mt-2">Run a scenario in the Threat Sandbox to generate dashboard data.</p>
            </div>
        );
    }
    const { metrics, topEvents, topProcesses, analysis, events, affectedResources } = data;

    const formattedTopProcesses = topProcesses.map(item => ({ ...item, name: item.name.replace('.exe', '') }));

    const eventSeverityData = Object.entries(events.reduce((acc, event) => {
        acc[event.severity] = (acc[event.severity] || 0) + 1;
        return acc;
    }, {} as Record<SecurityEvent['severity'], number>))
    .map(([name, value]) => ({ name, value }))
    .sort((a,b) => b.value - a.value);

    const resourceStatusData = Object.entries(affectedResources.reduce((acc, resource) => {
        acc[resource.status] = (acc[resource.status] || 0) + 1;
        return acc;
    }, {} as Record<CloudResource['status'], number>))
    .map(([name, value]) => ({ name, value }))
    .sort((a,b) => b.value - a.value);

    const activeThreats = events.filter(e => e.status === 'Investigating' || e.status === 'Action Required').length;


    return (
        <main className="flex-1 p-4 md:p-6">
             <header className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Scenario Dashboard</h1>
                <p className="text-muted-foreground">
                    An overview of the security posture based on the last simulated attack.
                </p>
            </header>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                        <FileWarning className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{events.length.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Generated in this scenario</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeThreats}</div>
                         <p className="text-xs text-muted-foreground">Events requiring action</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Blocked Attacks</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.interactionResult?.attacksBlocked ?? 0}</div>
                         <p className="text-xs text-muted-foreground">Via tested countermeasure</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
                         <ListTodo className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analysis.riskScore}</div>
                        <p className="text-xs text-muted-foreground">Overall scenario risk</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 mt-4 grid-cols-1 lg:grid-cols-2">
                <Card>
                     <CardHeader>
                        <CardTitle>Top Security Events</CardTitle>
                        <CardDescription>Most frequent security events generated during the simulation.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                             <BarChart data={topEvents} layout="horizontal" margin={{ left: 10, right: 20, top: 5, bottom: 80 }}>
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} interval={0} />
                                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.3)' }} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}}/>
                                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={20}>
                                    {topEvents.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card>
                     <CardHeader>
                        <CardTitle>Top Running Processes</CardTitle>
                        <CardDescription>System processes with the highest activity.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={formattedTopProcesses} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 20 }}>
                               <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} interval={0} width={120} />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.3)' }} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}}/>
                                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                                     {formattedTopProcesses.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                 <Card>
                     <CardHeader>
                        <CardTitle>Event Severity Breakdown</CardTitle>
                        <CardDescription>Distribution of security event severity levels.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    activeIndex={activeIndexSeverity}
                                    activeShape={renderActiveShape}
                                    data={eventSeverityData} 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={70}
                                    outerRadius={90} 
                                    dataKey="value"
                                    onMouseEnter={(_, index) => setActiveIndexSeverity(index)}
                                >
                                     {eventSeverityData.map((entry) => (
                                        <Cell key={`cell-${entry.name}`} fill={severityColors[entry.name]} />
                                    ))}
                                </Pie>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card>
                     <CardHeader>
                        <CardTitle>Cloud Resource Status</CardTitle>
                        <CardDescription>Security status of all affected cloud resources.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    activeIndex={activeIndexStatus}
                                    activeShape={renderActiveShape}
                                    data={resourceStatusData} 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={70}
                                    outerRadius={90} 
                                    dataKey="value"
                                    onMouseEnter={(_, index) => setActiveIndexStatus(index)}
                                >
                                     {resourceStatusData.map((entry) => (
                                        <Cell key={`cell-${entry.name}`} fill={statusColors[entry.name]} />
                                    ))}
                                </Pie>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
             </div>

            <div className="grid gap-4 mt-4">
                 <Card className="col-span-1 lg:col-span-full">
                    <CardHeader>
                        <CardTitle>Threat Analysis</CardTitle>
                         <CardDescription>AI-generated analysis of the simulated attack.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                               <span className="text-sm font-medium">Overall Risk Score</span>
                               <span className="text-sm font-bold text-primary">{analysis.riskScore} / 100</span>
                            </div>
                            <Progress value={analysis.riskScore} aria-label={`${analysis.riskScore}% risk score`} />
                        </div>
                        <div className="prose prose-sm prose-invert max-w-none text-muted-foreground">
                            <h4 className="font-semibold text-foreground">Executive Summary</h4>
                            <p>{analysis.executiveSummary}</p>
                             <h4 className="font-semibold text-foreground mt-4">Technical Breakdown</h4>
                            <p>{analysis.technicalBreakdown}</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <div className="w-full">
                            <h4 className="font-semibold text-foreground mb-2">Recommended Actions</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                {analysis.recommendedActions.map((action, index) => (
                                    <li key={index}>{action}</li>
                                ))}
                            </ul>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </main>
    );
}
