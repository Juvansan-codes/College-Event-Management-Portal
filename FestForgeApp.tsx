import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "student" | "organizer";

interface RoleCardData {
  id: Role;
  label: string;
  title: string;
  description: string;
  features: string[];
  cta: string;
  icon: React.ReactNode;
}

// ─── Role Card Component (matches StageCard design) ───────────────────────────
const RoleCard: React.FC<{
  data: RoleCardData;
  index: number;
  onClick: () => void;
}> = ({ data, index, onClick }) => {
  const cardRef = useRef<HTMLButtonElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      setTilt({ rotateX, rotateY });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  return (
    <motion.button
      ref={cardRef}
      onClick={onClick}
      className="stage-card"
      style={{
        transform: `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        textAlign: "left",
        width: "100%",
        cursor: "pointer",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 + index * 0.15, ease: "easeOut" }}
    >
      <div className="stage-card__icon">{data.icon}</div>
      <span className="stage-card__label">{data.label}</span>
      <h2 className="stage-card__title">{data.title}</h2>
      <p className="stage-card__description">{data.description}</p>

      {/* Feature tags */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "1.25rem",
        }}
      >
        {data.features.map((f) => (
          <span
            key={f}
            style={{
              fontSize: "0.72rem",
              fontWeight: 500,
              padding: "0.3rem 0.7rem",
              borderRadius: "999px",
              background: "var(--stage-card-icon-bg)",
              color: "var(--text-muted)",
              border: "1px solid var(--border-color)",
              letterSpacing: "0.04em",
            }}
          >
            {f}
          </span>
        ))}
      </div>

      <span className="stage-card__cta">
        {data.cta}
        <svg
          className="stage-card__cta-arrow"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </span>
    </motion.button>
  );
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const StudentIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const OrganizerIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

// ─── Role Data ────────────────────────────────────────────────────────────────
const ROLES: RoleCardData[] = [
  {
    id: "student",
    label: "Role 01",
    title: "Student",
    description:
      "Browse events, register for fests, track your schedule and connect with campus activities.",
    features: ["Discover Events", "Register", "Track Schedule", "Get Certificates"],
    cta: "Join as Student",
    icon: <StudentIcon />,
  },
  {
    id: "organizer",
    label: "Role 02",
    title: "Organizer",
    description:
      "Create events, manage registrations, coordinate teams and build unforgettable college fests.",
    features: ["Create Events", "Manage Teams", "Analytics", "Approvals"],
    cta: "Join as Organizer",
    icon: <OrganizerIcon />,
  },
];

// ─── Main Component ──────────────────────────────────────────────────────────
export default function FestForgeApp(): JSX.Element {
  const navigate = useNavigate();

  return (
    <section
      className="flex flex-col items-center justify-center px-6 py-16 md:px-10"
      style={{
        background: "var(--bg-primary)",
        minHeight: "calc(100vh - 60px)",
      }}
    >
      {/* Eyebrow */}
      <motion.p
        style={{
          fontSize: "0.78rem",
          fontWeight: 600,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: "0.6rem",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        Step 1 of 2 — Choose your role
      </motion.p>

      {/* Heading */}
      <motion.h1
        className="text-center mb-3 font-extrabold leading-[1.08]"
        style={{
          color: "var(--text-primary)",
          fontSize: "clamp(2rem, 5vw, 3.2rem)",
          letterSpacing: "-0.04em",
          maxWidth: "600px",
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        Who are you joining as?
      </motion.h1>

      {/* Subtext */}
      <motion.p
        className="text-center mb-12"
        style={{
          color: "var(--text-secondary)",
          fontSize: "1.05rem",
          maxWidth: "420px",
          lineHeight: 1.6,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
      >
        Pick your role — each unlocks a different experience on the platform.
      </motion.p>

      {/* Role Cards Grid */}
      <div
        className="stage-cards-row"
        style={{ width: "100%", maxWidth: "740px" }}
      >
        {ROLES.map((role, i) => (
          <RoleCard
            key={role.id}
            data={role}
            index={i}
            onClick={() => navigate(`/signup?role=${role.id}`)}
          />
        ))}
      </div>

      {/* Back link */}
      <motion.div
        className="flex flex-col items-center gap-2 mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            fontSize: "0.85rem",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--text-primary)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-muted)")
          }
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Home
        </button>
        <p
          style={{
            color: "var(--text-label)",
            fontSize: "0.78rem",
            fontWeight: 400,
          }}
        >
          You can change your role later from settings
        </p>
      </motion.div>
    </section>
  );
}
