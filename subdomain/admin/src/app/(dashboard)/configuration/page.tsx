'use client';

import React, { useState } from 'react';
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
  Loader2
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


import { getSiteSettings } from '@/app/actions/siteSettings';
import SiteSettingsForm from '@/components/configuration/SiteConfigurationForm';

export default function ConfigurationPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'identity' | 'users' | 'security' | 'infrastructure'>('identity');
  const [siteSettings, setSiteSettings] = useState<any>(null);

  React.useEffect(() => {
    getSiteSettings().then(setSiteSettings);
  }, []);

  const tabSummary = {
    identity: {
      title: 'Site Identity',
      caption: 'Manage your brand, SEO, and global metadata.',
      details: 'Configure the core identity of Fashcon, including logos, social links, and search engine parameters.',
    },
    users: {
      title: 'Administrative Control',
      caption: 'Manage admin accounts and platform permissions.',
      details: 'Invite new operators, assign roles, and keep access limited to the right team members.',
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
            <TabsTrigger value="users" className="gap-2 px-4 data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--primary)] text-[13px] font-medium">
              <User className="w-4 h-4" /> User Management
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 px-4 data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--primary)] text-[13px] font-medium">
              <Shield className="w-4 h-4" /> Security
            </TabsTrigger>
            <TabsTrigger value="infrastructure" className="gap-2 px-4 data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--primary)] text-[13px] font-medium">
              <Database className="w-4 h-4" /> Infrastructure
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

          {/* User Management */}
          <TabsContent value="users" className="mt-6">
            <Card className="bg-[var(--card)] border-[var(--border)] overflow-hidden">
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-[13px] font-bold uppercase tracking-wider">Administrative Users</h3>
                  <Badge variant="outline" className="text-[10px] bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20 px-2 py-0">2 ACTIVE</Badge>
                </div>
                <Button size="sm" className="h-8 bg-[var(--primary)] text-white gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Add Admin
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[var(--muted)]/30 border-b border-[var(--border)]">
                    <tr>
                      <th className="px-6 py-3 font-bold uppercase text-[10px] text-[var(--muted-foreground)] tracking-wider">User</th>
                      <th className="px-6 py-3 font-bold uppercase text-[10px] text-[var(--muted-foreground)] tracking-wider">Role</th>
                      <th className="px-6 py-3 font-bold uppercase text-[10px] text-[var(--muted-foreground)] tracking-wider">Last Active</th>
                      <th className="px-6 py-3 font-bold uppercase text-[10px] text-[var(--muted-foreground)] tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    <tr className="hover:bg-[var(--foreground)]/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-[var(--border)]">
                            <AvatarFallback className="bg-[var(--primary)]/10 text-[var(--primary)] font-bold text-[10px]">AD</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">Admin User</p>
                            <p className="text-[11px] text-[var(--muted-foreground)]">admin@fashcon.com</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/20 text-emerald-500 bg-emerald-500/5">SUPER ADMIN</Badge>
                      </td>
                      <td className="px-6 py-4 text-[var(--muted-foreground)]">Just now</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="w-8 h-8"><MoreVertical className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                    <tr className="hover:bg-[var(--foreground)]/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-[var(--border)]">
                            <AvatarFallback className="bg-blue-500/10 text-blue-500 font-bold text-[10px]">ED</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">Editorial Team</p>
                            <p className="text-[11px] text-[var(--muted-foreground)]">editor@fashcon.com</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-[10px] font-bold border-blue-500/20 text-blue-500 bg-blue-500/5">EDITOR</Badge>
                      </td>
                      <td className="px-6 py-4 text-[var(--muted-foreground)]">2 hours ago</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="w-8 h-8"><MoreVertical className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Access Control</h3>
                <p className="text-[12px] text-[var(--muted-foreground)] mt-1">Manage passwords and authentication methods.</p>
              </div>
              <Card className="md:col-span-2 p-6 bg-[var(--card)] border-[var(--border)] space-y-4">
                <div className="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg bg-[var(--background)]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold">Two-Factor Authentication</p>
                      <p className="text-[11px] text-[var(--muted-foreground)]">Add an extra layer of security to your account.</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="text-[11px] h-8 border-[var(--border)]">Enable</Button>
                </div>
                <div className="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg bg-[var(--background)]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold">Session Management</p>
                      <p className="text-[11px] text-[var(--muted-foreground)]">Log out of all other devices currently logged in.</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="text-[11px] h-8 border-[var(--border)] text-destructive">Reset All</Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Infrastructure Settings */}
          <TabsContent value="infrastructure" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </div>
  );
}
