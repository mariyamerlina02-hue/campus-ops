'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { maintenanceService } from '@/services/maintenanceService';
import { canManageMaintenance } from '@/lib/permissions';
import { MaintenanceTicket, MaintenanceStatus, MaintenancePriority } from '@/types';
import { 
  Wrench, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  MapPin, 
  DollarSign,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MaintenancePage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New ticket state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [building, setBuilding] = useState('Academic Block 2');
  const [roomNumber, setRoomNumber] = useState('LH-B');
  const [category, setCategory] = useState<'electrical' | 'plumbing' | 'hvac' | 'furniture' | 'network' | 'other'>('electrical');
  const [priority, setPriority] = useState<MaintenancePriority>('medium');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    const list = await maintenanceService.getAll();
    setTickets(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const created = await maintenanceService.create({
        title,
        description,
        building,
        roomNumber,
        category,
        priority,
        status: 'reported',
        reportedBy: user.uid,
        reporterName: user.displayName,
      });
      setTickets(prev => [created, ...prev]);
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      toast.success('Maintenance work order submitted');
    } catch {
      toast.error('Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: MaintenanceStatus) => {
    const updated = await maintenanceService.updateStatus(id, status, user?.displayName, 'Work order completed by maintenance personnel.');
    if (updated) {
      setTickets(prev => prev.map(t => t.id === id ? updated : t));
      toast.success(`Work order status set to ${status.toUpperCase()}`);
    }
  };

  const isStaffOrAdmin = user ? canManageMaintenance(user.role) : false;

  const filtered = tickets.filter(t => {
    return filterStatus === 'all' || t.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Facilities & Maintenance</h1>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              Work Orders
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Preventative upkeep, equipment repairs, and technician work order dispatch
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>New Work Order</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'reported', 'assigned', 'in_progress', 'resolved'].map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold capitalize transition ${
              filterStatus === st
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
            }`}
          >
            {st === 'all' ? 'All Work Orders' : st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(ticket => (
          <div
            key={ticket.id}
            className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {ticket.id}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                    ticket.priority === 'urgent'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : ticket.priority === 'medium'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800'
                  }`}>
                    {ticket.priority}
                  </span>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                    ticket.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {ticket.title}
              </h3>
              <p className="mt-2 text-xs text-slate-500 line-clamp-3 dark:text-slate-400">
                {ticket.description}
              </p>

              <div className="mt-4 space-y-1 rounded-xl bg-slate-50 p-2.5 text-[11px] dark:bg-slate-800/40">
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{ticket.building} • {ticket.roomNumber}</span>
                </div>
                <div className="text-slate-400">
                  Category: <span className="font-semibold text-slate-700 dark:text-slate-200 capitalize">{ticket.category}</span>
                </div>
                {ticket.assignedTechnician && (
                  <div className="text-indigo-600 dark:text-indigo-400 font-medium">
                    Technician: {ticket.assignedTechnician}
                  </div>
                )}
              </div>
            </div>

            {/* Staff Transition Actions */}
            {isStaffOrAdmin && ticket.status !== 'resolved' && (
              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                {ticket.status === 'reported' && (
                  <button
                    onClick={() => handleStatusUpdate(ticket.id, 'assigned')}
                    className="flex-1 rounded-xl bg-indigo-50 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300"
                  >
                    Assign Tech
                  </button>
                )}
                {ticket.status === 'assigned' && (
                  <button
                    onClick={() => handleStatusUpdate(ticket.id, 'in_progress')}
                    className="flex-1 rounded-xl bg-blue-600 py-1.5 text-xs font-bold text-white hover:bg-blue-500"
                  >
                    Start Work
                  </button>
                )}
                {ticket.status === 'in_progress' && (
                  <button
                    onClick={() => handleStatusUpdate(ticket.id, 'resolved')}
                    className="flex-1 rounded-xl bg-emerald-600 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Work Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Create Maintenance Work Order</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Issue Summary</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Electrical breaker tripping in Server Room 4"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:bg-white dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:bg-white dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="hvac">HVAC / Air Conditioning</option>
                    <option value="network">Network & Access Readers</option>
                    <option value="furniture">Furniture / Civil</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Priority Level</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:bg-white dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="urgent">Urgent / Safety</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Building</label>
                  <input
                    type="text"
                    required
                    value={building}
                    onChange={e => setBuilding(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:bg-white dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Room / Zone</label>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={e => setRoomNumber(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:bg-white dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Fault Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detail observed symptoms, noise, odors, or risks..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:bg-white dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white shadow-md hover:bg-indigo-500"
                >
                  {submitting ? 'Creating...' : 'Dispatch Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
