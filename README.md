# Corridor

Corridor is a platform where prospective college students can look up real reviews, department ratings, and placement data shared by current students. The idea is simple: the best person to tell you about a college is someone who is already there.

This is a 4th semester Basic Web Technologies project built with Next.js, MongoDB, and Tailwind CSS.

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
   Edit `.env.local` and add your MongoDB connection string and a JWT secret. You can use a local MongoDB instance or a free MongoDB Atlas cluster.

4. **Seed the database**
   ```bash
   npm run seed
   ```
   This populates the database with sample colleges (NITs, DTU, BITS Pilani, AIIMS, JIPMER), reviews, multi-exam rank data, and questions.

5. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### Authentication
- Multi-step signup with role selection (current student or aspirant)
- Students provide their college, branch, and year
- Aspirants can enter exam scores: JEE Main percentile, JEE Advanced rank, NEET marks/rank, BITSAT score
- Category/quota selection (General, OBC, SC, ST, EWS)
- JWT-based session with HTTP-only cookies
- Login, logout, and persistent auth state across pages

### College Exploration
- Browse all colleges with type (public/private/deemed) and city filters
- Filters sync to URL query params so filtered views are shareable
- Working search bar on the homepage that redirects to the explore page
- Click any college to see full details with tabbed interface

### College Detail Page
- Overview tab with about text and facilities
- Departments tab with ratings and review counts
- Reviews tab with category filter, review cards, and a review submission form
- Questions tab with existing Q&A and inline answer submission

### Reviews
- Submit reviews with branch, year, rating, category, title, and body
- Option to post anonymously
- Filter reviews by category (hostel, department, placement, overall, lab, campus)

### Questions and Answers
- Dedicated Ask page to browse and post questions for any college
- Post questions anonymously or with your name
- Answer any question inline with an expandable form

### College Predictor
- Supports four entrance exams: JEE Main, JEE Advanced, NEET, BITSAT
- Enter your rank/score, category, and optional branch filter
- Results table showing matching colleges with opening/closing ranks from previous years
- Based on real cutoff patterns from 2023, 2024, and 2025 counselling data

### Mobile Responsive
- Hamburger menu on mobile with animated transitions
- All pages, forms, and tables work well on smaller screens
- Responsive grid layouts for college cards and form fields

## Team

| Name | Role | Contact |
|------|------|---------|
| Salik Khan | Backend: models, API routes, auth system, seed script, DB setup | contact@salikkhan.com |
| Aayat Mir | Frontend: Homepage, CollegeCard, College detail page, ReviewForm, PredictionTable | miraayat2025@gmail.com |
| Filzah Fida | Frontend: Navbar, Explore page, Ask page, Login/Signup pages, mobile responsiveness | filzafida68@gmail.com |
| Mutaf Zehra | Frontend: About page, UI polish | mutaafzehra@gmail.com |

## Tech Used

- **Next.js 16** (App Router) with React 19 for frontend and API routes
- **MongoDB** with Mongoose for the database
- **Tailwind CSS v4** for styling
- **Google Fonts** (Lora + DM Sans) for typography
- **bcryptjs** for password hashing
- **jsonwebtoken** for JWT-based authentication

## Project Structure

```
app/
  layout.js                     Root layout with AuthProvider and Navbar
  page.jsx                      Homepage with search and featured colleges
  login/page.jsx                Login page
  signup/page.jsx               Multi-step signup with exam scores
  explore/page.jsx              Browse colleges with filters and query params
  about/page.jsx                About page with features and team
  college/[id]/page.jsx         College detail with tabs
  predict/page.jsx              Multi-exam predictor with results table
  ask/page.jsx                  Question browsing and posting
  api/
    auth/
      signup/route.js           Create account with role and exam scores
      login/route.js            Authenticate and set cookie
      logout/route.js           Clear auth cookie
      me/route.js               Get current user from cookie
    colleges/route.js           GET all, POST new
    colleges/[id]/route.js      GET by ID
    reviews/route.js            GET + POST reviews
    questions/route.js          GET + POST questions
    questions/[id]/answer/      POST answer
    predict/route.js            GET predictions by exam, rank, quota
components/
  AuthProvider.jsx              Auth context with login/signup/logout
  Navbar.jsx                    Top nav with auth state and mobile menu
  HomeSearch.jsx                Search bar that redirects to explore
  CollegeCard.jsx               College summary card
  ReviewCard.jsx                Single review display
  ReviewForm.jsx                Review submission form
  QuestionItem.jsx              Question with answers and answer form
  PredictionTable.jsx           Prediction results table
lib/
  mongodb.js                    DB connection with caching
  auth.js                       JWT helpers and cookie config
models/
  User.js                       User with roles and exam scores
  College.js                    College schema
  Review.js                     Review schema
  RankData.js                   Multi-exam rank cutoff schema
  Question.js                   Question + answers schema
scripts/
  seed.js                       Seeds 9 colleges with multi-exam data
```
