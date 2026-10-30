'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  CartesianGrid,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, Clock, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_DATA = [
  { name: 'Infrastructure', count: 18, resolved: 14 },
  { name: 'Academic', count: 12, resolved: 9 },
  { name: 'Hostels', count: 15, resolved: 11 },
  { name: 'Cafeteria', count: 8, resolved: 7 },
  { name: 'Security', count: 6, resolved: 6 },
  { name: 'Finance', count: 5, resolved: 4 },
];

const SLA_TREND_DATA = [
  { month: 'Jun', avgHours: 36, slaTarget: 24 },
  { month: 'Jul', avgHours: 31, slaTarget: 24 },
  { month: 'Aug', avgHours: 27, slaTarget: 24 },
  { month: 'Sep', avgHours: 23, slaTarget: 24 },
  { month: 'Oct', avgHours: 19, slaTarget: 24 },
];

const FACILITY_LOAD_DATA = [
  { facility: 'Turing Aud', bookings: 42 },
  { facility: 'AI Vision Lab', bookings: 68 },
  { facility: 'Boardroom A', bookings: 31 },
  { facility: 'Badminton Court', bookings: 54 },
  { facility: '3D Fab Studio', bookings: 29 },
];

const SEVERITY_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
const INCIDENT_PIE_DATA = [
  { name: 'Routine / Minor', value: 45 },
  { name: 'Facility Hazard', value: 25 },
  { name: 'Medical First Aid', value: 20 },
  { name: 'Critical SOS', value: 10 },
];

export default function AnalyticsPage() {
  const handleExport = () => {
    toast.success('Generated CampusOps Q4 Operations & Compliance Audit PDF');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Audit & Operational Analytics</h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Real-Time Telemetry
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Cross-departmental performance metrics, grievance SLA compliance, and facility load heatmaps
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition active:scale-95"
        >
          <Download className="h-4 w-4" />
          <span>Export Audit Report</span>
        </button>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Average Grievance SLA</span>
            <Clock className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">19.2 hrs</span>
            <span className="text-xs font-bold text-emerald-500">▼ 21% MoM</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Target threshold: 24.0 hours</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Resolution Rate</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">91.4%</span>
            <span className="text-xs font-bold text-emerald-500">▲ 4.8%</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">64 of 70 filed issues resolved</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Sentinel Response Time</span>
            <ShieldCheck className="h-5 w-5 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">2.8 min</span>
            <span className="text-xs font-bold text-emerald-500">Benchmark Exceeded</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Median patrol response to SOS beacons</p>
        </div>
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Grievances by Category */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Grievances Reported vs Resolved by Category
          </h2>
          <p className="text-xs text-slate-400 mb-6">Distribution across academic & facility departments</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CATEGORY_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="count" fill="#6366f1" name="Reported" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#10b981" name="Resolved" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: SLA Trend Line */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Resolution Turnaround SLA (Hours to Close)
          </h2>
          <p className="text-xs text-slate-400 mb-6">Mean resolution duration vs maximum target limit</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SLA_TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" unit="h" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="avgHours" stroke="#4f46e5" strokeWidth={3} name="Actual Turnaround" />
                <Line type="monotone" dataKey="slaTarget" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} name="SLA Target" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Facility Reservation Density */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Most Utilized Facilities & Labs
          </h2>
          <p className="text-xs text-slate-400 mb-6">Cumulative session bookings this semester</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FACILITY_LOAD_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" fontSize={11} stroke="#94a3b8" />
                <YAxis type="category" dataKey="facility" fontSize={11} stroke="#94a3b8" width={110} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#8b5cf6" name="Total Bookings" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Sentinel Safety Breakdown */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Campus Sentinel Incident Severity Ratio
          </h2>
          <p className="text-xs text-slate-400 mb-6">Breakdown of reported security & medical dispatches</p>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={INCIDENT_PIE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {INCIDENT_PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[index % SEVERITY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
