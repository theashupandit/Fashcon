'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
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
  ArrowUpRight,
  Fingerprint,
  LayoutDashboard,
  Download as DownloadIcon
} from 'lucide-react';
import { getUsers, updateUserRole, deleteUser } from '@/app/actions/users';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import StatsCard from "@/components/admin/StatsCard";

interface UserProfile {
  _id: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin' | 'super_admin';
  photoURL?: string;
  lastLogin?: string;
}

export default function UsersPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/admin');
      return;
    }
    fetchUsers();
  }, [authLoading, isAdmin, router]);

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
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      setUsers(users.filter(u => u._id !== id));
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Failed to delete user");
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
    const admins = users.filter(u => u.role === 'admin').length;
    const superAdmins = users.filter(u => u.role === 'super_admin').length;
    const activeToday = users.filter(u => {
      if (!u.lastLogin) return false;
      const lastLoginDate = new Date(u.lastLogin);
      const today = new Date();
      return lastLoginDate.toDateString() === today.toDateString();
    }).length;

    return [
      { label: 'Total Personnel', value: total.toString(), icon: UsersIcon, color: 'text-blue-500', change: '+2', trend: 'up' },
      { label: 'System Admins', value: admins.toString(), icon: Shield, color: 'text-purple-500', change: '0', trend: 'up' },
      { label: 'Super Admins', value: superAdmins.toString(), icon: ShieldAlert, color: 'text-rose-500', change: '0', trend: 'up' },
      { label: 'Active Today', value: activeToday.toString(), icon: UserCheck, color: 'text-emerald-500', change: '+1', trend: 'up' },
    ];
  }, [users]);

  if (authLoading || !isAdmin) return null;

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
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)]">Personnel</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--foreground)] to-[var(--foreground)]/40 uppercase">
            Access <span className="text-neutral-400">Registry</span>
          </h1>
          <p className="text-[13px] font-medium opacity-40 uppercase tracking-[0.2em]">Administrative Governance & Access Control</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-11 px-6 rounded-2xl border-[var(--border)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--primary)]/5 transition-all active:scale-95 gap-2"
          >
            <DownloadIcon className="w-4 h-4" />
            Export Registry
          </Button>
          <Button 
            className="h-11 px-6 rounded-2xl bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 font-black uppercase tracking-widest text-[11px] gap-2 shadow-xl border-none active:scale-95"
          >
            <UserPlus size={18} /> Provision Access
          </Button>
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
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Contact / Metadata</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Recent Activity</TableHead>
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
                      <p className="text-[13px] font-black uppercase tracking-widest">No users identified</p>
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
                          {user.lastLogin && (
                             <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[var(--card)]" />
                          )}
                        </div>
                        <div>
                          <p className="text-[14px] font-black leading-tight tracking-tight uppercase">{user.displayName || 'Anonymous'}</p>
                          <p className="text-[10px] font-black uppercase tracking-tighter opacity-30 mt-1">Ref: {user._id.substr(0, 12)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-3 py-1 border shadow-sm rounded-xl",
                        user.role === 'super_admin' ? "bg-rose-500 text-white border-rose-600" :
                        user.role === 'admin' ? "bg-neutral-900 text-white border-neutral-800" :
                        "bg-[var(--muted)]/50 text-[var(--muted-foreground)] border-[var(--border)]"
                      )}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[12px] font-black opacity-70">
                          <Mail size={12} className="opacity-40" />
                          {user.email}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-20">Verified Identity</p>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2 text-[12px] font-black text-[var(--muted-foreground)]">
                         <Calendar size={13} className="opacity-40" />
                         {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never Active'}
                       </div>
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-2xl hover:bg-[var(--foreground)]/10 transition-colors">
                            <MoreVertical size={18} className="opacity-40" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-2 shadow-sm">
                           <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 px-3 py-2">Escalation Protocol</DropdownMenuLabel>
                           <DropdownMenuItem 
                            onClick={() => updateRole(user._id, 'admin')}
                            className="gap-3 cursor-pointer py-3 px-4 rounded-xl font-black uppercase tracking-widest text-[11px]"
                           >
                              <ShieldAlert size={16} className="text-purple-500" /> Promote to System Admin
                           </DropdownMenuItem>
                           <DropdownMenuItem 
                            onClick={() => updateRole(user._id, 'user')}
                            className="gap-3 cursor-pointer py-3 px-4 rounded-xl font-black uppercase tracking-widest text-[11px]"
                           >
                              <Shield size={16} className="opacity-40" /> Revoke Admin Status
                           </DropdownMenuItem>
                           <DropdownMenuSeparator className="bg-[var(--border)]/50 my-2" />
                           <DropdownMenuItem 
                            onClick={() => handleDelete(user._id)}
                            className="gap-3 text-rose-500 focus:text-rose-600 focus:bg-rose-500/10 cursor-pointer py-3 px-4 rounded-xl font-black uppercase tracking-widest text-[11px]"
                           >
                              <Trash2 size={16} /> De-provision Personnel
                           </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
