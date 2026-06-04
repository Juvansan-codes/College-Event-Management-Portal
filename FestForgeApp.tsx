import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen = "preview" | "signin" | "roleselect" | "student-signup" | "success";
type Role = "student" | "organizer";

// ─── Shared: Background Grid ──────────────────────────────────────────────────
const BgGrid: React.FC = () => (
  <div
    className="absolute inset-0 opacity-[0.03] pointer-events-none"
    style={{
      backgroundImage:
        "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
      backgroundSize: "48px 48px",
    }}
  />
);

// ─── Shared: Logo ─────────────────────────────────────────────────────────────
const Logo: React.FC<{ size?: "sm" | "md" }> = ({ size = "md" }) => (
  <div className="flex items-center gap-2">
    <svg width={size === "sm" ? 14 : 18} height={size === "sm" ? 14 : 18} viewBox="0 0 22 22" fill="none">
      <rect x="1" y="1" width="8" height="8" rx="2" fill="#fff" />
      <rect x="13" y="1" width="8" height="8" rx="2" fill="#fff" />
      <rect x="1" y="13" width="8" height="8" rx="2" fill="#fff" />
      <rect x="13" y="13" width="8" height="8" rx="2" fill="#555" />
    </svg>
    <span
      className="text-white/80 font-bold tracking-widest uppercase font-mono"
      style={{ fontSize: size === "sm" ? "11px" : "13px" }}
    >
      FestForge
    </span>
  </div>
);

// ─── Shared: Input Field ──────────────────────────────────────────────────────
interface InputFieldProps {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  half?: boolean;
  error?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label, type = "text", placeholder, value, onChange, required, half, error,
}) => (
  <div className={half ? "flex-1 min-w-0" : "w-full"}>
    <label className="block text-white/50 text-[11px] font-mono tracking-widest uppercase mb-2">
      {label}{required && <span className="text-white/30 ml-1">*</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all duration-200"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: `1px solid ${error ? "rgba(220,50,50,0.6)" : "rgba(255,255,255,0.1)"}`,
        fontFamily: "inherit",
      }}
      onFocus={e => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = error ? "rgba(220,50,50,0.6)" : "rgba(255,255,255,0.1)";
        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
      }}
    />
  </div>
);

// ─── Sign In Page ─────────────────────────────────────────────────────────────
interface SignInPageProps {
  onCreateAccount: () => void;
}

const SignInPage: React.FC<SignInPageProps> = ({ onCreateAccount }) => {
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("arjun@college.edu");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <BgGrid />
      <div className="w-full max-w-lg relative z-10">
        <div className="flex flex-col items-center mb-10">
          <Logo />
          <p className="text-white/25 text-[10px] font-mono tracking-[0.2em] uppercase mt-1">Welcome Back</p>
        </div>

        <div
          className="rounded-3xl p-8"
          style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-6"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            🔑
          </div>
          <h1
            className="text-white font-black mb-1"
            style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(1.6rem,4vw,2rem)", letterSpacing: "-0.03em" }}
          >
            Sign in
          </h1>
          <p className="text-white/35 text-sm mb-7">Enter your credentials to access your account.</p>

          {/* Role toggle */}
          <div className="flex gap-3 mb-7">
            {(["student", "organizer"] as Role[]).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className="flex-1 py-2.5 rounded-xl text-xs font-mono tracking-widest uppercase transition-all duration-200"
                style={{
                  border: role === r ? "1px solid rgba(255,255,255,0.35)" : "1px solid rgba(255,255,255,0.1)",
                  background: role === r ? "rgba(255,255,255,0.08)" : "transparent",
                  color: role === r ? "#fff" : "rgba(255,255,255,0.35)",
                }}
              >
                {r === "student" ? "🎓" : "🔧"} {r}
              </button>
            ))}
          </div>

          <div className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-white/50 text-[11px] font-mono tracking-widest uppercase mb-2">
                Email Address <span className="text-white/30">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="arjun@college.edu"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontFamily: "inherit",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/50 text-[11px] font-mono tracking-widest uppercase mb-2">
                Password <span className="text-white/30">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-20 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontFamily: "inherit",
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                />
                <button
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-mono text-white/50 hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  {showPass ? "hide" : "show"}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <button className="text-white/30 text-xs font-mono hover:text-white/60 transition-colors">
                  Forgot password?
                </button>
              </div>
            </div>
          </div>

          <button
            className="w-full mt-7 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
            style={{ background: "#fff", color: "#000", fontFamily: "inherit" }}
          >
            Sign In →
          </button>

          <div
            className="flex items-center gap-3 my-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          />

          <p className="text-center text-white/20 text-xs font-mono">
            Don't have an account?{" "}
            <span
              className="text-white/50 cursor-pointer hover:text-white transition-colors"
              onClick={onCreateAccount}
            >
              Create one
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Role Select Page ─────────────────────────────────────────────────────────
interface RoleSelectPageProps {
  onSelect: (role: Role) => void;
  onBack: () => void;
}

