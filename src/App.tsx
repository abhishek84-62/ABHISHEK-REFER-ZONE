import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
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
  ArrowRight
} from 'lucide-react';

// --- Types ---
interface Offer {
  app: string;
  task: string;
  amt: string;
  tc: string;
  clm: string;
  trk: string;
}

interface Branding {
  name: string;
  bio: string;
  emoji: string;
  chip: string;
  logo: string;
}

// --- Constants ---
const SHEET_ID = '1z98mbUjd2feizZ235f95mUS3wmwygxPFXmu5mcnKUNk';
const GURL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

export default function App() {
  // --- State ---
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState('—');
  
  const [branding, setBranding] = useState<Branding>(() => {
    const saved = localStorage.getItem('rz_branding');
    return saved ? JSON.parse(saved) : {
      name: 'Abhishek ReferZone',
      bio: 'I am the youngest affiliate marketer 💹\nJoin me & start earning today!',
      emoji: '🚀',
      chip: 'Live Referral Offers',
      logo: ''
    };
  });

  const [cosmicKey, setCosmicKey] = useState(() => localStorage.getItem('rz_key') || '6200728484');
  const [isOwner, setIsOwner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [loginKey, setLoginKey] = useState('');
  const [loginError, setLoginError] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'info' | 'brand' | 'security'>('info');
  const [expandedOffer, setExpandedOffer] = useState<number | null>(null);

  // --- Data Fetching ---
  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${GURL}&_=${Date.now()}`);
      const text = await res.text();
      const jsonStr = text.substring(47).slice(0, -2);
      const jd = JSON.parse(jsonStr);
      
      const cols = jd.table.cols.map((c: any) => (c.label || '').trim().toLowerCase());
      const rows = jd.table.rows;

      const findIdx = (names: string[]) => {
        for (const name of names) {
          const i = cols.findIndex((c: string) => c.includes(name));
          if (i > -1) return i;
        }
        return -1;
      };

      const idx = {
        app: findIdx(['app name', 'app', 'name']),
        task: findIdx(['task']),
        amt: findIdx(['amount', 'ammount', 'amt', 'reward', 'earn']),
        tc: findIdx(['t&c', 'tc', 'term', 'condition']),
        clm: findIdx(['claim', 'link', 'url']),
        trk: findIdx(['tracker', 'track']),
      };

      // Fallbacks
      if (idx.app < 0) idx.app = 0;
      if (idx.task < 0) idx.task = 1;
      if (idx.amt < 0) idx.amt = 2;
      if (idx.tc < 0) idx.tc = 3;
      if (idx.clm < 0) idx.clm = 4;
      if (idx.trk < 0) idx.trk = 5;

      const getValue = (r: any, i: number) => (i >= 0 && r.c[i] ? String(r.c[i].v || '') : '');

      const fetchedOffers = rows.map((r: any) => ({
        app: getValue(r, idx.app),
        task: getValue(r, idx.task),
        amt: getValue(r, idx.amt),
        tc: getValue(r, idx.tc),
        clm: getValue(r, idx.clm),
        trk: getValue(r, idx.trk),
      })).filter((o: Offer) => o.app.trim());

      setOffers(fetchedOffers);
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
      setError('Failed to load offers. Please check your Google Sheet permissions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  // --- Handlers ---
  const handleLogin = () => {
    if (loginKey === cosmicKey) {
      setIsOwner(true);
      setShowLogin(false);
      setShowDashboard(true);
      setLoginKey('');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleSaveBranding = () => {
    localStorage.setItem('rz_branding', JSON.stringify(branding));
    alert('Branding saved successfully!');
  };

  const handleUpdateKey = (newKey: string) => {
    if (newKey.length < 4) {
      alert('Key must be at least 4 characters.');
      return;
    }
    setCosmicKey(newKey);
    localStorage.setItem('rz_key', newKey);
    alert('Cosmic Key updated!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setBranding({ ...branding, logo: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  // --- UI Components ---
  const GlassSphere = () => (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none z-0">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl animate-pulse" />
      <div className="absolute inset-4 rounded-full glass border-white/20 shadow-[0_0_100px_rgba(255,255,255,0.1)] animate-float overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5" />
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/5 rounded-full blur-2xl animate-rotate-slow" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen font-sans">
      <GlassSphere />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="text-center mb-16">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block relative mb-8"
          >
            <div className="absolute inset-0 rounded-full bg-white/10 blur-xl animate-pulse" />
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
            className="text-lg text-white/60 max-w-md mx-auto leading-relaxed mb-8"
          >
            {branding.bio}
          </motion.p>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 text-xs font-semibold tracking-widest uppercase text-white/80"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {branding.chip}
          </motion.div>
        </header>

        {/* Offers Grid */}
        <section className="mb-24">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
            <h2 className="font-display text-xl font-medium text-white/40 uppercase tracking-[0.2em]">Active Offers</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-64 rounded-3xl glass-dark animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="glass-dark rounded-3xl p-12 text-center border-red-500/20">
              <p className="text-red-400 mb-4">{error}</p>
              <button onClick={fetchOffers} className="text-white/60 hover:text-white underline underline-offset-4">Try Again</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {offers.map((offer, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group glass-dark rounded-3xl overflow-hidden border-white/5 hover:border-white/10 transition-all duration-500"
                >
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl glass border-white/10 flex items-center justify-center text-2xl shadow-inner">
                          {offer.app.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-display text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{offer.app}</h3>
                          <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">Referral Offer</p>
                        </div>
                      </div>
                      {offer.amt && (
                        <div className="px-4 py-2 rounded-xl bg-white text-black text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                          {offer.amt}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex gap-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 pt-1">Task</span>
                        <p className="text-sm text-white/70 leading-relaxed">{offer.task}</p>
                      </div>
                    </div>

                    {offer.tc && (
                      <div className="mb-8">
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
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-white text-black font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <Gift className="w-4 h-4" />
                        Claim Offer
                      </a>
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

        <footer className="text-center py-12 border-t border-white/5">
          <p className="text-xs text-white/20 font-medium tracking-widest uppercase">
            © 2026 {branding.name} · Design by ReferZone
          </p>
        </footer>
      </div>

      {/* Owner FAB */}
      <button 
        onClick={() => isOwner ? setShowDashboard(true) : setShowLogin(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full glass border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:scale-110 transition-all shadow-2xl z-50"
      >
        {isOwner ? <LayoutDashboard className="w-6 h-6" /> : <Key className="w-6 h-6" />}
      </button>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogin(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
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
                  className="w-full py-4 rounded-2xl bg-white text-black font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Enter Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dashboard Modal */}
      <AnimatePresence>
        {showDashboard && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDashboard(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
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

              <div className="flex p-2 bg-white/5 mx-8 mt-6 rounded-2xl">
                {(['info', 'brand', 'security'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white/60'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {activeTab === 'info' && (
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
                    <div className="flex gap-4">
                      <button 
                        onClick={fetchOffers}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl glass border-white/10 hover:bg-white/5 transition-all text-sm font-bold"
                      >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Data
                      </button>
                      <a 
                        href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-white text-black hover:scale-[1.02] transition-all text-sm font-bold"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Edit Sheet
                      </a>
                    </div>
                  </div>
                )}

                {activeTab === 'brand' && (
                  <div className="space-y-8">
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

                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 ml-1">Site Name</label>
                        <input 
                          type="text" 
                          value={branding.name}
                          onChange={(e) => setBranding({ ...branding, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl glass border-white/10 text-white focus:outline-none focus:border-white/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 ml-1">Bio / Tagline</label>
                        <textarea 
                          rows={3}
                          value={branding.bio}
                          onChange={(e) => setBranding({ ...branding, bio: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl glass border-white/10 text-white focus:outline-none focus:border-white/20 transition-all resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 ml-1">Badge Text</label>
                        <input 
                          type="text" 
                          value={branding.chip}
                          onChange={(e) => setBranding({ ...branding, chip: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl glass border-white/10 text-white focus:outline-none focus:border-white/20 transition-all"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleSaveBranding}
                      className="w-full py-4 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                )}

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
                        className="w-full py-4 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
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
