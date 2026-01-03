import React, { useState, useEffect, useCallback } from 'react';
import { TopSender, TopRecipient, ConnectedIP, AnalyticsSummary } from '../types';
import apiService, { ApiError } from '../services/apiService';
import {
  ChartBarIcon,
  ArrowDownTrayIcon,
  UserGroupIcon,
  GlobeAltIcon,
} from './icons/IconComponents';
import { getLastNDaysRange } from '../utils/dateUtils';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  type TooltipProps,
  type PieLabelRenderProps,
} from 'recharts';

type SenderChartDatum = {
  name: string;
  fullName: string;
  total: number;
  sent: number;
  bounced: number;
  deferred: number;
  successRate: number;
};

type RecipientChartDatum = {
  name: string;
  fullName: string;
  total: number;
  sent: number;
  bounced: number;
  deferred: number;
  deliveryRate: number;
};

type IpChartDatum = {
  name: string;
  connections: number;
  messages: number;
  sent: number;
  successRate: number;
};

type ChartDatum = SenderChartDatum | RecipientChartDatum | IpChartDatum;

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'senders' | 'recipients' | 'ips'>('senders');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'pie' | 'radar'>('bar');
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [topSenders, setTopSenders] = useState<TopSender[]>([]);
  const [topRecipients, setTopRecipients] = useState<TopRecipient[]>([]);
  const [connectedIPs, setConnectedIPs] = useState<ConnectedIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const defaultRange = getLastNDaysRange(7);
  const [filter, setFilter] = useState<{ startDate: string; endDate: string }>(defaultRange);
  const [limit, setLimit] = useState(50);

  const COLORS = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
  ];

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query = {
        startDate: filter.startDate,
        endDate: filter.endDate,
        limit: limit.toString(),
      };

      const [summaryData, sendersData, recipientsData, ipsData] = await Promise.all([
        apiService.get<AnalyticsSummary>('/api/analytics/summary', query),
        apiService.get<{ total: number; data: TopSender[] }>('/api/analytics/top-senders', query),
        apiService.get<{ total: number; data: TopRecipient[] }>(
          '/api/analytics/top-recipients',
          query,
        ),
        apiService.get<{ total: number; data: ConnectedIP[] }>(
          '/api/analytics/connected-ips',
          query,
        ),
      ]);

      setSummary(summaryData);
      setTopSenders(sendersData.data);
      setTopRecipients(recipientsData.data);
      setConnectedIPs(ipsData.data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch analytics data.');
      }
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, limit]);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleApplyFilter = () => {
    void fetchAnalytics();
  };

  const handleQuickFilter = (days: number) => {
    const newFilter = getLastNDaysRange(days);
    setFilter(newFilter);
    void fetchAnalytics();
  };

  const exportToCSV = <T extends object>(data: T[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]) as Array<keyof T>;
    const rows = data
      .map((item) =>
        headers
          .map((header) => {
            const value = item[header] as unknown;
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value);
            if (typeof value === 'symbol') return value.toString();
            if (typeof value === 'function') return '';
            if (typeof value === 'bigint') return value.toString();
            if (
              typeof value === 'string' ||
              typeof value === 'number' ||
              typeof value === 'boolean'
            ) {
              return String(value);
            }
            return JSON.stringify(value);
          })
          .join(','),
      )
      .join('\n');
    const csv = `${headers.join(',')}\n${rows}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${filter.startDate}_to_${filter.endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getChartData = (): ChartDatum[] => {
    if (activeTab === 'senders') {
      return topSenders.slice(0, 10).map((s) => ({
        name: s.email.split('@')[0],
        fullName: s.email,
        total: s.totalMessages,
        sent: s.sent,
        bounced: s.bounced,
        deferred: s.deferred,
        successRate: parseFloat(s.successRate),
      }));
    } else if (activeTab === 'recipients') {
      return topRecipients.slice(0, 10).map((r) => ({
        name: r.email.split('@')[0],
        fullName: r.email,
        total: r.totalMessages,
        sent: r.sent,
        bounced: r.bounced,
        deferred: r.deferred,
        deliveryRate: parseFloat(r.deliveryRate),
      }));
    } else {
      return connectedIPs.slice(0, 10).map((ip) => ({
        name: ip.ip,
        connections: ip.connections,
        messages: ip.totalMessages,
        sent: ip.sent,
        successRate: parseFloat(ip.successRate),
      }));
    }
  };

  const getPieChartData = () => {
    const data = getChartData();
    return data.map((item) => ({
      name: item.name,
      value: 'total' in item ? item.total : 'messages' in item ? item.messages : 0,
    }));
  };

  const getRadarChartData = () => {
    const data = getChartData().slice(0, 6);
    return data.map((item) => ({
      subject: item.name,
      sent: 'sent' in item ? item.sent : 0,
      bounced: 'bounced' in item ? item.bounced : 0,
      deferred: 'deferred' in item ? item.deferred : 0,
    }));
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-lg">
          <p className="text-gray-200 font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => {
            if (!entry) return null;
            const displayValue =
              typeof entry.value === 'number' ? entry.value : Number(entry.value);
            return (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: {Number.isFinite(displayValue) ? displayValue.toLocaleString() : ''}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const data = getChartData();

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={data} margin={{ bottom: 80, left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
              <XAxis
                dataKey="name"
                stroke="#9ca3af"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {activeTab === 'ips' ? (
                <>
                  <Bar
                    dataKey="connections"
                    fill="#3b82f6"
                    name="Connections"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar dataKey="messages" fill="#10b981" name="Messages" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="sent" fill="#f59e0b" name="Sent" radius={[8, 8, 0, 0]} />
                </>
              ) : (
                <>
                  <Bar dataKey="total" fill="#3b82f6" name="Total" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="sent" fill="#10b981" name="Sent" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="bounced" fill="#ef4444" name="Bounced" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="deferred" fill="#f59e0b" name="Deferred" radius={[8, 8, 0, 0]} />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={450}>
            <LineChart data={data} margin={{ bottom: 80, left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
              <XAxis
                dataKey="name"
                stroke="#9ca3af"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {activeTab === 'ips' ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="connections"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Connections"
                  />
                  <Line
                    type="monotone"
                    dataKey="messages"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Messages"
                  />
                  <Line
                    type="monotone"
                    dataKey="sent"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    name="Sent"
                  />
                </>
              ) : (
                <>
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Total"
                  />
                  <Line
                    type="monotone"
                    dataKey="sent"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Sent"
                  />
                  <Line
                    type="monotone"
                    dataKey="bounced"
                    stroke="#ef4444"
                    strokeWidth={3}
                    name="Bounced"
                  />
                  <Line
                    type="monotone"
                    dataKey="deferred"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    name="Deferred"
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={450}>
            <AreaChart data={data} margin={{ bottom: 80, left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
              <XAxis
                dataKey="name"
                stroke="#9ca3af"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {activeTab === 'ips' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="connections"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Connections"
                  />
                  <Area
                    type="monotone"
                    dataKey="messages"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Messages"
                  />
                </>
              ) : (
                <>
                  <Area
                    type="monotone"
                    dataKey="sent"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Sent"
                  />
                  <Area
                    type="monotone"
                    dataKey="bounced"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                    name="Bounced"
                  />
                  <Area
                    type="monotone"
                    dataKey="deferred"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.6}
                    name="Deferred"
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie': {
        const pieData = getPieChartData();
        const renderCustomLabel = ({ name, percent }: PieLabelRenderProps) => {
          if (typeof percent !== 'number' || percent <= 0.03) return '';
          const percentValue = (percent * 100).toFixed(1);
          return `${name}: ${percentValue}%`;
        };

        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={{ stroke: '#666', strokeWidth: 1 }}
                label={renderCustomLabel}
                outerRadius={130}
                fill="#8884d8"
                dataKey="value"
                minAngle={2}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{ paddingLeft: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      }

      case 'radar': {
        const radarData = getRadarChartData();
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#444444" />
              <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
              <PolarRadiusAxis stroke="#9ca3af" />
              <Radar name="Sent" dataKey="sent" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Radar
                name="Bounced"
                dataKey="bounced"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
              />
              <Radar
                name="Deferred"
                dataKey="deferred"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.6}
              />
              <Legend />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold flex items-center">
            <ChartBarIcon className="w-7 h-7 mr-2 text-primary" />
            Mail Analytics
          </h2>
          <p className="text-gray-400 mt-1">
            Analyze top senders, recipients, and connected IP addresses
          </p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <h3 className="text-lg font-semibold text-gray-200">Date Range:</h3>
            <div>
              <label htmlFor="startDate" className="text-sm font-medium text-gray-400 mr-2">
                From
              </label>
              <input
                type="date"
                name="startDate"
                id="startDate"
                value={filter.startDate}
                onChange={handleFilterChange}
                className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="text-sm font-medium text-gray-400 mr-2">
                To
              </label>
              <input
                type="date"
                name="endDate"
                id="endDate"
                value={filter.endDate}
                onChange={handleFilterChange}
                className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:ring-primary focus:border-primary"
              />
            </div>
            <button
              onClick={handleApplyFilter}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
            >
              Apply
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleQuickFilter(1)}
              className="px-3 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors text-sm"
            >
              Today
            </button>
            <button
              onClick={() => handleQuickFilter(7)}
              className="px-3 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors text-sm"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handleQuickFilter(30)}
              className="px-3 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors text-sm"
            >
              Last 30 Days
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-400">
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin h-8 w-8 mr-3 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading analytics...
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-md">
          {error}
        </div>
      )}

      {!loading && !error && summary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              className="bg-gray-800 p-6 rounded-lg border border-gray-700 cursor-pointer hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all"
              onClick={() => setActiveTab('senders')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setActiveTab('senders')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 font-medium">Unique Senders</p>
                  <p className="text-3xl font-bold text-gray-100 mt-1">{summary.uniqueSenders}</p>
                  <p className="text-sm text-gray-500 mt-2">{summary.senderDomains} domains</p>
                </div>
                <UserGroupIcon className="w-12 h-12 text-primary opacity-50" />
              </div>
            </div>

            <div
              className="bg-gray-800 p-6 rounded-lg border border-gray-700 cursor-pointer hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all"
              onClick={() => setActiveTab('recipients')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setActiveTab('recipients')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 font-medium">Unique Recipients</p>
                  <p className="text-3xl font-bold text-gray-100 mt-1">
                    {summary.uniqueRecipients}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">{summary.recipientDomains} domains</p>
                </div>
                <UserGroupIcon className="w-12 h-12 text-success opacity-50" />
              </div>
            </div>

            <div
              className="bg-gray-800 p-6 rounded-lg border border-gray-700 cursor-pointer hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all"
              onClick={() => setActiveTab('ips')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setActiveTab('ips')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 font-medium">Connected IPs</p>
                  <p className="text-3xl font-bold text-gray-100 mt-1">{summary.uniqueIPs}</p>
                  <p className="text-sm text-gray-500 mt-2">unique addresses</p>
                </div>
                <GlobeAltIcon className="w-12 h-12 text-warning opacity-50" />
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 font-medium">Total Messages</p>
                  <p className="text-3xl font-bold text-gray-100 mt-1">
                    {summary.totalMessages.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">in period</p>
                </div>
                <ChartBarIcon className="w-12 h-12 text-danger opacity-50" />
              </div>
            </div>
          </div>

          {/* Chart with Type Selector */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
              <h3 className="text-xl font-semibold">Top 10 Overview</h3>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    chartType === 'bar'
                      ? 'bg-primary text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  📊 Bar
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    chartType === 'line'
                      ? 'bg-primary text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  📈 Line
                </button>
                <button
                  onClick={() => setChartType('area')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    chartType === 'area'
                      ? 'bg-primary text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  📉 Area
                </button>
                <button
                  onClick={() => setChartType('pie')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    chartType === 'pie'
                      ? 'bg-primary text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  🥧 Pie
                </button>
                <button
                  onClick={() => setChartType('radar')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    chartType === 'radar'
                      ? 'bg-primary text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  🎯 Radar
                </button>
              </div>
            </div>
            {renderChart()}
          </div>

          {/* Tabs */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="border-b border-gray-700">
              <div className="flex flex-wrap">
                <button
                  onClick={() => setActiveTab('senders')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === 'senders'
                      ? 'text-primary border-b-2 border-primary bg-gray-700/50'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
                  }`}
                >
                  Top Senders ({topSenders.length})
                </button>
                <button
                  onClick={() => setActiveTab('recipients')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === 'recipients'
                      ? 'text-primary border-b-2 border-primary bg-gray-700/50'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
                  }`}
                >
                  Top Recipients ({topRecipients.length})
                </button>
                <button
                  onClick={() => setActiveTab('ips')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === 'ips'
                      ? 'text-primary border-b-2 border-primary bg-gray-700/50'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
                  }`}
                >
                  Connected IPs ({connectedIPs.length})
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm text-gray-400">
                    Show:
                    <select
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      className="ml-2 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-200"
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                    </select>
                  </label>
                </div>
                <button
                  onClick={() => {
                    if (activeTab === 'senders') exportToCSV(topSenders, 'top_senders');
                    else if (activeTab === 'recipients')
                      exportToCSV(topRecipients, 'top_recipients');
                    else exportToCSV(connectedIPs, 'connected_ips');
                  }}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
                >
                  <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                  Export CSV
                </button>
              </div>

              {/* Top Senders Table */}
              {activeTab === 'senders' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left">#</th>
                        <th className="px-4 py-3 text-left">Email</th>
                        <th className="px-4 py-3 text-left">Source/Relay IP(s)</th>
                        <th className="px-4 py-3 text-right">Total</th>
                        <th className="px-4 py-3 text-right">Sent</th>
                        <th className="px-4 py-3 text-right">Bounced</th>
                        <th className="px-4 py-3 text-right">Deferred</th>
                        <th className="px-4 py-3 text-right">Success Rate</th>
                        <th className="px-4 py-3 text-left">Last Seen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topSenders.map((sender, index) => (
                        <tr
                          key={sender.email}
                          className="border-b border-gray-700 hover:bg-gray-700/30"
                        >
                          <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                          <td className="px-4 py-3 font-mono text-sm">{sender.email}</td>
                          <td className="px-4 py-3 text-sm max-w-xs">
                            {sender.relayIPs && sender.relayIPs.length > 0 ? (
                              <div className="space-y-1">
                                {sender.relayIPs.map((ip, idx) => (
                                  <div
                                    key={idx}
                                    className="font-mono text-xs bg-gray-900/50 px-2 py-1 rounded inline-block mr-1"
                                  >
                                    {ip}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            {sender.totalMessages}
                          </td>
                          <td className="px-4 py-3 text-right text-green-400">{sender.sent}</td>
                          <td className="px-4 py-3 text-right text-red-400">{sender.bounced}</td>
                          <td className="px-4 py-3 text-right text-yellow-400">
                            {sender.deferred}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`px-2 py-1 rounded ${
                                parseFloat(sender.successRate) >= 90
                                  ? 'bg-green-500/20 text-green-400'
                                  : parseFloat(sender.successRate) >= 70
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {sender.successRate}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">
                            {new Date(sender.lastSeen).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Top Recipients Table */}
              {activeTab === 'recipients' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left">#</th>
                        <th className="px-4 py-3 text-left">Email</th>
                        <th className="px-4 py-3 text-left">Source/Relay IP(s)</th>
                        <th className="px-4 py-3 text-right">Total</th>
                        <th className="px-4 py-3 text-right">Delivered</th>
                        <th className="px-4 py-3 text-right">Bounced</th>
                        <th className="px-4 py-3 text-right">Deferred</th>
                        <th className="px-4 py-3 text-right">Delivery Rate</th>
                        <th className="px-4 py-3 text-left">Last Seen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topRecipients.map((recipient, index) => (
                        <tr
                          key={recipient.email}
                          className="border-b border-gray-700 hover:bg-gray-700/30"
                        >
                          <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                          <td className="px-4 py-3 font-mono text-sm">{recipient.email}</td>
                          <td className="px-4 py-3 text-sm max-w-xs">
                            {recipient.relayIPs && recipient.relayIPs.length > 0 ? (
                              <div className="space-y-1">
                                {recipient.relayIPs.map((ip, idx) => (
                                  <div
                                    key={idx}
                                    className="font-mono text-xs bg-gray-900/50 px-2 py-1 rounded inline-block mr-1"
                                  >
                                    {ip}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            {recipient.totalMessages}
                          </td>
                          <td className="px-4 py-3 text-right text-green-400">{recipient.sent}</td>
                          <td className="px-4 py-3 text-right text-red-400">{recipient.bounced}</td>
                          <td className="px-4 py-3 text-right text-yellow-400">
                            {recipient.deferred}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`px-2 py-1 rounded ${
                                parseFloat(recipient.deliveryRate) >= 90
                                  ? 'bg-green-500/20 text-green-400'
                                  : parseFloat(recipient.deliveryRate) >= 70
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {recipient.deliveryRate}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">
                            {new Date(recipient.lastSeen).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Connected IPs Table */}
              {activeTab === 'ips' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left">#</th>
                        <th className="px-4 py-3 text-left">IP Address</th>
                        <th className="px-4 py-3 text-left">Hostname(s)</th>
                        <th className="px-4 py-3 text-right">Connections</th>
                        <th className="px-4 py-3 text-right">Messages</th>
                        <th className="px-4 py-3 text-right">Sent</th>
                        <th className="px-4 py-3 text-right">Success Rate</th>
                        <th className="px-4 py-3 text-left">Last Seen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {connectedIPs.map((ip, index) => (
                        <tr key={ip.ip} className="border-b border-gray-700 hover:bg-gray-700/30">
                          <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                          <td className="px-4 py-3 font-mono text-sm">{ip.ip}</td>
                          <td
                            className="px-4 py-3 text-sm max-w-xs truncate"
                            title={ip.hostnames.join(', ')}
                          >
                            {ip.hostnames.length > 0 ? ip.hostnames.join(', ') : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">{ip.connections}</td>
                          <td className="px-4 py-3 text-right">{ip.totalMessages}</td>
                          <td className="px-4 py-3 text-right text-green-400">{ip.sent}</td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`px-2 py-1 rounded ${
                                parseFloat(ip.successRate) >= 90
                                  ? 'bg-green-500/20 text-green-400'
                                  : parseFloat(ip.successRate) >= 70
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {ip.successRate}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">
                            {new Date(ip.lastSeen).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
