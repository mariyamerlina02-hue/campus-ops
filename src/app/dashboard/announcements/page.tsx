'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { announcementService } from '@/services/announcementService';
import { canBroadcastAnnouncements } from '@/lib/permissions';
import { CampusAnnouncement, UserRole } from '@/types';
import { Megaphone, Plus, Bell, Tag, Calendar, User, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<CampusAnnouncement[]>([]);
  const [showModal, setShowModal] = useState(false);

  // New announcement form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [tagInput, setTagInput] = useState('Campus, Notice');
  const [targetRoles, setTargetRoles] = useState<UserRole[]>(['student', 'faculty', 'staff', 'security', 'admin']);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    const list = await announcementService.getAll();
    setAnnouncements(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const created = await announcementService.create({
        title,
        content,
        priority,
        targetRoles,
        authorId: user.uid,
        authorName: user.displayName,
        authorRole: user.role.toUpperCase(),
        tags: tagInput.split(',').map(t => t.trim()).filter(Boolean),
      });
      setAnnouncements(prev => [created, ...prev]);
      setShowModal(false);
      setTitle('');
      setContent('');
      toast.success('Announcement broadcast published');
    } catch {
      toast.error('Failed to post announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const isBroadcaster = user ? canBroadcastAnnouncements(user.role) : false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Campus Announcements</h1>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Live Broadcast
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Official university notices, emergency broadcasts, and academic directives
          </p>
        </div>

        {isBroadcaster && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Broadcast Notice</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {announcements.map(ann => (
          <div
            key={ann.id}
            className={`rounded-3xl border p-6 shadow-sm transition ${
              ann.priority === 'urgent'
                ? 'border-rose-200 bg-rose-50/40 dark:border-rose-900 dark:bg-rose-950/20'
                : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{ann.id}</span>
                {ann.priority === 'urgent' && (
                  <span className="rounded bg-rose-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                    URGENT BROADCAST
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <h3 className="mt-2 text-base font-extrabold text-slate-900 dark:text-white">
              {ann.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {ann.content}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <User className="h-3.5 w-3.5" />
                <span>Author: <strong className="text-slate-700 dark:text-slate-200">{ann.authorName}</strong> ({ann.authorRole})</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {ann.tags.map(t => (
                  <span key={t} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Broadcast Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Broadcast University Notice</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Notice Headline</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Schedule of Annual Convocation Rehearsals"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:bg-white dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Broadcast Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:bg-white dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="normal">Normal Announcement</option>
                    <option value="urgent">Urgent / High-Priority Alert</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    placeholder="Academic, Exams, Portal"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:bg-white dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Notice Body</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Enter full notice copy, instructions, and dates..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:bg-white dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white shadow-md hover:bg-indigo-500"
                >
                  {submitting ? 'Broadcasting...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
