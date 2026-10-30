'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { 
  GraduationCap, 
  ShieldAlert, 
  Layers, 
  MessageSquareWarning, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Sparkles,
  Zap,
  Users,
  ShieldCheck,
  Flame
} from 'lucide-react';

export default function LandingPage() {
  const { switchRole } = useAuth();
  const router = useRouter();

  const handleQuickDemo = (role: UserRole) => {
    switchRole(role);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[130px]" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[130px]" />
        <div className="absolute -bottom-40 left-1/3 h-[600px] w-[600px] rounded-full bg-rose-600/15 blur-[140px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex h-20 items-center justify-between border-b border-slate-800/80 px-6 max-w-7xl mx-auto md:px-12 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white">ORVIAN</span>
            <span className="ml-2 rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/30">
              3D Digital Twin Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-300 hover:text-white transition"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition active:scale-95"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 md:px-12 text-center">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/50 px-4 py-1.5 text-xs font-medium text-indigo-300 backdrop-blur-md mb-8">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span>ORVIAN • Smart University Digital Operations & 3D Twin</span>
          <span className="rounded-full bg-indigo-500/40 px-2 py-0.2 text-[10px] font-bold text-white">LIVE</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-tight">
          Welcome to <span className="text-indigo-400">ORVIAN</span> <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Smart Campus Operating System
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Unite student grievance resolution, autonomous lab & space scheduling, proactive facility maintenance, and critical emergency response in one unified real-time dashboard.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-indigo-600/30 hover:brightness-110 transition active:scale-95"
          >
            <span>Launch CampusOps</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/login"
            className="rounded-2xl border border-slate-700 bg-slate-800/80 px-8 py-4 text-base font-semibold text-slate-200 hover:bg-slate-800 transition"
          >
            Explore Role Simulator
          </Link>
        </div>

        {/* 1-Click Persona Simulator Grid */}
        <div className="mt-16 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 md:p-8 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
            <div className="text-left">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-400" />
                Instant Role-Based Simulator
              </h2>
              <p className="text-xs text-slate-400">
                Click any role to test CampusOps with dedicated permissions, preloaded records, and workflows:
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-full font-medium">
              <CheckCircle2 className="h-4 w-4" />
              <span>Firebase Auth & Firestore Synced</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Student */}
            <button
              onClick={() => handleQuickDemo('student')}
              className="flex flex-col items-start p-4 rounded-2xl border border-emerald-900/40 bg-emerald-950/20 hover:bg-emerald-950/40 hover:border-emerald-500/50 transition text-left group"
            >
              <span className="rounded-lg bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-bold uppercase mb-2">Student</span>
              <span className="font-bold text-sm text-white group-hover:text-emerald-300">Alex Rivers</span>
              <span className="text-[11px] text-slate-400 mt-0.5">CS Undergrad</span>
              <p className="text-[11px] text-slate-400 mt-3 line-clamp-2">Submit complaints, upvote peers, book study pods, trigger SOS.</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition">
                Enter as Student →
              </div>
            </button>

            {/* Faculty */}
            <button
              onClick={() => handleQuickDemo('faculty')}
              className="flex flex-col items-start p-4 rounded-2xl border border-blue-900/40 bg-blue-950/20 hover:bg-blue-950/40 hover:border-blue-500/50 transition text-left group"
            >
              <span className="rounded-lg bg-blue-500/20 text-blue-300 px-2 py-0.5 text-[10px] font-bold uppercase mb-2">Faculty</span>
              <span className="font-bold text-sm text-white group-hover:text-blue-300">Dr. Marcus Chen</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Robotics & AI</span>
              <p className="text-[11px] text-slate-400 mt-3 line-clamp-2">Reserve lecture halls, manage departmental complaints, publish notices.</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition">
                Enter as Faculty →
              </div>
            </button>

            {/* Staff */}
            <button
              onClick={() => handleQuickDemo('staff')}
              className="flex flex-col items-start p-4 rounded-2xl border border-amber-900/40 bg-amber-950/20 hover:bg-amber-950/40 hover:border-amber-500/50 transition text-left group"
            >
              <span className="rounded-lg bg-amber-500/20 text-amber-300 px-2 py-0.5 text-[10px] font-bold uppercase mb-2">Facilities Staff</span>
              <span className="font-bold text-sm text-white group-hover:text-amber-300">Sarah Miller</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Campus Operations</span>
              <p className="text-[11px] text-slate-400 mt-3 line-clamp-2">Track maintenance work orders, assign technicians, approve bookings.</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition">
                Enter as Staff →
              </div>
            </button>

            {/* Security */}
            <button
              onClick={() => handleQuickDemo('security')}
              className="flex flex-col items-start p-4 rounded-2xl border border-rose-900/40 bg-rose-950/20 hover:bg-rose-950/40 hover:border-rose-500/50 transition text-left group"
            >
              <span className="rounded-lg bg-rose-500/20 text-rose-300 px-2 py-0.5 text-[10px] font-bold uppercase mb-2">Security Guard</span>
              <span className="font-bold text-sm text-white group-hover:text-rose-300">Officer Jackson</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Emergency Command</span>
              <p className="text-[11px] text-slate-400 mt-3 line-clamp-2">Respond to live SOS beacons, dispatch medical squads, investigate reports.</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-rose-400 group-hover:translate-x-1 transition">
                Enter as Security →
              </div>
            </button>

            {/* Admin */}
            <button
              onClick={() => handleQuickDemo('admin')}
              className="flex flex-col items-start p-4 rounded-2xl border border-purple-900/40 bg-purple-950/20 hover:bg-purple-950/40 hover:border-purple-500/50 transition text-left group"
            >
              <span className="rounded-lg bg-purple-500/20 text-purple-300 px-2 py-0.5 text-[10px] font-bold uppercase mb-2">Campus Dean</span>
              <span className="font-bold text-sm text-white group-hover:text-purple-300">Dean Harrison</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Executive Leadership</span>
              <p className="text-[11px] text-slate-400 mt-3 line-clamp-2">Comprehensive audit analytics, campus-wide broadcast, policy management.</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition">
                Enter as Admin →
              </div>
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {/* Card 1 */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 mb-6">
              <MessageSquareWarning className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Campus Pulse</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Transparent student grievance ecosystem with anonymous submission mode, peer upvoting, SLA countdown timers, and department resolution workflows.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 mb-6">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Campus Nexus</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Automated resource & space management for grand auditoriums, AI research clusters, sports courts, and equipment with zero double-booking conflicts.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 mb-6">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Campus Sentinel</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Critical life-safety infrastructure with 1-click GPS SOS beacons, instant dispatcher alert broadcast, emergency response teams, and audit incident logging.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <p>© 2026 CampusOps Intelligent Infrastructure • Powered by Firebase Project <code className="text-indigo-400">orvian-89563</code></p>
      </footer>
    </div>
  );
}
