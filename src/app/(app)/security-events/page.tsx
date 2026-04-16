'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageTransition } from '@/components/layout/page-transition';
import { useSimulation } from '@/context/simulation-context';

const fallbackEvents = [
  {
    id: 'EVT-1001',
    severity: 'High',
    timestamp: new Date().toISOString(),
    source: 'AWS CloudTrail',
    description: 'Unexpected IAM policy update from non-standard IP range.',
    status: 'Investigating',
  },
  {
    id: 'EVT-1002',
    severity: 'Critical',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    source: 'GCP Audit',
    description: 'Privilege escalation attempt detected on service account token.',
    status: 'Contained',
  },
  {
    id: 'EVT-1003',
    severity: 'Medium',
    timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    source: 'Azure Monitor',
    description: 'Anomalous outbound traffic pattern from compute workload.',
    status: 'Open',
  },
];

function severityVariant(severity: string): 'destructive' | 'secondary' | 'outline' {
  if (severity === 'Critical') return 'destructive';
  if (severity === 'High') return 'secondary';
  return 'outline';
}

export default function SecurityEventsPage() {
  const { data } = useSimulation();
  const [severityFilter, setSeverityFilter] = useState('all');
  const [query, setQuery] = useState('');

  const events = useMemo(() => {
    const sourceEvents =
      data?.events?.map((event) => ({
        id: event.id,
        severity: event.severity,
        timestamp: event.timestamp,
        source: 'Vanguard Simulation',
        description: event.description,
        status: event.status,
      })) ?? fallbackEvents;

    return sourceEvents.filter((event) => {
      const severityMatch = severityFilter === 'all' || event.severity === severityFilter;
      const queryMatch =
        event.description.toLowerCase().includes(query.toLowerCase()) ||
        event.id.toLowerCase().includes(query.toLowerCase()) ||
        event.source.toLowerCase().includes(query.toLowerCase());
      return severityMatch && queryMatch;
    });
  }, [data, query, severityFilter]);

  return (
    <PageTransition>
      <Card className="surface">
        <CardHeader>
          <CardTitle>Security Events</CardTitle>
          <CardDescription>Prioritized event stream with severity and source context.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[220px_1fr]">
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by event id, source, or description"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <motion.tr key={event.id} whileHover={{ backgroundColor: 'rgba(17, 24, 39, 0.6)' }} className="border-b border-border">
                    <TableCell>
                      <p className="font-medium">{event.id}</p>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={severityVariant(event.severity)}>{event.severity}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{event.source}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{event.status}</Badge>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
