export enum MailStatus {
  Sent = 'sent',
  Bounced = 'bounced',
  Deferred = 'deferred',
  Rejected = 'rejected',
}

export interface MailLog {
  id: string;
  timestamp: string;
  from: string;
  to: string;
  status: MailStatus;
  detail: string;
}

export interface MailVolumeData {
  date: string;
  sent: number;
  bounced: number;
  deferred: number;
}

export interface RecentActivity {
  id: string;
  timestamp: string;
  type: 'security' | 'config' | 'system';
  description: string;
}

export interface AILogAnalysisStatistics {
  totalMessages: string;
  successRate: string;
  bounceRate: string;
  deferredRate: string;
  topSenderDomains: string[];
  topRecipientDomains: string[];
  peakActivityTime: string;
}

export interface AILogAnalysisResult {
  summary: string;
  anomalies: string[];
  threats: string[];
  errors: string[];
  statistics?: AILogAnalysisStatistics;
  recommendations?: string[];
}

export interface MailStats {
  total: number;
  sent: number;
  bounced: number;
  deferred: number;
  rejected: number;
}

export interface LogFilter {
  startDate?: string;
  endDate?: string;
  status?: MailStatus | 'all';
  limit?: number;
  page?: number;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: PaginationInfo;
}

// Analytics Types
export interface TopSender {
  email: string;
  totalMessages: number;
  sent: number;
  bounced: number;
  deferred: number;
  rejected: number;
  successRate: string;
  firstSeen: string;
  lastSeen: string;
  relayIPs: string[];
}

export interface TopRecipient {
  email: string;
  totalMessages: number;
  sent: number;
  bounced: number;
  deferred: number;
  rejected: number;
  deliveryRate: string;
  firstSeen: string;
  lastSeen: string;
  relayIPs: string[];
}

export interface ConnectedIP {
  ip: string;
  connections: number;
  totalMessages: number;
  sent: number;
  bounced: number;
  deferred: number;
  rejected: number;
  successRate: string;
  hostnames: string[];
  firstSeen: string;
  lastSeen: string;
  isLocal: boolean;
}

export interface AnalyticsSummary {
  uniqueSenders: number;
  uniqueRecipients: number;
  uniqueIPs: number;
  senderDomains: number;
  recipientDomains: number;
  totalMessages: number;
  dateRange: {
    start: string;
    end: string;
  };
}