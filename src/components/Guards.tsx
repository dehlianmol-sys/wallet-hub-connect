import { Navigate, useLocation } from '@/lib/router-compat';
import type { ReactNode } from 'react';
import { useStore } from '@/lib/store';

function LoadingScreen() {
  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", gap: 12, alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.82)" }} role="status">
      <span className="animate-spin" style={{ width: 34, height: 34, border: "3px solid rgba(255,255,255,.25)", borderTopColor: "#fff", borderRadius: "50%" }} />
      <span style={{ color: "#f2f4f5", fontSize: 13 }}>Loading…</span>
    </div>
  );
}

export function RequireUser({ children }: { children: ReactNode }) {
  const { currentUser, loading } = useStore();
  const loc = useLocation();
  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (currentUser.role !== 'user') return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { currentUser, isAdmin, loading } = useStore();
  const loc = useLocation();
  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const { currentUser, isSuperAdmin, loading } = useStore();
  const loc = useLocation();
  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (!isSuperAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { currentUser, loading } = useStore();
  if (loading) return <LoadingScreen />;
  if (currentUser) {
    return <Navigate to={currentUser.role === 'user' ? '/' : '/admin'} replace />;
  }
  return <>{children}</>;
}
