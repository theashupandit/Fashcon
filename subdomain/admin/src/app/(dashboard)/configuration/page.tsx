'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useAuth } from '@/lib/auth';
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Globe, 
  Save, 
  Plus, 
  MoreVertical, 
  Mail, 
  Lock,
  Database,
  Cloud,
  Layout,
  Search as SearchIcon,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  X,
  ShieldCheck,
  ShieldOff
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import PageHeader from '@/components/admin/PageHeader';


import { getSiteSettings, saveSiteSettings, clearNextCache } from '@/app/actions/siteSettings';
import SiteSettingsForm from '@/components/configuration/SiteConfigurationForm';

export default function ConfigurationPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'identity' | 'security' | 'infrastructure'>('identity');
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [togglingMaintenance, setTogglingMaintenance] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);

  const router = useRouter();
  const { user, profile, logout, loginRequired, toggleLoginGate, isSuperAdmin } = useAuth();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Login Gate Modal State
  const [isGateModalOpen, setIsGateModalOpen] = useState(false);
  const [gatePassword, setGatePassword] = useState('');
  const [gateError, setGateError] = useState('');
  const [gateLoading, setGateLoading] = useState(false);
  const [showGatePassword, setShowGatePassword] = useState(false);
  const gateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSiteSettings().then(setSiteSettings);
  }, []);

  const tabSummary = {
    identity: {
      title: 'Site Identity',
      caption: 'Manage your brand, SEO, and global metadata.',
      details: 'Configure the core identity of Fashcon, including logos, social links, and search engine parameters.',
    },
    security: {
      title: 'Access Control',
      caption: 'Manage passwords and authentication methods.',
      details: 'Enable MFA, review session activity, and keep your admin console protected.',
    },
    infrastructure: {
      title: 'System Health',
      caption: 'Monitor database, storage, and service connectivity.',
      details: 'Ensure your infrastructure stays stable and your admin tools stay synced.',
    },
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Configuration updated successfully");
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="space-y-6 min-w-0">
        <PageHeader
          title="System Configuration"
          subtitle="Configure your platform, users, and global parameters."
          badge="Core"
          className="mb-6"
        />

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full">
          <TabsList className="bg-[var(--card)] border border-[var(--border)] p-1 h-12 rounded-3xl">
            <TabsTrigger value="identity" className="gap-2 px-4 data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--primary)] text-[13px] font-medium">
              <Globe className="w-4 h-4" /> Site Identity
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              disabled={!isSuperAdmin}
              className="gap-2 px-4 data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--primary)] text-[13px] font-medium"
            >
              <Shield className={cn("w-4 h-4", !isSuperAdmin && "opacity-40")} /> 
              Security
              {!isSuperAdmin && <Lock className="w-3 h-3 ml-1 opacity-40" />}
            </TabsTrigger>
            <TabsTrigger 
              value="infrastructure" 
              disabled={!isSuperAdmin}
              className="gap-2 px-4 data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--primary)] text-[13px] font-medium"
            >
              <Database className={cn("w-4 h-4", !isSuperAdmin && "opacity-40")} /> 
              Infrastructure
              {!isSuperAdmin && <Lock className="w-3 h-3 ml-1 opacity-40" />}
            </TabsTrigger>
          </TabsList>

          {/* Site Identity Settings */}
          <TabsContent value="identity" className="mt-6">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {siteSettings ? (
                <SiteSettingsForm defaultValues={siteSettings} />
              ) : (
                <div className="h-[400px] flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin opacity-20" />
                </div>
              )}
            </div>
          </TabsContent>



          {/* Security Settings */}
          <TabsContent value="security" className="mt-6">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Access Control</h3>
                <p className="text-[12px] text-[var(--muted-foreground)] mt-1">Manage global storefront security, active sessions, and system maintenance overrides.</p>
              </div>
              <Card className="md:col-span-2 p-6 bg-[var(--card)] border-[var(--border)] space-y-4">
                {/* Global Site Access Lock Card */}
                <div className="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg bg-[var(--background)]">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      loginRequired ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                      {loginRequired ? <ShieldCheck className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-bold">Global Authentication Gate</p>
                        <Badge variant="outline" className={cn(
                          "text-[9px] font-bold px-1.5 py-0",
                          loginRequired ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5" : "border-rose-500/30 text-rose-500 bg-rose-500/5"
                        )}>
                          {loginRequired ? "ENFORCED" : "DEACTIVATED"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                        {loginRequired 
                          ? "Secured storefront. Users must authenticate before browsing pages." 
                          : "Unsecured public bypass active. Anyone can view the site without credentials."}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className={cn(
                      "text-[11px] h-8 border-[var(--border)] font-bold uppercase tracking-wider",
                      loginRequired ? "text-rose-400 hover:bg-rose-500/10" : "text-emerald-400 hover:bg-emerald-500/10"
                    )}
                    onClick={async () => {
                      if (loginRequired) {
                        setIsGateModalOpen(true);
                      } else {
                        // Turning security ON is safe, toggle directly
                        const res = await toggleLoginGate("");
                        if (res.success) {
                          toast.success("Global Authentication Gate enabled successfully.");
                        } else {
                          toast.error(res.error || "Failed to enable gate.");
                        }
                      }
                    }}
                  >
                    {loginRequired ? "Disable Lock" : "Enable Lock"}
                  </Button>
                </div>

                {/* Maintenance Mode Toggle Card */}
                <div className="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg bg-[var(--background)]">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      siteSettings?.maintenanceMode ? "bg-rose-500/10 text-rose-500 animate-pulse" : "bg-neutral-500/10 text-[var(--muted-foreground)]"
                    )}>
                      <Settings className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-bold">Storefront Maintenance Mode</p>
                        {siteSettings?.maintenanceMode && (
                          <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0 border-rose-500/30 text-rose-500 bg-rose-500/5">
                            OFFLINE
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                        Disable storefront browsing and show a premium &quot;Under Construction&quot; notice.
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    disabled={togglingMaintenance}
                    className={cn(
                      "text-[11px] h-8 border-[var(--border)] font-bold uppercase tracking-wider",
                      siteSettings?.maintenanceMode ? "text-rose-400 hover:bg-rose-500/10" : "text-neutral-400 hover:bg-white/5"
                    )}
                    onClick={async () => {
                      setTogglingMaintenance(true);
                      const newMode = !siteSettings?.maintenanceMode;
                      const res = await saveSiteSettings({ ...siteSettings, maintenanceMode: newMode });
                      setTogglingMaintenance(false);
                      if (res.success) {
                        setSiteSettings((prev: any) => ({ ...prev, maintenanceMode: newMode }));
                        toast.success(newMode ? "Maintenance Mode activated. Storefront is offline." : "Maintenance Mode deactivated. Storefront is live!");
                      } else {
                        toast.error(res.message || "Failed to toggle maintenance mode.");
                      }
                    }}
                  >
                    {togglingMaintenance ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (siteSettings?.maintenanceMode ? "Disable Mode" : "Enable Mode")}
                  </Button>
                </div>

                {/* Clear Cache Card */}
                <div className="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg bg-[var(--background)]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold">Production Cache Invalidation</p>
                      <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                        Forces Next.js static engine to purge and fetch latest collections from DB.
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    disabled={clearingCache}
                    className="text-[11px] h-8 border-[var(--border)] text-amber-400 hover:bg-amber-500/10 font-bold uppercase tracking-wider"
                    onClick={async () => {
                      setClearingCache(true);
                      const res = await clearNextCache();
                      setClearingCache(false);
                      if (res.success) {
                        toast.success("Static site cache purged successfully.");
                      } else {
                        toast.error(res.message || "Failed to purge cache.");
                      }
                    }}
                  >
                    {clearingCache ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Purge Cache"}
                  </Button>
                </div>

                {/* Active Session details */}
                <div className="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg bg-[var(--background)]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold">Active Admin Credentials Session</p>
                      <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                        Logged as: <strong className="text-[var(--primary)]">{user?.email ?? 'admin@fashcon.store'}</strong> · Privilege: <strong className="uppercase text-[var(--primary)]">{profile?.role ?? 'ADMIN'}</strong>
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-[11px] h-8 border-[var(--border)] text-rose-400 hover:bg-rose-500/10 font-bold uppercase tracking-wider"
                    onClick={async () => {
                      await logout();
                      router.push('/login');
                      toast.success("Active authentication credentials cleared.");
                    }}
                  >
                    Force Logout
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Infrastructure Settings */}
          <TabsContent value="infrastructure" className="mt-6">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--muted-foreground)]">System Health</h3>
                <p className="text-[12px] text-[var(--muted-foreground)] mt-1">Monitor database and server connectivity.</p>
              </div>
              <Card className="md:col-span-2 p-6 bg-[var(--card)] border-[var(--border)] space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-500" />
                        <span className="text-[12px] font-bold">MongoDB Atlas</span>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px]">ONLINE</Badge>
                    </div>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-2 uppercase tracking-wider font-bold opacity-60">Latency: 24ms · Shard: Cluster0</p>
                  </div>
                  <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cloud className="w-4 h-4 text-blue-500" />
                        <span className="text-[12px] font-bold">Cloudinary CDN</span>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px]">HEALTHY</Badge>
                    </div>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-2 uppercase tracking-wider font-bold opacity-60">Delivery: Optimal · Assets: 1,240</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border)]">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-3">Developer Tokens</h4>
                  <div className="flex items-center gap-2">
                    <Input readOnly value="CLD_API_KEY_51P8J0K..." className="font-mono text-[12px] bg-[var(--background)] border-[var(--border)]" />
                    <Button variant="outline" className="border-[var(--border)] text-[12px]">Revoke</Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ═══════════════════════════════ SECURITY GATE MODAL */}
      {isGateModalOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/65 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => !gateLoading && setIsGateModalOpen(false)}
        >
          <div
            className="w-full max-w-sm mx-4 bg-neutral-950 border border-white/10 rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-250"
            onClick={(e) => e.stopPropagation()}
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Verification</h3>
                  <p className="text-[10px] text-white/40 font-medium">Clearance verification required.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !gateLoading && setIsGateModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-white/50 leading-relaxed font-medium">
              Enter the security confirmation password to unlock the storefront access. This will deactivate credentials prompt.
            </p>

            {/* Input Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!gatePassword.trim()) {
                  setGateError('Confirmation password is required.');
                  return;
                }
                setGateLoading(true);
                setGateError('');
                const result = await toggleLoginGate(gatePassword);
                setGateLoading(false);
                if (result.success) {
                  setIsGateModalOpen(false);
                  setGatePassword('');
                  toast.success("Global Authentication Gate disabled successfully.");
                } else {
                  setGateError(result.error || 'Invalid credentials or verification failed.');
                  setGatePassword('');
                  gateInputRef.current?.focus();
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-wider text-white/40 block">Security Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-white/20" />
                  <input
                    ref={gateInputRef}
                    type={showGatePassword ? 'text' : 'password'}
                    value={gatePassword}
                    onChange={(e) => { setGatePassword(e.target.value); setGateError(''); }}
                    placeholder="Enter gate password"
                    autoComplete="off"
                    disabled={gateLoading}
                    className="w-full h-10 pl-10 pr-10 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 focus:bg-white/8 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGatePassword(!showGatePassword)}
                    className="absolute right-2 top-1.5 w-7 h-7 rounded-lg bg-transparent flex items-center justify-center text-white/30 hover:text-white transition-colors"
                  >
                    {showGatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {gateError && (
                <div className="text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-center gap-2 animate-in fade-in duration-200">
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
                  className="flex-1 h-9 rounded-xl border-white/10 text-white/50 text-[10px] uppercase font-bold tracking-wider hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={gateLoading}
                  className="flex-1 h-9 rounded-xl bg-rose-500 text-white text-[10px] uppercase font-bold tracking-wider hover:bg-rose-600 disabled:opacity-40"
                >
                  {gateLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify & Unlock"}
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
