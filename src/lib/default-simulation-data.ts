
import type { ModelAttackScenarioOutput } from '@/ai/flows/types/simulate-attack-types';

export const defaultAttackData: ModelAttackScenarioOutput = {
    analysis: {
        executiveSummary: "A simulated High-Volume HTTP Flood DDoS attack was detected targeting critical web services. The system successfully mitigated the majority of malicious requests, but the event highlights a need to review and enhance rate-limiting and traffic shaping policies to prevent potential service degradation during a more sophisticated attack.",
        technicalBreakdown: "The attack originated from a distributed network of bots, primarily using GET requests with randomized user agents to bypass basic caching layers. Peak traffic reached over 500,000 requests per minute. Key indicators included a sharp increase in HTTP 503 errors and elevated CPU utilization on web-facing instances. IOCs include the top 5 source IP ranges identified.",
        riskScore: 82,
        recommendedActions: [
            "Implement adaptive rate-limiting on edge load balancers based on IP reputation and request patterns.",
            "Refine WAF rules to more aggressively block traffic with suspicious user-agent strings.",
            "Place the top attacking IP addresses on a temporary blocklist and monitor for further activity.",
            "Review autoscaling group configurations to ensure rapid scaling response to CPU pressure."
        ],
        suggestedCountermeasure: ""
    },
    events: [
        { id: "EVT-001", timestamp: "2024-07-29 14:30:15", severity: "High", description: "Anomalous spike in inbound HTTP traffic detected on web-lb-01.", status: "Investigating" },
        { id: "EVT-002", timestamp: "2024-07-29 14:30:45", severity: "Medium", description: "CPU utilization for web-app-group exceeds 80% threshold.", status: "Action Required" },
        { id: "EVT-003", timestamp: "2024-07-29 14:31:02", severity: "High", description: "WAF rule 'DDoS-HTTP-Flood-L7' triggered by source IP 198.51.100.15.", status: "Action Required" },
        { id: "EVT-004", timestamp: "2024-07-29 14:31:19", severity: "Critical", description: "Web server web-app-1 unresponsive to health checks.", status: "Investigating" },
        { id: "EVT-005", timestamp: "2024-07-29 14:31:35", severity: "Low", description: "Autoscaling event triggered: Added 2 new instances to web-app-group.", status: "Investigating" },
        { id: "EVT-006", timestamp: "2024-07-29 14:32:01", severity: "High", description: "Multiple 503 Service Unavailable errors reported by end-user monitoring.", status: "Investigating" },
        { id: "EVT-007", timestamp: "2024-07-29 14:32:25", severity: "Medium", description: "Suspicious user agent 'Mozilla/5.0 (compatible; MegaBot/1.0)' blocked.", status: "Investigating" },
        { id: "EVT-008", timestamp: "2024-07-29 14:32:50", severity: "High", description: "WAF rule 'DDoS-HTTP-Flood-L7' triggered by source IP 203.0.113.22.", status: "Investigating" },
        { id: "EVT-009", timestamp: "2024-07-29 14:33:10", severity: "Low", description: "Network ACLs updated to temporarily block /24 range for known botnet.", status: "Action Required" },
        { id: "EVT-010", timestamp: "2024-07-29 14:33:45", severity: "Medium", description: "Failover to secondary CDN initiated for static assets.", status: "Action Required" },
        { id: "EVT-011", timestamp: "2024-07-29 14:34:05", severity: "Critical", description: "Database connection pool saturation detected.", status: "Investigating" },
        { id: "EVT-012", timestamp: "2024-07-29 14:34:33", severity: "High", description: "WAF rule 'DDoS-HTTP-Flood-L7' triggered by source IP 192.0.2.88.", status: "Investigating" },
        { id: "EVT-013", timestamp: "2024-07-29 14:35:01", severity: "Medium", description: "API gateway latency exceeds 2000ms.", status: "Investigating" },
        { id: "EVT-014", timestamp: "2024-07-29 14:35:28", severity: "Low", description: "Web server web-app-1 restored and passing health checks.", status: "Action Required" },
        { id: "EVT-015", timestamp: "2024-07-29 14:36:00", severity: "High", description: "Traffic volume from identified botnet IPs has decreased by 40%.", status: "Investigating" },
        { id: "EVT-016", timestamp: "2024-07-29 14:36:30", severity: "High", description: "WAF rule 'DDoS-HTTP-Flood-L7' triggered by source IP 198.51.100.40.", status: "Investigating" },
        { id: "EVT-017", timestamp: "2024-07-29 14:37:05", severity: "Medium", description: "CPU utilization for web-app-group returned to normal levels (< 50%).", status: "Action Required" },
        { id: "EVT-018", timestamp: "2024-07-29 14:37:40", severity: "High", description: "WAF rule 'DDoS-HTTP-Flood-L7' triggered by source IP 203.0.113.99.", status: "Investigating" },
        { id: "EVT-019", timestamp: "2024-07-29 14:38:15", severity: "Low", description: "Overall incident severity downgraded from Critical to High.", status: "Action Required" },
        { id: "EVT-020", timestamp: "2024-07-29 14:40:00", severity: "Low", description: "Inbound HTTP traffic has returned to baseline levels.", status: "Action Required" },
    ],
    metrics: {
        totalEvents: 31452,
        activeThreats: 68,
        blockedAttacks: 0,
        detectionAccuracy: "99.2%"
    },
    affectedResources: [
        { name: "production-web-load-balancer", resourceId: "arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/pro-web-lb/50dc6c495c0c9188", provider: "AWS", service: "Elastic Load Balancer", region: "us-east-1", status: "Investigating", reasonForStatus: "Experiencing extreme traffic volume, leading to intermittent 5xx errors." },
        { name: "webapp-prod-asg", resourceId: "asg-01a2b3c4d5e6f7g8h", provider: "AWS", service: "EC2 Auto Scaling Group", region: "us-east-1", status: "Vulnerable", reasonForStatus: "Scaling policies were too slow to respond to the initial traffic surge." },
        { name: "customer-api-gateway", resourceId: "gw-ag-123456", provider: "AWS", service: "API Gateway", region: "us-east-1", status: "Protected", reasonForStatus: "Throttling rules successfully limited impact on downstream services." },
        { name: "rds-main-cluster", resourceId: "db-ABC123DEF456", provider: "AWS", service: "RDS Aurora", region: "us-east-1", status: "Compromised", reasonForStatus: "High connection count from web instances caused connection pool exhaustion." },
        { name: "cdn-assets-distribution", resourceId: "E12345ABCDEF67", provider: "AWS", service: "CloudFront", region: "us-east-1", status: "Protected", reasonForStatus: "Cache-hit ratio remained high, absorbing much of the DDoS traffic for static assets." },
    ],
    topProcesses: [
        { name: "nginx.exe", count: 18432 },
        { name: "waf_agent.exe", count: 9872 },
        { name: "kernel_task", count: 7654 },
        { name: "systemd", count: 6543 },
        { name: "node.exe", count: 5432 },
        { name: "svchost.exe", count: 4321 },
        { name: "db_worker.exe", count: 3210 },
        { name: "metric_agent.exe", count: 2109 },
        { name: "python3.exe", count: 1598 },
        { name: "sshd.exe", count: 987 },
    ],
    topEvents: [
        { name: "waf_block.exe", count: 9872 },
        { name: "http_request.exe", count: 8765 },
        { name: "cpu_spike.exe", count: 6543 },
        { name: "health_check_fail.exe", count: 5432 },
        { name: "conn_limit.exe", count: 4321 },
        { name: "scaling_event.exe", count: 3210 },
        { name: "firewall_deny.exe", count: 2109 },
        { name: "latency_alert.exe", count: 1598 },
        { name: "auth_failure.exe", count: 987 },
        { name: "rate_limit.exe", count: 876 },
    ],
};
