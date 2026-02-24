-- Initialize malware_reports table
CREATE TABLE IF NOT EXISTS malware_reports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    hash VARCHAR(64) UNIQUE NOT NULL,
    type VARCHAR(100),
    severity VARCHAR(50),
    status VARCHAR(50),
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_ip VARCHAR(45),
    file_path TEXT,
    description TEXT,
    iocs TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on hash for faster queries
CREATE INDEX IF NOT EXISTS idx_malware_hash ON malware_reports(hash);

-- Sample data
INSERT INTO malware_reports (name, hash, type, severity, status, detected_at, source_ip, file_path, description, iocs) VALUES
    ('trojan.win32.generic', 'a' || lpad('1'::text, 63, '0'), 'Trojan', 'HIGH', 'active', NOW(), '192.168.1.100', 'C:\Windows\System32\malware.exe', 'Generic Trojan detected', 'IP: 192.168.1.100, Domain: malware.com'),
    ('ransomware.cryptolocker', 'b' || lpad('2'::text, 63, '0'), 'Ransomware', 'CRITICAL', 'quarantined', NOW() - INTERVAL '2 days', '10.0.0.50', 'D:\Documents\payload.exe', 'CryptoLocker ransomware', 'IP: 10.0.0.50, File: C:\payload.exe'),
    ('worm.conficker', 'c' || lpad('3'::text, 63, '0'), 'Worm', 'MEDIUM', 'removed', NOW() - INTERVAL '7 days', '172.16.0.1', '/var/lib/malware', 'Conficker worm signature', 'IP: 172.16.0.1, Port: 4444')
ON CONFLICT (hash) DO NOTHING;

-- Initialize cases table
CREATE TABLE IF NOT EXISTS cases (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    priority VARCHAR(50) DEFAULT 'medium',
    description TEXT,
    analyst_assigned VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample cases data
INSERT INTO cases (title, status, priority, description, analyst_assigned) VALUES
    ('Suspicious Network Activity', 'open', 'high', 'Multiple failed login attempts detected on Domain Controller', 'John Smith'),
    ('Ransomware Detection', 'in_progress', 'critical', 'WannaCry variant detected on 5 workstations', 'Jane Doe'),
    ('Data Exfiltration Investigation', 'resolved', 'high', 'Investigated data transfer to external IP', 'Mike Johnson'),
    ('Malware Sample Analysis', 'closed', 'medium', 'Completed analysis of trojan.win32.generic', 'Sarah Williams')
ON CONFLICT DO NOTHING;

-- Initialize hosts table
CREATE TABLE IF NOT EXISTS hosts (
    id SERIAL PRIMARY KEY,
    hostname VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    os VARCHAR(100),
    status VARCHAR(50) DEFAULT 'online',
    risk_level VARCHAR(50),
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    alerts_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample hosts data
INSERT INTO hosts (hostname, ip_address, os, status, risk_level, last_seen, alerts_count) VALUES
    ('DESKTOP-USER01', '192.168.1.100', 'Windows 10', 'online', 'medium', NOW(), 3),
    ('SERVER-PROD', '10.0.0.50', 'Windows Server 2019', 'online', 'low', NOW(), 0),
    ('LAPTOP-MOBILE', '192.168.1.45', 'Windows 11', 'offline', 'low', NOW() - INTERVAL '2 hours', 1),
    ('WORKSTATION-DEV', '172.16.0.1', 'Ubuntu 22.04', 'compromised', 'critical', NOW() - INTERVAL '30 minutes', 15)
ON CONFLICT (hostname) DO NOTHING;

-- Initialize daily_reports table
CREATE TABLE IF NOT EXISTS daily_reports (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL UNIQUE,
    total_threats INTEGER DEFAULT 0,
    critical_count INTEGER DEFAULT 0,
    high_count INTEGER DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    low_count INTEGER DEFAULT 0,
    summary TEXT,
    file_path TEXT,
    generated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample daily reports data
INSERT INTO daily_reports (report_date, total_threats, critical_count, high_count, medium_count, low_count, summary, generated_by) VALUES
    (CURRENT_DATE, 15, 2, 5, 6, 2, 'Daily malware analysis report: 15 threats detected including 2 critical ransomware samples. 1 host compromised.', 'System'),
    (CURRENT_DATE - INTERVAL '1 day', 12, 1, 4, 5, 2, 'Daily malware analysis report: 12 threats detected. Network monitoring shows suspicious outbound traffic.', 'System'),
    (CURRENT_DATE - INTERVAL '2 days', 8, 0, 3, 4, 1, 'Daily malware analysis report: 8 threats detected. All threats quarantined successfully.', 'System'),
    (CURRENT_DATE - INTERVAL '3 days', 20, 3, 7, 8, 2, 'Daily malware analysis report: 20 threats detected including 3 critical variants. Investigation ongoing.', 'System')
ON CONFLICT (report_date) DO NOTHING;
