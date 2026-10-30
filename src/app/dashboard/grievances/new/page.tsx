'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { grievanceService } from '@/services/grievanceService';
import { GrievanceCategory, GrievancePriority } from '@/types';
import { ArrowLeft, MessageSquareWarning, Shield, Send, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewGrievancePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GrievanceCategory>('infrastructure');
  const [priority, setPriority] = useState<GrievancePriority>('medium');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be signed in to submit a grievance');
      return;
    }

    setSubmitting(true);
    try {
      await grievanceService.create({
        title,
        category,
        priority,
        status: 'submitted',
        location: location || 'Campus General',
        description,
        isAnonymous,
        submitterId: isAnonymous ? 'anon-' + Date.now().toString().slice(-4) : user.uid,
        submitterName: isAnonymous ? 'Anonymous Submitter' : user.displayName,
        submitterRole: user.role,
      });

      toast.success('Grievance filed successfully into SLA Queue');
      router.push('/dashboard/grievances');
    } catch {
      toast.error('Failed to submit grievance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/dashboard/grievances"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Campus Pulse</span>
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <MessageSquareWarning className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">File a Campus Grievance</h1>
            <p className="text-xs text-slate-400">Issues are routed to relevant university departments with SLA escalation.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Grievance Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Water shortage in Hostel Block D 3rd Floor"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Department / Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as GrievanceCategory)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="infrastructure">Infrastructure & Facilities</option>
                <option value="academic">Academic & Grading Section</option>
                <option value="hostel">Hostel & Residential Life</option>
                <option value="cafeteria">Cafeteria & Dining Services</option>
                <option value="security">Campus Safety & Lighting</option>
                <option value="finance">Finance & Scholarship Portal</option>
                <option value="harassment">Anti-Harassment & Grievance Cell</option>
                <option value="other">General Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Severity / Urgency Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as GrievancePriority)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="low">Low - Routine observation</option>
                <option value="medium">Medium - Impacts daily convenience</option>
                <option value="high">High - Severe disruption to studies or living</option>
                <option value="critical">Critical - Immediate safety or health hazard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Precise Campus Location / Room
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Science Complex, Lab 204 or Block C Stairwell"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Detailed Description & Evidence
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide specific details, duration of issue, impacts on students, and previous attempts to resolve..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Anonymous toggle */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <input
              type="checkbox"
              id="anon"
              checked={isAnonymous}
              onChange={e => setIsAnonymous(e.target.checked)}
              className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="anon" className="cursor-pointer text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Submit as Anonymous Grievance
              </span>
              <p className="text-slate-500 dark:text-slate-400">
                Your name and student ID will be redacted from public view and only accessible to verified ombudsman if needed.
              </p>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 active:scale-95 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>{submitting ? 'Submitting...' : 'File Grievance'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
