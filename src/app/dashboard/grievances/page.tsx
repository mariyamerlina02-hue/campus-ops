'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { grievanceService } from '@/services/grievanceService';
import { 
  canManageGrievances, 
  canEscalateToHod, 
  canEscalateToDean, 
  canEscalateToRegistrar, 
  canFinalizeGrievance, 
  ROLE_LABELS,
  ROLE_HIERARCHY_LEVEL 
} from '@/lib/permissions';
import { Grievance, GrievanceCategory, GrievanceStatus } from '@/types';
import { 
  MessageSquareWarning, 
  Plus, 
  Search, 
  Filter, 
  ThumbsUp, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Eye,
  Send,
  Sparkles,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function GrievancesPage() {
  const { user } = useAuth();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeGrievance, setActiveGrievance] = useState<Grievance | null>(null);
  const [commentText, setCommentText] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');

  const loadData = async () => {
    const list = await grievanceService.getAll();
    setGrievances(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpvote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const updated = await grievanceService.toggleUpvote(id, user.uid);
    if (updated) {
      setGrievances(prev => prev.map(g => g.id === id ? updated : g));
      if (activeGrievance?.id === id) setActiveGrievance(updated);
      toast.success(updated.upvotes.includes(user.uid) ? 'Upvoted grievance' : 'Upvote removed');
    }
  };

  const handleStatusChange = async (
    newStatus: GrievanceStatus, 
    escalationLevel?: 'department' | 'school' | 'university_executive'
  ) => {
    if (!activeGrievance || !user) return;
    const note = resolutionNote || `Updated to ${newStatus.replace(/_/g, ' ')} by ${ROLE_LABELS[user.role]}`;
    const updated = await grievanceService.updateStatus(
      activeGrievance.id,
      newStatus,
      user.uid,
      user.displayName,
      note,
      escalationLevel
    );
    if (updated) {
      setActiveGrievance(updated);
      setGrievances(prev => prev.map(g => g.id === updated.id ? updated : g));
      toast.success(`Action applied: ${newStatus.replace(/_/g, ' ').toUpperCase()}`);
      setResolutionNote('');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGrievance || !user || !commentText.trim()) return;

    const updated = await grievanceService.addComment(activeGrievance.id, {
      userId: user.uid,
      userName: user.displayName,
      userRole: user.role,
      text: commentText.trim(),
    });

    if (updated) {
      setActiveGrievance(updated);
      setGrievances(prev => prev.map(g => g.id === updated.id ? updated : g));
      setCommentText('');
      toast.success('Comment logged into audit trail');
    }
  };

  const role = user?.role || 'student';
  const roleLevel = user ? ROLE_HIERARCHY_LEVEL[user.role] : 1;

  const filtered = grievances.filter(g => {
    const matchesCategory = selectedCategory === 'all' || g.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || g.status === selectedStatus;
    const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          g.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          g.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Campus Pulse</h1>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Pillar 1 • Redressal
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Transparent student grievance escalation pipeline with HOD, Dean, and Registrar sign-offs
          </p>
        </div>

        <Link
          href="/dashboard/grievances/new"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Report New Grievance</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search grievances by keyword, room, or issue..."
            className="w-full rounded-xl border-none bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-900 outline-none focus:bg-slate-100 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">All Categories</option>
            <option value="academic">Academic</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="hostel">Hostel</option>
            <option value="cafeteria">Cafeteria</option>
            <option value="security">Security</option>
            <option value="finance">Finance</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="in_progress">In Progress</option>
            <option value="escalated_to_hod">Escalated to HOD</option>
            <option value="escalated_to_dean">Escalated to Dean</option>
            <option value="escalated_to_registrar">Escalated to Registrar</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Grievance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => {
          const hasUpvoted = user ? item.upvotes.includes(user.uid) : false;

          return (
            <div
              key={item.id}
              onClick={() => setActiveGrievance(item)}
              className="cursor-pointer flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase dark:bg-slate-800 dark:text-slate-300">
                    {item.category}
                  </span>
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                    item.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : item.status.startsWith('escalated')
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                  }`}>
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-slate-500 line-clamp-3 dark:text-slate-400">
                  {item.description}
                </p>

                <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                <button
                  onClick={(e) => handleUpvote(item.id, e)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    hasUpvoted
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>{item.upvotes.length}</span>
                </button>

                <div className="text-[10px] text-slate-400">
                  {item.isAnonymous ? 'Anonymous Submitter' : item.submitterName}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grievance Modal Detail with Governance Escalation Actions */}
      {activeGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                    {activeGrievance.id}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-800">
                    {activeGrievance.category}
                  </span>
                  <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-700">
                    {activeGrievance.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                  {activeGrievance.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveGrievance(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                {activeGrievance.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40">
                <div>
                  <span className="text-[10px] text-slate-400">Location</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{activeGrievance.location}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Reported By</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {activeGrievance.isAnonymous ? 'Anonymous' : activeGrievance.submitterName}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Assigned Handler</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {activeGrievance.assignedName || 'Awaiting Triage'}
                  </p>
                </div>
              </div>

              {/* Responsible Role Action Bar */}
              {roleLevel >= 2 && (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-950 dark:bg-indigo-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" />
                      Responsible Governance Controls ({ROLE_LABELS[role]})
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Hierarchy Level {roleLevel}</span>
                  </div>

                  <input
                    type="text"
                    value={resolutionNote}
                    onChange={e => setResolutionNote(e.target.value)}
                    placeholder="Enter official resolution or escalation remark notes..."
                    className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-800"
                  />

                  <div className="flex flex-wrap gap-2 pt-1">
                    {/* Faculty / Add. HOD controls */}
                    {canEscalateToHod(role) && (
                      <button
                        onClick={() => handleStatusChange('escalated_to_hod', 'department')}
                        className="rounded-lg bg-amber-600 px-3 py-1.5 font-bold text-white shadow-sm hover:bg-amber-500"
                      >
                        Escalate to HOD
                      </button>
                    )}

                    {/* HOD controls */}
                    {canEscalateToDean(role) && (
                      <button
                        onClick={() => handleStatusChange('escalated_to_dean', 'school')}
                        className="rounded-lg bg-purple-600 px-3 py-1.5 font-bold text-white shadow-sm hover:bg-purple-500"
                      >
                        Escalate to Dean
                      </button>
                    )}

                    {/* Dean controls */}
                    {canEscalateToRegistrar(role) && (
                      <button
                        onClick={() => handleStatusChange('escalated_to_registrar', 'university_executive')}
                        className="rounded-lg bg-rose-600 px-3 py-1.5 font-bold text-white shadow-sm hover:bg-rose-500"
                      >
                        Escalate to Registrar
                      </button>
                    )}

                    {/* Finalize resolution */}
                    {canFinalizeGrievance(role) && (
                      <button
                        onClick={() => handleStatusChange('resolved')}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white shadow-sm hover:bg-emerald-500"
                      >
                        Mark Officially Resolved
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Official Audit Trail & Dialogue ({activeGrievance.comments.length})
                </span>

                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                  {activeGrievance.comments.map(c => (
                    <div key={c.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{c.userName} ({c.userRole})</span>
                        <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{c.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddComment} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Log an official note or inquiry..."
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 font-bold text-white hover:bg-indigo-500"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
