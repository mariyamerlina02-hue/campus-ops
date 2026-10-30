import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'ORVIAN | Next-Gen University Operations & 3D Spatial Platform',
  description: 'ORVIAN: Unified university operations platform featuring Campus Pulse grievances, Campus Nexus resource scheduling, Campus Sentinel emergency response, and 3D digital twin spatial explorer.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <AuthProvider>
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1e293b',
                color: '#fff',
                fontSize: '14px',
                borderRadius: '10px',
                padding: '12px 16px',
              }
            }} 
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
