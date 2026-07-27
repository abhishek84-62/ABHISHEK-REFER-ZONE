import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Key,
  X,
  LayoutDashboard,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  LogOut,
  Camera,
  Save,
  ShieldCheck,
  TrendingUp,
  Gift,
  Search,
  Share2,
  MessageCircle,
  Send,
  Instagram,
  Youtube,
  Sparkles,
  Link2,
  Palette,
  Check,
  AlertCircle,
  Info,
  Heart,
  Download,
  CheckCircle,
  Coins,
  Play,
} from 'lucide-react';

// --- Types ---
interface Offer {
  logo: string;
  app: string;
  amt: string;
  task: string;
  clm: string;
  tc: string;
  trk: string;
  active: string;
}

interface Branding {
  name: string;
  bio: string;
  emoji: string;
  chip: string;
  logo: string;
  // Social links
  whatsapp: string;
  telegram: string;
  instagram: string;
  youtube: string;
  // How It Works steps
  step1: string;
  step2: string;
  step3: string;
  // Theme
  accentColor: string;
  // Footer
  footerText: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

// --- Constants ---
const SHEET_ID = '1z98mbUjd2feizZ235f95mUS3wmwygxPFXmu5mcnKUNk';
const GURL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

const ACCENTS: Record<string, { color: string; label: string }> = {
  gold: { color: '#F59E0B', label: 'Gold' },
  blue: { color: '#3B82F6', label: 'Ocean Blue' },
  purple: { color: '#8B5CF6', label: 'Royal Purple' },
  green: { color: '#22C55E', label: 'Emerald' },
  rose: { color: '#F43F5E', label: 'Rose' },
};

const DEFAULT_BRANDING: Branding = {
  name: 'DOT ARN ₹$',
  bio: 'I am the youngest affiliate marketer 💹\nJoin me & start earning today!',
  emoji: '🚀',
  chip: 'Live Referral Offers',
  logo: '',
  whatsapp: '',
  telegram: '',
  instagram: '',
  youtube: '',
  step1: 'Download the app using our referral link',
  step2: 'Complete the required task or signup',
  step3: 'Earn your reward instantly!',
  accentColor: 'gold',
  footerText: '',
};

export default function App() {
  // --- State ---
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState('—');

  const [branding, setBranding] = useState<Branding>(() => {
    const saved = localStorage.getItem('rz_branding');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Update saved name if it was the old default
      if (parsed.name === 'Abhishek ReferZone') {
        parsed.name = 'DOT ARN ₹$';
      }
      return { ...DEFAULT_BRANDING, ...parsed };
    }
    return DEFAULT_BRANDING;
  });

