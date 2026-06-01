'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/components/ThemeProvider';
import { 
  Users as UsersIcon, 
  Search, 
  Plus, 
  ShieldAlert, 
  Shield, 
  MoreVertical, 
  Edit2, 
  Trash2,
  Mail,
  Calendar,
  Loader2,
  CheckCircle2,
  UserCheck,
  UserPlus,
  Fingerprint,
  LayoutDashboard,
  Download as DownloadIcon,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  Settings as SettingsIcon,
  Check,
  AlertTriangle,
  X
} from 'lucide-react';
import { getUsers, updateUserRole, deleteUser, createOperator, updateOperator } from '@/app/actions/users';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import StatsCard from "@/components/admin/StatsCard";

interface UserProfile {
  _id: string;
  email: string;
  displayName: string;
  role: 'user' | 'manager' | 'admin' | 'super_admin';
  photoURL?: string;
  lastLogin?: string;
  password?: string;
  permissions?: {
    dashboard: boolean;
    analytics: boolean;
    store: boolean;
    products: boolean;
    media: boolean;
    inbox: boolean;
    blogs: boolean;
    marketing: boolean;
    pinterest: boolean;
    settings: boolean;
  };
}

const DEFAULT_PERMISSIONS = {
  dashboard: true,
  analytics: false,
  store: false,
  products: false,
  media: false,
  inbox: false,
  blogs: false,
  marketing: false,
  pinterest: false,
  settings: false,
};

