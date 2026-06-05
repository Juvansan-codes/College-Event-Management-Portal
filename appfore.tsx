import React, { useState, useEffect, useRef } from 'react';

// ============================================================
// TYPES & CONSTANTS[cite: 1]
// ============================================================
interface Attendee {
  id: string;
  name: string;
  email: string;
  sid: string;
  event: string;
  seat: string | null;
  dept: string;
  checkedIn: boolean;
  time: string | null;
  ticket: string;
  arenaSection: number;
}

const COLORS = [
  ['#f0f0f0', '#1a1a1a'], ['#e0e0e0', '#111111'],
  ['#c8c8c8', '#0d0d0d'], ['#d8d8d8', '#141414'],
  ['#b0b0b0', '#0a0a0a'], ['#eaeaea', '#0f0f0f'],
];[cite: 1]

const EVENTS = ['TechFest 2025', 'CodeSprint', 'HackArena', 'DesignJam'];[cite: 1]

const ARENAS = [
  { name: 'Main Hall', cap: 200, used: 45, desc: 'Plenary sessions & keynotes' },
  { name: 'Workshop A', cap: 50, used: 23, desc: 'Hands-on coding labs' },
  { name: 'Demo Zone', cap: 80, used: 31, desc: 'Project exhibitions' },
];[cite: 1]

const SEATS_TAKEN = ['A-01', 'A-03', 'B-02', 'B-05', 'C-01', 'C-04', 'D-02', 'D-06', 'E-03'];[cite: 1]

