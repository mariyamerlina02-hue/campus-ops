'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { ROLE_LABELS } from '@/lib/permissions';
import { GraduationCap, ArrowRight, User, Mail, Lock, Building, Hash } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [studentOrEmployeeId, setStudentOrEmployeeId] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        displayName,
        email,
        department,
        studentOrEmployeeId: studentOrEmployeeId || 'ID-' + Math.floor(1000 + Math.random() * 9000),
        role,
        password,
      });
      router.push('/dashboard');
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <GraduationCap className="h-7 w-7" />
          </Link>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">Create CampusOps Account</h2>
          <p className="mt-1 text-xs text-slate-400">
            Join your university operations network
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300">Full Name</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Jordan Lee"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">University Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jordan.lee@campus.edu"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300">Department</label>
                <div className="relative mt-1">
                  <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="Computer Science"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Campus ID / Roll No</label>
                <div className="relative mt-1">
                  <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={studentOrEmployeeId}
                    onChange={e => setStudentOrEmployeeId(e.target.value)}
                    placeholder="STU-2026-99"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">Primary Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 px-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty Member</option>
                <option value="staff">Facilities & Maintenance Staff</option>
                <option value="security">Security Officer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link href="/login" className="font-semibold text-indigo-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
