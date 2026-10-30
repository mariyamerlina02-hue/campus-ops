'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { DEMO_USERS } from '@/lib/auth';
import { UserRole } from '@/types';
import { ROLE_LABELS, ROLE_BADGE_COLORS } from '@/lib/permissions';
import { 
  GraduationCap, 
  ArrowRight, 
  ShieldCheck, 
  Mail, 
  Lock, 
  Building2, 
  Check, 
  Users,
  Database
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchRole } = useAuth();
  const [email, setEmail] = useState('alex.rivers@campus.edu');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRolePreset = (role: UserRole) => {
    setSelectedRole(role);
    const demo = DEMO_USERS[role];
    if (demo) {
      setEmail(demo.email);
      setPassword('password123');
      switchRole(role);
      toast.success(`Loaded credentials for ${demo.displayName} (${ROLE_LABELS[role]})`);
    }
  };

  const rolesList: { role: UserRole; title: string; desc: string; icon: string }[] = [
    { role: 'student', title: 'Student', desc: 'Submit grievances, book study pods, trigger emergency SOS', icon: '🎓' },
    { role: 'faculty', title: 'Faculty', desc: 'Triage student requests, book departmental labs, endorse bookings', icon: '👨‍🏫' },
    { role: 'add_hod', title: 'Add. HOD', desc: 'Departmental grievance queue triage, routine room approvals', icon: '📋' },
    { role: 'hod', title: 'HOD', desc: 'Departmental resolution authority, lab allocation signoff', icon: '👔' },
    { role: 'dean', title: 'Dean', desc: 'School-wide academic oversight, auditorium approvals, audit analytics', icon: '📜' },
    { role: 'joint_registrar', title: 'Joint Registrar', desc: 'Campus facilities, institutional disciplinary arbitration, safety dispatch', icon: '⚖️' },
    { role: 'registrar', title: 'Registrar', desc: 'Highest administrative authority, campus policy & executive broadcast', icon: '🏛️' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 flex items-center justify-center">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-600/30">
            <GraduationCap className="h-7 w-7" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white">ORVIAN Governance Portal</h1>
          <p className="text-xs text-slate-400">
            Hierarchical Role-Based Access Control • Connected to Firebase <code className="text-indigo-400 font-mono">orvian-89563</code>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
          {/* Left Column: Role Preset Selector (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-indigo-400" />
                  Select Responsible Governance Role
                </span>
                <p className="text-[11px] text-slate-400">Click any role to load authentic credentials and permissions</p>
              </div>
              <span className="rounded-full bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <Database className="h-3 w-3" />
                <span>Firestore Synced</span>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-[380px] overflow-y-auto pr-1">
              {rolesList.map(item => {
                const isSelected = selectedRole === item.role;
                const demo = DEMO_USERS[item.role];

                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleSelectRolePreset(item.role)}
                    className={`flex items-start gap-3 rounded-2xl p-3 text-left transition border ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/50 ring-2 ring-indigo-500/30'
                        : 'border-slate-800/80 bg-slate-800/40 hover:bg-slate-800/80'
                    }`}
                  >
                    <span className="text-xl p-1">{item.icon}</span>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">
                          {ROLE_LABELS[item.role]}
                        </span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-indigo-400" />}
                      </div>
                      <div className="text-[11px] font-medium text-indigo-300">
                        {demo?.displayName} • <span className="text-slate-400">{demo?.studentOrEmployeeId}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Direct Sign-In Form (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800 pt-6 lg:pt-0 lg:pl-6">
            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Authenticate Persona
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5 mb-4">
                Sign into <strong className="text-indigo-400">{ROLE_LABELS[selectedRole]}</strong> dashboard
              </p>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300">University Email</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/90 py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300">Password</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/90 py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:brightness-110 active:scale-95 transition disabled:opacity-50"
                >
                  <span>{loading ? 'Entering Portal...' : `Enter as ${ROLE_LABELS[selectedRole].split(' ')[0]}`}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-800/30 p-3 text-[11px] text-slate-400">
              <span className="font-bold text-slate-200 block mb-0.5">Responsible Access Note:</span>
              Actions executed in Campus Pulse, Nexus, and Sentinel are tied directly to this governance role and recorded in the audit registry.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
