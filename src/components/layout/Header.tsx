'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { ROLE_LABELS, ROLE_BADGE_COLORS } from '@/lib/permissions';
import { incidentService } from '@/services/incidentService';
import { notificationService } from '@/services/notificationService';
import { CampusNotification } from '@/types';
import { 
  Bell, 
  ShieldAlert, 
  ChevronDown, 
  Search, 
  User, 
  LogOut, 
  Check, 
  ExternalLink,
  Flame,
  PhoneCall,
  CheckCheck
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Header() {
  const { user, switchRole, logout } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<CampusNotification[]>([]);
  const [sosActive, setSosActive] = useState(false);

  useEffect(() => {
    if (user) {
      notificationService.getUserNotifications(user.uid).then(setNotifications);
    }
  }, [user]);

  const handleSos = async () => {
    if (!user) return;
    try {
      const inc = await incidentService.triggerEmergencySOS(
        user.uid,
        user.displayName,
        'Active Web Session GPS'
      );
      setSosActive(true);
      toast.error('🚨 EMERGENCY SOS SENT: Security & Medical Units Notified!', { duration: 6000 });
      // Refresh notifications
      const notifs = await notificationService.getUserNotifications(user.uid);
      setNotifications(notifs);
    } catch {
      toast.error('Could not transmit SOS beacon');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    if (user) {
      await notificationService.markAllAsRead(user.uid);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    }
  };

  const roles: UserRole[] = [
    'student', 
    'faculty', 
    'add_hod', 
    'hod', 
    'dean', 
    'joint_registrar', 
    'registrar', 
    'staff', 
    'security', 
    'admin'
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-8 dark:border-slate-800 dark:bg-slate-900/95">
      {/* Left Search */}
      <div className="flex items-center gap-4">
        <div className="relative hidden w-64 md:block lg:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search grievances, labs, tickets..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-indigo-900"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* SOS Emergency Button */}
        <button
          onClick={handleSos}
          className="relative flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-rose-200 transition-all hover:bg-rose-700 active:scale-95 sm:px-4 sm:py-2 dark:shadow-rose-950"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-300 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white"></span>
          </span>
          <ShieldAlert className="h-4 w-4" />
          <span>SOS Beacon</span>
        </button>

        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            title="Click to switch simulation role"
          >
            <span className="hidden sm:inline text-slate-400">Role:</span>
            <span className="capitalize font-bold text-indigo-600 dark:text-indigo-400">
              {user ? ROLE_LABELS[user.role] : 'Student'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="px-3 py-2 text-xs font-medium text-slate-400 border-b border-slate-100 dark:border-slate-800">
                Switch Operational Perspective
              </div>
              <div className="mt-1 space-y-1">
                {roles.map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setShowRoleMenu(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                      user?.role === r 
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400' 
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{ROLE_LABELS[r]}</span>
                    {user?.role === r && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
              </div>
              <div className="mt-2 max-h-72 space-y-2 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">No notifications</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`rounded-lg p-2.5 text-xs transition ${
                        n.read 
                          ? 'bg-slate-50 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400' 
                          : 'bg-indigo-50/70 text-slate-900 font-medium dark:bg-indigo-950/40 dark:text-slate-100'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-semibold">{n.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-2 border-t border-slate-100 pt-2 text-center dark:border-slate-800">
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  View all alerts & logs →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-500/20"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
              {user?.displayName.charAt(0) || 'U'}
            </div>
          )}
          <button
            onClick={() => logout()}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
