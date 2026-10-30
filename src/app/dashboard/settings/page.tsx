'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { ROLE_LABELS, ROLE_BADGE_COLORS, ROLE_HIERARCHY_LEVEL } from '@/lib/permissions';
import { 
  Settings, 
  User, 
  ShieldCheck, 
  Database, 
  Bell, 
  RefreshCw, 
  Check, 
  Sliders,
  Sparkles,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, switchRole } = useAuth();

  const handleResetData = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      toast.success('Local demo cache reset to initial seed state. Reloading...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const roles: UserRole[] = [
    'student', 
    'faculty', 
    'add_hod', 
    'hod', 
    'dean', 
    'joint_registrar', 
    'registrar'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Institutional Governance & RBAC</h1>
          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            Hierarchy Levels 1 - 7
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Responsible authority matrix across Student, Faculty, Additional HOD, HOD, Dean, Joint Registrar, and Registrar
        </p>
      </div>

      {/* Role Simulator Persona Cards */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
          <Sliders className="h-4 w-4 text-indigo-600" />
          <span>Switch Responsible Persona Simulator</span>
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          Select any verified persona to simulate their distinct administrative scope across Campus Pulse, Nexus, and Sentinel:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {roles.map(r => {
            const isSelected = user?.role === r;
            const level = ROLE_HIERARCHY_LEVEL[r];

            return (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 dark:bg-indigo-950/40'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40'
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${ROLE_BADGE_COLORS[r].bg} ${ROLE_BADGE_COLORS[r].text}`}>
                    Level {level}
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <span className="font-bold text-xs text-slate-900 mt-2 dark:text-white">
                  {ROLE_LABELS[r]}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Click to switch view
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 7-Tier RBAC Permission Matrix */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Institutional Governance & Access Control Matrix
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Hierarchical delegation ensuring responsible access across the 3 Pillars
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase text-slate-400">
                <th className="pb-3">Governance Capability</th>
                <th className="pb-3 text-center">Student</th>
                <th className="pb-3 text-center">Faculty</th>
                <th className="pb-3 text-center">Add. HOD</th>
                <th className="pb-3 text-center">HOD</th>
                <th className="pb-3 text-center">Dean</th>
                <th className="pb-3 text-center">Jt. Registrar</th>
                <th className="pb-3 text-center">Registrar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300 text-[11px]">
              <tr>
                <td className="py-2.5 font-medium">1. File Grievance (Campus Pulse)</td>
                <td className="text-center text-emerald-500 font-bold">✓</td>
                <td className="text-center text-emerald-500 font-bold">✓</td>
                <td className="text-center text-emerald-500 font-bold">✓</td>
                <td className="text-center text-emerald-500 font-bold">✓</td>
                <td className="text-center text-emerald-500 font-bold">✓</td>
                <td className="text-center text-emerald-500 font-bold">✓</td>
                <td className="text-center text-emerald-500 font-bold">✓</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">2. Triage & Escalate to HOD</td>
                <td className="text-center text-slate-300">-</td>
                <td className="text-center text-emerald-500 font-bold">✓</td>
                <td className="text-center text-emerald-500 font-bold">✓</td>
                <td className="text-center text-slate-300">-</td>
                <td className="text-center text-slate-300">-</td>
                <td className="text-center text-slate-300">-</td>
                <td className="text-center text-slate-300">-</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">3. Dept Signoff / Escalate to Dean</td>
                <td className="text-center text-slate-300">-</td>
                <td className="text-center text-slate-300">-</td>
                <td className="text-center text-slate-300">-</td>
                <td className="text-center text-emerald-500 font-bold">✓</td>
                <td className="text-center text-slate-300">-</td>
                <td className="text-center text-slate-300">-</td>
                <td className="text-center text-slate-300">-</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">4. Final Executive Grievance Arbitration</td>
                <td className="text-center text-slate-300">-</td>
                <td className="text-center text-slate-300">-</td>
                <td className="text-center text-slate-300">-</td>
                <td className="text-center text-slate-300">-</td>
                <td className="text-center text-emerald-500 font-bold">✓</td>
                <td className="text-center text-emerald-500 font-bold">✓</td>
                <td className="text-center text-emerald-500 font-bold">✓</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">5. Department Lab Booking (Nexus)</td>
                <td className="text-center text-emerald-500 font-bold">Request</td>
                <td className="text-center text-emerald-500 font-bold">✓</td>
                <td className="text-center text-emerald-500 font-bold">Approve</td>
                <td className="text-center text-emerald-500 font-bold">Approve</td>
                <td className="text-center text-emerald-500 font-bold">Approve</td>
                <td className="text-center text-emerald-500 font-bold">Approve</td>
                <td className="text-center text-emerald-500 font-bold">Approve</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">6. Grand Auditorium / Major Events</td>
                <td className="text-center text-slate-300">-</td>
                <td className="text-center text-slate-300">-</td>
                <td className="text-center text-slate-300">-</td>
                <td className="text-center text-slate-300">-</td>
                <td className="text-center text-emerald-500 font-bold">Approve</td>
                <td className="text-center text-emerald-500 font-bold">Approve</td>
                <td className="text-center text-emerald-500 font-bold">Approve</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">7. Emergency SOS Panic Trigger (Sentinel)</td>
                <td className="text-center text-emerald-500 font-bold">✓</td>
                <td className="text-center text-emerald-500 font-bold">✓</td>
                <td className="text-center text-emerald-500 font-bold">✓</td>
                <td className="text-center text-emerald-500 font-bold">✓</td>
                <td className="text-center text-emerald-500 font-bold">✓</td>
                <td className="text-center text-emerald-500 font-bold">✓</td>
                <td className="text-center text-emerald-500 font-bold">✓</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">8. Emergency Patrol Car Dispatch</td>
                <td className="text-center text-slate-300">-</td>
                <td className="text-center text-slate-300">-</td>
                <td className="text-center text-slate-300">-</td>
                <td className="text-center text-slate-300">-</td>
                <td className="text-center text-slate-300">-</td>
                <td className="text-center text-emerald-500 font-bold">Command</td>
                <td className="text-center text-emerald-500 font-bold">Command</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cloud & Firebase Environment Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
          <Database className="h-4 w-4 text-emerald-600" />
          <span>Active Firebase Database Connection</span>
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Direct synchronization to your provisioned Firebase cloud project
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/40">
            <span className="text-[10px] text-slate-400">Project ID</span>
            <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">orvian-89563</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/40">
            <span className="text-[10px] text-slate-400">Auth Domain</span>
            <p className="font-mono font-bold text-slate-700 dark:text-slate-200">orvian-89563.firebaseapp.com</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/40">
            <span className="text-[10px] text-slate-400">Storage Bucket</span>
            <p className="font-mono font-bold text-slate-700 dark:text-slate-200">orvian-89563.firebasestorage.app</p>
          </div>
        </div>
      </div>

      {/* Reset Cache & Developer Options */}
      <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Reset Simulation Database</h3>
          <p className="text-xs text-slate-400">Purges browser demo storage and restores original seed grievances and tickets.</p>
        </div>
        <button
          onClick={handleResetData}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Reset Seed Data</span>
        </button>
      </div>
    </div>
  );
}
