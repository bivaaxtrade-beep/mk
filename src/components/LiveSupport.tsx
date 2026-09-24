import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronLeft, 
  ChevronDown, 
  Send, 
  Paperclip, 
  Headphones, 
  MessageCircle, 
  Plus, 
  Image as ImageIcon, 
  Clock, 
  CheckCheck, 
  User, 
  ShieldCheck,
  Trash2,
  ExternalLink,
  MessageSquare,
  Zap,
  Wallet,
  CreditCard
} from 'lucide-react';
import { 
  db, 
  auth, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDoc
} from '../firebase';
import { toast } from 'react-hot-toast';
import { useI18n } from '../context/I18nContext';
import { useTranslation } from '../lib/translations';

interface LiveSupportProps {
  onClose: () => void;
  userId: string;
}

interface TicketMessage {
  id?: string;
  ticketId?: string;
  senderId?: string;
  senderName?: string;
  senderType?: 'user' | 'support' | 'agent' | 'bot';
  isAdmin?: boolean;
  text?: string;
  message?: string;
  attachments?: string[];
  createdAt?: number;
  isRead?: boolean;
}

interface SupportTicket {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  subject?: string;
  category?: string;
  status?: 'open' | 'pending' | 'resolved' | 'closed' | string;
  lastMessage?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface QuickOption {
  label: string;
  msg?: string;
  action?: 'back' | 'custom_add' | string;
  children?: QuickOption[];
}

const DEFAULT_MENU_STRUCTURE: QuickOption[] = [
  { label: 'Talk to Agent 👤', msg: 'Transfer me to a live agent' },
  {
    label: 'Deposit Help 💰',
    children: [
      { label: 'USDT TRC-20 Help ⚡', msg: 'I need help with my USDT (TRC-20) deposit' },
      { label: 'USDT BEP-20 Help 🪙', msg: 'I need help with my USDT (BEP-20) deposit' },
      { label: 'Binance Pay Help 💳', msg: 'I need help with Binance Pay / Direct Transfer' },
      { label: 'Wrong Network Help ⚠️', msg: 'I transferred using a wrong network' },
      { label: 'Back to Main Menu ↩️', action: 'back' }
    ]
  },
  {
    label: 'Withdrawal Status 💳',
    children: [
      { label: 'Withdrawal Processing Time 🕒', msg: 'What is the standard withdrawal SLA processing time?' },
      { label: 'Why is my withdrawal pending? ⏳', msg: 'Why is my withdrawal showing as pending?' },
      { label: 'Change Wallet Address 🔄', msg: 'How do I change my registered withdrawal wallet address?' },
      { label: 'Back to Main Menu ↩️', action: 'back' }
    ]
  },
  {
    label: 'Verification 🛡️',
    children: [
      { label: 'KYC Document Guidelines 📋', msg: 'What are the official KYC verification guidelines and rules?' },
      { label: 'ID Card Rejected ❌', msg: 'Why was my ID card verification rejected?' },
      { label: 'Selfie Verification Rules 🤳', msg: 'How do I take and upload a valid selfie for account verification?' },
      { label: 'Back to Main Menu ↩️', action: 'back' }
    ]
  },
  {
    label: 'Promo Codes 🎁',
    children: [
      { label: 'Active Deposit Promos 🔥', msg: 'Are there any active deposit promo codes available right now?' },
      { label: 'Affiliate Campaign Details 👥', msg: 'How can I participate in affiliate promotion and postback campaigns?' },
      { label: 'Back to Main Menu ↩️', action: 'back' }
    ]
  }
];

export const LiveSupport: React.FC<LiveSupportProps> = ({ onClose, userId }) => {
  const [view, setView] = useState<'list' | 'chat' | 'new'>('list');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showTxSelector, setShowTxSelector] = useState(false);
  const [aiActions, setAiActions] = useState<string[]>([]);

  const currentUser = auth.currentUser;
  const currentUid = currentUser?.uid || userId || 'guest_user';

