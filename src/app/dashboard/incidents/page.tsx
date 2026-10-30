'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { incidentService } from '@/services/incidentService';
import { canManageIncidents } from '@/lib/permissions';
import { SecurityIncident, IncidentStatus } from '@/types';
import { 
  ShieldAlert, 
  Plus, 
  MapPin, 
  PhoneCall, 
  AlertTriangle, 
  Radio, 
  CheckCircle2, 
  Crosshair,
  Sparkles,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function IncidentsPage() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [triggeringSos, setTriggeringSos] = useState(false);

  const loadData = async () => {
    const list = await incidentService.getAll();
    setIncidents(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInstantSos = async () => {
    if (!user) return;
    setTriggeringSos(true);
    try {
      const inc = await incidentService.triggerEmergencySOS(
        user.uid,
        user.displayName,
        'Campus Courtyard / GPS Node #44'
      );
      setIncidents(prev => [inc, ...prev]);
      toast.error('🚨 EMERGENCY SOS BEACON BROADCAST TO ALL PATROL UNITS', { duration: 6000 });
    } finally {
      setTriggeringSos(false);
    }
  };

  const handleStatusChange = async (id: string, status: IncidentStatus) => {
    const updated = await incidentService.updateStatus(
      id,
      status,
      user?.displayName || 'Officer Jackson',
      `Officer updated case to ${status}`
    );
    if (updated) {
      setIncidents(prev => prev.map(i => i.id === id ? updated : i));
      toast.success(`Incident status changed to ${status.toUpperCase()}`);
    }
  };

  const isSecurityOrAdmin = user ? canManageIncidents(user.role) : false;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Campus Sentinel</h1>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              Emergency Command Grid
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Real-time GPS distress beacons, security patrol dispatch, and verified incident logging
          </p>
        </div>

        <Link
          href="/dashboard/incidents/report"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          <Plus className="h-4 w-4" />
          <span>Report Safety Concern</span>
        </Link>
      </div>

      {/* SOS Giant Panic Card */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-rose-500 bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 p-6 md:p-8 text-white shadow-xl shadow-rose-600/20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold tracking-wide backdrop-blur">
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              <span>HIGH-PRIORITY DIRECT TO CAMPUS SECURITY & 911</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              One-Click Immediate SOS Panic Beacon
            </h2>
            <p className="text-xs sm:text-sm text-rose-100 max-w-xl">
              If you feel unsafe, witness a medical emergency, fire, or suspicious threat, click below. Your live coordinates will be transmitted to security patrol units immediately.
            </p>
          </div>

          <button
            onClick={handleInstantSos}
            disabled={triggeringSos}
            className="group relative flex h-20 w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 text-base font-black uppercase tracking-wider text-rose-700 shadow-2xl transition hover:bg-rose-50 active:scale-95 disabled:opacity-50"
          >
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-600"></span>
            </span>
            <ShieldAlert className="h-6 w-6 text-rose-600 transition group-hover:scale-110" />
            <span>{triggeringSos ? 'Transmitting Beacon...' : 'Transmit SOS Panic Beacon'}</span>
          </button>
        </div>
      </div>

      {/* Incident Log Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Active Incidents & Security Log</span>
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold dark:bg-slate-800">
            {incidents.length}
          </span>
        </h2>

        <div className="space-y-4">
          {incidents.map(inc => (
            <div
              key={inc.id}
              className={`rounded-3xl border p-6 shadow-sm transition ${
                inc.isEmergencySos
                  ? 'border-rose-300 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/20'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                    {inc.id}
                  </span>
                  {inc.isEmergencySos && (
                    <span className="rounded bg-rose-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                      EMERGENCY SOS
                    </span>
                  )}
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-800">
                    {inc.type}
                  </span>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                    inc.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : inc.status === 'dispatched'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {inc.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400">
                  {new Date(inc.createdAt).toLocaleString()}
                </div>
              </div>

              <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                {inc.title}
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                {inc.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <MapPin className="h-4 w-4 text-rose-500" />
                  <span>{inc.location}</span>
                </div>
                {inc.respondingUnit && (
                  <div className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                    <Radio className="h-4 w-4" />
                    <span>Unit: {inc.respondingUnit}</span>
                  </div>
                )}
                <div className="text-slate-400">
                  Caller: {inc.anonymous ? 'Anonymous' : inc.reporterName}
                </div>
              </div>

              {/* Security Officer Dispatch Actions */}
              {isSecurityOrAdmin && inc.status !== 'resolved' && (
                <div className="mt-5 flex items-center gap-2 border-t border-slate-200/60 pt-4 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500">Security Command:</span>
                  {inc.status === 'open' && (
                    <button
                      onClick={() => handleStatusChange(inc.id, 'dispatched')}
                      className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-500"
                    >
                      Dispatch Patrol Car
                    </button>
                  )}
                  {inc.status === 'dispatched' && (
                    <button
                      onClick={() => handleStatusChange(inc.id, 'investigating')}
                      className="rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-500"
                    >
                      On Scene / Investigating
                    </button>
                  )}
                  <button
                    onClick={() => handleStatusChange(inc.id, 'resolved')}
                    className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                  >
                    Close Incident / Secure
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