export default function UsersPage() {
  const { isSuperAdmin, isAdmin, loading: authLoading, profile } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    role: 'manager' as UserProfile['role'],
    password: '',
    permissions: { ...DEFAULT_PERMISSIONS }
  });

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) {
      toast.error("Restricted Access: Operator management is reserved for Super Admins only.");
      router.push('/');
      return;
    }
    fetchUsers();
  }, [authLoading, isSuperAdmin, router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, newRole: UserProfile['role']) => {
    if (!isSuperAdmin) {
      toast.error("Access Denied: Master Clearance required to modify privilege levels");
      return;
    }
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success(`Personnel privilege elevated to ${newRole}`);
    } catch (error) {
      toast.error("Failed to sync privilege level");
    }
  };

  const [deleteUserConfirmId, setDeleteUserConfirmId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (!isSuperAdmin) {
      toast.error("Access Denied: Master account purging is reserved for Super Admins");
      return;
    }
    setDeleteUserConfirmId(id);
  };

  const executeDelete = async (id: string) => {
    try {
      await deleteUser(id);
      setUsers(users.filter(u => u._id !== id));
      toast.success("Personnel account purged successfully!");
    } catch (error) {
      toast.error("Failed to purge user account");
    }
  };

  const handleOpenCreateModal = () => {
    if (!isSuperAdmin) {
      toast.error("Security Enforcement: Master Clearance required to provision new operators");
      return;
    }
    setModalMode('create');
    setSelectedUserId(null);
    setFormData({
      displayName: '',
      email: '',
      role: 'manager',
      password: '',
      permissions: { ...DEFAULT_PERMISSIONS }
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserProfile) => {
    if (!isSuperAdmin) {
      toast.error("Security Enforcement: Master Clearance required to modify credentials");
      return;
    }
    setModalMode('edit');
    setSelectedUserId(user._id);
    setFormData({
      displayName: user.displayName || '',
      email: user.email || '',
      role: user.role,
      password: user.password || '',
      permissions: user.permissions ? { ...DEFAULT_PERMISSIONS, ...user.permissions } : { ...DEFAULT_PERMISSIONS }
    });
    setIsModalOpen(true);
  };

  const handleTogglePermission = (key: keyof typeof DEFAULT_PERMISSIONS) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key]
      }
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      toast.error("Access Denied");
      return;
    }
    if (!formData.displayName || !formData.email) {
      toast.error("Name and Email are required");
      return;
    }
    if (modalMode === 'create' && !formData.password) {
      toast.error("Password is required for provisioning separate credentials");
      return;
    }

    setSubmitting(true);
    try {
      const submissionData = {
        displayName: formData.displayName,
        email: formData.email,
        role: formData.role,
        password: formData.password,
        permissions: (formData.role === 'admin' || formData.role === 'super_admin') ? {
          dashboard: true, analytics: true, store: true, products: true, media: true, inbox: true, blogs: true, marketing: true, pinterest: true, settings: true
        } : formData.permissions
      };

      if (modalMode === 'create') {
        const newUser = await createOperator(submissionData);
        setUsers(prev => [newUser, ...prev]);
        toast.success("New personnel successfully provisioned!");
      } else if (selectedUserId) {
        const updatedUser = await updateOperator(selectedUserId, submissionData);
        setUsers(prev => prev.map(u => u._id === selectedUserId ? updatedUser : u));
        toast.success("Personnel credentials and permissions updated!");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save personnel configurations");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user._id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const stats = useMemo(() => {
    const total = users.length;
    const managers = users.filter(u => u.role === 'manager').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const superAdmins = users.filter(u => u.role === 'super_admin').length;

    return [
      { label: 'Total Operators', value: total.toString(), icon: UsersIcon, color: 'text-blue-500', change: '+2', trend: 'up' },
      { label: 'Managers (Limited)', value: managers.toString(), icon: KeyRound, color: 'text-amber-500', change: '+2', trend: 'up' },
      { label: 'System Admins', value: admins.toString(), icon: Shield, color: 'text-purple-500', change: '0', trend: 'up' },
      { label: 'Super Admins', value: superAdmins.toString(), icon: ShieldAlert, color: 'text-rose-500', change: '0', trend: 'up' },
    ];
  }, [users]);

  if (authLoading || !isSuperAdmin) return null;

  const t = isDark ? {
    modalBg: 'linear-gradient(145deg, rgba(20,20,20,0.98), rgba(12,12,12,0.99))',
    modalBorder: 'rgba(255,255,255,0.08)',
    inputBg: 'rgba(255,255,255,0.05)',
    inputBorder: 'rgba(255,255,255,0.1)',
    textPrimary: '#fff',
    textMuted: 'rgba(255,255,255,0.4)',
    badgeBg: 'rgba(255,255,255,0.05)',
  } : {
    modalBg: 'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,248,248,0.99))',
    modalBorder: 'rgba(0,0,0,0.08)',
    inputBg: 'rgba(0,0,0,0.04)',
    inputBorder: 'rgba(0,0,0,0.08)',
    textPrimary: '#0a0a0a',
    textMuted: 'rgba(0,0,0,0.4)',
    badgeBg: 'rgba(0,0,0,0.03)',
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* High Impact Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-1">
            <Link 
              href="/" 
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-all"
            >
              <LayoutDashboard size={12} className="group-hover:-translate-x-1 transition-transform" />
              Command
            </Link>
            <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)]">Master Registry</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--foreground)] to-[var(--foreground)]/40 uppercase">
            Personnel <span className="text-neutral-400">Vault</span>
          </h1>
          <p className="text-[13px] font-medium opacity-40 uppercase tracking-[0.2em]">Restricted Master Personnel Control & Clearance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-11 px-6 rounded-2xl border-[var(--border)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--primary)]/5 transition-all active:scale-95 gap-2"
          >
            <DownloadIcon className="w-4 h-4" />
            Export Audit Log
          </Button>
          {isSuperAdmin && (
            <Button 
              onClick={handleOpenCreateModal}
              className="h-11 px-6 rounded-2xl bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 font-black uppercase tracking-widest text-[11px] gap-2 shadow-xl border-none active:scale-95"
            >
              <UserPlus size={18} /> Provision Operator
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <StatsCard 
            key={i} 
            label={stat.label} 
            value={stat.value} 
            icon={stat.icon} 
            color={stat.color} 
            change={stat.change} 
            trend={stat.trend as 'up' | 'down'} 
          />
        ))}
      </div>

      {/* Active Session & Master Clearance Info */}
      <Card className="bg-[var(--card)] border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-sm p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner flex-shrink-0">
              <Fingerprint className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-1.5 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Session Operator
              </p>
              <h2 className="text-xl font-black uppercase tracking-tight leading-none mb-2">
                {profile?.displayName || 'System Admin'}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-bold text-[var(--muted-foreground)] uppercase">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 opacity-60" />
                  {profile?.email || 'admin@fashcon.store'}
                </span>
                <span className="w-1 h-1 rounded-full bg-[var(--border)] hidden sm:inline" />
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 opacity-60" />
                  Privilege Level: {profile?.role || 'admin'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto p-4 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/25 rounded-2xl max-w-md">
            <Lock className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <p className="mb-0.5">Secure Environment Account</p>
              <p className="text-[9px] opacity-60 leading-normal font-bold">This master admin profile is secured directly in the system configuration (.env) and is locked to prevent accidental deletion or database lockouts.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Active Personnel List */}
      <Card className="bg-[var(--card)] border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-sm">
        <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg font-black tracking-tight">Active Personnel</CardTitle>
            <CardDescription className="text-[11px] font-bold uppercase tracking-widest opacity-40 mt-1">Verified system operators and administrators</CardDescription>
          </div>
          <div className="flex gap-2 p-1 bg-[var(--background)] rounded-xl border border-[var(--border)]">
             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-20 group-focus-within:opacity-100 transition-opacity" />
                <input 
                  placeholder="Search registry..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8 w-48 bg-transparent border-none text-[11px] font-bold focus:ring-0 outline-none placeholder:text-neutral-500 placeholder:uppercase placeholder:tracking-widest"
                />
             </div>
          </div>
        </CardHeader>

        <div className="overflow-x-auto mt-4 border-t border-[var(--border)]/50">
          <Table>
            <TableHeader className="bg-[var(--muted)]/5">
              <TableRow className="border-[var(--border)] hover:bg-transparent">
                <TableHead className="pl-8 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] h-14">Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Privilege Level</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Contact Credentials</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Active Permissions</TableHead>
                <TableHead className="w-[80px] pr-8 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="hover:bg-transparent border-none">
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
                        <div className="absolute inset-0 blur-xl bg-[var(--primary)]/20 animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40">Verifying registry...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow className="hover:bg-transparent border-none">
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 opacity-20">
                      <Fingerprint className="w-12 h-12" />
                      <p className="text-[13px] font-black uppercase tracking-widest">No operators identified</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user._id} className="border-[var(--border)] hover:bg-[var(--foreground)]/[0.02] transition-colors group">
                    <TableCell className="pl-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="w-11 h-11 border-2 border-[var(--border)] group-hover:border-[var(--primary)]/30 transition-all duration-500 rounded-2xl">
                            <AvatarImage src={user.photoURL} />
                            <AvatarFallback className="bg-[var(--primary)]/5 text-[12px] font-black text-[var(--primary)] rounded-2xl">{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <p className="text-[14px] font-black leading-tight tracking-tight uppercase">{user.displayName || 'Anonymous'}</p>
                          <p className="text-[10px] font-black uppercase tracking-tighter opacity-30 mt-1">Ref ID: {user._id.substr(0, 12)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-3 py-1 border shadow-sm rounded-xl",
                        user.role === 'super_admin' ? "bg-rose-500 text-white border-rose-600" :
                        user.role === 'admin' ? "bg-purple-600 text-white border-purple-700" :
                        ['blog_writer', 'support_agent', 'store_manager', 'marketing_specialist'].includes(user.role) ? "bg-blue-600 text-white border-blue-700" :
                        user.role === 'manager' ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-600" :
                        "bg-[var(--muted)]/50 text-[var(--muted-foreground)] border-[var(--border)]"
                      )}>
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[12px] font-black opacity-70">
                          <Mail size={12} className="opacity-40" />
                          {user.email}
                        </div>
                        {user.password ? (
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-amber-500 uppercase tracking-wider">
                            <Lock size={10} /> Password Protected Account
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500 uppercase tracking-wider">
                            <Unlock size={10} /> Direct Access Account
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.role === 'super_admin' || user.role === 'admin' ? (
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                          ALL PERMISSIONS GRANTED
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 max-w-sm">
                          {user.permissions && Object.entries(user.permissions).filter(([, val]) => val).map(([key]) => (
                            <span 
                              key={key} 
                              className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border border-[var(--border)] opacity-60 bg-[var(--background)]"
                            >
                              {key}
                            </span>
                          ))}
                          {(!user.permissions || Object.values(user.permissions).filter(Boolean).length === 0) && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500 opacity-50 italic">
                              No Access Provisioned
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                      {isAdmin && user.role !== 'super_admin' && (
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenEditModal(user)}
                            className="w-9 h-9 rounded-xl hover:bg-blue-500/10 text-blue-500 hover:text-blue-600 transition-all flex items-center justify-center border border-blue-500/0 hover:border-blue-500/20"
                            title="Edit Credentials & Permissions"
                          >
                            <Edit2 size={15} />
                          </Button>
                          {user.role !== 'admin' ? (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => updateRole(user._id, 'admin')}
                              className="w-9 h-9 rounded-xl hover:bg-purple-500/10 text-purple-500 hover:text-purple-600 transition-all flex items-center justify-center border border-purple-500/0 hover:border-purple-500/20"
                              title="Promote to System Admin"
                            >
                              <ShieldAlert size={15} />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => updateRole(user._id, 'manager')}
                              className="w-9 h-9 rounded-xl hover:bg-neutral-500/10 text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-all flex items-center justify-center border border-[var(--border)]/0 hover:border-[var(--border)]"
                              title="Downgrade to Manager"
                            >
                              <Shield size={15} />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(user._id)}
                            className="w-9 h-9 rounded-xl hover:bg-rose-500/10 text-rose-500 hover:text-rose-600 transition-all flex items-center justify-center border border-rose-500/0 hover:border-rose-500/20"
                            title="Delete Operator"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ═══════════════════════════════ PROVISION ACCESS & EDIT CREDENTIALS MODAL */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            animation: 'fadeIn 0.2s ease-out',
            overflowY: 'auto',
            padding: '40px 16px',
          }}
          onClick={() => !submitting && setIsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 620,
              margin: 'auto',
              background: t.modalBg,
              border: `1px solid ${t.modalBorder}`,
              borderRadius: 32,
              boxShadow: isDark
                ? '0 32px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04) inset'
                : '0 32px 64px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.8) inset',
              overflow: 'hidden',
              animation: 'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 80px)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '28px 28px 20px',
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              background: isDark ? 'rgba(244,63,94,0.04)' : 'rgba(244,63,94,0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: isDark ? 'rgba(244,63,94,0.12)' : 'rgba(244,63,94,0.08)',
                    border: `1px solid rgba(244,63,94,0.2)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <KeyRound style={{ width: 15, height: 15, color: '#f43f5e' }} />
                  </div>
                  <h3 style={{
                    fontSize: 16, fontWeight: 900, color: t.textPrimary,
                    letterSpacing: '-0.02em', margin: 0, textTransform: 'uppercase'
                  }}>
                    {modalMode === 'create' ? 'Provision Access Protocol' : 'Modify Access configurations'}
                  </h3>
                </div>
                <p style={{
                  fontSize: 10, fontWeight: 600, color: t.textMuted,
                  margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                  Granular control over personnel credentials and module access
                </p>
              </div>
              <button
                onClick={() => !submitting && setIsModalOpen(false)}
                style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: t.textMuted,
                }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }} className="scrollbar-hide">
                
                {/* section: Credentials */}
                <div>
                  <h4 style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: t.textMuted, marginBottom: 12 }}>
                    Account Credentials
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: t.textMuted, marginBottom: 6 }}>
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                        placeholder="John Doe"
                        required
                        style={{
                          width: '100%', height: 44, padding: '0 14px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                          background: t.inputBg, border: `1.5px solid ${t.inputBorder}`, outline: 'none', color: t.textPrimary, boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: t.textMuted, marginBottom: 6 }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="operator@fashcon.store"
                        required
                        style={{
                          width: '100%', height: 44, padding: '0 14px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                          background: t.inputBg, border: `1.5px solid ${t.inputBorder}`, outline: 'none', color: t.textPrimary, boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* section: Access Level and Passcode */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: t.textMuted, marginBottom: 6 }}>
                      Privilege Role
                    </label>
                    <Select
                      value={formData.role}
                      onValueChange={(newRole: string | null) => {
                        if (!newRole) return;
                        setFormData(prev => {
                          let newPerms = { ...prev.permissions };
                          if (newRole === 'blog_writer') newPerms = { ...DEFAULT_PERMISSIONS, dashboard: true, blogs: true };
                          else if (newRole === 'support_agent') newPerms = { ...DEFAULT_PERMISSIONS, dashboard: true, inbox: true };
                          else if (newRole === 'store_manager') newPerms = { ...DEFAULT_PERMISSIONS, dashboard: true, store: true, products: true };
                          else if (newRole === 'marketing_specialist') newPerms = { ...DEFAULT_PERMISSIONS, dashboard: true, marketing: true, analytics: true };
                          else if (newRole === 'manager') newPerms = { ...DEFAULT_PERMISSIONS };
                          return { ...prev, role: newRole as any, permissions: newPerms };
                        });
                      }}
                    >
                      <SelectTrigger style={{
                        width: '100%', height: 44, padding: '0 14px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                        background: t.inputBg, border: `1.5px solid ${t.inputBorder}`, outline: 'none', color: t.textPrimary, boxSizing: 'border-box'
                      }}>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manager">Manager (Granular Permissions)</SelectItem>
                        <SelectItem value="blog_writer">Blog Writer (Content Creation)</SelectItem>
                        <SelectItem value="support_agent">Support Agent (Inbox Sync)</SelectItem>
                        <SelectItem value="store_manager">Store Manager (Products & Layout)</SelectItem>
                        <SelectItem value="marketing_specialist">Marketing Specialist (Campaigns)</SelectItem>
                        <SelectItem value="admin">System Administrator (Full Access)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: t.textMuted, marginBottom: 6 }}>
                      Separate Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter account security key"
                        required={modalMode === 'create'}
                        style={{
                          width: '100%', height: 44, paddingLeft: 14, paddingRight: 40, borderRadius: 12, fontSize: 12, fontWeight: 600,
                          background: t.inputBg, border: `1.5px solid ${t.inputBorder}`, outline: 'none', color: t.textPrimary, boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                          width: 28, height: 28, background: 'transparent', border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textMuted
                        }}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* section: Permissions switches (only shown for manager) */}
                {formData.role !== 'admin' && formData.role !== 'super_admin' ? (
                  <div>
                    <h4 style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: t.textMuted, marginBottom: 12 }}>
                      Granular Module Permissions
                    </h4>
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
                      background: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)',
                      padding: 14, borderRadius: 20, border: `1px solid ${t.modalBorder}`
                    }}>
                      {[
                        { key: 'dashboard', label: 'Command Dashboard', desc: 'Read analytics summaries and overview' },
                        { key: 'analytics', label: 'Analytics Intel', desc: 'Read complex spring-based reports' },
                        { key: 'store', label: 'Storefront Editor', desc: 'Manage page configurations & layout' },
                        { key: 'products', label: 'Products Vault', desc: 'Add, modify, and delete product feeds' },
                        { key: 'media', label: 'Assets Studio Pro', desc: 'Manage central media ingestion' },
                        { key: 'inbox', label: 'Inbox Sync Hub', desc: 'Access client support inbox feed' },
                        { key: 'blogs', label: 'Blog Composer Feed', desc: 'Compose editorial and manage items' },
                        { key: 'marketing', label: 'Affiliates & Intel', desc: 'Manage referrals & competitors radar' },
                        { key: 'pinterest', label: 'Pinterest Engine', desc: 'Sync scheduled and publisher pins' },
                        { key: 'settings', label: 'System Configuration', desc: 'Manage system settings & parameters' }
                      ].map((item) => {
                        const active = formData.permissions[item.key as keyof typeof DEFAULT_PERMISSIONS];
                        return (
                          <div
                            key={item.key}
                            onClick={() => handleTogglePermission(item.key as any)}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '10px 14px', borderRadius: 14, cursor: 'pointer',
                              background: active ? (isDark ? 'rgba(244,63,94,0.06)' : 'rgba(244,63,94,0.03)') : 'transparent',
                              border: `1.5px solid ${active ? 'rgba(244,63,94,0.2)' : 'transparent'}`,
                              transition: 'all 0.2s',
                            }}
                            className="group hover:bg-black/5 dark:hover:bg-white/5"
                          >
                            <div style={{ textAlign: 'left', overflow: 'hidden', paddingRight: 8 }}>
                              <p style={{ fontSize: 11, fontWeight: 900, color: active ? '#f43f5e' : t.textPrimary, margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                {item.label}
                              </p>
                              <p style={{ fontSize: 8, fontWeight: 700, color: t.textMuted, margin: '2px 0 0', textTransform: 'uppercase', opacity: 0.5 }}>
                                {item.desc}
                              </p>
                            </div>
                            <div style={{
                              width: 18, height: 18, borderRadius: 6,
                              border: `1.5px solid ${active ? '#f43f5e' : t.inputBorder}`,
                              background: active ? '#f43f5e' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', transition: 'all 0.15s', flexShrink: 0
                            }}>
                              {active && <Check size={12} strokeWidth={4} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: 16, borderRadius: 20, background: 'rgba(16,185,129,0.06)',
                    border: '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', gap: 12
                  }}>
                    <ShieldCheckIcon style={{ color: '#10b981', width: 20, height: 20, flexShrink: 0 }} />
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: 11, fontWeight: 900, color: '#10b981', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        System Admin Clearance Selected
                      </p>
                      <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(16,185,129,0.6)', margin: '2px 0 0', textTransform: 'uppercase' }}>
                        This operator will hold full administrative clearance over all pages and configurations.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{
                padding: '20px 28px',
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                display: 'flex',
                gap: 12
              }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  style={{
                    flex: 1, height: 44, borderRadius: 12,
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                    color: t.textPrimary,
                    fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1, height: 44, borderRadius: 12,
                    background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                    border: 'none', color: '#fff',
                    fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 0.15s',
                    boxShadow: '0 4px 16px rgba(244,63,94,0.3)',
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                      Configuring Access
                    </>
                  ) : (
                    <>
                      <Check style={{ width: 13, height: 13 }} />
                      {modalMode === 'create' ? 'Provision Account' : 'Commit Configuration'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Dialog open={!!deleteUserConfirmId} onOpenChange={(open) => !open && setDeleteUserConfirmId(null)}>
        <DialogContent className="sm:max-w-[400px] bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm p-6 overflow-hidden z-[201] text-zinc-900 dark:text-zinc-100">
          <DialogHeader className="flex flex-col gap-2">
            <DialogTitle className="text-lg font-black tracking-tight text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Delete Operator
            </DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Are you sure you want to permanently delete this operator user account? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteUserConfirmId(null)}
              className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (deleteUserConfirmId) {
                  executeDelete(deleteUserConfirmId);
                  setDeleteUserConfirmId(null);
                }
              }}
              className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 11 2 2 4-4" />
    </svg>
  );
}
