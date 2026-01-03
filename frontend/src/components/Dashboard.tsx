import React, { useState, useEffect, useCallback } from 'react';
import { TooltipProps } from 'recharts';
import Header from './Header';
import Sidebar from './Sidebar';
import MailLogTable from './MailLogTable';
import AILogAnalysis from './AILogAnalysis';
import Analytics from './Analytics';
import MailVolumeChart from './MailVolumeChart';
import RecentActivity from './RecentActivity';
import AllowedNetworks from './AllowedNetworks';
import StatCard from './StatCard';
import {
  ChartBarIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from './icons/IconComponents';
import { MailVolumeData, MailStats, MailStatus } from '../types';
import apiService, { ApiError } from '../services/apiService';
import {
  getLastNDaysRange,
  getTodayRange,
  getThisWeekRange,
  getThisMonthRange,
} from '../utils/dateUtils';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DashboardProps {
  onLogout: () => void;
}

type View = 'dashboard' | 'logs' | 'analysis' | 'analytics' | 'networks';
type ChartType = 'default' | 'bar' | 'line' | 'area' | 'stacked' | 'composed' | 'radial';

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('default');
  const [stats, setStats] = useState<MailStats>({
    total: 0,
    sent: 0,
    bounced: 0,
    deferred: 0,
    rejected: 0,
  });
  const [volumeData, setVolumeData] = useState<MailVolumeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default to last 7 days
  const defaultRange = getLastNDaysRange(7);
  const [filter, setFilter] = useState<{ startDate: string; endDate: string }>(defaultRange);

  // State for navigating to logs with filters
  const [logFilter, setLogFilter] = useState<{
    status?: MailStatus | 'all';
    startDate?: string;
    endDate?: string;
  }>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (new Date(filter.endDate) < new Date(filter.startDate)) {
        throw new Error('End date cannot be before the start date.');
      }

      const query = {
        startDate: filter.startDate,
        endDate: filter.endDate,
      };

      const [statsData, volumeData] = await Promise.all([
        apiService.get<MailStats>('/api/stats', query),
        apiService.get<MailVolumeData[]>('/api/volume-trends', query),
      ]);

      setStats(statsData);
      setVolumeData(volumeData);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch dashboard data. Please check your connection.');
      }
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (activeView === 'dashboard') {
      void fetchData();
    }
  }, [activeView, fetchData]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleApplyFilter = () => {
    void fetchData();
  };

  const handleQuickFilter = async (type: 'today' | 'week' | 'month' | 'last7' | 'last30') => {
    let newFilter: { startDate: string; endDate: string };

    switch (type) {
      case 'today':
        newFilter = getTodayRange();
        break;
      case 'week':
        newFilter = getThisWeekRange();
        break;
      case 'month':
        newFilter = getThisMonthRange();
        break;
      case 'last7':
        newFilter = getLastNDaysRange(7);
        break;
      case 'last30':
        newFilter = getLastNDaysRange(30);
        break;
      default:
        newFilter = getLastNDaysRange(7);
    }

    setFilter(newFilter);

    // Fetch data immediately with the new filter
    setLoading(true);
    setError(null);
    try {
      const query = {
        startDate: newFilter.startDate,
        endDate: newFilter.endDate,
      };

      const [statsData, volumeData] = await Promise.all([
        apiService.get<MailStats>('/api/stats', query),
        apiService.get<MailVolumeData[]>('/api/volume-trends', query),
      ]);

      setStats(statsData);
      setVolumeData(volumeData);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch dashboard data. Please check your connection.');
      }
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle stat card clicks
  const handleStatCardClick = useCallback(
    (status: MailStatus | 'all') => {
      setLogFilter({
        status,
        startDate: filter.startDate,
        endDate: filter.endDate,
      });
      setActiveView('logs');
    },
    [filter.startDate, filter.endDate],
  );

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-lg">
          <p className="text-gray-200 font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => {
            if (!entry) return null;
            const displayValue = typeof entry.value === 'number' ? entry.value : Number(entry.value);
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

  // Render custom chart based on selected type
  const renderVolumeChart = () => {
    if (chartType === 'default') {
      return <MailVolumeChart data={volumeData} />;
    }

    const chartData = volumeData.map((item) => ({
      date: item.date,
      sent: item.sent,
      bounced: item.bounced,
      deferred: item.deferred,
      total: item.sent + item.bounced + item.deferred,
    }));

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ bottom: 20, left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="sent" fill="#10b981" name="Sent" radius={[8, 8, 0, 0]} />
              <Bar dataKey="bounced" fill="#ef4444" name="Bounced" radius={[8, 8, 0, 0]} />
              <Bar dataKey="deferred" fill="#f59e0b" name="Deferred" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ bottom: 20, left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="sent"
                stroke="#10b981"
                strokeWidth={3}
                name="Sent"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="bounced"
                stroke="#ef4444"
                strokeWidth={3}
                name="Bounced"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="deferred"
                stroke="#f59e0b"
                strokeWidth={3}
                name="Deferred"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ bottom: 20, left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
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
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'stacked':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ bottom: 20, left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="sent" stackId="a" fill="#10b981" name="Sent" radius={[0, 0, 0, 0]} />
              <Bar
                dataKey="deferred"
                stackId="a"
                fill="#f59e0b"
                name="Deferred"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="bounced"
                stackId="a"
                fill="#ef4444"
                name="Bounced"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'composed':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData} margin={{ bottom: 20, left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="total"
                fill="#3b82f6"
                stroke="#3b82f6"
                fillOpacity={0.3}
                name="Total"
              />
              <Bar dataKey="sent" fill="#10b981" name="Sent" radius={[4, 4, 0, 0]} />
              <Line
                type="monotone"
                dataKey="bounced"
                stroke="#ef4444"
                strokeWidth={2}
                name="Bounced"
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="deferred"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Deferred"
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'radial': {
        // Calculate totals for radial chart
        const totalSent = chartData.reduce((sum, item) => sum + item.sent, 0);
        const totalBounced = chartData.reduce((sum, item) => sum + item.bounced, 0);
        const totalDeferred = chartData.reduce((sum, item) => sum + item.deferred, 0);
        const grandTotal = totalSent + totalBounced + totalDeferred;

        const radialData = [
          {
            name: 'Sent',
            value: totalSent,
            fill: '#10b981',
            percent: grandTotal ? ((totalSent / grandTotal) * 100).toFixed(1) : '0.0',
          },
          {
            name: 'Deferred',
            value: totalDeferred,
            fill: '#f59e0b',
            percent: grandTotal ? ((totalDeferred / grandTotal) * 100).toFixed(1) : '0.0',
          },
          {
            name: 'Bounced',
            value: totalBounced,
            fill: '#ef4444',
            percent: grandTotal ? ((totalBounced / grandTotal) * 100).toFixed(1) : '0.0',
          },
        ];

        return (
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={280}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="20%"
                outerRadius="90%"
                barSize={30}
                data={radialData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar background={{ fill: '#2d3748' }} dataKey="value" cornerRadius={10} />
                <Legend
                  iconSize={10}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  formatter={(value, entry) => {
                    const payload = (entry as { payload?: { percent?: string } }).payload;
                    const percent = typeof payload?.percent === 'string' ? payload.percent : '';
                    return `${value}: ${percent}%`;
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="text-center mt-2">
              <p className="text-sm text-gray-400">Total Period Distribution</p>
              <p className="text-2xl font-bold text-gray-200">{grandTotal.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Messages</p>
            </div>
          </div>
        );
      }

      default:
        return <MailVolumeChart data={volumeData} />;
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'logs':
        return <MailLogTable initialFilter={logFilter} />;
      case 'analysis':
        return <AILogAnalysis />;
      case 'analytics':
        return <Analytics />;
      case 'networks':
        return <AllowedNetworks />;
      case 'dashboard':
      default:
        return (
          <>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
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
                    onClick={() => void handleQuickFilter('today')}
                    className="px-3 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors text-sm"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => void handleQuickFilter('week')}
                    className="px-3 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors text-sm"
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => void handleQuickFilter('last7')}
                    className="px-3 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors text-sm"
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => void handleQuickFilter('last30')}
                    className="px-3 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors text-sm"
                  >
                    Last 30 Days
                  </button>
                  <button
                    onClick={() => void handleQuickFilter('month')}
                    className="px-3 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors text-sm"
                  >
                    This Month
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
                  Loading dashboard data...
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-md mb-4">
                {error}
              </div>
            )}

            {!loading && !error && (
              <>
                {stats.total === 0 && (
                  <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 p-4 rounded-md mb-4">
                    <p className="font-semibold">No mail logs found for the selected date range.</p>
                    <p className="text-sm mt-1">
                      Try selecting a different date range or check if your mail logs are being
                      generated.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <StatCard
                    title="Total Mails"
                    value={stats.total.toLocaleString()}
                    icon={<DocumentTextIcon className="w-8 h-8 text-primary" />}
                    change="in period"
                    onClick={() => handleStatCardClick('all')}
                    isClickable={true}
                  />
                  <StatCard
                    title="Delivered"
                    value={stats.sent.toLocaleString()}
                    icon={<ShieldCheckIcon className="w-8 h-8 text-success" />}
                    change="successful"
                    status="success"
                    onClick={() => handleStatCardClick(MailStatus.Sent)}
                    isClickable={true}
                  />
                  <StatCard
                    title="Bounced"
                    value={stats.bounced.toLocaleString()}
                    icon={<ShieldCheckIcon className="w-8 h-8 text-danger" />}
                    change="failed"
                    status="danger"
                    onClick={() => handleStatCardClick(MailStatus.Bounced)}
                    isClickable={true}
                  />
                  <StatCard
                    title="Deferred"
                    value={stats.deferred.toLocaleString()}
                    icon={<ShieldCheckIcon className="w-8 h-8 text-warning" />}
                    change="retrying"
                    status="warning"
                    onClick={() => handleStatCardClick(MailStatus.Deferred)}
                    isClickable={true}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                      <h2 className="text-xl font-semibold flex items-center">
                        <ChartBarIcon className="w-6 h-6 mr-2 text-primary" />
                        Mail Volume Trends
                      </h2>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setChartType('default')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            chartType === 'default'
                              ? 'bg-primary text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          📊 Default
                        </button>
                        <button
                          onClick={() => setChartType('bar')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            chartType === 'bar'
                              ? 'bg-primary text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          📊 Bar
                        </button>
                        <button
                          onClick={() => setChartType('line')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            chartType === 'line'
                              ? 'bg-primary text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          📈 Line
                        </button>
                        <button
                          onClick={() => setChartType('area')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            chartType === 'area'
                              ? 'bg-primary text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          📉 Area
                        </button>
                        <button
                          onClick={() => setChartType('stacked')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            chartType === 'stacked'
                              ? 'bg-primary text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          📚 Stacked
                        </button>
                        <button
                          onClick={() => setChartType('composed')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            chartType === 'composed'
                              ? 'bg-primary text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          🎨 Mixed
                        </button>
                        <button
                          onClick={() => setChartType('radial')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            chartType === 'radial'
                              ? 'bg-primary text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          ⭕ Radial
                        </button>
                      </div>
                    </div>
                    {renderVolumeChart()}
                  </div>
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <SparklesIcon className="w-6 h-6 mr-2 text-primary" />
                      Recent Critical Activity
                    </h2>
                    <RecentActivity />
                  </div>
                </div>

                <div className="mt-6 bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <DocumentTextIcon className="w-6 h-6 mr-2 text-primary" />
                    Most Recent Mails
                  </h2>
                  <MailLogTable showFilters={false} />
                </div>
              </>
            )}
          </>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={onLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
