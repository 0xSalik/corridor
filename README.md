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
   Edit `.env.local` and add your MongoDB connection string. You can use a local MongoDB instance or a free MongoDB Atlas cluster.

4. **Seed the database**
   ```bash
   npm run seed
   ```
   This populates the database with sample colleges, reviews, rank data, and questions.

5. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Team

| Name | Role | Contact |
|------|------|---------|
| Salik Khan | Backend: models, API routes, seed script, DB setup | contact@salikkhan.com |
| Aayat Mir | Frontend: Homepage, CollegeCard component | miraayat504@gmail.com |
| Filzah Fida | Frontend: Navbar, Explore page | filzafida68@gmail.com |
| Mutaf Zehra | Frontend: About page | mutafzehra5@gmail.com |

## Tech Used

- **Next.js** (App Router) with React for the frontend and API routes
- **MongoDB** with Mongoose for the database
- **Tailwind CSS** for styling
- **Google Fonts** (Lora + DM Sans) for typography

## Project Structure

```
app/
  page.jsx                    Homepage
  explore/page.jsx            Explore all colleges
  about/page.jsx              About page (static)
  college/[id]/page.jsx       College detail (TODO)
  predict/page.jsx            Predictor (TODO)
  ask/page.jsx                Ask questions (TODO)
  api/
    colleges/route.js         GET all, POST new
    colleges/[id]/route.js    GET by ID
    reviews/route.js          GET + POST reviews
    questions/route.js        GET + POST questions
    questions/[id]/answer/    POST answer
    predict/route.js          GET predictions
components/
  Navbar.jsx                  Top navigation
  CollegeCard.jsx             College summary card
lib/
  mongodb.js                  DB connection utility
models/
  College.js                  College schema
  Review.js                   Review schema
  RankData.js                 Rank cutoff schema
  Question.js                 Question + answers schema
scripts/
  seed.js                     Database seed script
```

## What is Done (Stage 1)

- All four MongoDB models (College, Review, RankData, Question)
- All API routes with input validation and error handling
- MongoDB connection utility with caching
- Seed script with 6 real Indian colleges and realistic data
- Homepage with featured colleges fetched from the API
- Explore page with college grid and type filter
- About page (static)
- Navbar and CollegeCard components
- Consistent UI with custom color palette and typography

## TODO (Stage 2)

These are planned for the next stage of development:

- College Detail Page (`/college/[id]`) with tabs for overview, departments, and reviews
- Review submission form on the college detail page so students can add their own reviews
- Ask a Question page (`/ask`) with question browsing and anonymous submission
- ReviewCard component for rendering individual reviews
- QuestionItem component for rendering questions with their answers
- Connect the Explore page filter to actual URL query params so filtered views are shareable

## TODO (Stage 3)

These come after Stage 2 is done:

- Prediction Page (`/predict`) with a form for rank, quota, and branch, showing matching colleges in a table
- PredictionTable component to display prediction results
- Answer submission UI on the question detail view
- Full mobile responsiveness pass across all pages
- Any remaining UI polish and bug fixes
