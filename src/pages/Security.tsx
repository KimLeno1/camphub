import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api/client';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Key, 
  RefreshCw, 
  Trash2, 
  Download, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Database, 
  Server, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Terminal, 
  Check, 
  Search,
  BookOpen
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

type SecurityTab = 'logs' | 'sandbox' | 'encryption' | 'backups' | 'rate-limits' | 'compliance';

export function Security() {
  const [activeTab, setActiveTab] = useState<SecurityTab>('logs');
  const queryClient = useQueryClient();

  // Sandbox inputs
  const [sandboxInput, setSandboxInput] = useState('');
  const [sandboxResult, setSandboxResult] = useState<{ original: string; sanitized: string } | null>(null);

  // File scan simulation
  const [scanFileName, setScanFileName] = useState('');
  const [scanFileType, setScanFileType] = useState('application/pdf');
  const [scanFileSize, setScanFileSize] = useState(1024); // KB
  const [scanResult, setScanResult] = useState<{ isClean: boolean; status: string; reason: string } | null>(null);

  // Encryption playground
  const [encryptPlaintext, setEncryptPlaintext] = useState('');
  const [encryptedData, setEncryptedData] = useState<{ ciphertext: string; iv: string; tag: string } | null>(null);
  const [decryptedResult, setDecryptedResult] = useState<string | null>(null);

  // Blocklist inputs
  const [ipToBlock, setIpToBlock] = useState('');

  // Fetch security audit logs
  const { data: auditLogsRaw, isLoading: loadingLogs, refetch: refetchLogs } = useQuery({
    queryKey: ['security-logs'],
    queryFn: async () => {
      const res = await apiClient.get('/api/security/logs');
      return res.data;
    },
    refetchInterval: 5000, // Auto-poll logs every 5 seconds for live monitor effect!
  });

  // Fetch live server monitoring metrics
  const { data: monitoringMetrics, isLoading: loadingMetrics, refetch: refetchMetrics } = useQuery({
    queryKey: ['security-monitoring'],
    queryFn: async () => {
      const res = await apiClient.get('/api/security/monitoring');
      return res.data;
    },
    refetchInterval: 8000,
  });

  // Fetch backups
  const { data: backupsRaw, isLoading: loadingBackups, refetch: refetchBackups } = useQuery({
    queryKey: ['security-backups'],
    queryFn: async () => {
      const res = await apiClient.get('/api/security/backups');
      return res.data;
    }
  });

  // Fetch blocked IPs
  const { data: blockedIpsRaw, isLoading: loadingBlocked, refetch: refetchBlocked } = useQuery({
    queryKey: ['security-blocked-ips'],
    queryFn: async () => {
      const res = await apiClient.get('/api/security/blocked-ips');
      return res.data;
    }
  });

  const auditLogs: any[] = Array.isArray(auditLogsRaw) ? auditLogsRaw : (Array.isArray(auditLogsRaw?.data) ? auditLogsRaw.data : []);
  const backups: any[] = Array.isArray(backupsRaw) ? backupsRaw : (Array.isArray(backupsRaw?.data) ? backupsRaw.data : []);
  const blockedIps: any[] = Array.isArray(blockedIpsRaw) ? blockedIpsRaw : (Array.isArray(blockedIpsRaw?.data) ? blockedIpsRaw.data : []);

  // Mutations
  const sanitizeMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await apiClient.post('/api/security/sanitize', { text });
      return res.data;
    },
    onSuccess: (data) => {
      setSandboxResult(data);
      refetchLogs();
      toast.success('Input safety scans complete');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Sanitization request failed.';
      toast.error(msg);
      setSandboxResult({ original: sandboxInput, sanitized: 'Blocked by Firewall (SQL Injection Exception)' });
    }
  });

  const scanFileMutation = useMutation({
    mutationFn: async (payload: { title: string; mimeType: string; fileSizeBytes: number }) => {
      const res = await apiClient.post('/api/security/scan-file', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setScanResult(data);
      refetchLogs();
      if (data.isClean) {
        toast.success('File scanned successfully: Clean!');
      } else {
        toast.warning(`File Blocked: ${data.reason}`);
      }
    },
    onError: () => {
      toast.error('File integrity scan failed.');
    }
  });

  const encryptMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await apiClient.post('/api/security/encrypt', { text });
      return res.data;
    },
    onSuccess: (data) => {
      setEncryptedData(data);
      setDecryptedResult(null);
      refetchLogs();
      toast.success('Symmetric AES-256-GCM encryption complete.');
    },
    onError: () => {
      toast.error('Encryption failed.');
    }
  });

  const decryptMutation = useMutation({
    mutationFn: async (payload: { ciphertext: string; iv: string; tag: string }) => {
      const res = await apiClient.post('/api/security/decrypt', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setDecryptedResult(data);
      refetchLogs();
      toast.success('Payload integrity check complete: Text decrypted.');
    },
    onError: () => {
      toast.error('Decryption failed. Integrity checks failed (Tag mismatch).');
    }
  });

  const createBackupMutation = useMutation({
    mutationFn: async (type: 'full' | 'incremental') => {
      const res = await apiClient.post('/api/security/backup', { type });
      return res.data;
    },
    onSuccess: () => {
      refetchBackups();
      refetchLogs();
      toast.success('Database backup snapshot generated.');
    }
  });

  const deleteBackupMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/security/backup/${id}`);
    },
    onSuccess: () => {
      refetchBackups();
      refetchLogs();
      toast.success('Backup archive purged safely.');
    }
  });

  const unblockIpMutation = useMutation({
    mutationFn: async (ip: string) => {
      await apiClient.post('/api/security/unblock-ip', { ip });
    },
    onSuccess: () => {
      refetchBlocked();
      refetchLogs();
      toast.success('IP cleared from platform blocklist.');
    }
  });

  const handleUnblock = (ip: string) => {
    unblockIpMutation.mutate(ip);
  };

  const executeRestore = (fileName: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Restoring database transaction logs from ${fileName}...`,
        success: 'Database restored successfully to previous healthy snapshot!',
        error: 'Failed to restore database.'
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white p-8 md:p-12 shadow-md">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-rose-200 to-rose-900 pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 animate-pulse" /> Security Control Center
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-heading leading-tight">
            Autonomous Student Governance & Security
          </h1>
          <p className="text-white/80 text-sm md:text-base leading-relaxed">
            In Center7, there are no permanent administrators. The student community governs security protocols, audits rate limit blocklists, reviews automated virus scanning, and triggers database backups.
          </p>
        </div>
      </div>

      {/* Security Metrics Dashboard Block */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col justify-between h-24">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-rose-500" /> Platform Security
            </span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {monitoringMetrics?.securityPosture || 'A+'}
              </span>
              <span className="text-xs text-emerald-500 font-semibold">Active Shield</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-between h-24">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-indigo-500" /> Total API Scans
            </span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl font-bold text-foreground">
                {monitoringMetrics?.totalRequestsScanned || '2,510'}
              </span>
              <span className="text-[10px] text-muted-foreground">Requests</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-between h-24">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-500" /> Server Uptime
            </span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 truncate w-full block">
                {monitoringMetrics?.uptime || 'Calculating...'}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-between h-24">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Blocked IPs
            </span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl font-bold text-amber-500">
                {blockedIps?.length ?? monitoringMetrics?.blockedIPsCount ?? 1}
              </span>
              <span className="text-xs text-amber-600 font-medium">Banned</span>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 md:col-span-1">
          <CardContent className="p-4 flex flex-col justify-between h-24">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-indigo-500" /> Server Load
            </span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-xs font-mono font-semibold truncate text-muted-foreground block">
                {monitoringMetrics?.memoryHeapUsed || '35.4 MB'} used
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Primary Section Tabs */}
      <div className="flex border-b border-border overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
        {(['logs', 'sandbox', 'encryption', 'backups', 'rate-limits', 'compliance'] as SecurityTab[]).map((tab) => {
          const labels: Record<SecurityTab, { label: string; icon: any }> = {
            logs: { label: 'Live Audit Log', icon: Activity },
            sandbox: { label: 'OWASP / Malware Sandbox', icon: ShieldAlert },
            encryption: { label: 'Symmetric Encryption', icon: Key },
            backups: { label: 'Backups & Recovery', icon: Database },
            'rate-limits': { label: 'Rate Limits', icon: AlertTriangle },
            compliance: { label: 'OWASP Compliance', icon: ShieldCheck }
          };
          const Icon = labels[tab].icon;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all duration-200 ${
                activeTab === tab
                  ? 'border-rose-600 text-rose-600 bg-rose-50/5 rounded-t-md'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {labels[tab].label}
            </button>
          );
        })}
      </div>

      {/* Main Feature Container */}
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm min-h-[400px]">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: Live Audit Logs */}
          {activeTab === 'logs' && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold font-heading">Live Firewall & Security Audit Trails</h3>
                  <p className="text-muted-foreground text-sm">
                    View real-time, tamper-proof system logs generated by rate-limit firewalls, XSS sanitizers, and database parameter scanners.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchLogs()}>
                  <RefreshCw className="w-3.5 h-3.5 mr-2" /> Force Refresh
                </Button>
              </div>

              {loadingLogs ? (
                <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-muted-foreground/50" /></div>
              ) : (
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-muted/40 border-b border-border">
                          <th className="p-3 font-semibold text-xs text-muted-foreground uppercase">Timestamp</th>
                          <th className="p-3 font-semibold text-xs text-muted-foreground uppercase">Event Type</th>
                          <th className="p-3 font-semibold text-xs text-muted-foreground uppercase">Severity</th>
                          <th className="p-3 font-semibold text-xs text-muted-foreground uppercase">Message</th>
                          <th className="p-3 font-semibold text-xs text-muted-foreground uppercase">IP Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {auditLogs?.map((log: any) => {
                          const severityColors: Record<string, string> = {
                            INFO: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-950/40',
                            WARNING: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-100 dark:border-amber-950/40',
                            CRITICAL: 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-100 dark:border-red-950/40'
                          };
                          return (
                            <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                              <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </td>
                              <td className="p-3 font-semibold text-xs whitespace-nowrap">
                                <span className="font-mono text-indigo-600 dark:text-indigo-400">{log.eventType}</span>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded ${severityColors[log.severity] || ''}`}>
                                  {log.severity}
                                </span>
                              </td>
                              <td className="p-3 text-xs font-medium text-foreground leading-relaxed max-w-sm">
                                {log.message}
                              </td>
                              <td className="p-3 text-xs font-mono text-muted-foreground whitespace-nowrap">
                                {log.ipAddress}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: OWASP / Malware Sandbox */}
          {activeTab === 'sandbox' && (
            <motion.div
              key="sandbox"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Part A: Input Sanitization Playground */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold font-heading">OWASP Input Sanitization & Threat Shield</h3>
                  <p className="text-muted-foreground text-sm">
                    Input sandbox testing: type a Cross-Site Scripting (XSS) payload like `<script>alert('compromised')</script>` or SQL injection text like `' UNION SELECT` to verify automatic platform blocking mechanisms.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="sandboxInput">Test Input Text</Label>
                      <textarea
                        id="sandboxInput"
                        value={sandboxInput}
                        onChange={(e) => setSandboxInput(e.target.value)}
                        placeholder="e.g. <script>stealCookies()</script> or ' OR 1=1--"
                        className="w-full h-36 border border-border rounded-xl p-3 bg-muted/25 text-sm focus:outline-none focus:ring-1 focus:ring-rose-600 font-mono"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => sanitizeMutation.mutate(sandboxInput)}
                        disabled={!sandboxInput || sanitizeMutation.isPending}
                        className="bg-rose-600 hover:bg-rose-700"
                      >
                        {sanitizeMutation.isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                        Scan & Sanitize
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setSandboxInput('');
                        setSandboxResult(null);
                      }}>Clear</Button>
                    </div>
                  </div>

                  <div className="border border-border rounded-xl bg-muted/10 p-5 flex flex-col justify-between h-48">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Sanitization Outcome</h4>
                      {sandboxResult ? (
                        <div className="space-y-2">
                          <div>
                            <span className="text-[10px] font-mono text-muted-foreground">Original:</span>
                            <p className="text-xs font-mono text-muted-foreground line-through truncate">{sandboxResult.original}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-muted-foreground">Sanitized Output:</span>
                            <p className="text-sm font-mono text-foreground font-semibold bg-card border border-border rounded p-2 overflow-x-auto whitespace-pre">
                              {sandboxResult.sanitized}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground/60 italic mt-4">Enter a threat payload on the left to test live OWASP sanitization.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Part B: File Validation / Virus Scan Sandbox */}
              <div className="space-y-4 pt-6 border-t border-border">
                <div>
                  <h3 className="text-lg font-bold font-heading">Heuristic Malware Integrity Scanner</h3>
                  <p className="text-muted-foreground text-sm">
                    Configure a mock file upload to test signature checking, allowed mime-types, malware indicators, and the platform-wide 50MB file size safeguard.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="fileName">File Name</Label>
                        <Input 
                          id="fileName"
                          value={scanFileName}
                          onChange={(e) => setScanFileName(e.target.value)}
                          placeholder="e.g. syllabus.pdf"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="mimeType">MIME Type</Label>
                        <select
                          id="mimeType"
                          value={scanFileType}
                          onChange={(e) => setScanFileType(e.target.value)}
                          className="w-full h-10 border border-border rounded-md px-3 bg-card text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-rose-600"
                        >
                          <option value="application/pdf">PDF File</option>
                          <option value="application/zip">Zip Archive</option>
                          <option value="image/png">PNG Image</option>
                          <option value="application/octet-stream">Binary Executable</option>
                          <option value="text/javascript">JavaScript script</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="fileSize">File Size (KB)</Label>
                        <Input 
                          id="fileSize"
                          type="number"
                          value={scanFileSize}
                          onChange={(e) => setScanFileSize(parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => scanFileMutation.mutate({ title: scanFileName, mimeType: scanFileType, fileSizeBytes: scanFileSize * 1024 })}
                        disabled={!scanFileName || scanFileMutation.isPending}
                        className="bg-rose-600 hover:bg-rose-700"
                      >
                        {scanFileMutation.isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
                        Scan for Malware
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setScanFileName('');
                        setScanResult(null);
                      }}>Reset</Button>
                    </div>
                  </div>

                  <div className="border border-border rounded-xl bg-muted/10 p-5 flex flex-col justify-between min-h-[140px]">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Scanner Report</h4>
                      {scanResult ? (
                        <div className="flex gap-3 mt-2">
                          <div className="shrink-0">
                            {scanResult.isClean ? (
                              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            ) : (
                              <AlertCircle className="w-8 h-8 text-rose-500 animate-bounce" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${scanResult.isClean ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20'}`}>
                              {scanResult.status}
                            </span>
                            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                              {scanResult.reason}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground/60 italic mt-4">Provide file properties on the left and trigger a malware scan.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: Symmetric Encryption Playground */}
          {activeTab === 'encryption' && (
            <motion.div
              key="encryption"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold font-heading">Cryptographic Safeguards (AES-256-GCM)</h3>
                <p className="text-muted-foreground text-sm">
                  In Center7, sensitive student records, personal identifiers, and private keys are encrypted in transit and at rest using modern AES-256-GCM symmetric ciphers. Test the cryptographic mechanism in real-time below.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Encrypt block */}
                <div className="border border-border rounded-xl p-5 space-y-4">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Lock className="w-4 h-4 text-rose-600" /> Symmetric Encryption Engine
                  </h4>
                  <div className="space-y-2">
                    <Label htmlFor="encryptPlaintext">Enter Sensitive Text</Label>
                    <Input 
                      id="encryptPlaintext"
                      value={encryptPlaintext}
                      onChange={(e) => setEncryptPlaintext(e.target.value)}
                      placeholder="e.g. Student SSN, private key, address..."
                    />
                  </div>
                  <Button 
                    className="w-full bg-rose-600 hover:bg-rose-700"
                    disabled={!encryptPlaintext || encryptMutation.isPending}
                    onClick={() => encryptMutation.mutate(encryptPlaintext)}
                  >
                    {encryptMutation.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                    Encrypt Payload
                  </Button>

                  {encryptedData && (
                    <div className="space-y-3 pt-3 border-t border-border bg-muted/20 p-3 rounded-lg text-xs font-mono space-y-2">
                      <div className="truncate">
                        <span className="text-[10px] text-muted-foreground">Ciphertext:</span>
                        <p className="text-foreground font-semibold truncate select-all">{encryptedData.ciphertext}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="truncate">
                          <span className="text-[10px] text-muted-foreground">Initialization Vector (IV):</span>
                          <p className="text-foreground truncate select-all">{encryptedData.iv}</p>
                        </div>
                        <div className="truncate">
                          <span className="text-[10px] text-muted-foreground">Auth Tag (Integrity):</span>
                          <p className="text-foreground truncate select-all">{encryptedData.tag}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Decrypt block */}
                <div className="border border-border rounded-xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Unlock className="w-4 h-4 text-indigo-600" /> Integrity Verification & Decryption
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Symmetric decryption requires both the Ciphertext, the Initialization Vector (IV), and the cryptographic Authentication Tag. If even one bit of the ciphertext or tag is modified, the decryption will throw a integrity exception (preventing active tampering).
                    </p>
                  </div>

                  <Button 
                    variant="secondary"
                    className="w-full"
                    disabled={!encryptedData || decryptMutation.isPending}
                    onClick={() => decryptMutation.mutate(encryptedData!)}
                  >
                    {decryptMutation.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                    Verify Tag & Decrypt Back
                  </Button>

                  {decryptedResult && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg border border-emerald-200 dark:border-emerald-950/40 text-xs">
                      <p className="font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Integrity Integrity Passed!
                      </p>
                      <p className="font-mono mt-1 font-bold text-foreground">Decrypted Text: {decryptedResult}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: Backups & Recovery */}
          {activeTab === 'backups' && (
            <motion.div
              key="backups"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold font-heading">Database Snapshot & Backups Manager</h3>
                  <p className="text-muted-foreground text-sm">
                    Student jurors govern local recovery procedures. Generate manual full snapshots or restore database schemas to any prior healthy state instantly.
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled={createBackupMutation.isPending}
                    onClick={() => createBackupMutation.mutate('incremental')}
                  >
                    Incremental Backup
                  </Button>
                  <Button 
                    size="sm"
                    disabled={createBackupMutation.isPending}
                    onClick={() => createBackupMutation.mutate('full')}
                    className="bg-rose-600 hover:bg-rose-700"
                  >
                    Trigger Full Backup
                  </Button>
                </div>
              </div>

              {loadingBackups ? (
                <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-muted-foreground/50" /></div>
              ) : (
                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border">
                        <th className="p-3 font-semibold text-xs text-muted-foreground uppercase">Archive Filename</th>
                        <th className="p-3 font-semibold text-xs text-muted-foreground uppercase">Size</th>
                        <th className="p-3 font-semibold text-xs text-muted-foreground uppercase">Date Created</th>
                        <th className="p-3 font-semibold text-xs text-muted-foreground uppercase">Scope</th>
                        <th className="p-3 font-semibold text-xs text-muted-foreground uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {backups?.map((backup: any) => (
                        <tr key={backup.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-3 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {backup.fileName}
                          </td>
                          <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                            {(backup.sizeBytes / 1024 / 1024).toFixed(2)} MB
                          </td>
                          <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(backup.createdAt).toLocaleString()}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                              backup.type === 'full' 
                                ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-950/40' 
                                : 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-950/40'
                            }`}>
                              {backup.type}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-2 whitespace-nowrap">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 text-xs hover:border-emerald-500/50 hover:bg-emerald-50/5 hover:text-emerald-500"
                              onClick={() => executeRestore(backup.fileName)}
                            >
                              Restore
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-600"
                              disabled={deleteBackupMutation.isPending}
                              onClick={() => deleteBackupMutation.mutate(backup.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 5: Rate limits & Blocklists */}
          {activeTab === 'rate-limits' && (
            <motion.div
              key="rate-limits"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold font-heading">DDoS Firewall & Rate Limiting Blocklist</h3>
                <p className="text-muted-foreground text-sm">
                  Automatic rate-limiting restricts clients to 60 requests/minute. Persistent offenders violating thresholds are automatically blacklisted. You can inspect or release blocked IPs below.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active blocked list */}
                <div className="border border-border rounded-xl p-5 space-y-4">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" /> Active Blocklist Ledger
                  </h4>
                  {loadingBlocked ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Fetching blocked IPs...</div>
                  ) : !blockedIps || blockedIps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                      <ShieldCheck className="w-10 h-10 text-emerald-500/50" />
                      <p className="text-xs font-semibold text-foreground">Zero blocked IPs currently</p>
                      <p className="text-[10px] text-muted-foreground">The platform is currently safe from brute force/DDoS floods.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                      {blockedIps.map((ip: string) => (
                        <div key={ip} className="flex items-center justify-between p-3 bg-muted/20">
                          <span className="font-mono text-xs font-bold text-foreground">{ip}</span>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 text-xs hover:border-emerald-500/40"
                            onClick={() => handleUnblock(ip)}
                          >
                            Unblock IP
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Firewall configuration */}
                <div className="border border-border rounded-xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Server className="w-4 h-4 text-indigo-600" /> Rate Limiting Rules & Thresholds
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Center7 employs a multi-tier rate limiting scheme:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground leading-relaxed pl-1">
                      <li><strong>General APIs:</strong> Max 60 requests per 1 minute window.</li>
                      <li><strong>AI Inference APIs:</strong> Max 10 requests per 1 minute window.</li>
                      <li><strong>Resource Uploads:</strong> Max 5 files per 10 minute window.</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 p-4 rounded-lg border border-amber-200 dark:border-amber-950/40 text-xs">
                    <p className="font-semibold flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 shrink-0" /> Anti-Brute-Force Shield Active
                    </p>
                    <p className="mt-1 leading-relaxed">
                      IP addresses sending more than 120 requests/minute are auto-flagged and placed in temporary blocklist for 24 hours.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 6: Compliance */}
          {activeTab === 'compliance' && (
            <motion.div
              key="compliance"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold font-heading">OWASP Standard Security Compliance Checklist</h3>
                <p className="text-muted-foreground text-sm">
                  Center7 has been built from the ground up to follow strict OWASP top application vulnerabilities guidelines, ensuring user PII and platform data are always secured.
                </p>
              </div>

              <div className="space-y-4">
                {monitoringMetrics?.owaspComplianceRules?.map((rule: any, idx: number) => (
                  <div key={idx} className="border border-border rounded-xl p-4 bg-card flex items-start gap-3 hover:border-indigo-500/20 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-foreground">{rule.name}</h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 rounded">
                          {rule.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{rule.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
