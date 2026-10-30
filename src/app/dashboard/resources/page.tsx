'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { resourceService } from '@/services/resourceService';
import { canApproveBookings } from '@/lib/permissions';
import { CampusResource, ResourceBooking, ResourceType, BookingStatus } from '@/types';
import { 
  Layers, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Sparkles,
  Building2,
  Check,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<CampusResource[]>([]);
  const [bookings, setBookings] = useState<ResourceBooking[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'catalog' | 'bookings'>('catalog');
  const [bookingModalResource, setBookingModalResource] = useState<CampusResource | null>(null);

  // Form State
  const [bookingDate, setBookingDate] = useState('2026-11-05');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('16:00');
  const [purpose, setPurpose] = useState('');
  const [attendeesCount, setAttendeesCount] = useState(25);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    const [res, bk] = await Promise.all([
      resourceService.getResources(),
      resourceService.getBookings(),
    ]);
    setResources(res);
    setBookings(bk);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModalResource || !user) return;
    setSubmitting(true);
    try {
      const created = await resourceService.createBooking({
        resourceId: bookingModalResource.id,
        resourceName: bookingModalResource.name,
        userId: user.uid,
        userName: user.displayName,
        userRole: user.role,
        department: user.department,
        date: bookingDate,
        startTime,
        endTime,
        purpose,
        attendeesCount,
      });
      setBookings(prev => [created, ...prev]);
      setBookingModalResource(null);
      setPurpose('');
      toast.success('Reservation request submitted for review');
      setActiveTab('bookings');
    } catch {
      toast.error('Failed to submit booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookingStatus = async (id: string, status: BookingStatus) => {
    const updated = await resourceService.updateBookingStatus(id, status);
    if (updated) {
      setBookings(prev => prev.map(b => b.id === id ? updated : b));
      toast.success(`Booking ${status.toUpperCase()}`);
    }
  };

  const isApprover = user ? canApproveBookings(user.role) : false;

  const filteredResources = resources.filter(r => {
    return selectedType === 'all' || r.type === selectedType;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Campus Nexus</h1>
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              Smart Facility & Space Booking
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Automated conflict-free scheduling for auditoriums, AI clusters, maker studios, and athletic courts
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-200/80 p-1 dark:bg-slate-800">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
              activeTab === 'catalog'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Spaces & Labs ({resources.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
              activeTab === 'bookings'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Active Bookings ({bookings.length})
          </button>
        </div>
      </div>

      {activeTab === 'catalog' ? (
        <>
          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {['all', 'auditorium', 'lab', 'conference', 'sports', 'equipment'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold capitalize transition ${
                  selectedType === type
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                }`}
              >
                {type === 'all' ? 'All Spaces' : type}
              </button>
            ))}
          </div>

          {/* Resources Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map(res => (
              <div
                key={res.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800">
                    <img
                      src={res.imageUrl}
                      alt={res.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                      Capacity: {res.capacity} seats
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{res.building} • {res.floor}</span>
                    </div>

                    <h3 className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
                      {res.name}
                    </h3>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {res.amenities.map(a => (
                        <span key={a} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 p-5 dark:border-slate-800">
                  <button
                    onClick={() => setBookingModalResource(res)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition active:scale-95"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Reserve Space</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Bookings List View */
        <div className="space-y-3">
          {bookings.map(b => (
            <div
              key={b.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{b.id}</span>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                    b.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : b.status === 'rejected'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {b.status}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{b.resourceName}</h3>
                <p className="text-xs text-slate-500">{b.purpose} ({b.attendeesCount} participants)</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>Reserved by {b.userName}</span>
                  <span>•</span>
                  <span>Date: {b.date} ({b.startTime} - {b.endTime})</span>
                </div>
              </div>

              {/* Approver Actions */}
              {isApprover && b.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBookingStatus(b.id, 'approved')}
                    className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleBookingStatus(b.id, 'rejected')}
                    className="flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-500"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Booking Form Modal */}
      {bookingModalResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase">Reservation Request</span>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">{bookingModalResource.name}</h2>
              </div>
              <button
                onClick={() => setBookingModalResource(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Reservation Date</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={e => setBookingDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:bg-white dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Expected Attendees</label>
                  <input
                    type="number"
                    max={bookingModalResource.capacity}
                    value={attendeesCount}
                    onChange={e => setAttendeesCount(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:bg-white dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:bg-white dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:bg-white dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Event / Session Purpose</label>
                <textarea
                  required
                  rows={3}
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  placeholder="State the objective, academic project, or club meeting details..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:bg-white dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setBookingModalResource(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white shadow-md hover:bg-indigo-500"
                >
                  {submitting ? 'Submitting...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
