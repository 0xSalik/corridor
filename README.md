# Corridor

Corridor is a platform where prospective college students can look up real reviews, department ratings, and placement data shared by current students. The idea is simple: the best person to tell you about a college is someone who is already there.

Built with Next.js, MongoDB, and Tailwind CSS.

## Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/0xSalik/corridor.git
   cd corridor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` and add your MongoDB connection string and a JWT secret.

4. **Seed the database**
   ```bash
   npm run seed
   ```

5. **Run the dev server**
   ```bash
   npm run dev
   ```

## Features

### Role-based system
Two user types with completely different experiences:
- **Aspirants** exploring colleges get predictions, comparisons, saved shortlists, and student connect
- **Current students** write reviews for their own college, answer questions, and volunteer as mentors

### Authentication
- Multi-step signup with role-specific flows
- Students select their college from the database and pick their department
- Aspirants enter exam scores (JEE Main, Advanced, NEET, BITSAT) and category
- Full profile editing with all fields updatable
- JWT-based sessions with HTTP-only cookies

### College predictor
- Four exam types: JEE Main, JEE Advanced, NEET, BITSAT
- Enter rank, category, and optional branch filter
- Results based on real cutoff patterns from 2023-2025 counselling data
- Pre-fills category from user profile

### College comparison (USP)
- Select 2 or 3 colleges for side-by-side comparison
- Compares type, establishment year, placements, ratings, facilities
- Department-by-department rating breakdown

### Student connect (USP)
- Students toggle mentoring availability from their profile or dashboard
- Set contact method (WhatsApp, Email, Telegram, Instagram) and a short bio
- Aspirants browse available mentors per college, see their department and contact info
- Connect tab appears on college detail pages

### Reviews
- Eight categories: overall, hostel, department, placement, lab, campus, faculty, food
- Optional department name for department-specific reviews
- Students can only review their own college (enforced server-side)
- Anonymous posting option
- Category filter on college detail page

### Questions and answers
- Ask page with college selector and question posting
- Anonymous or named questions
- Inline answer form on each question
- Available on both the Ask page and college detail page

### Dashboard
- Aspirants see: quick links to predict/compare/explore, saved college shortlist
- Students see: link to their college, their reviews, mentoring toggle, quick actions

### College detail page
- Tabbed: Overview, Departments, Reviews, Questions, Connect
- Save-to-shortlist button
- Role-conditional review form (own college only)
- Connect tab shows available mentors

### Explore
- Type filter (public/private/deemed), city filter, search
- All filters synced to URL query params
- Working search bar on landing page redirects here

## Team

| Name | Role | Contact |
|------|------|---------|
| Salik Khan | Backend, auth, API routes, models, seed data | contact@salikkhan.com |
| Aayat Mir | College detail, ReviewForm, PredictionTable, Homepage, Dashboard | miraayat2025@gmail.com |
| Filzah Fida | Navbar, Explore, Ask, Signup/Login, Compare, Connect, responsiveness | filzafida68@gmail.com |
| Mutaf Zehra | About page, UI polish | mutaafzehra@gmail.com |

## Tech

- Next.js 16 (App Router) + React 19
- MongoDB + Mongoose
- Tailwind CSS v4
- Google Fonts (Lora + DM Sans)
- bcryptjs + jsonwebtoken for auth