// ============================================================
// INJECTED CSS STYLES (Animations & Font Framework overrides)[cite: 1]
// ============================================================
const CSS_INJECTION = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap');

  .ff-font-sans { font-family: 'Outfit', sans-serif; }
  .ff-font-mono { font-family: 'DM Mono', monospace; }
  .ff-font-display { font-family: 'Bebas Neue', sans-serif; }

  @keyframes ff-ticker {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes ff-rowIn {
    from { opacity: 0; transform: translateX(-6px); }
    to { opacity: 1; transform: none; }
  }
  @keyframes ff-modalIn {
    from { opacity: 0; transform: scale(0.94); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes ff-toastIn {
    from { transform: translateY(10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes ff-fadeDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: none; }
  }
  
  .animate-ff-ticker { animation: ff-ticker 28s linear infinite; }
  .animate-ff-rowIn { animation: ff-rowIn 0.3s ease both; }
  .animate-ff-modalIn { animation: ff-modalIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
  .animate-ff-toastIn { animation: ff-toastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
  .animate-ff-fadeDown { animation: ff-fadeDown 0.5s ease both; }
`;[cite: 1]

// ============================================================
// UTILITIES[cite: 1]
// ============================================================
const initials = (n: string) => n.trim().split(' ').map(x => x[0] || '').join('').substring(0, 2).toUpperCase();[cite: 1]

const colorFor = (n: string) => {
  let h = 0;
  for (let i = 0; i < n.length; i++) {
    h = (h << 5) - h + n.charCodeAt(i);
    h |= 0;
  }
  return COLORS[Math.abs(h) % COLORS.length];
};[cite: 1]

const mkTicket = () => 'TKT-' + Math.random().toString(36).substring(2, 8).toUpperCase();[cite: 1]

const genQR = (canvas: HTMLCanvasElement, data: string) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const sz = canvas.width, m = 21, cs = (sz - 16) / m, off = 8;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, sz, sz);
  
  let h = 0;
  for (let i = 0; i < data.length; i++) {
    h = ((h << 5) - h) + data.charCodeAt(i);
    h |= 0;
  }
  const rng = (s: number) => {
    let x = Math.sin(s + h) * 10000;
    return x - Math.floor(x);
  };

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < m; c++) {
      const tl = r < 7 && c < 7;
      const tr = r < 7 && c >= m - 7;
      const bl = r >= m - 7 && c < 7;
      let fill = false;
      if (tl || tr || bl) {
        const lr = bl ? r - (m - 7) : r;
        const lc = tr ? c - (m - 7) : c;
        fill = (lr === 0 || lr === 6 || lc === 0 || lc === 6) || (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4);
      } else {
        fill = rng(r * m + c) > 0.43;
      }
      if (fill) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(off + c * cs + 0.5, off + r * cs + 0.5, cs - 1, cs - 1, 1.5);
        ctx.fill();
      }
    }
  }
};[cite: 1]

export default function FestForgePortal() {
  // ============================================================
  // REACT STATE SYSTEMS[cite: 1]
  // ============================================================
  const [attendees, setAttendees] = useState<Attendee[]>([]);[cite: 1]
  const [curPage, setCurPage] = useState<'attendees' | 'arena' | 'tickets' | 'badges' | 'analytics'>('attendees');[cite: 1]
  const [curFilter, setCurFilter] = useState<'all' | 'present' | 'pending'>('all');[cite: 1]
  const [searchQuery, setSearchQuery] = useState('');[cite: 1]
  const [selArena, setSelArena] = useState(0);[cite: 1]
  const [mySeats, setMySeats] = useState<string[]>([]);[cite: 1]
  
  const [isScannerOpen, setIsScannerOpen] = useState(false);[cite: 1]
  const [isRegOpen, setIsRegOpen] = useState(false);[cite: 1]
  const [selectedQRId, setSelectedQRId] = useState<string | null>(null);[cite: 1]
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);[cite: 1]

  const [manualInput, setManualInput] = useState('');[cite: 1]
  const [isSimulating, setIsSimulating] = useState(false);[cite: 1]
  const [scanResult, setScanResult] = useState<{ ok: boolean; msg: string; name?: string; sid?: string } | null>(null);[cite: 1]

  const [formName, setFormName] = useState('');[cite: 1]
  const [formEmail, setFormEmail] = useState('');[cite: 1]
  const [formSid, setFormSid] = useState('');[cite: 1]
  const [formDept, setFormDept] = useState('CS');[cite: 1]
  const [formEvent, setFormEvent] = useState('TechFest 2025');[cite: 1]
  const [formSeat, setFormSeat] = useState('');[cite: 1]

  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' | 'warn' } | null>(null);[cite: 1]

  const scanCanvasRef = useRef<HTMLCanvasElement | null>(null);[cite: 1]
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);[cite: 1]
  const scanAnimRef = useRef<number | null>(null);[cite: 1]

  // ============================================================
  // EFFECTS & TOAST ENGINE[cite: 1]
  // ============================================================
  const triggerToast = (msg: string, type: 'ok' | 'err' | 'warn') => {
    setToast({ msg, type });
  };[cite: 1]

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);[cite: 1]

  // Live Canvas Viewfinder Animation[cite: 1]
  useEffect(() => {
    if (isScannerOpen && scanCanvasRef.current) {
      const cv = scanCanvasRef.current;
      const ctx = cv.getContext('2d');
      if (!ctx) return;
      
      let scanPos = 0;
      let scanDir = 1;

      const draw = () => {
        const W = cv.width, H = cv.height;
        ctx.fillStyle = '#060606';
        ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x < W; x += 24) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y < H; y += 24) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        const b = 28;
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 2;
        [[0, 0], [W - b, 0], [0, H - b], [W - b, H - b]].forEach(([cx, cy]) => {
          ctx.beginPath(); ctx.moveTo(cx + b, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + b); ctx.stroke();
        });

        scanPos += scanDir * 1.1;
        if (scanPos > H - 4 || scanPos < 4) scanDir *= -1;
        const g = ctx.createLinearGradient(0, scanPos - 20, 0, scanPos + 20);
        g.addColorStop(0, 'transparent');
        g.addColorStop(0.5, 'rgba(255,255,255,0.5)');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, scanPos - 20, W, 40);

        scanAnimRef.current = requestAnimationFrame(draw);
      };

      draw();
    }

    return () => {
      if (scanAnimRef.current) cancelAnimationFrame(scanAnimRef.current);
    };
  }, [isScannerOpen]);[cite: 1]

  // QR Code Execution Trigger[cite: 1]
  useEffect(() => {
    if (selectedQRId && qrCanvasRef.current) {
      const attendee = attendees.find(a => a.id === selectedQRId);
      if (attendee) {
        genQR(qrCanvasRef.current, `${attendee.id}|${attendee.sid}|${attendee.ticket}|${attendee.event}`);
      }
    }
  }, [selectedQRId, attendees]);[cite: 1]

  // ============================================================
  // LOGIC & ACTIONS ENGINE[cite: 1]
  // ============================================================
  const handleQuickCheckIn = (id: string) => {
    setAttendees(prev => prev.map(a => a.id === id ? {
      ...a,
      checkedIn: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } : a));
    const target = attendees.find(a => a.id === id);
    if (target) triggerToast(`${target.name} checked in!`, 'ok');
  };[cite: 1]

  const handleRemoveAttendee = (id: string) => {
    if (!window.confirm('Remove this attendee?')) return;
    setAttendees(prev => prev.filter(a => a.id !== id));
    triggerToast('Attendee removed', 'err');
  };[cite: 1]

  const handleRegister = () => {
    if (!formName.trim() || !formEmail.trim() || !formSid.trim()) {
      triggerToast('Please fill all required fields', 'err');
      return;
    }
    if (!formEmail.includes('@')) {
      triggerToast('Please enter a valid email', 'err');
      return;
    }
    if (attendees.some(a => a.sid.toLowerCase() === formSid.trim().toLowerCase())) {
      triggerToast('Student ID already registered', 'err');
      return;
    }

    const nextId = 'ATT-' + String(attendees.length + 1).padStart(3, '0');
    const newAttendee: Attendee = {
      id: nextId,
      name: formName.trim(),
      email: formEmail.trim(),
      sid: formSid.trim().toUpperCase(),
      event: formEvent,
      seat: formSeat.trim() || null,
      dept: formDept,
      checkedIn: false,
      time: null,
      ticket: mkTicket(),
      arenaSection: 0
    };

    setAttendees(prev => [...prev, newAttendee]);
    setIsRegOpen(false);
    triggerToast(`${formName} registered! QR code generated.`, 'ok');

    setFormName(''); setFormEmail(''); setFormSid(''); setFormSeat('');
  };[cite: 1]

  const simulateQRScan = () => {
    setIsSimulating(true);
    setScanResult(null);
    setTimeout(() => {
      setIsSimulating(false);
      const pending = attendees.filter(a => !a.checkedIn);
      if (!attendees.length) {
        setScanResult({ ok: false, msg: 'No attendees registered yet!' });
        return;
      }
      if (!pending.length) {
        setScanResult({ ok: false, msg: 'All attendees already checked in!' });
        return;
      }

      const luckyPick = pending[Math.floor(Math.random() * pending.length)];
      const checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      setAttendees(prev => prev.map(a => a.id === luckyPick.id ? { ...a, checkedIn: true, time: checkInTime } : a));
      setScanResult({
        ok: true,
        msg: 'Attendance marked successfully!',
        name: luckyPick.name,
        sid: luckyPick.sid
      });
    }, 2000);
  };[cite: 1]

  const handleManualCheckIn = () => {
    if (!manualInput.trim()) return;
    const matched = attendees.find(a => 
      a.id.toLowerCase() === manualInput.trim().toLowerCase() ||
      a.sid.toLowerCase() === manualInput.trim().toLowerCase()
    );

    if (!matched) {
      setScanResult({ ok: false, msg: `No attendee found: "${manualInput}"` });
      return;
    }
    if (matched.checkedIn) {
      setScanResult({ ok: false, msg: `${matched.name} already checked in.` });
      return;
    }

    const checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAttendees(prev => prev.map(a => a.id === matched.id ? { ...a, checkedIn: true, time: checkInTime } : a));
    setScanResult({
      ok: true,
      msg: 'Attendance marked!',
      name: matched.name,
      sid: matched.sid
    });
    setManualInput('');
  };[cite: 1]

  const toggleSeat = (seatId: string) => {
    const isTakenExternally = SEATS_TAKEN.includes(seatId) || attendees.some(a => a.seat === seatId && !mySeats.includes(seatId));
    if (isTakenExternally && !mySeats.includes(seatId)) return;

    setMySeats(prev => prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId]);
  };[cite: 1]

  const downloadQR = () => {
    if (!qrCanvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'festforge-qr.png';
    link.href = qrCanvasRef.current.toDataURL();
    link.click();
  };[cite: 1]

  // ============================================================
  // MATRIX METRIC EVALUATORS[cite: 1]
  // ============================================================
  const totalEnrolled = attendees.length;[cite: 1]
  const checkedInCount = attendees.filter(a => a.checkedIn).length;[cite: 1]
  const pendingCount = totalEnrolled - checkedInCount;[cite: 1]
  const attendanceRate = totalEnrolled ? Math.round((checkedInCount / totalEnrolled) * 100) : 0;[cite: 1]

  const filteredAttendees = attendees.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.sid.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = curFilter === 'all' || 
                          (curFilter === 'present' && a.checkedIn) || 
                          (curFilter === 'pending' && !a.checkedIn);
    return matchesSearch && matchesFilter;
  });[cite: 1]

  const byEvent: Record<string, number> = {};
  attendees.forEach(a => { byEvent[a.event] = (byEvent[a.event] || 0) + 1; });
  const sortedEvents = Object.entries(byEvent).sort((a, b) => b[1] - a[1]);
  const maxEventVal = sortedEvents[0] ? sortedEvents[0][1] : 1;

  const byDept: Record<string, number> = {};
  attendees.forEach(a => { byDept[a.dept] = (byDept[a.dept] || 0) + 1; });
  const sortedDepts = Object.entries(byDept).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxDeptVal = sortedDepts[0] ? sortedDepts[0][1] : 1;

  const timelineHours = ['08', '09', '10', '11', '12', '13', '14', '15', '16'];
  const hourlyCounts = timelineHours.map(h => attendees.filter(a => a.checkedIn && a.time && a.time.startsWith(h)).length);
  const maxTimelineVal = Math.max(1, ...hourlyCounts);

  const previewBadgeColors = formName ? colorFor(formName) : ['#111111', '#555555'];

  return (
    <div className="ff-font-sans relative bg-[#080808] text-[#f0f0f0] min-h-screen overflow-x-hidden pb-16">
      {/* Styles Injection block */}
      <style>{CSS_INJECTION}</style>

      {/* Grid Pattern overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)'
        }}
      />

      <div className="relative z-10 max-w-[980px] mx-auto px-5 pt-6">
        {/* HEADER */}
        <header className="flex items-center justify-between border-b border-[#2a2a2a] pb-6 mb-8 flex-wrap gap-4 animate-ff-fadeDown">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-white flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <div>
              <div className="ff-font-display tracking-[0.08em] text-[1.9rem] text-white leading-none">FEST<span className="text-[#888888]">FORGE</span></div>
              <div className="text-[0.72rem] text-[#555555] mt-0.5 tracking-[0.06em] uppercase">Attendee Portal</div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#333333] rounded-lg text-[0.8rem] font-semibold bg-transparent text-[#f0f0f0] hover:bg-white/5 hover:border-[#555555] transition-all cursor-pointer" onClick={() => setIsScannerOpen(true)}>
              <span>&#128247;</span> <span>Scan QR</span>
            </button>
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[0.8rem] font-semibold bg-white text-black hover:bg-[#e0e0e0] transition-all cursor-pointer" onClick={() => setIsRegOpen(true)}>
              <span>&#10133;</span> <span>Register</span>
            </button>
          </div>
        </header>

        {/* MARQUEE TICKER */}
        <div className="overflow-hidden border-t border-b border-[#2a2a2a] bg-[#111111] py-2 mb-7">
          <div className="flex gap-0 whitespace-nowrap animate-ff-ticker">
            {[...Array(2)].map((_, mainIdx) => (
              <React.Fragment key={mainIdx}>
                <span className="inline-flex items-center gap-2 px-8 text-[0.72rem] text-[#888888] ff-font-mono tracking-wide"><span className="text-white">&#9889;</span> TechFest 2025 <span className="text-[#555555]">·</span> Registration Open</span>
                <span className="inline-flex items-center gap-2 px-8 text-[0.72rem] text-[#888888] ff-font-mono tracking-wide"><span className="text-white">&#128197;</span> CodeSprint <span className="text-[#555555]">·</span> Jan 20 2025</span>
                <span className="inline-flex items-center gap-2 px-8 text-[0.72rem] text-[#888888] ff-font-mono tracking-wide"><span className="text-white">&#127942;</span> HackArena <span className="text-[#555555]">·</span> 48h Hackathon</span>
                <span className="inline-flex items-center gap-2 px-8 text-[0.72rem] text-[#888888] ff-font-mono tracking-wide"><span className="text-white">&#127912;</span> DesignJam <span className="text-[#555555]">·</span> 200+ Seats</span>
                <span className="inline-flex items-center gap-2 px-8 text-[0.72rem] text-[#888888] ff-font-mono tracking-wide"><span className="text-white">&#128242;</span> QR Check-In <span className="text-[#555555]">·</span> Now Active</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
          {[
            { label: 'Registered', val: totalEnrolled, desc: 'total enrolled', txtColor: 'text-white' },
            { label: 'Checked In', val: checkedInCount, desc: 'present today', txtColor: 'text-[#4ade80]' },
            { label: 'Pending', val: pendingCount, desc: 'not yet arrived', txtColor: 'text-[#fbbf24]' },
            { label: 'Attendance', val: `${attendanceRate}%`, desc: 'check-in rate', txtColor: 'text-white' }
          ].map((stat, sIdx) => (
            <div key={sIdx} className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-[0.9rem_1.1rem] relative overflow-hidden group hover:border-[#333333] transition-all">
              <div className="text-[0.68rem] text-[#555555] uppercase tracking-wider font-semibold mb-1.5">{stat.label}</div>
              <div className={`text-[2.2rem] ff-font-display font-medium tracking-wide leading-none ${stat.txtColor}`}>{stat.val}</div>
              <div className="text-[0.68rem] text-[#555555] mt-1">{stat.desc}</div>
            </div>
          ))}
        </div>

        {/* PROGRESS BAR */}
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-[0.85rem_1.1rem] mb-5">
          <div className="flex justify-between items-center mb-2.5">
            <div className="text-[0.72rem] text-[#555555] uppercase tracking-wider font-semibold flex items-center gap-1">
              <span className="text-[#888888]">&#128200;</span> Check-in Progress
            </div>
            <div className="ff-font-mono text-[0.8rem] text-white font-medium">{checkedInCount} / {totalEnrolled}</div>
          </div>
          <div className="h-1 rounded-full bg-[#333333] overflow-hidden">
            <div className="h-full rounded-full bg-white transition-all duration-700 ease-out" style={{ width: `${attendanceRate}%` }} />
          </div>
        </div>

        {/* NAV TABS */}
        <div className="flex gap-0.5 mb-5 bg-[#111111] border border-[#2a2a2a] rounded-xl p-1 overflow-x-auto">
          {[
            { id: 'attendees', label: 'Attendees' },
            { id: 'arena', label: 'Arena' },
            { id: 'tickets', label: 'Tickets' },
            { id: 'badges', label: 'Badges' },
            { id: 'analytics', label: 'Analytics' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 min-w-fit px-3 py-2 rounded-lg text-[0.78rem] font-semibold transition-all tracking-wide whitespace-nowrap cursor-pointer ${
                curPage === tab.id ? 'bg-white text-black font-bold' : 'bg-transparent text-[#555555] hover:text-[#888888] hover:bg-white/5'
              }`}
              onClick={() => setCurPage(tab.id as any)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT CONTEXT INTERFACES */}
        <div className="transition-all duration-300">
          
          {/* VIEW: ATTENDEES */}
          {curPage === 'attendees' && (
            <div>
              <div className="flex gap-2 mb-3 flex-wrap items-center">
                <div className="relative flex-1 min-w-[180px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555] text-[14px]">&#128269;</span>
                  <input 
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#2a2a2a] bg-[#111111] text-[#f0f0f0] text-[0.8rem] focus:outline-none focus:border-[#333333] transition-colors"
                    placeholder="Search name, email, ID…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {['all', 'present', 'pending'].map((filt) => (
                  <button
                    key={filt}
                    className={`px-3 py-2 rounded-lg border text-[0.75rem] font-semibold tracking-wide capitalize transition-colors cursor-pointer ${
                      curFilter === filt ? 'bg-white text-black border-white' : 'border-[#2a2a2a] bg-[#111111] text-[#555555] hover:text-[#f0f0f0] hover:border-[#333333]'
                    }`}
                    onClick={() => setCurFilter(filt as any)}
                  >
                    {filt}
                  </button>
                ))}
              </div>

              {!attendees.length ? (
                <div className="text-center py-14 text-[#555555]">
                  <span className="text-[2.5rem] block mb-3 opacity-30">&#120141;</span>
                  <p className="text-[0.85rem] leading-relaxed">No attendees yet.<br /><strong className="text-[#888888]">Click Register</strong> to add your first attendee.</p>
                </div>
              ) : (
                <>
                  <div className="hidden md:grid grid-cols-[2.2fr_1fr_1fr_0.9fr_100px] gap-3 px-4 py-1.5 mb-1 text-[0.65rem] font-bold text-[#555555] uppercase tracking-wider">
                    <span>Student</span><span>Student ID</span><span>Event</span><span>Status</span><span></span>
                  </div>

                  {!filteredAttendees.length ? (
                    <div className="text-center py-8 text-[#555555]">
                      <span className="text-[2.5rem] block mb-3 opacity-30">&#128373;</span>
                      <p className="text-[0.85rem]">No results matches <strong>"{searchQuery}"</strong></p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {filteredAttendees.map((a, idx) => {
                        const [bg, fg] = colorFor(a.name);
                        return (
                          <div key={a.id} className="grid grid-cols-[1fr_auto] md:grid-cols-[2.2fr_1fr_1fr_0.9fr_100px] gap-2 md:gap-3 items-center p-[0.72rem_1rem] bg-[#111111] border border-[#2a2a2a] rounded-lg hover:border-[#333333] hover:bg-[#181818] transition-all animate-ff-rowIn" style={{ animationDelay: `${idx * 0.04}s` }}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-[30px] h-[30px] rounded-md flex items-center justify-center text-[0.68rem] font-bold tracking-wide shrink-0" style={{ backgroundColor: bg, color: fg }}>
                                {initials(a.name)}
                              </div>
                              <div className="min-w-0">
                                <div className="text-[0.82rem] font-semibold text-ellipsis overflow-hidden whitespace-nowrap">{a.name}</div>
                                <div className="text-[0.68rem] text-[#555555] text-ellipsis overflow-hidden whitespace-nowrap">{a.email}</div>
                              </div>
                            </div>

                            <span className="hidden md:inline-block ff-font-mono text-[0.72rem] text-[#888888] bg-[#181818] px-2 py-0.5 rounded border border-[#2a2a2a] w-fit">{a.sid}</span>
                            <span className="hidden md:inline-block text-[0.75rem] text-[#888888]">{a.event}</span>
                            
                            <div>
                              {a.checkedIn ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.68rem] font-semibold bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20">✓ Present</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.68rem] font-semibold bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/20">◷ Pending</span>
                              )}
                            </div>

                            <div className="flex gap-0.5 justify-end col-span-2 md:col-span-1">
                              <button className="w-7 h-7 rounded border border-[#2a2a2a] bg-[#181818] text-[#555555] hover:text-[#f0f0f0] hover:border-[#333333] flex items-center justify-center transition-colors text-[13px] cursor-pointer" title="View QR" onClick={() => setSelectedQRId(a.id)}>&#128240;</button>
                              <button className="w-7 h-7 rounded border border-[#2a2a2a] bg-[#181818] text-[#555555] hover:text-[#f0f0f0] hover:border-[#333333] flex items-center justify-center transition-colors text-[13px] cursor-pointer" title="Badge" onClick={() => setSelectedBadgeId(a.id)}>&#128187;</button>
                              {!a.checkedIn && (
                                <button className="w-7 h-7 rounded border border-[#2a2a2a] bg-[#181818] text-[#555555] hover:text-[#4ade80] hover:border-[#4ade80]/40 flex items-center justify-center transition-colors text-[13px] cursor-pointer" title="Check In" onClick={() => handleQuickCheckIn(a.id)}>✓</button>
                              )}
                              <button className="w-7 h-7 rounded border border-[#2a2a2a] bg-[#181818] text-[#555555] hover:text-[#f87171] hover:border-[#f87171]/40 flex items-center justify-center transition-colors text-[13px] cursor-pointer" title="Remove" onClick={() => handleRemoveAttendee(a.id)}>&#128465;</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-center text-[0.7rem] text-[#555555] mt-3">Showing {filteredAttendees.length} of {attendees.length} attendees</p>
                </>
              )}
            </div>
          )}

          {/* VIEW: ARENA SEAT MAP */}
          {curPage === 'arena' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[0.7rem] text-[#555555] uppercase tracking-wider font-bold flex items-center gap-1">&#127967; Arena Sections</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                {ARENAS.map((ar, idx) => {
                  const fillPct = Math.round((ar.used / ar.cap) * 100);
                  return (
                    <div 
                      key={idx} 
                      className={`bg-[#111111] border rounded-xl p-[0.9rem_1rem] cursor-pointer transition-all ${idx === selArena ? 'border-white bg-white/5' : 'border-[#2a2a2a]'}`}
                      onClick={() => setSelArena(idx)}
                    >
                      <h3 className="text-[0.85rem] font-bold mb-0.5">{ar.name}</h3>
                      <p className="text-[0.72rem] text-[#555555]">{ar.desc}</p>
                      <div className="text-[0.68rem] ff-font-mono text-[#888888] mt-1.5">{ar.used} / {ar.cap} capacity</div>
                      <div className="h-[3px] bg-[#2a2a2a] rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${fillPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4 text-center mb-3">
                <div className="bg-white/5 border border-[#333333] rounded-md p-1 text-[0.68rem] text-[#888888] font-bold tracking-widest uppercase mx-auto mb-3.5 max-w-[160px]">Stage / Screen</div>
                
                <div className="flex flex-col gap-1 items-center">
                  {['A', 'B', 'C', 'D', 'E'].map(row => (
                    <div key={row} className="flex justify-center gap-1">
                      {[...Array(8)].map((_, cIdx) => {
                        const seatId = `${row}-${String(cIdx + 1).padStart(2, '0')}`;
                        const isTaken = SEATS_TAKEN.includes(seatId) || attendees.some(a => a.seat === seatId && !mySeats.includes(seatId));
                        const isMine = mySeats.includes(seatId);
                        
                        let seatClass = 'bg-[#181818] border-[#2a2a2a] text-[#555555] hover:bg-white/10 hover:border-[#333333] cursor-pointer';
                        if (isMine) seatClass = 'bg-white text-black border-white';
                        else if (isTaken) seatClass = 'bg-white/5 border-[#333333] text-[#888888] cursor-not-allowed';

                        return (
                          <div 
                            key={seatId}
                            className={`w-5 h-5 rounded-sm border flex items-center justify-center text-[0.5rem] font-bold transition-all ${seatClass}`}
                            title={seatId}
                            onClick={() => toggleSeat(seatId)}
                          >
                            {isMine ? '★' : ''}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center gap-4 mt-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-[0.66rem] text-[#555555]">
                    <div className="w-2.5 h-2.5 rounded-sm bg-white/10 border border-[#333333]" /> Taken
                  </div>
                  <div className="flex items-center gap-1.5 text-[0.66rem] text-[#555555]">
                    <div className="w-2.5 h-2.5 rounded-sm bg-white border border-white" /> Yours ★
                  </div>
                  <div className="flex items-center gap-1.5 text-[0.66rem] text-[#555555]">
                    <div className="w-2.5 h-2.5 rounded-sm bg-[#181818] border border-[#2a2a2a]" /> Available
                  </div>
                </div>
              </div>

              <div className="text-[0.7rem] text-[#555555] uppercase tracking-wider font-bold flex items-center gap-1 mt-4 mb-2">&#120134; Checked-in in {ARENAS[selArena].name}</div>
              {attendees.filter(a => a.checkedIn && a.arenaSection === selArena).length === 0 ? (
                <div className="text-center py-6 bg-[#111111] border border-[#2a2a2a] rounded-xl text-[#555555]">
                  <span className="text-[1.5rem] block mb-1.5">&#128100;</span>
                  <p className="text-[0.75rem]">No checked-in attendees allocated in this venue area.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {attendees.filter(a => a.checkedIn && a.arenaSection === selArena).map(a => {
                    const [bg, fg] = colorFor(a.name);
                    return (
                      <div key={a.id} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center p-[0.72rem_1rem] bg-[#111111] border border-[#2a2a2a] rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded flex items-center justify-center text-[0.62rem] font-bold shrink-0" style={{ backgroundColor: bg, color: fg }}>{initials(a.name)}</div>
                          <div>
                            <div className="text-[0.82rem] font-semibold">{a.name}</div>
                            <div className="text-[0.68rem] text-[#555555]">{a.sid}</div>
                          </div>
                        </div>
                        <span className="ff-font-mono text-[0.72rem] text-[#888888] bg-[#181818] px-2 py-0.5 rounded border border-[#2a2a2a]">{a.seat || 'Floor'}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.62rem] font-semibold bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20">{a.time || '—'}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW: TICKETS */}
          {curPage === 'tickets' && (
            <div className="flex flex-col gap-2">
              {!attendees.length ? (
                <div className="text-center py-14 text-[#555555]">
                  <span className="text-[2.5rem] block mb-3 opacity-30">&#127915;</span>
                  <p className="text-[0.85rem]">No tickets yet.<br /><strong className="text-[#888888]">Register attendees</strong> to generate standard tickets.</p>
                </div>
              ) : (
                attendees.map((a, idx) => (
                  <div key={a.id} className="bg-[#111111] border border-[#2a2a2a] rounded-xl flex overflow-hidden hover:border-[#333333] transition-all animate-ff-rowIn" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className="w-[90px] shrink-0 bg-[#181818] border-r border-dashed border-[#333333] flex flex-col items-center justify-center p-[0.85rem_0.5rem] text-center gap-1 relative before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-[#080808] before:border before:border-[#2a2a2a] before:-left-2 before:top-[calc(50%-14px)] after:content-[''] after:absolute after:w-4 after:h-4 after:rounded-full after:bg-[#080808] after:border after:border-[#2a2a2a] after:-left-2 after:top-[calc(50%+4px)]">
                      <div className="text-[0.58rem] font-bold uppercase tracking-widest text-[#555555]">{a.event.split(' ')[0]}</div>
                      <div className="ff-font-display text-[1.5rem] text-white tracking-wider leading-none">{a.id.split('-')[1]}</div>
                      <span className={`text-[0.58rem] px-1.5 py-0.5 rounded-full font-semibold border ${a.checkedIn ? 'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20' : 'bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/20'}`}>
                        {a.checkedIn ? 'Used' : 'Valid'}
                      </span>
                    </div>

                    <div className="flex-1 p-[0.85rem_1rem] flex flex-col gap-1.5 justify-center min-w-0">
                      <div className="text-[0.88rem] font-bold text-ellipsis overflow-hidden whitespace-nowrap">{a.name}</div>
                      <div className="text-[0.7rem] text-[#555555] text-ellipsis overflow-hidden whitespace-nowrap">{a.sid} · {a.email}</div>
                      <div className="flex gap-1.5 flex-wrap mt-0.5">
                        <span className="text-[0.65rem] p-[2px_7px] rounded border border-[#2a2a2a] bg-[#181818] text-[#888888] flex items-center gap-1">&#128198; {a.event}</span>
                        <span className="text-[0.65rem] p-[2px_7px] rounded border border-[#2a2a2a] bg-[#181818] text-[#888888] flex items-center gap-1">&#128205; {a.seat || 'General'}</span>
                        <span className="text-[0.65rem] p-[2px_7px] rounded border border-[#2a2a2a] bg-[#181818] text-[#888888] flex items-center gap-1">&#128336; {a.checkedIn ? `In ${a.time}` : 'Pending'}</span>
                        <span className="text-[0.65rem] p-[2px_7px] rounded border border-[#2a2a2a] bg-[#181818] text-[#888888] flex items-center gap-1 ff-font-mono"># {a.ticket}</span>
                      </div>
                    </div>

                    <div className="p-[0.85rem_0.75rem] flex items-center">
                      <button className="w-7 h-7 rounded border border-[#2a2a2a] bg-[#181818] text-[#555555] hover:text-[#f0f0f0] hover:border-[#333333] flex items-center justify-center transition-colors text-[13px] cursor-pointer" onClick={() => setSelectedQRId(a.id)}>&#128240;</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* VIEW: BADGES */}
          {curPage === 'badges' && (
            <div>
              {!attendees.length ? (
                <div className="text-center py-14 text-[#555555]">
                  <span className="text-[2.5rem] block mb-3 opacity-30">&#128187;</span>
                  <p className="text-[0.85rem]">No badges yet.<br /><strong className="text-[#888888]">Register attendees</strong> to generate custom layout templates.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="text-[0.7rem] text-[#555555] uppercase tracking-wider font-bold flex items-center gap-1">&#128107; Custom Event Badges</div>
                    <span className="text-[0.7rem] text-[#555555]">{attendees.length} badge{attendees.length > 1 ? 's' : ''} generated</span>
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2.5">
                    {attendees.map((a, idx) => {
                      const [bg, fg] = colorFor(a.name);
                      return (
                        <div key={a.id} className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4 text-center cursor-pointer hover:border-[#333333] hover:-translate-y-0.5 transition-all animate-ff-rowIn" style={{ animationDelay: `${idx * 0.05}s` }} onClick={() => setSelectedBadgeId(a.id)}>
                          <div className="w-11 h-11 rounded-lg mx-auto mb-2.5 flex items-center justify-center text-[0.9rem] font-bold" style={{ backgroundColor: bg, color: fg }}>{initials(a.name)}</div>
                          <div className="text-[0.82rem] font-bold text-ellipsis overflow-hidden whitespace-nowrap">{a.name}</div>
                          <div className="text-[0.65rem] text-[#555555] ff-font-mono mb-1">{a.sid}</div>
                          <div className="inline-block px-2 py-0.5 rounded-full text-[0.62rem] font-semibold bg-white/5 border border-[#333333] text-[#888888] max-w-full text-ellipsis overflow-hidden whitespace-nowrap">{a.event}</div>
                          <div className="mt-1.5">
                            <span className={`text-[0.6rem] px-2 py-0.5 rounded-full font-semibold ${a.checkedIn ? 'bg-[#4ade80]/10 text-[#4ade80]' : 'bg-[#fbbf24]/10 text-[#fbbf24]'}`}>
                              {a.checkedIn ? '✓ Attended' : 'Pending'}
                            </span>
                          </div>
                          <button className="mt-3 w-full p-1.5 rounded border border-[#2a2a2a] bg-[#181818] text-[#555555] hover:text-[#f0f0f0] hover:border-[#333333] font-semibold text-[0.68rem] transition-colors flex items-center justify-center gap-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedBadgeId(a.id); }}>
                            Preview
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* VIEW: ANALYTICS */}
          {curPage === 'analytics' && (
            <div className="flex flex-col gap-2.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-[0.9rem_1rem]">
                  <h4 className="text-[0.68rem] text-[#555555] uppercase tracking-wider font-bold mb-3">Check-in Rate</h4>
                  <div className="flex items-center justify-center gap-6 py-2">
                    <div className="relative w-20 h-20 shrink-0">
                      <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
                        <circle cx="40" cy="40" r="34" fill="none" strokeWidth="5" className="stroke-[#333333]" />
                        <circle 
                          cx="40" 
                          cy="40" 
                          r="34" 
                          fill="none" 
                          strokeWidth="5" 
                          className="stroke-white stroke-linecap-round transition-all duration-700 ease-out" 
                          strokeDasharray={`${2 * Math.PI * 34 * (attendanceRate / 100)} ${2 * Math.PI * 34}`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="ff-font-display text-[1.3rem] text-white leading-none">{attendanceRate}%</div>
                        <div className="text-[0.5rem] text-[#555555] uppercase tracking-widest mt-0.5">Rate</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-[0.75rem]">
                        <div className="w-2 h-2 rounded-full bg-[#4ade80]" /> <span className="text-[#888888]">{checkedInCount} present</span>
                      </div>
                      <div className="flex items-center gap-2 text-[0.75rem]">
                        <div className="w-2 h-2 rounded-full bg-[#fbbf24]" /> <span className="text-[#888888]">{pendingCount} pending</span>
                      </div>
                      <div className="flex items-center gap-2 text-[0.75rem]">
                        <div className="w-2 h-2 rounded-full bg-[#333333]" /> <span className="text-[#888888]">{totalEnrolled} total</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-[0.9rem_1rem]">
                  <h4 className="text-[0.68rem] text-[#555555] uppercase tracking-wider font-bold mb-3">By Department</h4>
                  {!sortedDepts.length ? (
                    <p className="text-[0.75rem] text-[#555555]">No historical metrics recorded.</p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {sortedDepts.map(([d, count]) => (
                        <div key={d} className="flex items-center gap-2">
                          <span className="text-[0.7rem] text-[#888888] w-[70px] truncate">{d}</span>
                          <div className="flex-1 h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${Math.round((count / maxDeptVal) * 100)}%` }} />
                          </div>
                          <span className="text-[0.7rem] font-semibold text-[#888888] w-6 text-right ff-font-mono">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-[0.9rem_1rem]">
                  <h4 className="text-[0.68rem] text-[#555555] uppercase tracking-wider font-bold mb-3">Attendees by Event</h4>
                  {!sortedEvents.length ? (
                    <p className="text-[0.75rem] text-[#555555]">No event records captured.</p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {sortedEvents.map(([ev, count]) => (
                        <div key={ev} className="flex items-center gap-2">
                          <span className="text-[0.7rem] text-[#888888] w-[70px] truncate" title={ev}>{ev}</span>
                          <div className="flex-1 h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${Math.round((count / maxEventVal) * 100)}%` }} />
                          </div>
                          <span className="text-[0.7rem] font-semibold text-[#888888] w-6 text-right ff-font-mono">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-[0.9rem_1rem]">
                  <h4 className="text-[0.68rem] text-[#555555] uppercase tracking-wider font-bold mb-3">Check-in Timeline</h4>
                  <div className="flex gap-1.5 items-end h-[72px] pt-2">
                    {timelineHours.map((hour, hIdx) => {
                      const count = hourlyCounts[hIdx];
                      const heightPx = count ? Math.max(10, Math.round((count / maxTimelineVal) * 56)) : 4;
                      return (
                        <div key={hour} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[0.56rem] text-[#555555] h-3">{count || ''}</span>
                          <div className={`w-full rounded-t-sm transition-all duration-500 ${count ? 'bg-white' : 'bg-[#2a2a2a]'}`} style={{ height: `${heightPx}px` }} />
                          <span className="text-[0.56rem] text-[#555555]">{hour}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODAL: QR SCANNER OVERLAY */}
      {isScannerOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-[300] backdrop-blur-xs">
          <div className="bg-[#111111] border border-[#333333] rounded-2xl p-6 w-full max-w-[420px] relative animate-ff-modalIn">
            <button className="absolute top-3 right-3 bg-[#181818] border border-[#2a2a2a] rounded-md w-7 h-7 flex items-center justify-center text-[#555555] hover:text-[#f0f0f0] hover:border-[#333333] transition-colors cursor-pointer" onClick={() => { setIsScannerOpen(false); setScanResult(null); }}>&times;</button>
            <p className="text-[0.95rem] font-bold flex items-center gap-1.5 mb-0.5"><span>&#128247;</span> QR Scanner</p>
            <p className="text-[0.75rem] text-[#555555] mb-4">Scan student QR code to mark attendance instantly</p>
            
            <div className="rounded-lg overflow-hidden bg-black relative h-[190px] mb-4 border border-[#2a2a2a]">
              <canvas ref={scanCanvasRef} width="400" height="190" className="w-full h-[190px] block" />
              {isSimulating && (
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-white text-black px-3 py-1 rounded-full text-[0.72rem] font-bold flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" /> Scanning…
                </div>
              )}
            </div>

            {scanResult && (
              <div className={`p-3 rounded-lg mb-3.5 flex gap-2.5 items-start border ${scanResult.ok ? 'bg-[#4ade80]/10 border-[#4ade80]/25 text-[#4ade80]' : 'bg-[#f87171]/10 border-[#f87171]/25 text-[#f87171]'}`}>
                <span className="text-[17px] font-bold mt-0.5">{scanResult.ok ? '✓' : '✕'}</span>
                <div>
                  <p className="text-[0.83rem] font-semibold m-0">{scanResult.msg}</p>
                  {scanResult.name && <small className="text-[0.72rem] text-[#555555] block mt-0.5">{scanResult.name} · {scanResult.sid}</small>}
                </div>
              </div>
            )}

            <button className="w-full p-2.5 rounded-lg border border-[#333333] bg-white text-black font-bold text-[0.83rem] flex items-center justify-center gap-1.5 mb-2.5 hover:bg-[#e0e0e0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer" onClick={simulateQRScan} disabled={isSimulating}>
              Simulate QR Scan
            </button>

            <div className="relative mb-2">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-[#2a2a2a] z-0" />
              <div className="relative z-10 text-center"><span className="bg-[#111111] px-2.5 text-[0.68rem] text-[#555555] font-semibold uppercase tracking-widest">or manual</span></div>
            </div>

            <div className="flex gap-1.5 mb-2">
              <input 
                className="flex-1 p-[0.5rem_0.75rem] rounded-lg border border-[#2a2a2a] bg-[#181818] text-[#f0f0f0] text-[0.8rem] focus:outline-none focus:border-[#333333]" 
                placeholder="Enter ATT-001 or student ID…" 
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualCheckIn()}
              />
              <button className="px-3.5 py-2 rounded-lg border border-[#333333] bg-[#181818] text-[#888888] font-semibold text-[0.78rem] hover:bg-white/5 hover:text-[#f0f0f0] transition-all cursor-pointer" onClick={handleManualCheckIn}>Check In</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: QR VIEWER PASSPORT OVERLAY */}
      {selectedQRId && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-[300] backdrop-blur-xs">
          <div className="bg-[#111111] border border-[#333333] rounded-2xl p-6 w-full max-w-[320px] relative text-center animate-ff-modalIn">
            <button className="absolute top-3 right-3 bg-[#181818] border border-[#2a2a2a] rounded-md w-7 h-7 flex items-center justify-center text-[#555555] hover:text-[#f0f0f0] hover:border-[#333333] transition-colors cursor-pointer" onClick={() => setSelectedQRId(null)}>&times;</button>
            {(() => {
              const a = attendees.find(x => x.id === selectedQRId);
              if (!a) return null;
              const [bg, fg] = colorFor(a.name);
              return (
                <>
                  <div className="w-12 h-12 rounded-[11px] mx-auto mb-2.5 flex items-center justify-center text-[1rem] font-bold" style={{ backgroundColor: bg, color: fg }}>{initials(a.name)}</div>
                  <div className="text-[1rem] font-bold mb-0.5">{a.name}</div>
                  <div className="text-[0.74rem] text-[#555555] mb-4">{a.sid} · {a.event}</div>
                  <canvas ref={qrCanvasRef} width="168" height="168" className="rounded-lg bg-black border border-[#333333] p-2 mx-auto mb-3.5" />
                  <div className="bg-[#181818] rounded-md p-2 mb-3.5 border border-[#2a2a2a]">
                    <code className="ff-font-mono text-[0.72rem] text-[#888888] tracking-wide">{a.id} · {a.ticket}</code>
                  </div>
                  <div className={`text-[0.78rem] flex items-center justify-center gap-1 mb-4 ${a.checkedIn ? 'text-[#4ade80]' : 'text-[#555555]'}`}>
                    <span>{a.checkedIn ? '✓' : '◷'}</span> {a.checkedIn ? `Checked in at ${a.time}` : 'Not yet checked in'}
                  </div>
                  <button className="w-full p-2.5 rounded-lg border border-[#2a2a2a] bg-[#181818] text-[#888888] font-semibold text-[0.8rem] flex items-center justify-center gap-1.5 hover:border-[#333333] hover:text-[#f0f0f0] transition-colors cursor-pointer" onClick={downloadQR}>
                    Download QR Code
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW ID BADGE OVERLAY */}
      {selectedBadgeId && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-[300] backdrop-blur-xs">
          <div className="bg-[#111111] border border-[#333333] rounded-2xl p-6 w-full max-w-[340px] relative text-center animate-ff-modalIn">
            <button className="absolute top-3 right-3 bg-[#181818] border border-[#2a2a2a] rounded-md w-7 h-7 flex items-center justify-center text-[#555555] hover:text-[#f0f0f0] hover:border-[#333333] transition-colors cursor-pointer" onClick={() => setSelectedBadgeId(null)}>&times;</button>
            {(() => {
              const a = attendees.find(x => x.id === selectedBadgeId);
              if (!a) return null;
              const [bg, fg] = colorFor(a.name);
              return (
                <>
                  <p className="text-[0.7rem] font-bold uppercase tracking-widest text-[#555555] mb-4">Event Badge</p>
                  <div className="rounded-2xl p-5 text-center relative overflow-hidden border bg-gradient-to-br from-[#181818] to-[#111111]" style={{ borderColor: bg }}>
                    <div className="w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center text-[1.2rem] font-bold relative z-10" style={{ backgroundColor: bg, color: fg }}>{initials(a.name)}</div>
                    <div className="text-[1rem] font-bold mb-0.5 relative z-10">{a.name}</div>
                    <div className="ff-font-mono text-[0.72rem] text-[#555555] relative z-10">{a.sid}</div>
                    <div className="inline-block mt-2.5 px-3 py-1 rounded-full text-[0.72rem] font-semibold bg-white/5 border border-[#333333] text-[#888888] relative z-10">{a.event}</div>
                    {a.seat && <div className="text-[0.7rem] text-[#555555] mt-1.5 relative z-10">&#128205; Seat {a.seat}</div>}
                    <div className="h-[1px] bg-[#2a2a2a] my-3.5 relative z-10" />
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[0.68rem] font-semibold relative z-10 border ${a.checkedIn ? 'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20' : 'bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/20'}`}>
                      {a.checkedIn ? '✓ Attended' : 'Pending Attendance'}
                    </span>
                  </div>
                  <button className="w-full mt-3.5 p-2.5 rounded-lg border border-[#2a2a2a] bg-[#181818] text-[#888888] font-semibold text-[0.8rem] flex items-center justify-center gap-1.5 hover:border-[#333333] hover:text-[#f0f0f0] transition-colors cursor-pointer" onClick={() => { const bId = a.id; setSelectedBadgeId(null); setSelectedQRId(bId); }}>
                    View QR Code
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL: ATTENDEE REGISTRATION INTERACTIVE SHEET FORM */}
      {isRegOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-[300] backdrop-blur-xs">
          <div className="bg-[#111111] border border-[#333333] rounded-2xl p-6 w-full max-w-[500px] relative animate-ff-modalIn">
            <button className="absolute top-3 right-3 bg-[#181818] border border-[#2a2a2a] rounded-md w-7 h-7 flex items-center justify-center text-[#555555] hover:text-[#f0f0f0] hover:border-[#333333] transition-colors cursor-pointer" onClick={() => setIsRegOpen(false)}>&times;</button>
            <p className="text-[0.95rem] font-bold flex items-center gap-1.5 mb-0.5"><span>&#128100;</span> Register New Attendee</p>
            <p className="text-[0.75rem] text-[#555555] mb-4">Fill in the details to register and auto-generate QR code</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
              <div>
                <label className="text-[0.72rem] text-[#555555] block mb-1 font-semibold tracking-wide">Full Name *</label>
                <input className="w-full p-[0.52rem_0.75rem] rounded-lg border border-[#2a2a2a] bg-[#181818] text-[#f0f0f0] text-[0.82rem] focus:outline-none focus:border-[#333333] transition-colors" placeholder="e.g. Riya Sharma" value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>
              <div>
                <label className="text-[0.72rem] text-[#555555] block mb-1 font-semibold tracking-wide">Email *</label>
                <input className="w-full p-[0.52rem_0.75rem] rounded-lg border border-[#2a2a2a] bg-[#181818] text-[#f0f0f0] text-[0.82rem] focus:outline-none focus:border-[#333333] transition-colors" placeholder="student@college.edu" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-[0.72rem] text-[#555555] block mb-1 font-semibold tracking-wide">Student ID *</label>
                <input className="w-full p-[0.52rem_0.75rem] rounded-lg border border-[#2a2a2a] bg-[#181818] text-[#f0f0f0] text-[0.82rem] focus:outline-none focus:border-[#333333] transition-colors" placeholder="e.g. CS2024001" value={formSid} onChange={(e) => setFormSid(e.target.value)} />
              </div>
              <div>
                <label className="text-[0.72rem] text-[#555555] block mb-1 font-semibold tracking-wide">Department</label>
                <select className="w-full p-[0.52rem_0.75rem] rounded-lg border border-[#2a2a2a] bg-[#181818] text-[#f0f0f0] text-[0.82rem] focus:outline-none focus:border-[#333333] transition-colors appearance-none" value={formDept} onChange={(e) => setFormDept(e.target.value)}>
                  <option value="CS" className="bg-[#111111]">Computer Science</option>
                  <option value="EC" className="bg-[#111111]">Electronics</option>
                  <option value="ME" className="bg-[#111111]">Mechanical</option>
                  <option value="IT" className="bg-[#111111]">Information Tech</option>
                  <option value="EE" className="bg-[#111111]">Electrical</option>
                  <option value="CE" className="bg-[#111111]">Civil</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[0.72rem] text-[#555555] block mb-1 font-semibold tracking-wide">Event</label>
                <select className="w-full p-[0.52rem_0.75rem] rounded-lg border border-[#2a2a2a] bg-[#181818] text-[#f0f0f0] text-[0.82rem] focus:outline-none focus:border-[#333333] transition-colors appearance-none" value={formEvent} onChange={(e) => setFormEvent(e.target.value)}>
                  {EVENTS.map(ev => <option key={ev} value={ev} className="bg-[#111111]">{ev}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[0.72rem] text-[#555555] block mb-1 font-semibold tracking-wide">Arena Seat (optional)</label>
                <input className="w-full p-[0.52rem_0.75rem] rounded-lg border border-[#2a2a2a] bg-[#181818] text-[#f0f0f0] text-[0.82rem] focus:outline-none focus:border-[#333333] transition-colors" placeholder="e.g. A-12 or leave blank" value={formSeat} onChange={(e) => setFormSeat(e.target.value)} />
              </div>
            </div>

            <div className="border border-[#2a2a2a] rounded-lg p-4 text-center mt-3 bg-[#181818]">
              <p className="text-[0.65rem] text-[#555555] uppercase tracking-widest font-bold mb-2.5">Badge Live Preview</p>
              <div className="w-11 h-11 rounded-md mx-auto mb-2 flex items-center justify-center text-[0.9rem] font-bold border transition-colors" style={formName ? { backgroundColor: previewBadgeColors[0], color: previewBadgeColors[1], borderColor: 'transparent' } : { backgroundColor: '#111111', color: '#555555', borderColor: '#2a2a2a' }}>
                {formName ? initials(formName) : '?'}
              </div>
              <div className={`text-[0.88rem] font-bold mb-0.5 ${formName ? 'text-[#f0f0f0]' : 'text-[#555555]'}`}>{formName || 'Student Name'}</div>
              <div className="ff-font-mono text-[0.68rem] text-[#555555]">{formSid || 'Student ID'}</div>
              <div className="inline-block mt-2 px-2 py-0.5 rounded-full text-[0.62rem] font-semibold bg-white/5 border border-[#333333] text-[#888888]">{formEvent}</div>
            </div>
            <br />
            <button className="w-full p-2.5 rounded-lg border-none bg-white text-black font-bold text-[0.85rem] flex items-center justify-center gap-1.5 hover:bg-[#e0e0e0] transition-colors cursor-pointer" onClick={handleRegister}>
              Register & Generate QR
            </button>
          </div>
        </div>
      )}

      {/* GLOBAL TOAST BANNER */}
      {toast && (
        <div className={`fixed bottom-5 right-5 text-black p-[0.6rem_1.1rem] rounded-lg text-[0.8rem] font-bold flex items-center gap-2 z-[999] shadow-2xl animate-ff-toastIn ${
          toast.type === 'err' ? 'bg-[#f87171] text-white' : toast.type === 'warn' ? 'bg-[#fbbf24]' : 'bg-white'
        }`}>
          <span>{toast.type === 'err' ? '✕' : '✓'}</span> {toast.msg}
        </div>
      )}
    </div>
  );
}