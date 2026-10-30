'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { incidentService } from '@/services/incidentService';
import { IncidentType, IncidentSeverity } from '@/types';
import { ArrowLeft, ShieldAlert, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportIncidentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<IncidentType>('security');
  const [severity, setSeverity] = useState<IncidentSeverity>('moderate');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      await incidentService.report({
        title,
        type,
        severity,
        status: 'open',
        location,
        description,
        isEmergencySos: false,
        anonymous,
        reporterId: anonymous ? 'anon-' + Date.now().toString().slice(-4) : user.uid,
        reporterName: anonymous ? 'Anonymous Reporter' : user.displayName,
      });

      toast.success('Incident logged into Sentinel Dispatch system');
      router.push('/dashboard/incidents');
    } catch {
      toast.error('Failed to log incident');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/dashboard/incidents"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-rose-600 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Sentinel Command</span>
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Report Security or Safety Concern</h1>
            <p className="text-xs text-slate-400">Non-emergency safety concerns, hazards, theft, or suspicious behavior.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Incident Heading</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Unattended backpack left near East Gate turnstiles"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:bg-white dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Incident Nature</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as IncidentType)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:bg-white dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="security">General Security / Trespassing</option>
                <option value="theft">Theft / Missing Property</option>
                <option value="hazard">Environmental / Physical Hazard</option>
                <option value="medical">Medical Non-Emergency</option>
                <option value="fire">Fire / Smoke Precaution</option>
                <option value="other">Other Incident</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Severity Assessment</label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as IncidentSeverity)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:bg-white dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="low">Low - Routine notice</option>
                <option value="moderate">Moderate - Caution advised</option>
                <option value="high">High - Potential security threat</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Exact Location Details</label>
            <input
              type="text"
              required
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. South Pathway, Lamppost #14 near Innovation Gate"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:bg-white dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Incident Observation</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detail descriptions of individuals involved, license plates, times, or sequence of events..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:bg-white dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <input
              type="checkbox"
              id="sec-anon"
              checked={anonymous}
              onChange={e => setAnonymous(e.target.checked)}
              className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500"
            />
            <label htmlFor="sec-anon" className="cursor-pointer text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Submit as Anonymous Witness Report
              </span>
              <p className="text-slate-500 dark:text-slate-400">
                Your profile will be withheld from incident summaries.
              </p>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 font-bold text-white shadow-md hover:bg-rose-500"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{submitting ? 'Transmitting...' : 'Transmit Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