  const [cosmicKey, setCosmicKey] = useState(() => localStorage.getItem('rz_key') || '6200728484');
  const [isOwner, setIsOwner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [loginKey, setLoginKey] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'brand' | 'social' | 'security'>('overview');
  const [expandedOffer, setExpandedOffer] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // --- Accent color ---
  const accent = ACCENTS[branding.accentColor] || ACCENTS.gold;

  // --- Update Document Title ---
  useEffect(() => {
    document.title = branding.name || 'DOT ARN ₹$';
  }, [branding.name]);

  // --- Data Fetching (Strict Rules 1-12) ---
  const fetchOffers = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${GURL}&_=${Date.now()}`);
      const text = await res.text();
      const jsonStr = text.substring(47).slice(0, -2);
      const jd = JSON.parse(jsonStr);

      const rawRows = jd.table.rows || [];
      let headerCols = (jd.table.cols || []).map((c: any) => (c.label || '').trim().toLowerCase());
      let dataRows = rawRows;

      // Extract headers from Row 1 if table.cols labels are empty
      const hasColLabels = headerCols.some((l: string) => l.length > 0);
      if (!hasColLabels && rawRows.length > 0) {
        headerCols = (rawRows[0].c || []).map((cell: any) => (cell && cell.v !== null && cell.v !== undefined ? String(cell.v).trim().toLowerCase() : ''));
        dataRows = rawRows.slice(1); // Row 2 onwards
      }

      // Rule 10: Always locate columns by matching header names
      const findIdx = (names: string[]) => {
        for (const name of names) {
          const i = headerCols.findIndex((c: string) => c === name || c.includes(name));
          if (i > -1) return i;
        }
        return -1;
      };

      const idx = {
        logo: findIdx(['logo', 'icon', 'img', 'image', 'emoji']),
        app: findIdx(['app', 'name']),
        amt: findIdx(['ammount', 'amount', 'amt', 'reward', 'earn']),
        task: findIdx(['task', 'description', 'desc']),
        clm: findIdx(['link', 'claim', 'url', 'clm']),
        tc: findIdx(['t&c', 'tc', 'term', 'condition', 'terms']),
        trk: findIdx(['tracker', 'track', 'trk']),
        active: findIdx(['active', 'status', 'enabled', 'show']),
      };

      const getValue = (r: any, i: number) =>
        i >= 0 && r.c && r.c[i] && r.c[i].v !== null && r.c[i].v !== undefined
          ? String(r.c[i].v).trim()
          : '';

      const fetchedOffers: Offer[] = [];

      // Rule 2 & 11: Loop data rows starting from Row 2 onwards
      for (const r of dataRows) {
        if (!r || !r.c) continue;

        const app = getValue(r, idx.app);
        const amt = getValue(r, idx.amt);
        const clm = getValue(r, idx.clm);
        const task = getValue(r, idx.task);
        const tc = getValue(r, idx.tc);
        const trk = getValue(r, idx.trk);
        const logo = getValue(r, idx.logo);
        const activeRaw = getValue(r, idx.active).toLowerCase();

        // Rule 5: ACTIVE column controls visibility. If ACTIVE != "yes", skip row completely.
        if (idx.active >= 0 && activeRaw !== 'yes') {
          continue;
        }

        // Rule 9: If required fields missing (APP, LINK/CLM, or AMMOUNT), skip completely.
        if (!app || !clm || !amt) {
          continue;
        }

        fetchedOffers.push({
          logo,
          app,
          amt,
          task,
          clm,
          tc,
          trk,
          active: activeRaw || 'yes',
        });
      }

      setOffers(fetchedOffers);
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
      if (!isSilent) setError('Failed to load offers. Please check your Google Sheet permissions.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
    // Rule 12: Auto-sync every 30 seconds so Google Sheets edits reflect automatically
    const interval = setInterval(() => {
      fetchOffers(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchOffers]);

  // --- Toast System ---
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  // --- Computed ---
  const filteredOffers = useMemo(() => {
    if (!searchQuery.trim()) return offers;
    const q = searchQuery.toLowerCase();
    return offers.filter(o =>
      o.app.toLowerCase().includes(q) ||
      o.task.toLowerCase().includes(q) ||
      o.amt.toLowerCase().includes(q)
    );
  }, [offers, searchQuery]);

  const totalRewards = useMemo(() => {
    return offers.reduce((sum, o) => {
      const num = parseInt(o.amt.replace(/[^0-9]/g, ''));
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  }, [offers]);

  const isHotOffer = (offer: Offer) => {
    const num = parseInt(offer.amt.replace(/[^0-9]/g, ''));
    return !isNaN(num) && num >= 100;
  };

  // --- Handlers ---
  const handleLogin = () => {
    if (loginKey === cosmicKey) {
      setIsOwner(true);
      setShowLogin(false);
      setShowDashboard(true);
      setLoginKey('');
      setLoginError(false);
      showToast('Welcome back, Owner! 🎉');
    } else {
      setLoginError(true);
    }
  };

  const handleSaveBranding = () => {
    localStorage.setItem('rz_branding', JSON.stringify(branding));
    showToast('Settings saved successfully! ✅');
  };

  const handleUpdateKey = (newKey: string) => {
    if (newKey.length < 4) {
      showToast('Key must be at least 4 characters.', 'error');
      return;
    }
    setCosmicKey(newKey);
    localStorage.setItem('rz_key', newKey);
    showToast('Cosmic Key updated! 🔐');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setBranding({ ...branding, logo: ev.target?.result as string });
      showToast('Logo uploaded! Save to keep changes.', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleShare = async (offer: Offer) => {
    const url = offer.clm.startsWith('http') ? offer.clm : `https://${offer.clm}`;
    const text = `🎁 *${offer.app}* — ${offer.amt}\n📋 ${offer.task}\n\n👉 Claim now: ${url}\n\nShared via ${branding.name}`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        showToast('Offer copied to clipboard! 📋');
      } catch {
        showToast('Could not copy link', 'error');
      }
    }
  };

  // --- Black Hole (UNCHANGED) ---
  const BlackHole = () => (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
      <div
        className="absolute rounded-full"
        style={{
          width: 1100, height: 1100, left: -550, top: -550,
          background: 'radial-gradient(circle, rgba(255,80,0,0.15) 0%, rgba(180,40,0,0.08) 30%, rgba(80,0,0,0.04) 50%, transparent 70%)',
          animation: 'singularity-breathe 4s ease-in-out infinite',
        }}
      />
      <div
        className="absolute animate-accretion"
        style={{
          width: 600, height: 600, left: -300, top: -300, borderRadius: '50%',
          background: 'conic-gradient(from 0deg, rgba(255,180,0,0.55), rgba(255,60,0,0.1), rgba(255,215,0,0.6), rgba(255,90,0,0.05), rgba(255,60,0,0.5), rgba(255,200,50,0.35), rgba(255,140,0,0.55))',
          filter: 'blur(12px)',
        }}
      />
      <div
        className="absolute animate-accretion-rev"
        style={{
          width: 420, height: 420, left: -210, top: -210, borderRadius: '50%',
          background: 'conic-gradient(from 120deg, rgba(255,220,80,0.65), rgba(255,80,0,0.06), rgba(255,180,0,0.55), rgba(255,100,0,0.04), rgba(255,220,80,0.65))',
          filter: 'blur(6px)',
        }}
      />
      {[0, 1, 2, 3, 4, 5].map(i => (
        <div
          key={`particle-${i}`}
          className="absolute animate-particle-orbit"
          style={{
            width: 340, height: 340, left: -170, top: -170,
            animationDuration: `${3 + i * 1.2}s`,
            animationDelay: `${i * 0.6}s`,
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: 4 + (i % 3) * 2, height: 4 + (i % 3) * 2,
              top: 0, left: '50%', marginLeft: -(2 + (i % 3)),
              background: i % 2 === 0 ? 'rgba(255,200,50,0.9)' : 'rgba(255,120,0,0.8)',
              boxShadow: `0 0 ${8 + i * 3}px ${3 + i}px ${i % 2 === 0 ? 'rgba(255,200,50,0.6)' : 'rgba(255,120,0,0.5)'}`,
            }}
          />
        </div>
      ))}
      <div
        className="absolute animate-warp-ring"
        style={{
          width: 320, height: 320, left: -160, top: -160, borderRadius: '50%',
          border: '1.5px solid rgba(255, 180, 50, 0.5)',
          boxShadow: '0 0 30px 6px rgba(255,160,0,0.25), inset 0 0 30px 6px rgba(255,160,0,0.2)',
        }}
      />
      <div
        className="absolute rounded-full animate-horizon-pulse"
        style={{ width: 260, height: 260, left: -130, top: -130 }}
      />
      <div
        className="absolute rounded-full animate-singularity"
        style={{
          width: 200, height: 200, left: -100, top: -100,
          background: 'radial-gradient(circle, #000 55%, rgba(0,0,0,0.98) 70%, rgba(0,0,0,0.85) 85%, transparent 100%)',
          boxShadow: '0 0 80px 50px rgba(0,0,0,0.98), 0 0 150px 80px rgba(0,0,0,0.8), 0 0 250px 120px rgba(0,0,0,0.4)',
        }}
      />
    </div>
  );

  // --- Floating Coins ---
  const COIN_SYMBOLS = ['₹', '$', '€', '£', '¥', '🪙', '💰', '💵', '💲'];
  const coins = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const count = isMobile ? 18 : 40;
    const maxRadius = isMobile ? 280 : 550;
    return Array.from({ length: count }, (_, i) => {
      const symbol = COIN_SYMBOLS[i % COIN_SYMBOLS.length];
      const angle = (Math.PI * 2 * i / count) + (Math.random() * 0.5 - 0.25);
      const radius = 350 + Math.random() * maxRadius;
      const sx = Math.cos(angle) * radius;
      const sy = Math.sin(angle) * radius;
      const size = 18 + Math.random() * 28;
      const duration = 3 + Math.random() * 5;
      const delay = (i / count) * 7 + Math.random() * 1;
      const opacity = 0.45 + Math.random() * 0.45;
      return { symbol, sx, sy, size, duration, delay, opacity, id: i };
    });
  }, []);

  const FloatingCoins = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
      <div className="absolute top-1/2 left-1/2" style={{ width: 0, height: 0 }}>
        {coins.map((coin) => (
          <span
            key={coin.id}
            className="absolute animate-spiral-in select-none"
            style={{
              '--sx': `${coin.sx}px`,
              '--sy': `${coin.sy}px`,
              '--coin-opacity': coin.opacity,
              animationDuration: `${coin.duration}s`,
              animationDelay: `${coin.delay}s`,
              fontSize: `${coin.size}px`,
              left: 0, top: 0,
            } as React.CSSProperties}
          >
            {coin.symbol}
          </span>
        ))}
      </div>
    </div>
  );

  // --- Social Link Helper ---
  const hasSocials = branding.whatsapp || branding.telegram || branding.instagram || branding.youtube;

  const SocialIcons = ({ size = 'w-5 h-5', gap = 'gap-3' }: { size?: string; gap?: string }) => (
    <div className={`flex items-center ${gap}`}>
      {branding.whatsapp && (
        <a href={`https://wa.me/${branding.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
          className="w-10 h-10 rounded-xl glass border-white/10 flex items-center justify-center text-green-400 hover:bg-green-500/20 hover:scale-110 transition-all">
          <MessageCircle className={size} />
        </a>
      )}
      {branding.telegram && (
        <a href={branding.telegram.startsWith('http') ? branding.telegram : `https://t.me/${branding.telegram}`} target="_blank" rel="noopener noreferrer"
          className="w-10 h-10 rounded-xl glass border-white/10 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 hover:scale-110 transition-all">
          <Send className={size} />
        </a>
      )}
      {branding.instagram && (
        <a href={branding.instagram.startsWith('http') ? branding.instagram : `https://instagram.com/${branding.instagram}`} target="_blank" rel="noopener noreferrer"
          className="w-10 h-10 rounded-xl glass border-white/10 flex items-center justify-center text-pink-400 hover:bg-pink-500/20 hover:scale-110 transition-all">
          <Instagram className={size} />
        </a>
      )}
      {branding.youtube && (
        <a href={branding.youtube.startsWith('http') ? branding.youtube : `https://youtube.com/${branding.youtube}`} target="_blank" rel="noopener noreferrer"
          className="w-10 h-10 rounded-xl glass border-white/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:scale-110 transition-all">
          <Play className={size} />
        </a>
      )}
    </div>
  );

  // =================== RENDER ===================
  return (
    <div className="min-h-screen font-sans">
      <BlackHole />
      <FloatingCoins />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">

        {/* ========== HEADER ========== */}
        <header className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block relative mb-8"
          >
            <div className="absolute inset-0 rounded-full blur-xl animate-pulse" style={{ backgroundColor: accent.color + '20' }} />
            <div className="relative w-32 h-32 rounded-full glass border-white/20 flex items-center justify-center overflow-hidden shadow-2xl">
              {branding.logo ? (
                <img src={branding.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl">{branding.emoji}</span>
              )}
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl md:text-7xl font-display font-bold mb-6 text-gradient tracking-tight"
          >
            {branding.name.split(' ').map((word, i) => (
              <span key={i} className={i === branding.name.split(' ').length - 1 ? 'text-white/40 italic' : ''}>
                {word}{' '}
              </span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/60 max-w-md mx-auto leading-relaxed mb-6 whitespace-pre-line"
          >
            {branding.bio}
          </motion.p>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 text-xs font-semibold tracking-widest uppercase text-white/80 mb-6"
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accent.color }} />
            {branding.chip}
          </motion.div>

          {/* Social Icons */}
          {hasSocials && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center"
            >
              <SocialIcons />
            </motion.div>
          )}
        </header>

        {/* ========== STATS BANNER ========== */}
        {offers.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12"
          >
            <div className="glass-dark rounded-2xl p-5 text-center border-white/5">
              <p className="text-2xl md:text-3xl font-display font-bold" style={{ color: accent.color }}>{offers.length}+</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">Active Offers</p>
            </div>
            <div className="glass-dark rounded-2xl p-5 text-center border-white/5">
              <p className="text-2xl md:text-3xl font-display font-bold" style={{ color: accent.color }}>₹{totalRewards.toLocaleString()}+</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">Total Rewards</p>
            </div>
            <div className="glass-dark rounded-2xl p-5 text-center border-white/5 col-span-2 md:col-span-1">
              <p className="text-2xl md:text-3xl font-display font-bold" style={{ color: accent.color }}>100%</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">Verified Offers</p>
            </div>
          </motion.div>
        )}

        {/* ========== HOW IT WORKS ========== */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
            <h2 className="font-display text-lg font-medium text-white/40 uppercase tracking-[0.2em]">How It Works</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: <Download className="w-6 h-6" />, step: branding.step1, num: '01' },
              { icon: <CheckCircle className="w-6 h-6" />, step: branding.step2, num: '02' },
              { icon: <Coins className="w-6 h-6" />, step: branding.step3, num: '03' },
            ].map((item, i) => (
              <div key={i} className="glass-dark rounded-2xl p-6 border-white/5 text-center group hover:border-white/10 transition-all">
                <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: accent.color + '20', color: accent.color }}>
                  {item.icon}
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/20 mb-2">Step {item.num}</p>
                <p className="text-sm text-white/70 leading-relaxed">{item.step}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ========== SEARCH + OFFERS ========== */}
        <section className="mb-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
            <h2 className="font-display text-xl font-medium text-white/40 uppercase tracking-[0.2em]">Active Offers</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search offers by name or task..."
              className="w-full pl-14 pr-6 py-4 rounded-2xl glass-dark border-white/5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-all text-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-64 rounded-3xl glass-dark animate-pulse">
                  <div className="p-8 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/5" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-2/3 bg-white/5 rounded" />
                        <div className="h-3 w-1/3 bg-white/5 rounded" />
                      </div>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded" />
                    <div className="h-3 w-4/5 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="glass-dark rounded-3xl p-12 text-center border-red-500/20">
              <p className="text-red-400 mb-4">{error}</p>
              <button onClick={fetchOffers} className="text-white/60 hover:text-white underline underline-offset-4">Try Again</button>
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="glass-dark rounded-3xl p-12 text-center border-white/5">
              <Search className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/40 text-lg font-display font-bold mb-2">No offers found</p>
              <p className="text-white/20 text-sm">
                {searchQuery ? 'Try a different search term' : 'No active offers right now — check back soon!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredOffers.map((offer, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group glass-dark rounded-3xl overflow-hidden border-white/5 hover:border-white/10 transition-all duration-500"
                >
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl glass border-white/10 flex items-center justify-center text-2xl shadow-inner overflow-hidden shrink-0">
                          {offer.logo ? (
                            offer.logo.startsWith('http://') || offer.logo.startsWith('https://') || offer.logo.startsWith('data:') ? (
                              <img src={offer.logo} alt={offer.app} className="w-full h-full object-cover" />
                            ) : (
                              <span>{offer.logo}</span>
                            )
                          ) : (
                            <span>{offer.app.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-display text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{offer.app}</h3>
                            {isHotOffer(offer) && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider" style={{ backgroundColor: accent.color + '25', color: accent.color }}>
                                <Sparkles className="w-3 h-3" /> HOT
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">Referral Offer</p>
                        </div>
                      </div>
                      {offer.amt && (
                        <div className="px-4 py-2 rounded-xl text-sm font-bold text-white shadow-lg" style={{ backgroundColor: accent.color }}>
                          {offer.amt}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex gap-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 pt-1">Task</span>
                        <p className="text-sm text-white/70 leading-relaxed">{offer.task}</p>
                      </div>
                    </div>

                    {offer.tc && (
                      <div className="mb-6">
                        <button
                          onClick={() => setExpandedOffer(expandedOffer === i ? null : i)}
                          className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/30 hover:text-white/60 transition-colors"
                        >
                          Terms & Conditions
                          <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${expandedOffer === i ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {expandedOffer === i && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <p className="mt-4 p-4 rounded-2xl bg-white/5 text-xs text-white/40 leading-relaxed italic">
                                {offer.tc}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <a
                        href={offer.clm.startsWith('http') ? offer.clm : `https://${offer.clm}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm text-white hover:scale-[1.02] active:scale-[0.98] transition-all"
                        style={{ backgroundColor: accent.color }}
                      >
                        <Gift className="w-4 h-4" />
                        Claim Offer
                      </a>
                      <button
                        onClick={() => handleShare(offer)}
                        className="w-14 h-14 flex items-center justify-center rounded-2xl glass border-white/10 hover:bg-white/10 transition-all"
                        title="Share this offer"
                      >
                        <Share2 className="w-5 h-5 text-white/60" />
                      </button>
                      {offer.trk && (
                        <a
                          href={offer.trk.startsWith('http') ? offer.trk : `https://${offer.trk}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-14 h-14 flex items-center justify-center rounded-2xl glass border-white/10 hover:bg-white/10 transition-all"
                        >
                          <TrendingUp className="w-5 h-5 text-white/60" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ========== FOOTER ========== */}
        <footer className="text-center py-12 border-t border-white/5 space-y-6">
          {hasSocials && (
            <div className="flex justify-center">
              <SocialIcons gap="gap-4" />
            </div>
          )}
          {branding.whatsapp && (
            <a
              href={`https://wa.me/${branding.whatsapp.replace(/[^0-9]/g, '')}?text=Hi! I want to join your referral channel`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white hover:scale-105 transition-all"
              style={{ backgroundColor: '#25D366' }}
            >
              <MessageCircle className="w-4 h-4" /> Join My Channel
            </a>
          )}
          <p className="text-xs text-white/20 font-medium tracking-widest uppercase">
            {branding.footerText || `© 2026 ${branding.name}`}
          </p>
          <p className="text-[10px] text-white/10 flex items-center justify-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500/40" /> by ReferZone
          </p>
        </footer>
      </div>

      {/* ========== FLOATING WhatsApp FAB ========== */}
      {branding.whatsapp && (
        <a
          href={`https://wa.me/${branding.whatsapp.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-8 left-8 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-all z-50"
          style={{ backgroundColor: '#25D366' }}
        >
          <MessageCircle className="w-7 h-7" />
        </a>
      )}

      {/* ========== OWNER FAB ========== */}
      <button
        onClick={() => isOwner ? setShowDashboard(true) : setShowLogin(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full glass border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:scale-110 transition-all shadow-2xl z-50"
      >
        {isOwner ? <LayoutDashboard className="w-6 h-6" /> : <Key className="w-6 h-6" />}
      </button>

      {/* ========== LOGIN MODAL ========== */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowLogin(false)}
              className="absolute inset-0 bg-black/60"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md glass-dark rounded-[40px] p-10 border-white/10 shadow-2xl"
            >
              <button onClick={() => setShowLogin(false)} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
              <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-3xl glass border-white/10 flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-3xl font-display font-bold mb-2">Owner Access</h2>
                <p className="text-white/40 text-sm">Enter your Cosmic Key to continue</p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3 ml-1">Cosmic Key</label>
                  <input
                    type="password"
                    value={loginKey}
                    onChange={(e) => setLoginKey(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="••••••••••"
                    className="w-full px-6 py-4 rounded-2xl glass border-white/10 text-white placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-all"
                  />
                  {loginError && <p className="text-red-400 text-xs mt-3 ml-1">Incorrect key — try again.</p>}
                </div>
                <button
                  onClick={handleLogin}
                  className="w-full py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all text-white"
                  style={{ backgroundColor: accent.color }}
                >
                  Enter Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========== DASHBOARD MODAL ========== */}
      <AnimatePresence>
        {showDashboard && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDashboard(false)}
              className="absolute inset-0 bg-black/80"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl glass-dark rounded-[40px] border-white/10 shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold">Dashboard</h2>
                  <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mt-1">Manage your ReferZone</p>
                </div>
                <button onClick={() => setShowDashboard(false)} className="text-white/20 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex p-2 bg-white/5 mx-8 mt-6 rounded-2xl">
                {(['overview', 'brand', 'social', 'security'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
                    style={activeTab === tab ? { backgroundColor: accent.color } : {}}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

                {/* === OVERVIEW TAB === */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 rounded-3xl glass border-white/5">
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Total Offers</p>
                        <p className="text-3xl font-display font-bold">{offers.length}</p>
                      </div>
                      <div className="p-6 rounded-3xl glass border-white/5">
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Last Refresh</p>
                        <p className="text-xl font-display font-bold">{lastRefresh}</p>
                      </div>
                    </div>
                    <div className="p-6 rounded-3xl glass border-white/5 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Data Source</p>
                        <p className="text-sm font-medium">Google Sheets Connected</p>
                      </div>
                      <ShieldCheck className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 rounded-3xl glass border-white/5">
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Total Rewards</p>
                        <p className="text-2xl font-display font-bold">₹{totalRewards.toLocaleString()}</p>
                      </div>
                      <div className="p-6 rounded-3xl glass border-white/5">
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Hot Offers</p>
                        <p className="text-2xl font-display font-bold" style={{ color: accent.color }}>
                          {offers.filter(isHotOffer).length}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => { fetchOffers(); showToast('Data refreshed! 🔄'); }}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl glass border-white/10 hover:bg-white/5 transition-all text-sm font-bold"
                      >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Data
                      </button>
                      <a
                        href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-white hover:scale-[1.02] transition-all text-sm font-bold"
                        style={{ backgroundColor: accent.color }}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Edit Sheet
                      </a>
                    </div>
                  </div>
                )}

                {/* === BRAND TAB === */}
                {activeTab === 'brand' && (
                  <div className="space-y-8">
                    {/* Logo / Emoji */}
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-3xl glass border-white/10 flex items-center justify-center overflow-hidden">
                          {branding.logo ? (
                            <img src={branding.logo} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-4xl">{branding.emoji}</span>
                          )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-3xl">
                          <Camera className="w-6 h-6" />
                          <input type="file" onChange={handleLogoUpload} className="hidden" accept="image/*" />
                        </label>
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 ml-1">Emoji Avatar</label>
                        <input
                          type="text"
                          value={branding.emoji}
                          onChange={(e) => setBranding({ ...branding, emoji: e.target.value })}
                          placeholder="🚀"
                          className="w-full px-4 py-3 rounded-xl glass border-white/10 text-white focus:outline-none focus:border-white/20 transition-all"
                        />
                        {branding.logo && (
                          <button
                            onClick={() => setBranding({ ...branding, logo: '' })}
                            className="text-[10px] text-red-400 mt-2 hover:underline"
                          >
                            Remove photo, use emoji
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Text Fields */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 ml-1">Site Name</label>
                        <input type="text" value={branding.name} onChange={(e) => setBranding({ ...branding, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl glass border-white/10 text-white focus:outline-none focus:border-white/20 transition-all" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 ml-1">Bio / Tagline</label>
                        <textarea rows={3} value={branding.bio} onChange={(e) => setBranding({ ...branding, bio: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl glass border-white/10 text-white focus:outline-none focus:border-white/20 transition-all resize-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 ml-1">Badge Text</label>
                        <input type="text" value={branding.chip} onChange={(e) => setBranding({ ...branding, chip: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl glass border-white/10 text-white focus:outline-none focus:border-white/20 transition-all" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 ml-1">Footer Text</label>
                        <input type="text" value={branding.footerText} onChange={(e) => setBranding({ ...branding, footerText: e.target.value })}
                          placeholder={`© 2026 ${branding.name}`}
                          className="w-full px-4 py-3 rounded-xl glass border-white/10 text-white placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-all" />
                      </div>
                    </div>

                    {/* How It Works Steps */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4 ml-1 flex items-center gap-2">
                        <Info className="w-3 h-3" /> How It Works Steps
                      </label>
                      <div className="space-y-3">
                        {(['step1', 'step2', 'step3'] as const).map((key, i) => (
                          <div key={key} className="flex items-center gap-3">
                            <span className="text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: accent.color + '25', color: accent.color }}>
                              {i + 1}
                            </span>
                            <input type="text" value={branding[key]} onChange={(e) => setBranding({ ...branding, [key]: e.target.value })}
                              className="flex-1 px-4 py-3 rounded-xl glass border-white/10 text-white text-sm focus:outline-none focus:border-white/20 transition-all" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Theme Color */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4 ml-1 flex items-center gap-2">
                        <Palette className="w-3 h-3" /> Theme Color
                      </label>
                      <div className="flex gap-3">
                        {Object.entries(ACCENTS).map(([key, { color, label }]) => (
                          <button
                            key={key}
                            onClick={() => setBranding({ ...branding, accentColor: key })}
                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${branding.accentColor === key ? 'glass border-white/20 scale-105' : 'hover:bg-white/5'}`}
                            title={label}
                          >
                            <div className="w-8 h-8 rounded-full border-2 transition-all" style={{ backgroundColor: color, borderColor: branding.accentColor === key ? 'white' : 'transparent' }} />
                            <span className="text-[9px] font-bold uppercase tracking-wider text-white/40">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleSaveBranding}
                      className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all text-white"
                      style={{ backgroundColor: accent.color }}
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                )}

                {/* === SOCIAL TAB === */}
                {activeTab === 'social' && (
                  <div className="space-y-8">
                    <div className="p-6 rounded-3xl border border-white/5" style={{ backgroundColor: accent.color + '10' }}>
                      <p className="text-sm leading-relaxed" style={{ color: accent.color }}>
                        Add your social links below. They'll appear in the header, footer, and as a floating WhatsApp button for your visitors.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 ml-1">
                          <MessageCircle className="w-3 h-3 text-green-400" /> WhatsApp Number
                        </label>
                        <input type="text" value={branding.whatsapp} onChange={(e) => setBranding({ ...branding, whatsapp: e.target.value })}
                          placeholder="919876543210 (with country code)"
                          className="w-full px-4 py-3 rounded-xl glass border-white/10 text-white placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-all" />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 ml-1">
                          <Send className="w-3 h-3 text-blue-400" /> Telegram
                        </label>
                        <input type="text" value={branding.telegram} onChange={(e) => setBranding({ ...branding, telegram: e.target.value })}
                          placeholder="username or https://t.me/channel"
                          className="w-full px-4 py-3 rounded-xl glass border-white/10 text-white placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-all" />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 ml-1">
                          <Instagram className="w-3 h-3 text-pink-400" /> Instagram
                        </label>
                        <input type="text" value={branding.instagram} onChange={(e) => setBranding({ ...branding, instagram: e.target.value })}
                          placeholder="username or full URL"
                          className="w-full px-4 py-3 rounded-xl glass border-white/10 text-white placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-all" />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 ml-1">
                          <Play className="w-3 h-3 text-red-400" /> YouTube
                        </label>
                        <input type="text" value={branding.youtube} onChange={(e) => setBranding({ ...branding, youtube: e.target.value })}
                          placeholder="@channel or full URL"
                          className="w-full px-4 py-3 rounded-xl glass border-white/10 text-white placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-all" />
                      </div>
                    </div>

                    <button
                      onClick={handleSaveBranding}
                      className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all text-white"
                      style={{ backgroundColor: accent.color }}
                    >
                      <Save className="w-4 h-4" />
                      Save Social Links
                    </button>
                  </div>
                )}

                {/* === SECURITY TAB === */}
                {activeTab === 'security' && (
                  <div className="space-y-8">
                    <div className="p-6 rounded-3xl bg-blue-500/10 border border-blue-500/20">
                      <p className="text-sm text-blue-200 leading-relaxed">
                        Your Cosmic Key is used to access this dashboard. Keep it safe and don't share it with anyone.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 ml-1">New Cosmic Key</label>
                        <input
                          type="password"
                          placeholder="Enter new key"
                          className="w-full px-4 py-3 rounded-xl glass border-white/10 text-white focus:outline-none focus:border-white/20 transition-all"
                          id="newKeyInput"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const input = document.getElementById('newKeyInput') as HTMLInputElement;
                          handleUpdateKey(input.value);
                          input.value = '';
                        }}
                        className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all text-white"
                        style={{ backgroundColor: accent.color }}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Update Cosmic Key
                      </button>
                    </div>

                    <div className="pt-8 border-t border-white/5">
                      <button
                        onClick={() => {
                          setIsOwner(false);
                          setShowDashboard(false);
                          showToast('Logged out', 'info');
                        }}
                        className="w-full py-4 rounded-2xl glass border-red-500/20 text-red-400 font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout Session
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========== TOAST NOTIFICATIONS ========== */}
      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ x: 100, opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 100, opacity: 0, scale: 0.9 }}
              className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border text-sm font-medium max-w-sm ${
                toast.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-200' :
                toast.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-200' :
                'bg-blue-500/20 border-blue-500/30 text-blue-200'
              }`}
            >
              {toast.type === 'success' && <Check className="w-5 h-5 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
              {toast.type === 'info' && <Info className="w-5 h-5 shrink-0" />}
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
