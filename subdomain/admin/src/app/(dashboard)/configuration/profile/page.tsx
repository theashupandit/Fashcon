'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, User, Mail, Lock, Shield, Image as ImageIcon, Loader2, Phone, Building2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { useForm } from 'react-hook-form';

interface ProfileFormValues {
  displayName: string;
  username: string;
  email: string;
  phone: string;
  office: string;
  bio: string;
  photoURL: string;
}

export default function ProfileConfigurationPage() {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, watch, setValue } = useForm<ProfileFormValues>({
    defaultValues: {
      displayName: '',
      username: '',
      email: '',
      phone: '',
      office: '',
      bio: '',
      photoURL: '',
    }
  });

  useEffect(() => {
    if (profile) {
      reset({
        displayName: profile.displayName || '',
        username: (profile as any).username || '',
        email: profile.email || '',
        phone: (profile as any).phone || '',
        office: (profile as any).office || '',
        bio: (profile as any).bio || '',
        photoURL: profile.photoURL || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    setLoading(true);
    try {
      const updated = await updateProfile(data);
      if (updated) {
        toast.success('Identity synchronized with vault');
      }
    } catch (error) {
      toast.error('Failed to sync profile changes');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
    formData.append('folder', 'profiles');

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.secure_url) {
        setValue('photoURL', data.secure_url);
        // Auto save photoURL immediately
        await updateProfile({ photoURL: data.secure_url });
        toast.success('Avatar updated successfully');
      }
    } catch (error) {
      toast.error('Avatar upload failed');
    } finally {
      setUploading(false);
    }
  };

  const watchPhotoURL = watch('photoURL');
  const watchDisplayName = watch('displayName');
  const watchUsername = watch('username');
  const watchEmail = watch('email');

  const initials = watchDisplayName?.[0]?.toUpperCase() || watchEmail?.[0]?.toUpperCase() || 'A';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] animate-in fade-in duration-500">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight uppercase">Profile <span className="text-neutral-500">Configuration</span></h1>
            <p className="text-[13px] font-medium opacity-40 uppercase tracking-widest">Update your administrative identity & security</p>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-12 px-8 rounded-2xl bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 gap-3 text-[11px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile
          </Button>
        </div>

        <Card className="p-8 bg-[var(--card)] border-[var(--border)] rounded-[2rem] shadow-sm space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] opacity-50">Full Identity Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors" />
                  <Input {...register('displayName')} className="bg-[var(--background)] border-[var(--border)] h-12 pl-12 rounded-xl font-bold text-[13px] focus:ring-1 focus:ring-[var(--primary)]/20" />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] opacity-50">Email Address (Primary)</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <Input {...register('email')} readOnly className="bg-[var(--background)]/50 border-[var(--border)] h-12 pl-12 rounded-xl font-bold text-[13px] opacity-60" />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] opacity-50">Contact Phone</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors" />
                  <Input {...register('phone')} className="bg-[var(--background)] border-[var(--border)] h-12 pl-12 rounded-xl font-bold text-[13px] focus:ring-1 focus:ring-[var(--primary)]/20" />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] opacity-50">Admin Username</label>
                <Input {...register('username')} className="bg-[var(--background)] border-[var(--border)] h-12 rounded-xl font-bold text-[13px] focus:ring-1 focus:ring-[var(--primary)]/20" />
              </div>
              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] opacity-50">Access Level</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--primary)]" />
                  <Input value={profile?.role || 'Admin'} readOnly className="bg-[var(--background)]/50 border-[var(--border)] h-12 pl-12 rounded-xl font-bold text-[13px] opacity-60 text-[var(--primary)]" />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] opacity-50">Office Location</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors" />
                  <Input {...register('office')} className="bg-[var(--background)] border-[var(--border)] h-12 pl-12 rounded-xl font-bold text-[13px] focus:ring-1 focus:ring-[var(--primary)]/20" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-[1fr_280px]">
            <div className="grid gap-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] opacity-50">Administrative Bio</label>
              <textarea
                {...register('bio')}
                className="w-full min-h-[160px] resize-none rounded-[1.5rem] border border-[var(--border)] bg-[var(--background)] p-5 text-[13px] font-medium outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
                placeholder="Write a brief bio about your role and responsibilities..."
              />
            </div>
            <div className="flex flex-col gap-6 p-6 rounded-[2rem] border border-[var(--border)] bg-[var(--background)] items-center justify-center text-center">
              <div className="relative group">
                <div className="w-24 h-24 rounded-[2rem] border-2 border-dashed border-[var(--border)] flex items-center justify-center overflow-hidden transition-all group-hover:border-[var(--primary)]/50">
                  {watchPhotoURL ? (
                    <img src={watchPhotoURL} alt="Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/60 flex items-center justify-center text-white text-2xl font-black">
                      {initials}
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-all">
                  <ImageIcon className="w-4 h-4" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                </label>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground)]">Profile Picture</p>
                <p className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-tighter opacity-50">JPG, PNG or GIF (Max 2MB)</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8 bg-[var(--card)] border-[var(--border)] rounded-[2rem] shadow-sm space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-black tracking-tight uppercase">Security <span className="text-neutral-500">& Login</span></h2>
              <p className="text-[12px] font-medium opacity-40 uppercase tracking-widest">Manage your authentication and vault access</p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
              Highly Secure
            </Badge>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] opacity-50">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <Input type="password" placeholder="••••••••" className="bg-[var(--background)] border-[var(--border)] h-12 pl-12 rounded-xl" />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] opacity-50">New Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <Input type="password" placeholder="••••••••" className="bg-[var(--background)] border-[var(--border)] h-12 pl-12 rounded-xl" />
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-[var(--border)]/10">
            <Button variant="outline" type="button" className="h-12 w-full rounded-2xl border-[var(--border)] text-[11px] font-black uppercase tracking-widest gap-3 hover:bg-[var(--primary)]/5 hover:text-[var(--primary)] transition-all">
              <Shield className="w-4 h-4" /> Enable Two-Factor Authentication
            </Button>
          </div>
        </Card>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start animate-in slide-in-from-right duration-700">
        <Card className="rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--primary)]/10 to-transparent rounded-bl-full translate-x-12 -translate-y-12" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="h-14 w-14 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center overflow-hidden">
              {watchPhotoURL ? (
                <img src={watchPhotoURL} alt="Summary Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-[var(--primary)]" />
              )}
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] opacity-50">Profile Summary</p>
              <p className="text-lg font-black tracking-tight uppercase">{watchDisplayName || 'Admin'}</p>
            </div>
          </div>

          <div className="mt-8 space-y-6 relative z-10">
            <div className="space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)] opacity-50">Active Username</span>
              <p className="text-[13px] font-bold tracking-tight">{watchUsername || '—'}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)] opacity-50">Administrative Email</span>
              <p className="text-[13px] font-bold tracking-tight">{watchEmail || '—'}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)] opacity-50">Operational Status</span>
              <div>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg">
                  Active Member
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background)]/50 p-5 relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">System Insight</p>
            </div>
            <p className="text-[12px] font-semibold leading-relaxed opacity-60">Use this panel to synchronize your identity with the global vault and maintain secure administrative access.</p>
          </div>
        </Card>
      </aside>
    </form>
  );
}
