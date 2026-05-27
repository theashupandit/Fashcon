'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Inbox, 
  Mail, 
  MessageSquare, 
  Trash2, 
  Search, 
  Loader2, 
  Calendar, 
  Clock, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Eye, 
  X, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSubscriptions, deleteSubscription, getMessages, deleteMessage } from '@/app/actions/inbox';
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
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import StatsCard from '@/components/admin/StatsCard';
import PageHeader from '@/components/admin/PageHeader';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

interface Subscriber {
  _id: string;
  email: string;
  createdAt: string;
}

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

const GmailIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <i className={cn("fa-solid fa-envelope", className)} style={{ 
    background: 'linear-gradient(45deg, #4285F4, #EA4335, #FBBC05, #34A853)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block'
  }}></i>
);

export default function InboxPage() {
  const [activeTab, setActiveTab] = useState<'messages' | 'subscribers'>('messages');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string | null;
    type: 'message' | 'subscriber' | null;
    isOpen: boolean;
    isDeleting: boolean;
  }>({
    id: null,
    type: null,
    isOpen: false,
    isDeleting: false,
  });
  
  // Preview message modal state
  const [previewMessage, setPreviewMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchInboxData();
  }, []);

  const fetchInboxData = async () => {
    setLoading(true);
    try {
      const [subsData, msgsData] = await Promise.all([
        getSubscriptions(),
        getMessages()
      ]);
      setSubscribers(subsData);
      setMessages(msgsData);
    } catch (error) {
      console.error("Error loading inbox data:", error);
      toast.error("Failed to fetch inbox records.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscriber = (id: string) => {
    setDeleteConfirm({
      id,
      type: 'subscriber',
      isOpen: true,
      isDeleting: false,
    });
  };

  const handleDeleteMessage = (id: string) => {
    setDeleteConfirm({
      id,
      type: 'message',
      isOpen: true,
      isDeleting: false,
    });
  };

  const onConfirmDelete = async () => {
    if (!deleteConfirm.id || !deleteConfirm.type) return;
    
    setDeleteConfirm(prev => ({ ...prev, isDeleting: true }));
    try {
      if (deleteConfirm.type === 'subscriber') {
        const res = await deleteSubscription(deleteConfirm.id);
        if (res.success) {
          setSubscribers(subscribers.filter(s => s._id !== deleteConfirm.id));
          toast.success("Subscriber removed successfully.");
        }
      } else {
        const res = await deleteMessage(deleteConfirm.id);
        if (res.success) {
          setMessages(messages.filter(m => m._id !== deleteConfirm.id));
          if (previewMessage?._id === deleteConfirm.id) {
            setPreviewMessage(null);
          }
          toast.success("Message deleted successfully.");
        }
      }
    } catch (error) {
      toast.error(`Failed to delete ${deleteConfirm.type}.`);
    } finally {
      setDeleteConfirm({ id: null, type: null, isOpen: false, isDeleting: false });
    }
  };

  const exportSubscribersCSV = () => {
    if (subscribers.length === 0) {
      toast.error("No subscribers to export.");
      return;
    }
    const headers = ["ID", "Email", "Date Joined"];
    const rows = subscribers.map(s => [
      s._id,
      s.email,
      new Date(s.createdAt).toLocaleString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Fashcon_Newsletter_Subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Subscribers list exported successfully!");
  };

  const filteredMessages = useMemo(() => {
    return messages.filter(m => 
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [messages, searchQuery]);

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter(s => 
      s.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [subscribers, searchQuery]);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <PageHeader
        title={<>Inbox <span className="text-neutral-400">Hub</span></>}
        subtitle="User Inquiries & Newsletter Subscriptions"
        badge="Inbox Hub"
        actions={
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => window.open('https://mail.google.com/mail/?view=cm&fs=1', '_blank')}
              className="h-11 px-6 rounded-2xl bg-white text-black hover:bg-zinc-100 font-black uppercase tracking-widest text-[11px] gap-2 shadow-xl border-none active:scale-95 cursor-pointer"
            >
              <GmailIcon className="text-sm" />
              Compose Email
            </Button>
            {activeTab === 'subscribers' && (
              <Button 
                onClick={exportSubscribersCSV}
                className="h-11 px-6 rounded-2xl bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 font-black uppercase tracking-widest text-[11px] gap-2 shadow-xl border-none active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Export Club CSV
              </Button>
            )}
          </div>
        }
      />

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatsCard 
          label="Total Unread Messages" 
          value={messages.length.toString()} 
          icon={MessageSquare} 
          color="text-pink-500" 
        />
        <StatsCard 
          label="Club Subscribers" 
          value={subscribers.length.toString()} 
          icon={() => <GmailIcon className="text-xl" />} 
          color="text-teal-500" 
        />
        <StatsCard 
          label="Weekly Growth Rate" 
          value="+14.8%" 
          icon={Inbox} 
          color="text-purple-500" 
        />
      </div>

      {/* Navigation Controls */}
      <div className="flex border-b border-[var(--border)] gap-8">
        <button
          onClick={() => { setActiveTab('messages'); setSearchQuery(''); }}
          className={cn(
            "pb-4 font-bold text-xs uppercase tracking-widest transition-all relative cursor-pointer",
            activeTab === 'messages' ? "text-[var(--primary)] font-black" : "opacity-50 hover:opacity-100"
          )}
        >
          User Inquiries ({messages.length})
          {activeTab === 'messages' && (
            <motion.div layoutId="inboxTabLine" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--primary)]" />
          )}
        </button>
        <button
          onClick={() => { setActiveTab('subscribers'); setSearchQuery(''); }}
          className={cn(
            "pb-4 font-bold text-xs uppercase tracking-widest transition-all relative cursor-pointer",
            activeTab === 'subscribers' ? "text-[var(--primary)] font-black" : "opacity-50 hover:opacity-100"
          )}
        >
          Newsletter Club ({subscribers.length})
          {activeTab === 'subscribers' && (
            <motion.div layoutId="inboxTabLine" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--primary)]" />
          )}
        </button>
      </div>

      {/* Table Section */}
      <Card className="bg-[var(--card)] border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[var(--border)] bg-[var(--background)]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20 group-focus-within:opacity-100 transition-opacity" />
            <Input 
              placeholder={activeTab === 'messages' ? "Search inquiries..." : "Search subscriber list..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-[var(--background)] border-transparent rounded-2xl text-[13px] font-bold focus:bg-[var(--background)] focus:border-[var(--primary)]/20 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'messages' ? (
            <Table>
              <TableHeader className="bg-[var(--muted)]/20">
                <TableRow className="border-[var(--border)] hover:bg-transparent">
                  <TableHead className="pl-8 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] h-14">Sender Specifications</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Subject / Summary</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Receipt Timestamp</TableHead>
                  <TableHead className="w-[100px] pr-8 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 text-[var(--primary)] animate-spin" />
                        <p className="text-[12px] font-medium text-[var(--muted-foreground)]">Accessing mail pipelines...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredMessages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="w-8 h-8 text-[var(--muted-foreground)]/20" />
                        <p className="text-[13px] font-medium text-[var(--muted-foreground)]">Inquiries empty</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMessages.map((msg) => (
                    <TableRow key={msg._id} className="border-[var(--border)] hover:bg-[var(--foreground)]/5 transition-colors group">
                      <TableCell className="pl-8">
                        <div className="flex items-center gap-3 py-2">
                          <div>
                            <p className="text-[13px] font-semibold">{msg.name}</p>
                            <p className="text-[11px] text-[var(--muted-foreground)] font-medium">{msg.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[400px]">
                          <p className="text-[12px] font-semibold text-[var(--foreground)] truncate">{msg.subject}</p>
                          <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-1">{msg.message}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-[11px] text-[var(--muted-foreground)] font-medium uppercase tracking-tighter flex items-center gap-1.5">
                          <Clock className="w-3 h-3 opacity-40" />
                          {new Date(msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${msg.email}`, '_blank')}
                            className="w-8 h-8 rounded-xl hover:bg-[var(--foreground)]/5 cursor-pointer"
                            title={`Compose mail to ${msg.email}`}
                          >
                            <GmailIcon className="text-[14px]" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setPreviewMessage(msg)}
                            className="w-8 h-8 rounded-xl hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-white cursor-pointer"
                            title="Read message"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteMessage(msg._id)}
                            className="w-8 h-8 rounded-xl hover:bg-red-500/10 text-red-500 cursor-pointer"
                            title="Delete message"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader className="bg-[var(--muted)]/20">
                <TableRow className="border-[var(--border)] hover:bg-transparent">
                  <TableHead className="pl-8 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] h-14">Subscriber Specifications</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Registration Date</TableHead>
                  <TableHead className="w-[80px] pr-8 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 text-[var(--primary)] animate-spin" />
                        <p className="text-[12px] font-medium text-[var(--muted-foreground)]">Accessing club vault...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredSubscribers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="w-8 h-8 text-[var(--muted-foreground)]/20" />
                        <p className="text-[13px] font-medium text-[var(--muted-foreground)]">Subscriptions empty</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscribers.map((sub) => (
                    <TableRow key={sub._id} className="border-[var(--border)] hover:bg-[var(--foreground)]/5 transition-colors group">
                      <TableCell className="pl-8 py-4">
                        <div className="flex items-center gap-3">
                          <GmailIcon className="text-[14px]" />
                          <span className="text-[13px] font-bold text-white tracking-wide">{sub.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-[11px] text-[var(--muted-foreground)] font-medium uppercase tracking-tighter flex items-center gap-1.5">
                          <Clock className="w-3 h-3 opacity-40" />
                          {new Date(sub.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${sub.email}`, '_blank')}
                            className="w-8 h-8 rounded-xl hover:bg-[var(--foreground)]/5 cursor-pointer"
                            title={`Compose mail to ${sub.email}`}
                          >
                            <GmailIcon className="text-[14px]" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteSubscriber(sub._id)}
                            className="w-8 h-8 rounded-xl hover:bg-red-500/10 text-red-500 cursor-pointer"
                            title="Delete subscription"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="p-4 border-t border-[var(--border)] bg-[var(--muted)]/10 flex items-center justify-between">
          <p className="text-[11px] text-[var(--muted-foreground)] font-medium">
            Showing {activeTab === 'messages' ? filteredMessages.length : filteredSubscribers.length} total entries
          </p>
        </div>
      </Card>

      {/* Preview Message Modal Drawer */}
      <AnimatePresence>
        {previewMessage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewMessage(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-[2.5rem] shadow-2xl overflow-hidden z-10 p-8 sm:p-10"
            >
              <button 
                onClick={() => setPreviewMessage(null)}
                className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="space-y-6">
                <div>
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border-[var(--primary)]/20 text-[var(--primary)] bg-[var(--primary)]/5 mb-3">
                    User Message
                  </Badge>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white line-clamp-2">
                    {previewMessage.subject}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-b border-[var(--border)] py-4 my-2">
                  <div>
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Sender</span>
                    <span className="text-[13px] font-bold text-white flex items-center gap-1.5 mt-0.5">
                      <User size={13} className="opacity-40" />
                      {previewMessage.name}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Email Address</span>
                    <a 
                      href={`mailto:${previewMessage.email}`} 
                      className="text-[13px] font-bold text-[var(--primary)] hover:underline flex items-center gap-1.5 mt-0.5"
                    >
                      <GmailIcon className="text-[14px]" />
                      {previewMessage.email}
                    </a>
                  </div>
                </div>

                <div>
                  <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-2">Message Body</span>
                  <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-5 text-sm leading-relaxed text-zinc-300 font-medium whitespace-pre-wrap max-h-[220px] overflow-y-auto">
                    {previewMessage.message}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-[var(--muted-foreground)] font-medium flex items-center gap-1.5">
                    <Calendar size={13} className="opacity-40" />
                    Received: {new Date(previewMessage.createdAt).toLocaleString()}
                  </span>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        window.location.href = `mailto:${previewMessage.email}?subject=RE: ${encodeURIComponent(previewMessage.subject)}`;
                      }}
                      className="h-10 px-5 rounded-xl border-[var(--border)] text-xs font-black uppercase tracking-widest hover:bg-[var(--primary)]/5 transition-all cursor-pointer"
                    >
                      Compose Reply
                    </Button>
                    <Button 
                      onClick={() => handleDeleteMessage(previewMessage._id)}
                      className="h-10 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest transition-all cursor-pointer border-none"
                    >
                      Delete Inquiry
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
        onConfirm={onConfirmDelete}
        isLoading={deleteConfirm.isDeleting}
        title={deleteConfirm.type === 'subscriber' ? "Remove Subscriber" : "Delete Message"}
        description={deleteConfirm.type === 'subscriber' 
          ? "Are you sure you want to remove this email from your newsletter club? This action cannot be undone." 
          : "Are you sure you want to delete this inquiry? This message will be permanently removed from your hub."
        }
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
