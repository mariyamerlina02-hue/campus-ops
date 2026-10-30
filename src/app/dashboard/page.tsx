'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { grievanceService } from '@/services/grievanceService';
import { resourceService } from '@/services/resourceService';
import { incidentService } from '@/services/incidentService';
import { maintenanceService } from '@/services/maintenanceService';
import { announcementService } from '@/services/announcementService';
import { ROLE_LABELS, ROLE_HIERARCHY_LEVEL, ROLE_BADGE_COLORS } from '@/lib/permissions';
import { 
  Grievance, 
  ResourceBooking, 
  SecurityIncident, 
  CampusAnnouncement 
} from '@/types';
import { 
  MessageSquareWarning, 
  Layers, 
  ShieldAlert, 
  Sparkles, 
  Database, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  PlusCircle, 
  Radio, 
  Calendar,
  Building,
  UserCheck,
  Award,
  ChevronRight,
  Flame
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [bookings, setBookings] = useState<ResourceBooking[]>([]);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [announcements, setAnnouncements] = useState<CampusAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [g, b, inc, ann] = await Promise.all([
          grievanceService.getAll(),
          resourceService.getBookings(),
          incidentService.getAll(),
          announcementService.getAll(),
        ]);
        setGrievances(g);
        setBookings(b);
        setIncidents(inc);
        setAnnouncements(ann);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const openGrievances = grievances.filter(g => g.status !== 'resolved' && g.status !== 'rejected').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const activeAlerts = incidents.filter(i => i.status !== 'resolved').length;
  const roleLevel = user ? ROLE_HIERARCHY_LEVEL[user.role] : 1;

  const triggerDirectSos = async () => {
    if (!user) return;
    try {
      const inc = await incidentService.triggerEmergencySOS(
        user.uid,
        user.displayName,
        'Main Academic Block Central Foyer'
      );
      setIncidents(prev => [inc, ...prev]);
      toast.error('🚨 EMERGENCY SOS SENT: Security & Medical Units Dispatched!', { duration: 6000 });
    } catch {
      toast.error('Failed to trigger SOS');
    }
  };

  return (
    <div className="space-y-8">
      {/* Governance Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 md:p-8 text-white shadow-2xl">
        <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Governance Level {roleLevel} of 7</span>
              </span>
              <span className="rounded-full bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5" />
                <span>Firebase Connected: orvian-89563</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {user?.displayName || 'Campus Member'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              <strong className="text-indigo-400 font-bold uppercase">{user ? ROLE_LABELS[user.role] : 'Student'}</strong>
              {' '}• {user?.department} • ID: <code className="text-slate-400">{user?.studentOrEmployeeId}</code>
            </p>
          </div>

          {/* Quick Action Badges based on role */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/dashboard/grievances/new"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              <span>File Grievance</span>
            </Link>

            <Link
              href="/dashboard/resources"
              className="flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
            >
              <Calendar className="h-4 w-4 text-purple-400" />
              <span>{roleLevel >= 3 ? 'Review Bookings' : 'Book Facility'}</span>
            </Link>

            <button
              onClick={triggerDirectSos}
              className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-black uppercase text-white shadow hover:bg-rose-500 active:scale-95 transition"
            >
              <Radio className="h-4 w-4" />
              <span>SOS Beacon</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 CORE PILLARS SPOTLIGHT */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Three Core Operational Pillars</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Institutional management grid for Campus Pulse, Campus Nexus, and Campus Sentinel</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PILLAR 1: CAMPUS PULSE */}
          <div className="rounded-3xl border border-indigo-200 bg-gradient-to-b from-indigo-50/60 to-white p-6 shadow-sm dark:border-indigo-900/50 dark:from-indigo-950/20 dark:to-slate-900 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
                  <MessageSquareWarning className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Pillar 1 • Pulse
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900 dark:text-white">Campus Pulse</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Grievance resolution, anonymous whistleblowing, SLA tracking, and hierarchical department escalation.
              </p>

              <div className="mt-5 space-y-2 rounded-2xl bg-white/80 p-3.5 border border-indigo-100 dark:bg-slate-800/60 dark:border-indigo-950 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Active Grievances:</span>
                  <strong className="text-indigo-600 dark:text-indigo-400 font-black">{openGrievances} tickets</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Your Action Scope:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {roleLevel === 1 && 'Submit & Upvote'}
                    {roleLevel === 2 && 'Faculty Triage'}
                    {roleLevel === 3 && 'Add. HOD Review'}
                    {roleLevel === 4 && 'HOD Resolution'}
                    {roleLevel === 5 && 'Dean Arbitration'}
                    {roleLevel >= 6 && 'Registrar Final Signoff'}
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/grievances"
              className="mt-6 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition"
            >
              <span>Manage Grievance Queue</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* PILLAR 2: CAMPUS NEXUS */}
          <div className="rounded-3xl border border-purple-200 bg-gradient-to-b from-purple-50/60 to-white p-6 shadow-sm dark:border-purple-900/50 dark:from-purple-950/20 dark:to-slate-900 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-600/30">
                  <Layers className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  Pillar 2 • Nexus
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900 dark:text-white">Campus Nexus</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Autonomous resource allocation, lab slots, grand auditorium booking, and double-booking avoidance.
              </p>

              <div className="mt-5 space-y-2 rounded-2xl bg-white/80 p-3.5 border border-purple-100 dark:bg-slate-800/60 dark:border-purple-950 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Active Bookings:</span>
                  <strong className="text-purple-600 dark:text-purple-400 font-black">{bookings.length} reservations</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Pending Review:</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{pendingBookings} awaiting approval</span>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/resources"
              className="mt-6 flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white shadow hover:bg-purple-500 transition"
            >
              <span>Access Space Nexus</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* PILLAR 3: CAMPUS SENTINEL */}
          <div className="rounded-3xl border border-rose-200 bg-gradient-to-b from-rose-50/60 to-white p-6 shadow-sm dark:border-rose-900/50 dark:from-rose-950/20 dark:to-slate-900 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-600/30">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  Pillar 3 • Sentinel
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900 dark:text-white">Campus Sentinel</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Critical life-safety infrastructure, 1-click GPS panic beacons, rapid patrol car dispatch, and incident investigation.
              </p>

              <div className="mt-5 space-y-2 rounded-2xl bg-white/80 p-3.5 border border-rose-100 dark:bg-slate-800/60 dark:border-rose-950 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Active Alert Status:</span>
                  <span className={`font-black uppercase ${activeAlerts > 0 ? 'text-rose-600 animate-pulse' : 'text-emerald-600'}`}>
                    {activeAlerts > 0 ? `${activeAlerts} Dispatched Alerts` : 'All Clear'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Direct Command:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {roleLevel >= 6 ? 'Executive Dispatch Authority' : 'Emergency SOS Active'}
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/incidents"
              className="mt-6 flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow hover:bg-rose-500 transition"
            >
              <span>Open Sentinel Console</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Grievance Escalation & Sentinel Alert Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Pulse Issues */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquareWarning className="h-4 w-4 text-indigo-600" />
              <span>Campus Pulse • Department Grievances Queue</span>
            </h3>
            <Link href="/dashboard/grievances" className="text-xs font-bold text-indigo-600 hover:underline">
              View All ({grievances.length}) →
            </Link>
          </div>

          <div className="space-y-3">
            {grievances.slice(0, 4).map(item => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300 transition dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{item.id}</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {item.category}
                    </span>
                  </div>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                    item.status === 'resolved' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Reported by: <strong>{item.isAnonymous ? 'Anonymous' : item.submitterName}</strong></span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">▲ {item.upvotes.length} Community Upvotes</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): Nexus Approvals & Sentinel Dispatches */}
        <div className="lg:col-span-5 space-y-6">
          {/* Nexus Approvals */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-600" />
                <span>Campus Nexus • Reservations</span>
              </h3>
              <Link href="/dashboard/resources" className="text-xs text-purple-600 hover:underline">
                All Spaces →
              </Link>
            </div>

            <div className="mt-3 space-y-2.5">
              {bookings.slice(0, 3).map(b => (
                <div key={b.id} className="rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white truncate">{b.resourceName}</span>
                    <span className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                      b.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{b.purpose}</p>
                  <div className="mt-1 text-[10px] text-slate-400">
                    By {b.userName} • {b.date} ({b.startTime} - {b.endTime})
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sentinel Incident Radar */}
          <div className="rounded-3xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm dark:border-rose-950 dark:bg-rose-950/20">
            <div className="flex items-center justify-between border-b border-rose-200/60 pb-3 dark:border-rose-900/50">
              <h3 className="text-sm font-bold text-rose-950 dark:text-rose-200 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-600" />
                <span>Campus Sentinel • Live Alerts</span>
              </h3>
              <Link href="/dashboard/incidents" className="text-xs text-rose-600 font-bold hover:underline">
                Emergency Radar →
              </Link>
            </div>

            <div className="mt-3 space-y-2.5">
              {incidents.slice(0, 2).map(inc => (
                <div key={inc.id} className="rounded-xl border border-rose-200 bg-white p-3 text-xs dark:border-rose-900 dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white truncate">{inc.title}</span>
                    <span className="rounded bg-rose-100 px-1.5 py-0.2 text-[9px] font-bold text-rose-700 uppercase">
                      {inc.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">{inc.location}</p>
                  <div className="mt-1.5 text-[10px] font-semibold text-rose-600">
                    Unit: {inc.respondingUnit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