  // Dynamic Options states
  const [activeMenu, setActiveMenu] = useState<QuickOption[]>(DEFAULT_MENU_STRUCTURE);
  const [customShortcuts, setCustomShortcuts] = useState<{ label: string; msg: string }[]>(() => {
    try {
      const saved = localStorage.getItem(`custom_shortcuts_${currentUid}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [showAddShortcut, setShowAddShortcut] = useState(false);
  const [newShortcutLabel, setNewShortcutLabel] = useState('');
  const [newShortcutMsg, setNewShortcutMsg] = useState('');

  // Persist custom shortcuts
  useEffect(() => {
    localStorage.setItem(`custom_shortcuts_${currentUid}`, JSON.stringify(customShortcuts));
  }, [customShortcuts, currentUid]);

  const handleOptionClick = (option: QuickOption) => {
    if (option.action === 'back') {
      setActiveMenu(DEFAULT_MENU_STRUCTURE);
      return;
    }

    if (option.children) {
      setActiveMenu(option.children);
    } else if (option.msg) {
      handleSendMessage(option.msg);
      setActiveMenu(DEFAULT_MENU_STRUCTURE);
    }
  };

  const getVisibleMenu = () => {
    if (activeMenu === DEFAULT_MENU_STRUCTURE) {
      const menu = [...DEFAULT_MENU_STRUCTURE];
      if (customShortcuts.length > 0) {
        menu.push({
          label: 'My Shortcuts 📁',
          children: [
            ...customShortcuts.map(s => ({ label: s.label, msg: s.msg })),
            { label: 'Back to Main Menu ↩️', action: 'back' }
          ]
        });
      }
      return menu;
    }
    return activeMenu;
  };

  const handleAddShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShortcutLabel.trim() || !newShortcutMsg.trim()) {
      toast.error("Please fill in both fields");
      return;
    }
    const exists = customShortcuts.some(s => s.label.toLowerCase() === newShortcutLabel.trim().toLowerCase());
    if (exists) {
      toast.error("A shortcut with this label already exists");
      return;
    }
    setCustomShortcuts(prev => [...prev, { label: newShortcutLabel.trim(), msg: newShortcutMsg.trim() }]);
    setNewShortcutLabel('');
    setNewShortcutMsg('');
    setShowAddShortcut(false);
    toast.success("Shortcut added successfully!");
  };

  const handleDeleteShortcut = (labelToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = customShortcuts.filter(s => s.label !== labelToDelete);
    setCustomShortcuts(filtered);
    if (filtered.length === 0) {
      setActiveMenu(DEFAULT_MENU_STRUCTURE);
    } else {
      setActiveMenu([
        ...filtered.map(s => ({ label: s.label, msg: s.msg })),
        { label: 'Back to Main Menu ↩️', action: 'back' }
      ]);
    }
    toast.success("Shortcut deleted");
  };
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { language } = useI18n();
  const { t } = useTranslation(language);

  const currentUserName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Trader';
  const currentUserEmail = currentUser?.email || '';

  const botAvatar = "https://i.postimg.cc/6p1dmLjB/IMG-20260822-005000-661.jpg"; // Using platform logo as bot avatar

  // Listen to user's tickets in real-time
  useEffect(() => {
    if (!currentUid) return;

    try {
      const q = query(
        collection(db, 'tickets'),
        where('userId', '==', currentUid)
      );

      const unsub = onSnapshot(q, (snapshot) => {
        const ticketList: SupportTicket[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        } as SupportTicket));

        // Sort by updatedAt descending
        ticketList.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
        setTickets(ticketList);

        // If there's an active ticket, keep it synced
        if (activeTicket) {
          const updated = ticketList.find(t => t.id === activeTicket.id);
          if (updated) setActiveTicket(updated);
        }
      }, (error) => {
        console.warn("Tickets snapshot error:", error);
      });

      return () => unsub();
    } catch (e) {
      console.error("Failed to subscribe to tickets:", e);
    }
  }, [currentUid, activeTicket?.id]);

  // Listen to messages for the active ticket in real-time
  useEffect(() => {
    if (!activeTicket?.id) {
      setMessages([]);
      setAiActions([]);
      return;
    }

    try {
      const q = query(
        collection(db, 'tickets', activeTicket.id, 'messages'),
        orderBy('createdAt', 'asc')
      );

      const unsub = onSnapshot(q, (snapshot) => {
        const msgList: TicketMessage[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        } as TicketMessage));
        setMessages(msgList);

        // Extract actions from the last AI message if available
        const lastMsg = msgList[msgList.length - 1];
        if (lastMsg && (lastMsg.senderType === 'bot' || lastMsg.isAdmin)) {
          try {
            // Check if message is JSON (handled by backend now)
            const text = lastMsg.text || lastMsg.message || '';
            if (text.startsWith('{')) {
              const parsed = JSON.parse(text);
              if (parsed.actions) setAiActions(parsed.actions);
            } else {
              setAiActions([]);
            }
          } catch (e) {
            setAiActions([]);
          }
        } else if (lastMsg && lastMsg.senderType === 'user') {
          setAiActions([]);
        }
      }, (error) => {
        console.warn("Messages snapshot error:", error);
      });

      return () => unsub();
    } catch (e) {
      console.error("Failed to subscribe to ticket messages:", e);
    }
  }, [activeTicket?.id]);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('bivax_token')}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setTransactions(data.slice(0, 5));
      }
    } catch (e) {
      console.error("Failed to fetch transactions:", e);
    }
  };

  useEffect(() => {
    if (view === 'new' || (view === 'chat' && activeTicket)) {
      fetchTransactions();
    }
  }, [view, activeTicket]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // If chat is open and new messages arrive, mark them as read
    if (view === 'chat' && activeTicket?.id && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      const isStaff = lastMsg.senderType === 'support' || lastMsg.senderType === 'agent' || lastMsg.isAdmin;
      if (isStaff && !lastMsg.isRead) {
        fetch('/api/tickets/messages/read', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('bivax_token')}`
          },
          body: JSON.stringify({ ticketId: activeTicket.id, userId: currentUid })
        }).catch(() => {});
      }
    }
  }, [messages, view, activeTicket?.id, currentUid]);

  // Open a specific ticket chat
  const handleOpenTicket = async (ticket: SupportTicket) => {
    setActiveTicket(ticket);
    setView('chat');
    
    // Mark messages as read
    try {
      await fetch('/api/tickets/messages/read', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bivax_token')}`
        },
        body: JSON.stringify({ ticketId: ticket.id, userId: currentUid })
      });
    } catch (e) {}
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (attachedFiles.length + files.length > 3) {
      toast.error("You can only attach up to 3 images");
      return;
    }

    const processFile = async (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1000;
            const MAX_HEIGHT = 1000;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.6));
          };
          img.onerror = reject;
          img.src = event.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast.error("Only images are allowed");
        continue;
      }
      try {
        const compressedBase64 = await processFile(file);
        if (compressedBase64.length > 800 * 1024) {
             toast.error("Image is too large");
             continue;
        }
        setAttachedFiles(prev => [...prev, compressedBase64]);
      } catch (err) {
        toast.error("Failed to process image");
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateNewChat = async (initialMsg?: string, initialSubject?: string) => {
    const msg = initialMsg || inputMessage;
    if (!msg.trim() && attachedFiles.length === 0) {
      toast.error("Please enter a message");
      return;
    }

    setIsSending(true);
    try {
      const subject = initialSubject || newSubject.trim() || `${newCategory} Inquiry - ${new Date().toLocaleDateString()}`;
      const now = Date.now();

      const ticketData = {
        userId: currentUid,
        userName: currentUserName,
        userEmail: currentUserEmail,
        subject: subject,
        category: newCategory,
        status: 'Open',
        lastMessage: msg.trim() || 'Attached files',
        hiddenFromAdmin: false,
        dismissedByAdmin: false,
        dismissedAt: null,
        createdAt: now,
        updatedAt: now
      };

      const ticketRef = await addDoc(collection(db, 'tickets'), ticketData);
      const ticketId = ticketRef.id;

      // 1. Initial User Message
      await addDoc(collection(db, 'tickets', ticketId, 'messages'), {
        ticketId: ticketId,
        senderId: currentUid,
        senderName: currentUserName,
        senderType: 'user',
        isAdmin: false,
        text: msg.trim(),
        attachments: attachedFiles,
        createdAt: now
      });

      // 2. Automated Bot Greeting
      setTimeout(async () => {
        try {
          const welcomeMsg = {
            reply: `Hello ${currentUserName}! I'm your Bivaax AI Assistant. I have analyzed your account status. How can I help you today?`,
            actions: ["Check Verification 🛡️", "Deposit Problem 💰", "Trading Help 📈"]
          };
          const welcomeJson = JSON.stringify(welcomeMsg);

          await addDoc(collection(db, 'tickets', ticketId, 'messages'), {
            ticketId: ticketId,
            senderId: 'bot',
            senderName: 'Bivaax AI',
            senderType: 'bot',
            isAdmin: true,
            text: welcomeJson,
            createdAt: now + 500
          });
        } catch (e) {
          console.warn("Bot greeting failed:", e);
        }
      }, 1000);

      const newTicket: SupportTicket = { id: ticketId, ...ticketData };
      setActiveTicket(newTicket);
      setInputMessage('');
      setAttachedFiles([]);
      setNewSubject('');
      setView('chat');
    } catch (error: any) {
      console.error("Failed to start conversation:", error);
      toast.error(error.message || "Could not start conversation.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    if (!activeTicket?.id) return;
    const msgText = textOverride || inputMessage;
    if (!msgText.trim() && attachedFiles.length === 0) return;

    setIsSending(true);
    const textToSend = msgText.trim();
    const attachmentsToSend = [...attachedFiles];
    const now = Date.now();

    if (!textOverride) setInputMessage('');
    setAttachedFiles([]);
    setShowTxSelector(false);

    try {
      await addDoc(collection(db, 'tickets', activeTicket.id, 'messages'), {
        ticketId: activeTicket.id,
        senderId: currentUid,
        senderName: currentUserName,
        senderType: 'user',
        isAdmin: false,
        text: textToSend,
        attachments: attachmentsToSend,
        createdAt: now
      });

      await updateDoc(doc(db, 'tickets', activeTicket.id), {
        lastMessage: textToSend || 'Sent an attachment',
        updatedAt: now,
        status: 'Open',
        hiddenFromAdmin: false,
        dismissedByAdmin: false,
        dismissedAt: null
      });
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const formatTicketDate = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return `Started ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-0 z-[1000] bg-white flex flex-col md:w-[400px] md:h-[600px] md:top-auto md:bottom-6 md:right-6 md:rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-gray-100 overflow-hidden font-sans"
    >
      {/* Premium Header */}
      <div className="bg-[#1c1d22] text-white px-5 py-4 flex items-center justify-between shadow-sm select-none shrink-0">
        <div className="flex items-center gap-3">
          {view !== 'list' ? (
            <button 
              onClick={() => {
                setView('list');
                setActiveTicket(null);
                setAttachedFiles([]);
              }} 
              className="p-1 -ml-1 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#ffcf00] flex items-center justify-center text-black shadow-lg">
               <MessageSquare size={20} fill="currentColor" />
            </div>
          )}
          
          <div className="flex flex-col">
            {view === 'chat' && activeTicket ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#2a2b31] border border-white/5 flex items-center justify-center overflow-hidden">
                    <img src={botAvatar} alt="Agent" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-white leading-none">
                      {formatTicketDate(activeTicket.createdAt)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  {view === 'list' ? 'Support' : t('liveChat')}
                </h2>
                <span className="text-[10px] text-gray-400 font-medium">
                  We reply in under 5 minutes
                </span>
              </>
            )}
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="p-1.5 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronDown size={24} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-white overflow-hidden relative">
        
        {/* VIEW 1: Conversation List */}
        {view === 'list' && (
          <div className="flex-1 flex flex-col h-full bg-[#f8f9fa]">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {tickets.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-20 h-20 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-4">
                    <MessageCircle size={40} className="text-[#ffcf00]" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">No conversations yet</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
                    Our support team is ready to help you 24/7.
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">
                    Recent Chats
                  </div>
                  {tickets.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleOpenTicket(t)}
                      className="w-full p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all flex items-center gap-4 text-left group"
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                        <img src={botAvatar} alt="Bot" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-[13px] font-bold text-gray-900 truncate">
                            {t.subject || 'Support Chat'}
                          </span>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {new Date(t.updatedAt || t.createdAt || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[12px] text-gray-500 line-clamp-1">
                          {t.lastMessage || 'Sent an attachment'}
                        </p>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
            
            {/* New Conversation Button at Bottom */}
            <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
              <button 
                onClick={() => setView('new')}
                className="w-full py-3.5 bg-black text-white font-bold text-sm rounded-full hover:bg-gray-800 transition-all active:scale-[0.98] shadow-lg shadow-black/10"
              >
                New conversation
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: New Ticket Form */}
        {view === 'new' && (
          <div className="flex-1 flex flex-col h-full bg-white">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div>
                <h3 className="text-xl font-bold text-gray-900">How can we help?</h3>
                <p className="text-sm text-gray-500 mt-1">Select a category to start chatting with an agent.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'Deposit', icon: Wallet, label: 'Payment & Deposit' },
                    { id: 'Withdrawal', icon: CreditCard, label: 'Withdrawal' },
                    { id: 'Account', icon: User, label: 'Account & Verification' },
                    { id: 'General', icon: Zap, label: 'Technical / General' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setNewCategory(cat.id)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                        newCategory === cat.id 
                          ? 'border-black bg-black text-white shadow-md' 
                          : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-200'
                      }`}
                    >
                      <cat.icon size={18} />
                      <span className="text-sm font-bold">{cat.label}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Message</label>
                   <textarea
                    rows={4}
                    placeholder="Describe your issue..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl text-sm text-gray-900 focus:outline-none focus:bg-white focus:border-gray-200 transition-all resize-none placeholder:text-gray-400"
                  />
                </div>

                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {attachedFiles.map((file, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-100">
                        <img src={file} alt="preview" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => handleRemoveAttachment(idx)}
                          className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                   <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                   <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-gray-400 hover:text-black transition-colors"
                   >
                     <Paperclip size={20} />
                   </button>
                   <button
                    onClick={() => handleCreateNewChat()}
                    disabled={isSending || !inputMessage.trim()}
                    className="flex-1 py-4 bg-black text-white font-bold text-sm rounded-full disabled:opacity-50 transition-all active:scale-[0.98]"
                   >
                    {isSending ? 'Connecting...' : 'Start Chat'}
                   </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: Live Chat Area */}
        {view === 'chat' && activeTicket && (
          <div className="flex-1 flex flex-col h-full bg-white">
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-[#fcfcfc]">
              
              {/* Messages Container */}
              {messages.map((msg, idx) => {
                const isStaff = msg.senderType === 'support' || msg.senderType === 'agent' || msg.isAdmin;
                return (
                  <div key={msg.id || idx} className={`flex flex-col ${isStaff ? 'items-start' : 'items-end'} gap-1`}>
                    {isStaff && (
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100">
                          <img src={botAvatar} alt="Agent" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[11px] font-bold text-gray-400">{isStaff ? (msg.senderName || 'Agent') : 'You'}</span>
                      </div>
                    )}
                    
                    <div className={`max-w-[85%] p-3.5 ${
                      isStaff 
                        ? 'bg-white border border-gray-100 text-gray-800 rounded-[1.25rem] rounded-tl-none shadow-sm' 
                        : 'bg-[#1c1d22] text-white rounded-[1.25rem] rounded-tr-none shadow-md'
                    }`}>
                      <p className="text-[13px] leading-relaxed whitespace-pre-wrap font-medium">
                        {(() => {
                          const text = msg.text || msg.message || '';
                          if (text.startsWith('{')) {
                            try {
                              const parsed = JSON.parse(text);
                              return parsed.reply || parsed.message || text;
                            } catch (e) {
                              return text;
                            }
                          }
                          return text;
                        })()}
                      </p>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {msg.attachments.map((att, aIdx) => (
                            <img key={aIdx} src={att} alt="attachment" className="w-24 h-24 object-cover rounded-xl border border-white/10" />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 px-1 mt-0.5">
                      <span className="text-[9px] text-gray-400 font-medium">
                        {new Date(msg.createdAt || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!isStaff && (
                         <span className={`text-[10px] font-bold ${msg.isRead ? 'text-blue-500' : 'text-gray-300'}`}>
                           <CheckCheck size={12} />
                         </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Quick Topic Buttons (Inside Chat) */}
              <div className="flex flex-wrap gap-2 justify-end pt-2">
                {getVisibleMenu().map((topic, i) => {
                  const isCustom = customShortcuts.some(s => s.label === topic.label);
                  return (
                    <div key={i} className="relative group flex items-center">
                      <button
                        onClick={() => handleOptionClick(topic)}
                        className={`pl-4 ${isCustom ? 'pr-8' : 'pr-4'} py-2 bg-white border border-gray-200 rounded-full text-[12px] font-bold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all active:scale-95 shadow-sm flex items-center gap-1`}
                      >
                        {topic.label}
                      </button>
                      
                      {isCustom && (
                        <button
                          onClick={(e) => handleDeleteShortcut(topic.label, e)}
                          title="Delete Shortcut"
                          className="absolute right-2 text-gray-400 hover:text-red-500 p-1 transition-all rounded-full hover:bg-gray-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}
                
                <button
                  onClick={() => setShowTxSelector(!showTxSelector)}
                  className={`px-4 py-2 rounded-full text-[12px] font-bold transition-all active:scale-95 shadow-sm border ${
                    showTxSelector 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  Select Transaction 📑
                </button>

                <button
                  onClick={() => setShowAddShortcut(!showAddShortcut)}
                  className={`px-4 py-2 rounded-full text-[12px] font-bold transition-all active:scale-95 shadow-sm border ${
                    showAddShortcut 
                      ? 'bg-[#14b37d] text-white border-[#14b37d]' 
                      : 'bg-white text-[#14b37d] border-[#14b37d]/20 hover:border-[#14b37d]'
                  }`}
                >
                  Add Shortcut ➕
                </button>
              </div>

              {/* Add Custom Shortcut Form */}
              {showAddShortcut && (
                <motion.form 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onSubmit={handleAddShortcut}
                  className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3 mt-2 shadow-inner"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">Add Custom Shortcut Command ⚙️</span>
                    <button type="button" onClick={() => setShowAddShortcut(false)} className="text-gray-400 hover:text-black">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Shortcut Button Label</label>
                      <input 
                        type="text" 
                        placeholder="e.g. My Custom Help 💡" 
                        value={newShortcutLabel}
                        onChange={(e) => setNewShortcutLabel(e.target.value)}
                        className="w-full bg-white text-gray-800 text-xs px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Message to Send</label>
                      <textarea 
                        placeholder="e.g. I need help resetting my Google Authenticator." 
                        value={newShortcutMsg}
                        onChange={(e) => setNewShortcutMsg(e.target.value)}
                        rows={2}
                        className="w-full bg-white text-gray-800 text-xs px-3 py-2 rounded-xl border border-gray-200 outline-none resize-none focus:border-blue-500 transition-all font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button 
                      type="button" 
                      onClick={() => setShowAddShortcut(false)} 
                      className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-[11px] font-bold text-gray-600 rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-[11px] font-bold text-white rounded-lg transition-all shadow-sm"
                    >
                      Save Shortcut
                    </button>
                  </div>
                </motion.form>
              )}

              {/* AI Actions */}
              {aiActions.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-start pt-2">
                  {aiActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(action)}
                      className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-[12px] font-bold text-blue-600 hover:bg-blue-100 transition-all active:scale-95 shadow-sm"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}

              {/* Transaction Selector */}
              {showTxSelector && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-400 uppercase">Recent Transactions</span>
                    <button onClick={() => setShowTxSelector(false)} className="text-gray-400 hover:text-black">
                      <X size={14} />
                    </button>
                  </div>
                  {transactions.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">No recent transactions found.</p>
                  ) : (
                    <div className="space-y-2">
                      {transactions.map((tx) => (
                        <button
                          key={tx.id}
                          onClick={() => handleSendMessage(`I have an issue with this ${tx.type} transaction: ID ${tx.id || tx.tx_hash}, Amount: ${tx.amount}, Status: ${tx.status}`)}
                          className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all text-left"
                        >
                          <div>
                            <p className="text-[12px] font-bold text-gray-900 capitalize">{tx.type} • {tx.method || 'Transfer'}</p>
                            <p className="text-[10px] text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[12px] font-bold text-gray-900">${tx.amount}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              tx.status === 'completed' || tx.status === 'approved' ? 'bg-green-50 text-green-600' :
                              tx.status === 'failed' || tx.status === 'rejected' ? 'bg-red-50 text-red-600' :
                              'bg-yellow-50 text-yellow-600'
                            }`}>
                              {tx.status}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-4 bg-white border-t border-gray-100">
               {attachedFiles.length > 0 && (
                <div className="flex gap-2 mb-3 px-1">
                  {attachedFiles.map((file, idx) => (
                    <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-100">
                      <img src={file} alt="preview" className="w-full h-full object-cover" />
                      <button onClick={() => handleRemoveAttachment(idx)} className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 bg-[#f4f4f4] rounded-full px-4 py-1 border border-transparent focus-within:bg-white focus-within:border-gray-200 transition-all">
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 text-gray-400 hover:text-black transition-colors"
                >
                  <Paperclip size={20} />
                </button>
                <input 
                  type="text" 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message" 
                  className="flex-1 h-11 bg-transparent text-sm text-gray-900 focus:outline-none placeholder:text-gray-400"
                />
                <button 
                  onClick={() => handleSendMessage()}
                  disabled={isSending || (!inputMessage.trim() && attachedFiles.length === 0)}
                  className="p-1.5 text-black disabled:opacity-30"
                >
                  <Send size={20} fill="currentColor" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
};
