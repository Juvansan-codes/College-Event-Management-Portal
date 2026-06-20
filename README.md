# FestForge 🎫

![FestForge Banner](https://via.placeholder.com/1200x400/0f0f11/ffffff?text=FestForge+-+Enterprise+College+Event+Portal)

**FestForge** is a premium, state-of-the-art college event management and registration portal. Built to handle everything from campus hackathons to large-scale university festivals, FestForge provides a seamless, dynamic, and beautiful interface for both Event Organizers and Attendees.

## 🌟 Key Features

### For Attendees
*   **Immersive Event Discovery:** Browse upcoming events in a beautiful, responsive grid layout.
*   **Seamless Registration:** Instantly register for events and select your desired ticket tier (Free, General, VIP, Early Bird).
*   **Digital Wallet Passes:** View your registered tickets as sleek, realistic digital boarding passes with dynamic QR stubs.
*   **Mobile-First Design:** Fully responsive interface that adapts flawlessly to any screen size.

### For Organizers
*   **Analytics Dashboard:** Real-time metrics including gross revenue, total registrations, and interactive SVG trend charts.
*   **Ticket Tier Management:** Create, edit, and monitor custom ticket categories with specific pricing, color hexes, and capacity allocations.
*   **Agenda Planner:** A Notion-style chronological timeline to plot workshops, talks, and panels. Export the day's schedule directly to a polished PDF.
*   **Attendee Management:** Monitor live registration rosters and ticket statuses at a glance.

## 🛠️ Technology Stack

*   **Frontend Framework:** React 18 with TypeScript, powered by Vite for lightning-fast HMR.
*   **Styling:** Custom Vanilla CSS Design System with CSS variables, CSS Grid/Flexbox, and a premium dark-mode aesthetic.
*   **Animations:** Framer Motion for buttery-smooth page transitions, staggering, and micro-interactions.
*   **Backend & Database:** Supabase for secure authentication, real-time database syncing, and relational data management.

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/College-Event-Management-Portal.git
   cd College-Event-Management-Portal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file in the root directory and add your Supabase connection details:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

## 📱 Responsive Layouts
FestForge is built with a strictly mobile-responsive mindset. The dashboards utilize modern CSS Grid capabilities (`auto-fit`, `minmax()`) and contextual media queries to ensure that dense data tables and ticket visualizers gracefully degrade to vertical layouts on small screens, preventing horizontal grid blowouts.

## 📄 License
This project is licensed under the MIT License.
