'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services/notificationService';
import { CampusNotification } from '@/types';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle2, AlertOctagon, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<CampusNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const loadData = async () => {
    if (!user) return;
    const list = await notificationService.getUserNotifications(user.uid);
    setNotifications(list);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    await notificationService.markAllAsRead(user.uid);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All marked as read');
  };

  const handleMarkRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const filtered = notifications.filter(n => filter === 'all' || !n.read);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Notification Center</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Real-time telemetry, grievance updates, booking approvals, and security alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-slate-200/80 p-1 dark:bg-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-600'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                filter === 'unread' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-600'
              }`}
            >
              Unread ({notifications.filter(n => !n.read).length})
            </button>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Mark all read</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <Bell className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
            <h3 className="mt-3 font-bold text-slate-800 dark:text-slate-200">No notifications</h3>
            <p className="text-xs text-slate-400">You are all caught up with your campus alerts!</p>
          </div>
        ) : (
          filtered.map(item => (
            <div
              key={item.id}
              onClick={() => handleMarkRead(item.id)}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 shadow-sm transition ${
                item.read 
                  ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900' 
                  : 'border-indigo-200 bg-indigo-50/40 dark:border-indigo-900 dark:bg-indigo-950/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl ${
                  item.type === 'alert'
                    ? 'bg-rose-100 text-rose-600'
                    : item.type === 'success'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-indigo-100 text-indigo-600'
                }`}>
                  {item.type === 'alert' && <AlertOctagon className="h-4 w-4" />}
                  {item.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                  {item.type === 'info' && <Info className="h-4 w-4" />}
                  {item.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</span>
                    {!item.read && (
                      <span className="h-2 w-2 rounded-full bg-indigo-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{item.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {item.link && (
                <Link
                  href={item.link}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  <span>Open</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
