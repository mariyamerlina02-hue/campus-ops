'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LABELS, ROLE_BADGE_COLORS } from '@/lib/permissions';
import { 
  LayoutDashboard, 
  MessageSquareWarning, 
  Layers, 
  Wrench, 
  ShieldAlert, 
  Megaphone, 
  MapPin, 
  BarChart3, 
  Settings,
  GraduationCap,
  Sparkles
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Campus Pulse', subtitle: 'Grievance SLA', href: '/dashboard/grievances', icon: MessageSquareWarning },
  { name: 'Campus Nexus', subtitle: 'Labs & Spaces', href: '/dashboard/resources', icon: Layers },
  { name: 'Facilities & Maint', subtitle: 'Work Orders', href: '/dashboard/maintenance', icon: Wrench },
  { name: 'Campus Sentinel', subtitle: 'Emergency & Safety', href: '/dashboard/incidents', icon: ShieldAlert },
  { name: 'Announcements', subtitle: 'Campus Broadcast', href: '/dashboard/announcements', icon: Megaphone },
  { name: '3D Campus Explorer', subtitle: 'Digital Twin Model', href: '/dashboard/map', icon: MapPin },
  { name: 'Audit & Analytics', subtitle: 'Live Intelligence', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings & Profiles', subtitle: 'RBAC Controls', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* Brand Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6 dark:border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-slate-900 dark:text-white">ORVIAN</span>
            <span className="rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">v2.0</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Campus Operations Hub</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Main Modules
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-300 dark:shadow-none'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`} />
                <div>
                  <div className="leading-tight">{item.name}</div>
                  {item.subtitle && (
                    <div className={`text-[10px] font-normal ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {item.subtitle}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Status Card */}
      {user && (
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500/20"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {user.displayName.charAt(0)}
              </div>
            )}
            <div className="overflow-hidden">
              <div className="truncate text-xs font-bold text-slate-900 dark:text-white">
                {user.displayName}
              </div>
              <div className="flex items-center gap-1">
                <span className={`inline-block truncate rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${ROLE_BADGE_COLORS[user.role].bg} ${ROLE_BADGE_COLORS[user.role].text}`}>
                  {user.role}
                </span>
                <span className="truncate text-[10px] text-slate-400">
                  {user.studentOrEmployeeId}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
