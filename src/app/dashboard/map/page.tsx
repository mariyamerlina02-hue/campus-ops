'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Box, Layers, MapPin, Sparkles } from 'lucide-react';

const Campus3DExplorer = dynamic(() => import('@/components/Campus3DExplorer'), { ssr: false });

export default function CampusMapPage() {
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  return (
    <div className="space-y-6">
      {/* View Switcher Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">ORVIAN Spatial Intelligence</span>
          <h2 className="text-xl font-black text-white">Campus Digital Twin & Spatial Navigation</h2>
        </div>

        <div className="flex rounded-2xl bg-slate-900 border border-slate-800 p-1">
          <button
            onClick={() => setViewMode('3d')}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
              viewMode === '3d'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="h-4 w-4" />
            <span>3D Interactive Campus</span>
          </button>
          <button
            onClick={() => setViewMode('2d')}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
              viewMode === '2d'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>2D Blueprint Matrix</span>
          </button>
        </div>
      </div>

      {viewMode === '3d' ? (
        <Campus3DExplorer />
      ) : (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h3 className="text-base font-bold text-white">2D Blueprint Grid</h3>
          <p className="text-xs text-slate-400">Blueprint view with coordinate references.</p>
          <div className="h-96 rounded-2xl border border-slate-800 bg-slate-950 flex items-center justify-center text-slate-500 text-xs">
            Switch to the 3D Interactive Campus tab for photorealistic WebGL drone navigation.
          </div>
        </div>
      )}
    </div>
  );
}