const RoleSelectPage: React.FC<RoleSelectPageProps> = ({ onSelect, onBack }) => {
  const [hovered, setHovered] = useState<string | null>(null);

  const cards = [
    {
      id: "student" as Role,
      icon: "🎓",
      roleNum: "Role 01",
      title: "Student",
      desc: "Browse events, register for fests, track your schedule and connect with campus activities.",
      features: ["Discover Events", "Register", "Track Schedule", "Get Certificates"],
      cta: "Join as Student",
    },
    {
      id: "organizer" as Role,
      icon: "🔧",
      roleNum: "Role 02",
      title: "Organizer",
      desc: "Create events, manage registrations, coordinate teams and build unforgettable college fests.",
      features: ["Create Events", "Manage Teams", "Analytics", "Approvals"],
      cta: "Join as Organizer",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
      <BgGrid />

      <div className="flex items-center gap-2 mb-2">
        <Logo />
      </div>
      <p className="text-white/25 text-[10px] font-mono tracking-widest uppercase mb-14">
        Step 2 of 3 — Choose your role
      </p>

      <h1
        className="text-white text-center mb-3 font-black leading-none"
        style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(1.8rem,4vw,2.8rem)", letterSpacing: "-0.03em" }}
      >
        Who are you joining as?
      </h1>
      <p className="text-white/35 text-sm text-center mb-14 max-w-xs leading-relaxed">
        Pick your role — each unlocks a different experience on the platform.
      </p>

      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl">
        {cards.map(card => (
          <button
            key={card.id}
            className="flex-1 relative group text-left rounded-3xl border transition-all duration-300 overflow-hidden"
            style={{
              background: hovered === card.id ? "#111" : "#0f0f0f",
              borderColor: hovered === card.id ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
              transform: hovered === card.id ? "translateY(-6px) scale(1.01)" : "translateY(0) scale(1)",
              boxShadow: hovered === card.id ? "0 32px 64px rgba(0,0,0,0.6)" : "none",
            }}
            onMouseEnter={() => setHovered(card.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect(card.id)}
          >
            <div className="h-[3px] w-full bg-gradient-to-r from-white/60 via-white/20 to-transparent" />
            <div className="p-8 pb-10">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-3xl"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {card.icon}
              </div>
              <div className="text-white/30 text-[10px] font-mono tracking-[0.2em] uppercase mb-2">{card.roleNum}</div>
              <h2
                className="text-white text-3xl font-black mb-3"
                style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}
              >
                {card.title}
              </h2>
              <p className="text-white/45 text-sm leading-relaxed mb-8">{card.desc}</p>
              <div className="flex flex-wrap gap-2 mb-8">
                {card.features.map(f => (
                  <span
                    key={f}
                    className="text-[10px] font-mono px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    {f}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-white/70 group-hover:text-white transition-colors">
                {card.cta}
                <span className="transition-transform group-hover:translate-x-1 duration-200">→</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onBack}
        className="text-white/20 text-xs font-mono hover:text-white/50 transition-colors mt-10"
      >
        ← Back to Sign In
      </button>
      <p className="text-white/15 text-xs font-mono mt-3">You can change your role later from settings</p>
    </div>
  );
};

// ─── Student Sign Up Form ─────────────────────────────────────────────────────
interface StudentSignUpFormProps {
  onBack: () => void;
  onComplete: () => void;
}

const StudentSignUpForm: React.FC<StudentSignUpFormProps> = ({ onBack, onComplete }) => {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    college: "", department: "", year: "", rollNo: "",
    password: "", confirmPassword: "",
  });

  const set = (key: keyof typeof form) => (v: string) =>
    setForm(f => ({ ...f, [key]: v }));

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-start px-6 py-12 relative overflow-hidden">
      <BgGrid />
      <div className="w-full max-w-xl relative z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/30 hover:text-white/70 text-xs font-mono tracking-widest uppercase mb-10 transition-colors"
        >
          ← Back
        </button>

        <div className="mb-10">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            🎓
          </div>
          <div className="text-white/25 text-[10px] font-mono tracking-[0.2em] uppercase mb-2">Student Registration</div>
          <h1
            className="text-white font-black leading-tight mb-2"
            style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(1.6rem,4vw,2.2rem)", letterSpacing: "-0.03em" }}
          >
            Create your account
          </h1>
          <p className="text-white/35 text-sm">Join thousands of students already on FestForge.</p>
        </div>

        <div
          className="rounded-3xl p-8"
          style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="space-y-5">
            <div className="text-white/20 text-[10px] font-mono tracking-[0.18em] uppercase pb-2 border-b border-white/5">
              Personal Info
            </div>
            <div className="flex gap-4">
              <InputField label="First Name" placeholder="Arjun" value={form.firstName} onChange={set("firstName")} required half />
              <InputField label="Last Name" placeholder="Sharma" value={form.lastName} onChange={set("lastName")} required half />
            </div>
            <InputField label="Email Address" type="email" placeholder="arjun@college.edu" value={form.email} onChange={set("email")} required />
            <InputField label="Phone Number" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set("phone")} />

            <div className="text-white/20 text-[10px] font-mono tracking-[0.18em] uppercase pb-2 border-b border-white/5 pt-2">
              Academic Details
            </div>
            <InputField label="College / University" placeholder="NIT Trichy" value={form.college} onChange={set("college")} required />
            <div className="flex gap-4">
              <InputField label="Department" placeholder="Computer Science" value={form.department} onChange={set("department")} required half />
              <div className="flex-1 min-w-0">
                <label className="block text-white/50 text-[11px] font-mono tracking-widest uppercase mb-2">
                  Year <span className="text-white/30">*</span>
                </label>
                <select
                  value={form.year}
                  onChange={e => set("year")(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all duration-200 appearance-none"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontFamily: "inherit",
                    color: form.year ? "#fff" : "rgba(255,255,255,0.2)",
                  }}
                >
                  <option value="" disabled>Select year</option>
                  {["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"].map((y, i) => (
                    <option key={i} value={i + 1}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <InputField label="Roll Number" placeholder="CS21B001" value={form.rollNo} onChange={set("rollNo")} />

            <div className="text-white/20 text-[10px] font-mono tracking-[0.18em] uppercase pb-2 border-b border-white/5 pt-2">
              Security
            </div>
            <InputField label="Password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set("password")} required />
            <InputField label="Confirm Password" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={set("confirmPassword")} required />
          </div>

          <button
            onClick={onComplete}
            className="w-full mt-8 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
            style={{ background: "#fff", color: "#000", fontFamily: "inherit" }}
          >
            Create Student Account →
          </button>

          <p className="text-center text-white/20 text-xs font-mono mt-5">
            Already have an account?{" "}
            <span className="text-white/50 cursor-pointer hover:text-white transition-colors">Sign in</span>
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Success Screen ───────────────────────────────────────────────────────────
interface SuccessScreenProps {
  onRestart: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ onRestart }) => (
  <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 relative overflow-hidden">
    <BgGrid />
    <div className="relative z-10 text-center">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        🎉
      </div>
      <h1
        className="text-white font-black mb-3"
        style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(1.8rem,4vw,2.5rem)", letterSpacing: "-0.03em" }}
      >
        You're in!
      </h1>
      <p className="text-white/40 text-sm max-w-xs mx-auto mb-8 leading-relaxed">
        Your FestForge account has been created. Welcome to the community.
      </p>
      <button
        onClick={onRestart}
        className="px-8 py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 hover:opacity-90"
        style={{ background: "#fff", color: "#000" }}
      >
        Back to Sign In
      </button>
    </div>
  </div>
);

// ─── Preview: Side-by-side layout (Role Select + Student Signup) ──────────────
interface PreviewLayoutProps {
  onNavigate: (screen: Screen) => void;
}

const PreviewLayout: React.FC<PreviewLayoutProps> = ({ onNavigate }) => {
  // Role Select local state
  const [hovered, setHovered] = useState<string | null>(null);

  // Student Signup local state
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    college: "", department: "", year: "", rollNo: "",
    password: "", confirmPassword: "",
  });
  const set = (key: keyof typeof form) => (v: string) =>
    setForm(f => ({ ...f, [key]: v }));

  const cards = [
    {
      id: "student",
      icon: "🎓", roleNum: "Role 01", title: "Student",
      desc: "Browse events, register for fests, track your schedule and connect with campus activities.",
      features: ["Discover Events", "Register", "Track Schedule", "Get Certificates"],
      cta: "Join as Student",
    },
    {
      id: "organizer",
      icon: "🔧", roleNum: "Role 02", title: "Organizer",
      desc: "Create events, manage registrations, coordinate teams and build unforgettable college fests.",
      features: ["Create Events", "Manage Teams", "Analytics", "Approvals"],
      cta: "Join as Organizer",
    },
  ];

  return (
    <div className="min-h-screen bg-[#060606] flex flex-col relative overflow-hidden">
      <BgGrid />

      {/* Top nav */}
      <div
        className="relative z-20 flex items-stretch"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <button
          onClick={() => onNavigate("signin")}
          className="flex-1 py-4 text-center font-mono text-xs tracking-[0.2em] uppercase text-white/40 hover:text-white/70 transition-colors"
          style={{ borderRight: "1px solid rgba(255,255,255,0.07)" }}
        >
          Sign In
        </button>
        <button
          className="flex-1 py-4 text-center font-mono text-xs tracking-[0.2em] uppercase text-white/80"
          style={{ borderRight: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}
        >
          Role Select
        </button>
        <button
          className="flex-1 py-4 text-center font-mono text-xs tracking-[0.2em] uppercase text-white/80"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          Student Signup
        </button>
      </div>

      {/* Side by side */}
      <div className="relative z-10 flex flex-1 divide-x divide-white/[0.05]">

        {/* ── LEFT: Role Select ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-14 overflow-y-auto">
          <div className="flex items-center gap-2 mb-1">
            <Logo size="sm" />
          </div>
          <p className="text-white/20 text-[10px] font-mono tracking-widest uppercase mb-10">
            Step 2 of 3 — Choose your role
          </p>

          <h1
            className="text-white text-center mb-2 font-black leading-none"
            style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(1.4rem,2.5vw,2.2rem)", letterSpacing: "-0.03em" }}
          >
            Who are you joining as?
          </h1>
          <p className="text-white/30 text-xs text-center mb-10 max-w-xs leading-relaxed">
            Pick your role — each unlocks a different experience on the platform.
          </p>

          <div className="flex flex-col gap-4 w-full max-w-sm">
            {cards.map(card => (
              <button
                key={card.id}
                className="relative group text-left rounded-2xl border transition-all duration-300 overflow-hidden"
                style={{
                  background: hovered === card.id ? "#111" : "#0f0f0f",
                  borderColor: hovered === card.id ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
                  transform: hovered === card.id ? "translateY(-3px) scale(1.01)" : "translateY(0) scale(1)",
                  boxShadow: hovered === card.id ? "0 24px 48px rgba(0,0,0,0.6)" : "none",
                }}
                onMouseEnter={() => setHovered(card.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => card.id === "student" ? onNavigate("student-signup") : onNavigate("success")}
              >
                <div className="h-[2px] w-full bg-gradient-to-r from-white/60 via-white/20 to-transparent" />
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      {card.icon}
                    </div>
                    <div>
                      <div className="text-white/25 text-[9px] font-mono tracking-[0.2em] uppercase">{card.roleNum}</div>
                      <h2
                        className="text-white text-lg font-black"
                        style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}
                      >
                        {card.title}
                      </h2>
                    </div>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed mb-4">{card.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {card.features.map(f => (
                      <span
                        key={f}
                        className="text-[9px] font-mono px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white/60 group-hover:text-white transition-colors">
                    {card.cta}
                    <span className="transition-transform group-hover:translate-x-1 duration-200">→</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <p className="text-white/15 text-[10px] font-mono mt-8">You can change your role later from settings</p>
        </div>

        {/* ── RIGHT: Student Signup ── */}
        <div className="flex-1 flex flex-col items-center justify-start px-8 py-10 overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="mb-7">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                🎓
              </div>
              <div className="text-white/25 text-[10px] font-mono tracking-[0.2em] uppercase mb-1">Student Registration</div>
              <h1
                className="text-white font-black leading-tight mb-1"
                style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(1.3rem,2.5vw,1.8rem)", letterSpacing: "-0.03em" }}
              >
                Create your account
              </h1>
              <p className="text-white/30 text-xs">Join thousands of students already on FestForge.</p>
            </div>

            <div
              className="rounded-2xl p-6"
              style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="space-y-4">
                <div className="text-white/20 text-[9px] font-mono tracking-[0.18em] uppercase pb-1.5 border-b border-white/5">
                  Personal Info
                </div>
                <div className="flex gap-3">
                  <InputField label="First Name" placeholder="Arjun" value={form.firstName} onChange={set("firstName")} required half />
                  <InputField label="Last Name" placeholder="Sharma" value={form.lastName} onChange={set("lastName")} required half />
                </div>
                <InputField label="Email Address" type="email" placeholder="arjun@college.edu" value={form.email} onChange={set("email")} required />
                <InputField label="Phone Number" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set("phone")} />

                <div className="text-white/20 text-[9px] font-mono tracking-[0.18em] uppercase pb-1.5 border-b border-white/5 pt-1">
                  Academic Details
                </div>
                <InputField label="College / University" placeholder="NIT Trichy" value={form.college} onChange={set("college")} required />
                <div className="flex gap-3">
                  <InputField label="Department" placeholder="Computer Science" value={form.department} onChange={set("department")} required half />
                  <div className="flex-1 min-w-0">
                    <label className="block text-white/50 text-[11px] font-mono tracking-widest uppercase mb-2">
                      Year <span className="text-white/30">*</span>
                    </label>
                    <select
                      value={form.year}
                      onChange={e => set("year")(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all duration-200 appearance-none"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        fontFamily: "inherit",
                        color: form.year ? "#fff" : "rgba(255,255,255,0.2)",
                      }}
                    >
                      <option value="" disabled>Select year</option>
                      {["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"].map((y, i) => (
                        <option key={i} value={i + 1}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <InputField label="Roll Number" placeholder="CS21B001" value={form.rollNo} onChange={set("rollNo")} />

                <div className="text-white/20 text-[9px] font-mono tracking-[0.18em] uppercase pb-1.5 border-b border-white/5 pt-1">
                  Security
                </div>
                <InputField label="Password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set("password")} required />
                <InputField label="Confirm Password" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={set("confirmPassword")} required />
              </div>

              <button
                onClick={() => onNavigate("success")}
                className="w-full mt-6 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
                style={{ background: "#fff", color: "#000", fontFamily: "inherit" }}
              >
                Create Student Account →
              </button>

              <p className="text-center text-white/20 text-xs font-mono mt-4">
                Already have an account?{" "}
                <span
                  className="text-white/50 cursor-pointer hover:text-white transition-colors"
                  onClick={() => onNavigate("signin")}
                >
                  Sign in
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── App Router ───────────────────────────────────────────────────────────────
export default function App(): JSX.Element {
  const [screen, setScreen] = useState<Screen>("preview");

  const navigate = (s: Screen) => setScreen(s);

  if (screen === "preview") return <PreviewLayout onNavigate={navigate} />;
  if (screen === "signin") return <SignInPage onCreateAccount={() => navigate("roleselect")} />;
  if (screen === "roleselect") return (
    <RoleSelectPage
      onSelect={role => navigate(role === "student" ? "student-signup" : "success")}
      onBack={() => navigate("signin")}
    />
  );
  if (screen === "student-signup") return (
    <StudentSignUpForm
      onBack={() => navigate("roleselect")}
      onComplete={() => navigate("success")}
    />
  );
  return <SuccessScreen onRestart={() => navigate("signin")} />;
}
