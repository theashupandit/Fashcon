'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Save, User, Mail, Lock, Shield, 
  Image as ImageIcon, Loader2, Phone, 
  Building2, Eye, EyeOff, KeyRound 
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { useForm } from 'react-hook-form';

interface ProfileFormValues {
  displayName: string;
  username: string;
  phone: string;
  office: string;
  bio: string;
  photoURL: string;
}

export default function ProfilePage() {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Peek states for secure read-only credentials
  const [peekEmail, setPeekEmail] = useState(false);
  const [peekPassword, setPeekPassword] = useState(false);

  // Extract env values safely to allow the peek function to reveal actual credentials
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@fashcon.store';
  const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin_password_123';
  const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'super@fashcon.store';
  const superAdminPass = process.env.NEXT_PUBLIC_SUPER_ADMIN_PASSWORD || 'super_password_123';

  // Determine actual email & password to show when peeking
  const actualEmail = profile?.email || adminEmail;
  const actualPassword = 
    profile?.email === superAdminEmail 
      ? superAdminPass 
      : profile?.email === adminEmail 
        ? adminPass 
        : '••••••••'; // Default fallback for DB-backed managers

  const { register, handleSubmit, reset, watch, setValue } = useForm<ProfileFormValues>({
    defaultValues: {
      displayName: '',
      username: '',
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
        toast.success('Administrative identity synchronized successfully!');
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
      toast.error('Please upload a valid image file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default');
    formData.append('folder', 'profiles');

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'fashconcloud';
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.secure_url) {
        setValue('photoURL', data.secure_url);
        // Save photoURL immediately to both database and context
        await updateProfile({ photoURL: data.secure_url });
        toast.success('Profile avatar updated successfully!');
      } else {
        toast.error('Failed to upload image. Please try again.');
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

  const initials = watchDisplayName?.[0]?.toUpperCase() || actualEmail?.[0]?.toUpperCase() || 'A';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] animate-in fade-in duration-500">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight uppercase">My Profile</h1>
            <p className="text-[12px] font-medium opacity-40 uppercase tracking-widest">Manage your personal operational profile</p>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-12 px-8 rounded-2xl bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 gap-3 text-[11px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
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
                <Input {...register('username')} className="bg-[var(--background)] border-[var(--border)] h-12 rounded-xl font-bold text-[13px] focus:ring-1 focus:ring-[var(--primary)]/20" placeholder="e.g. admin_pro" />
              </div>

              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] opacity-50">Office Location</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors" />
                  <Input {...register('office')} className="bg-[var(--background)] border-[var(--border)] h-12 pl-12 rounded-xl font-bold text-[13px] focus:ring-1 focus:ring-[var(--primary)]/20" placeholder="e.g. Mumbai HQ" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] opacity-50">Administrative Bio</label>
            <textarea
              {...register('bio')}
              className="w-full min-h-[140px] resize-none rounded-[1.5rem] border border-[var(--border)] bg-[var(--background)] p-5 text-[13px] font-medium outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
              placeholder="Write a brief bio about your role and responsibilities..."
            />
          </div>
        </Card>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start animate-in slide-in-from-right duration-700">
        {/* Avatar Upload Card */}
        <Card className="rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm flex flex-col gap-6 items-center justify-center text-center">
          <div className="relative group">
            <div className="w-28 h-28 rounded-[2rem] border-2 border-dashed border-[var(--border)] flex items-center justify-center overflow-hidden transition-all group-hover:border-[var(--primary)]/50 bg-[var(--background)]">
              {watchPhotoURL ? (
                <img src={watchPhotoURL} alt="Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-3xl font-black">
                  {initials}
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-[2rem]">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 transition-all border-4 border-[var(--card)]">
              <ImageIcon className="w-4 h-4" />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
            </label>
          </div>
          <div className="space-y-1">
            <p className="text-[12px] font-black uppercase tracking-widest text-[var(--foreground)]">Profile Image</p>
            <p className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-tighter opacity-50">JPG, PNG or WEBP (Max 2MB)</p>
          </div>
        </Card>

        {/* Secure Credentials Peek Card */}
        <Card className="rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--muted-foreground)] opacity-50">Secure Credentials</p>
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-lg">
              Vault Protected
            </Badge>
          </div>

          <div className="space-y-4">
            {/* Primary Email (Read Only + Peek Toggle) */}
            <div className="grid gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] opacity-40">Primary Email</span>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-4 h-4 text-[var(--muted-foreground)] opacity-45" />
                <input 
                  type="text" 
                  value={peekEmail ? actualEmail : '•••••••••••••••••••••'} 
                  readOnly 
                  className="w-full bg-[var(--background)] border border-[var(--border)] h-12 pl-12 pr-12 rounded-xl font-mono text-[11px] font-bold outline-none opacity-80"
                />
                <button 
                  type="button" 
                  onClick={() => setPeekEmail(!peekEmail)}
                  className="absolute right-3 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--foreground)]/5 text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-all"
                  title="Reveal Email"
                >
                  {peekEmail ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Account Password (Read Only + Peek Toggle) */}
            <div className="grid gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] opacity-40">Account Password</span>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-4 h-4 text-[var(--muted-foreground)] opacity-45" />
                <input 
                  type="text" 
                  value={peekPassword ? actualPassword : '•••••••••••••••••••••'} 
                  readOnly 
                  className="w-full bg-[var(--background)] border border-[var(--border)] h-12 pl-12 pr-12 rounded-xl font-mono text-[11px] font-bold outline-none opacity-80"
                />
                <button 
                  type="button" 
                  onClick={() => setPeekPassword(!peekPassword)}
                  className="absolute right-3 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--foreground)]/5 text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-all"
                  title="Reveal Password"
                >
                  {peekPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>
        </Card>
      </aside>
    </form>
  );
}
