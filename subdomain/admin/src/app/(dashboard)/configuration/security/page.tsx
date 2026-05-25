'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useAuth } from '@/lib/auth';
import { 
  Shield, 
  ShieldCheck, 
  ShieldOff, 
  Settings, 
  Database, 
  Code, 
  KeyRound, 
  Lock, 
  X, 
  AlertTriangle, 
  Loader2 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import PageHeader from '@/components/admin/PageHeader';
import { getSiteSettings, saveSiteSettings, clearNextCache } from '@/app/actions/siteSettings';

export default function SecurityConfigPage() {
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [togglingMaintenance, setTogglingMaintenance] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [togglingProtection, setTogglingProtection] = useState(false);

  const router = useRouter();
  const { user, profile, logout, loginRequired, toggleLoginGate, isSuperAdmin } = useAuth();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    getSiteSettings().then(setSiteSettings);
  }, []);

  // Login Gate Modal State
  const [isGateModalOpen, setIsGateModalOpen] = useState(false);
  const [gatePassword, setGatePassword] = useState('');
  const [gateError, setGateError] = useState('');
  const [gateLoading, setGateLoading] = useState(false);
  const [showGatePassword, setShowGatePassword] = useState(false);
  const gateInputRef = useRef<HTMLInputElement>(null);

  if (!siteSettings) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin opacity-20" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <PageHeader
        title="Security & Access"
        subtitle="Manage global system gates, maintenance overrides, and static engine integrity."
        badge="Security"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Global Auth Gate Card */}
        <div className="bg-[#0B0B0C] border border-white/10 rounded-3xl p-8 flex flex-col justify-between group hover:border-emerald-500/20 transition-all">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className={cn(
                "p-4 rounded-2xl border transition-all",
                loginRequired ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              )}>
                {loginRequired ? <ShieldCheck className="w-6 h-6" /> : <ShieldOff className="w-6 h-6" />}
              </div>
              <Badge className={cn(
                "text-[10px] font-black uppercase tracking-widest px-3 py-1",
                loginRequired ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
              )}>
                {loginRequired ? "Enforced" : "Deactivated"}
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Global Authentication Gate</h3>
            <p className="text-sm text-zinc-500 leading-relaxed mb-8">
              Force all storefront visitors to authenticate before browsing. This adds a critical layer of privacy during exclusive drops or private previews.
            </p>
          </div>
          <Button 
            onClick={async () => {
              if (loginRequired) setIsGateModalOpen(true);
              else {
                const res = await toggleLoginGate("");
                if (res.success) toast.success("Gate enabled.");
              }
            }}
            className={cn(
              "w-full py-7 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] border transition-all",
              loginRequired ? "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
            )}
          >
            {loginRequired ? "Disable Protocol" : "Enable Security"}
          </Button>
        </div>

        {/* 2. Maintenance Mode Card */}
        <div className="bg-[#0B0B0C] border border-white/10 rounded-3xl p-8 flex flex-col justify-between group hover:border-amber-500/20 transition-all">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className={cn(
                "p-4 rounded-2xl border transition-all",
                siteSettings?.maintenanceMode ? "bg-amber-500/10 border-amber-500/20 text-amber-500 animate-pulse" : "bg-white/5 border-white/10 text-zinc-500"
              )}>
                <Settings className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Storefront Maintenance</h3>
            <p className="text-sm text-zinc-500 leading-relaxed mb-8">
              Instantly toggle a high-end "Under Construction" notice across the entire public domain. Only authenticated administrators will be able to bypass this notice.
            </p>
          </div>
          <Button 
            disabled={togglingMaintenance}
            onClick={async () => {
              setTogglingMaintenance(true);
              const newMode = !siteSettings?.maintenanceMode;
              const res = await saveSiteSettings({ ...siteSettings, maintenanceMode: newMode });
              setTogglingMaintenance(false);
              if (res.success) {
                setSiteSettings((prev: any) => ({ ...prev, maintenanceMode: newMode }));
                toast.success(newMode ? "Site is Offline" : "Site is Live");
              }
            }}
            className="w-full py-7 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 transition-all"
          >
            {togglingMaintenance ? <Loader2 className="animate-spin w-5 h-5" /> : (siteSettings?.maintenanceMode ? "Deactivate Mode" : "Enable Maintenance")}
          </Button>
        </div>
      </div>

      {/* 3. Secondary Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0B0B0C] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                   <Database className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                   <h4 className="font-bold text-sm text-zinc-200">Invalidate Production Cache</h4>
                   <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Force Purge Sync</p>
                </div>
              </div>
              <Button 
                size="sm" 
                disabled={clearingCache}
                onClick={async () => {
                  setClearingCache(true);
                  const res = await clearNextCache();
                  setClearingCache(false);
                  if (res.success) toast.success("Static engine purged.");
                }}
                className="bg-white/5 hover:bg-white/10 text-amber-400 font-black text-[10px] uppercase tracking-widest h-10 px-4 rounded-xl"
              >
                {clearingCache ? <Loader2 className="animate-spin w-4 h-4" /> : "Purge Now"}
              </Button>
          </div>

          <div className={cn(
            "bg-[#0B0B0C] border border-white/10 rounded-2xl p-5 flex items-center justify-between transition-all",
            !isSuperAdmin && "opacity-40 grayscale pointer-events-none"
          )}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                   <Code className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                   <h4 className="font-bold text-sm text-zinc-200">Main Site Inspect Protection</h4>
                   <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Block DevTools</p>
                </div>
              </div>
              <Button 
                size="sm" 
                disabled={togglingProtection}
                onClick={async () => {
                  setTogglingProtection(true);
                  const newProt = !siteSettings?.inspectProtection;
                  const res = await saveSiteSettings({ ...siteSettings, inspectProtection: newProt });
                  setTogglingProtection(false);
                  if (res.success) {
                    setSiteSettings((prev: any) => ({ ...prev, inspectProtection: newProt }));
                    toast.success(newProt ? "Armed" : "Disarmed");
                  }
                }}
                className={cn(
                  "font-black text-[10px] uppercase tracking-widest h-10 px-4 rounded-xl",
                  siteSettings?.inspectProtection ? "bg-rose-500/20 text-rose-500 border border-rose-500/30" : "bg-white/5 text-zinc-500 border border-white/10"
                )}
              >
                {siteSettings?.inspectProtection ? "Armed" : "Arm Protection"}
              </Button>
          </div>
      </div>

      {/* 4. Active Session */}
      <div className="bg-[#0B0B0C] border border-white/10 rounded-2xl p-6 flex items-center justify-between max-w-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
               <KeyRound className="w-5 h-5 text-blue-500" />
            </div>
            <div>
               <h4 className="font-bold text-sm text-zinc-200">Active Admin Credentials</h4>
               <p className="text-[11px] text-zinc-500">Authenticated as: <strong className="text-white">{user?.email}</strong></p>
            </div>
          </div>
          <Button 
            variant="outline"
            onClick={async () => {
              await logout();
              router.push('/login');
              toast.success("Logged out.");
            }}
            className="border-white/10 text-rose-500 font-black text-[10px] uppercase tracking-widest h-10 px-4 rounded-xl hover:bg-rose-500/10"
          >
            Force Logout
          </Button>
      </div>

      {/* ═══════════════════════════════ SECURITY GATE MODAL */}
      {isGateModalOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/65 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => !gateLoading && setIsGateModalOpen(false)}
        >
          <div
            className="w-full max-w-sm mx-4 bg-neutral-950 border border-white/10 rounded-3xl shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-250"
            onClick={(e) => e.stopPropagation()}
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Verification</h3>
                  <p className="text-[10px] text-white/40 font-medium">Clearance required.</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-white/50 leading-relaxed font-medium">
              Enter your security passcode to deactivate the global authentication gate.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!gatePassword.trim()) return;
                setGateLoading(true);
                setGateError('');
                const result = await toggleLoginGate(gatePassword);
                setGateLoading(false);
                if (result.success) {
                  setIsGateModalOpen(false);
                  setGatePassword('');
                  toast.success("Gate unlocked.");
                } else {
                  setGateError(result.error || 'Verification failed.');
                  setGatePassword('');
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-white/20" />
                  <input
                    ref={gateInputRef}
                    type="password"
                    value={gatePassword}
                    onChange={(e) => { setGatePassword(e.target.value); setGateError(''); }}
                    placeholder="Enter security passcode"
                    autoComplete="off"
                    disabled={gateLoading}
                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white focus:outline-none focus:border-white/25 transition-all"
                  />
                </div>
              </div>

              {gateError && (
                <div className="text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{gateError}</span>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => setIsGateModalOpen(false)}
                  disabled={gateLoading}
                  variant="outline"
                  className="flex-1 h-11 rounded-xl border-white/10 text-white/50 text-[10px] uppercase font-black tracking-widest"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={gateLoading || !gatePassword.trim()}
                  className="flex-1 h-11 rounded-xl bg-rose-500 text-white text-[10px] uppercase font-black tracking-widest hover:bg-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                >
                  {gateLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Authorize"}
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
