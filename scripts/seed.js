// Seed script: populates the database with sample colleges, reviews,
// rank data, and questions. Run with: npm run seed

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env.local") });

// Import models
import College from "../models/College.js";
import Review from "../models/Review.js";
import RankData from "../models/RankData.js";
import Question from "../models/Question.js";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI not found. Check your .env.local file.");
  process.exit(1);
}

const colleges = [
  {
    name: "NIT Srinagar",
    city: "Srinagar",
    state: "Jammu & Kashmir",
    type: "public",
    established: 1960,
    about:
      "One of the older NITs in India, sitting right by Dal Lake. Known for its CSE and EE departments. The campus has its rough patches but the location makes up for a lot.",
    departments: [
      { name: "Computer Science", rating: 3.8, reviewCount: 45 },
      { name: "Electrical Engineering", rating: 3.5, reviewCount: 32 },
      { name: "Mechanical Engineering", rating: 3.2, reviewCount: 28 },
      { name: "Civil Engineering", rating: 3.0, reviewCount: 20 },
      { name: "Electronics & Communication", rating: 3.6, reviewCount: 38 },
    ],
    facilities: { hostel: true, lab: true, library: true },
    averagePlacement: 7.2,
    photos: [],
  },
  {
    name: "IUST Awantipora",
    city: "Awantipora",
    state: "Jammu & Kashmir",
    type: "public",
    established: 2005,
    about:
      "A younger university that has been growing fast. The campus is in Pulwama district, about 30km from Srinagar. Strong focus on IT and management programs.",
    departments: [
      { name: "Computer Science", rating: 3.4, reviewCount: 22 },
      { name: "Electronics & Communication", rating: 3.1, reviewCount: 15 },
      { name: "Civil Engineering", rating: 2.9, reviewCount: 12 },
      { name: "Food Technology", rating: 3.3, reviewCount: 10 },
    ],
    facilities: { hostel: true, lab: true, library: true },
    averagePlacement: 4.5,
    photos: [],
  },
  {
    name: "NIT Hamirpur",
    city: "Hamirpur",
    state: "Himachal Pradesh",
    type: "public",
    established: 1986,
    about:
      "Tucked in the hills of Himachal. Small town, not much happening outside campus, but the crowd is solid and placements for CS have been climbing steadily.",
    departments: [
      { name: "Computer Science", rating: 4.0, reviewCount: 55 },
      { name: "Electronics & Communication", rating: 3.7, reviewCount: 42 },
      { name: "Electrical Engineering", rating: 3.4, reviewCount: 30 },
      { name: "Mechanical Engineering", rating: 3.3, reviewCount: 25 },
      { name: "Civil Engineering", rating: 3.1, reviewCount: 18 },
    ],
    facilities: { hostel: true, lab: true, library: true },
    averagePlacement: 8.5,
    photos: [],
  },
  {
    name: "MNIT Jaipur",
    city: "Jaipur",
    state: "Rajasthan",
    type: "public",
    established: 1963,
    about:
      "Right in the middle of Jaipur, which is a huge plus for internships and city life. One of the top NITs, especially for CS and ECE. Good alumni network too.",
    departments: [
      { name: "Computer Science", rating: 4.3, reviewCount: 80 },
      { name: "Electronics & Communication", rating: 4.0, reviewCount: 65 },
      { name: "Electrical Engineering", rating: 3.8, reviewCount: 50 },
      { name: "Mechanical Engineering", rating: 3.6, reviewCount: 45 },
      { name: "Chemical Engineering", rating: 3.2, reviewCount: 22 },
    ],
    facilities: { hostel: true, lab: true, library: true },
    averagePlacement: 12.8,
    photos: [],
  },
  {
    name: "DTU Delhi",
    city: "Delhi",
    state: "Delhi",
    type: "public",
    established: 1941,
    about:
      "Formerly DCE, this is one of Delhi's top engineering colleges. The location in Rohini means easy metro access. Strong placements, competitive crowd, and tons of college fests.",
    departments: [
      { name: "Computer Science", rating: 4.5, reviewCount: 120 },
      { name: "Information Technology", rating: 4.2, reviewCount: 90 },
      { name: "Electronics & Communication", rating: 4.0, reviewCount: 75 },
      { name: "Mechanical Engineering", rating: 3.7, reviewCount: 55 },
      { name: "Software Engineering", rating: 4.3, reviewCount: 60 },
    ],
    facilities: { hostel: true, lab: true, library: true },
    averagePlacement: 16.5,
    photos: [],
  },
  {
    name: "NIT Warangal",
    city: "Warangal",
    state: "Telangana",
    type: "public",
    established: 1959,
    about:
      "One of the original RECs, now among the top 10 NITs. Great placement record, especially for CS and ECE. Campus is huge and green. Warangal is a quiet town but the college life is anything but.",
    departments: [
      { name: "Computer Science", rating: 4.4, reviewCount: 95 },
      { name: "Electronics & Communication", rating: 4.1, reviewCount: 70 },
      { name: "Electrical Engineering", rating: 3.9, reviewCount: 48 },
      { name: "Mechanical Engineering", rating: 3.7, reviewCount: 40 },
      { name: "Chemical Engineering", rating: 3.3, reviewCount: 20 },
    ],
    facilities: { hostel: true, lab: true, library: true },
    averagePlacement: 14.2,
    photos: [],
  },
];

// Reviews written to sound like real students
function getReviewsForCollege(collegeId, collegeName) {
  const reviewSets = {
    "NIT Srinagar": [
      {
        studentName: "Arjun Nair",
        branch: "Computer Science",
        yearOfStudy: 3,
        rating: 4,
        title: "Good college, tough winters",
        body: "CSE department is pretty decent. The faculty for core subjects actually know their stuff. Winters are brutal though, and the internet can be spotty during shutdowns. But honestly, the campus next to Dal Lake is something else. You learn to manage around the issues.",
        category: "overall",
        isAnonymous: false,
      },
      {
        studentName: "Rafia Mir",
        branch: "Electronics & Communication",
        yearOfStudy: 4,
        rating: 3,
        title: "Hostels need work",
        body: "The hostel situation is okay-ish. Girls hostel is relatively better maintained. Boys side has some rooms that really need renovation. Hot water is inconsistent in winter which is a problem when it is minus something outside. Mess food is average, some days good, some days you order from outside.",
        category: "hostel",
        isAnonymous: false,
      },
      {
        studentName: "Anonymous",
        branch: "Mechanical Engineering",
        yearOfStudy: 2,
        rating: 3,
        title: "Placements are improving but slowly",
        body: "For CS and ECE, placements are getting better year by year. Mech and Civil still struggle. If you are in a non-CS branch, you need to upskill on your own. The placement cell tries but the location factor makes it hard to get companies to visit campus.",
        category: "placement",
        isAnonymous: true,
      },
    ],
    "IUST Awantipora": [
      {
        studentName: "Syed Irfan",
        branch: "Computer Science",
        yearOfStudy: 3,
        rating: 3,
        title: "Growing university with potential",
        body: "IUST is still figuring things out. The CS department has some really good young faculty who are genuinely passionate. Infrastructure is improving, new buildings coming up. It is not NIT level yet but for a university this young, the progress is noticeable.",
        category: "department",
        isAnonymous: false,
      },
      {
        studentName: "Zainab Bhat",
        branch: "Food Technology",
        yearOfStudy: 4,
        rating: 4,
        title: "Underrated program honestly",
        body: "Nobody talks about Food Tech here but our department is actually well equipped. Lab facilities are solid. Placements are not huge numbers but there are decent opportunities in the food processing industry. The faculty are approachable and genuinely helpful.",
        category: "department",
        isAnonymous: false,
      },
      {
        studentName: "Anonymous",
        branch: "Electronics & Communication",
        yearOfStudy: 2,
        rating: 3,
        title: "Campus life is quiet",
        body: "The campus is in Awantipora so do not expect a city college vibe. It is peaceful which is great for studying but not much happening otherwise. Library is decent, labs are getting updated. Just wish there were more tech events and workshops.",
        category: "campus",
        isAnonymous: true,
      },
    ],
    "NIT Hamirpur": [
      {
        studentName: "Priya Sharma",
        branch: "Computer Science",
        yearOfStudy: 4,
        rating: 4,
        title: "Great for CS, town is tiny",
        body: "If you are in CS here, placements are genuinely good now. Top companies come, packages have been climbing. The downside is Hamirpur itself. There is literally nothing in the town. You are stuck on campus, which means you either love it or hate it. I got used to it.",
        category: "placement",
        isAnonymous: false,
      },
      {
        studentName: "Rohit Gupta",
        branch: "Mechanical Engineering",
        yearOfStudy: 3,
        rating: 3,
        title: "Decent college, not much for non-CS",
        body: "Mech department is okay. Labs are functional but nothing fancy. Most people in non-CS branches end up preparing for GATE or switching to IT roles through self-study. The college itself is nice, campus is hilly and beautiful. Just set your expectations right for placements.",
        category: "overall",
        isAnonymous: false,
      },
      {
        studentName: "Anonymous",
        branch: "Electronics & Communication",
        yearOfStudy: 2,
        rating: 4,
        title: "Hostel life is actually fun here",
        body: "Since everyone lives on campus and there is nowhere else to go, the hostel community is tight. Late night coding sessions, random cricket matches, chai runs at 2am. Rooms are small but you get used to it. Food could be better but they recently changed the vendor.",
        category: "hostel",
        isAnonymous: true,
      },
    ],
    "MNIT Jaipur": [
      {
        studentName: "Kavya Meena",
        branch: "Computer Science",
        yearOfStudy: 4,
        rating: 5,
        title: "Best NIT for city life and placements",
        body: "Being in Jaipur is a huge advantage. Internships, meetups, startup scene, everything is accessible. CS placements are strong, we had multiple offers above 30 LPA last year. Faculty is a mix, some are excellent, some are just okay. But the peer group pushes you to do well.",
        category: "placement",
        isAnonymous: false,
      },
      {
        studentName: "Harsh Agarwal",
        branch: "Electrical Engineering",
        yearOfStudy: 3,
        rating: 4,
        title: "Solid all-rounder college",
        body: "MNIT has that old-NIT charm. The campus is right in the city, which has its pros and cons. Hostels are decent, nothing luxurious. Labs for EE are well maintained. The culture is competitive but not toxic. Fests like Blitzschlag are genuinely fun.",
        category: "overall",
        isAnonymous: false,
      },
      {
        studentName: "Anonymous",
        branch: "Chemical Engineering",
        yearOfStudy: 2,
        rating: 3,
        title: "Chem Eng is neglected here",
        body: "Honestly, if you are in Chemical Engineering, MNIT is not the best experience. Department gets less attention and funding compared to CS and ECE. Placements for our branch are mediocre. You will need to branch out into data science or consulting on your own. Library is good though.",
        category: "department",
        isAnonymous: true,
      },
    ],
    "DTU Delhi": [
      {
        studentName: "Aditya Verma",
        branch: "Software Engineering",
        yearOfStudy: 4,
        rating: 5,
        title: "Top tier placements and crowd",
        body: "DTU placements are no joke. CS and SE branches consistently see great offers. The competitive coding culture is intense. Everyone is building something, doing GSoC, interning at startups. The metro connectivity makes life easy. Campus canteen is legendary for cheap samosas.",
        category: "placement",
        isAnonymous: false,
      },
      {
        studentName: "Neha Singh",
        branch: "Information Technology",
        yearOfStudy: 3,
        rating: 4,
        title: "Campus is old but has character",
        body: "The infrastructure shows its age in some parts. Some classrooms need renovation. But the new library is great, and labs have been updated recently. What makes DTU special is the people and the fests. Engifest is massive. Also being in Delhi means you are never bored on weekends.",
        category: "campus",
        isAnonymous: false,
      },
      {
        studentName: "Anonymous",
        branch: "Mechanical Engineering",
        yearOfStudy: 2,
        rating: 3,
        title: "Hostel allotment is a mess",
        body: "Getting a hostel in DTU is a struggle. Priority goes to outstation students and even then it is not guaranteed. If you are from Delhi, forget about it. The hostels themselves are fine, not great, not terrible. Mess food is passable. AC is only in newer blocks.",
        category: "hostel",
        isAnonymous: true,
      },
    ],
    "NIT Warangal": [
      {
        studentName: "Sreekanth Reddy",
        branch: "Computer Science",
        yearOfStudy: 4,
        rating: 5,
        title: "One of the best NITs, period",
        body: "NITW is consistently in the top 5 NITs and it shows. CS department placements are excellent. Faculty has a good mix of experienced professors and younger ones who are up to date. Campus is massive, has its own lake. The only downside is Warangal city does not offer much.",
        category: "overall",
        isAnonymous: false,
      },
      {
        studentName: "Anjali Kumari",
        branch: "Electronics & Communication",
        yearOfStudy: 3,
        rating: 4,
        title: "Labs are well maintained",
        body: "ECE labs here are genuinely good. We have proper equipment for VLSI, embedded systems, everything. The department encourages research, and a few profs have active projects you can contribute to. Workshops happen regularly. Placements for ECE are also strong compared to other NITs.",
        category: "lab",
        isAnonymous: false,
      },
      {
        studentName: "Anonymous",
        branch: "Chemical Engineering",
        yearOfStudy: 2,
        rating: 3,
        title: "Good campus, average branch prospects",
        body: "The campus is beautiful, no complaints there. Hostel life is decent, food is okay. But Chemical Engineering placements are not great. Most of us are either prepping for GATE, shifting to IT, or aiming for PSUs. The department itself is fine, just limited industry demand.",
        category: "placement",
        isAnonymous: true,
      },
    ],
  };

  const reviews = reviewSets[collegeName] || [];
  return reviews.map((r) => ({ ...r, collegeId }));
}

// Rank data based on approximate JoSAA/real cutoff patterns
function getRankDataForCollege(collegeId, collegeName) {
  const rankSets = {
    "NIT Srinagar": [
      { year: 2024, branch: "Computer Science", openingRank: 15200, closingRank: 26800, quota: "general", roundNumber: 6 },
      { year: 2024, branch: "Electronics & Communication", openingRank: 24000, closingRank: 38500, quota: "general", roundNumber: 6 },
      { year: 2023, branch: "Computer Science", openingRank: 14800, closingRank: 27500, quota: "general", roundNumber: 6 },
      { year: 2023, branch: "Electronics & Communication", openingRank: 23500, closingRank: 39000, quota: "general", roundNumber: 6 },
      { year: 2022, branch: "Computer Science", openingRank: 16000, closingRank: 28000, quota: "general", roundNumber: 6 },
      { year: 2022, branch: "Electronics & Communication", openingRank: 25000, closingRank: 40000, quota: "general", roundNumber: 6 },
    ],
    "NIT Hamirpur": [
      { year: 2024, branch: "Computer Science", openingRank: 14500, closingRank: 24000, quota: "general", roundNumber: 6 },
      { year: 2024, branch: "Electronics & Communication", openingRank: 22000, closingRank: 36000, quota: "general", roundNumber: 6 },
      { year: 2023, branch: "Computer Science", openingRank: 15000, closingRank: 25000, quota: "general", roundNumber: 6 },
      { year: 2023, branch: "Electronics & Communication", openingRank: 23000, closingRank: 37000, quota: "general", roundNumber: 6 },
      { year: 2022, branch: "Computer Science", openingRank: 15500, closingRank: 26000, quota: "general", roundNumber: 6 },
      { year: 2022, branch: "Electronics & Communication", openingRank: 24000, closingRank: 38000, quota: "general", roundNumber: 6 },
    ],
    "MNIT Jaipur": [
      { year: 2024, branch: "Computer Science", openingRank: 5200, closingRank: 10800, quota: "general", roundNumber: 6 },
      { year: 2024, branch: "Electronics & Communication", openingRank: 9500, closingRank: 16500, quota: "general", roundNumber: 6 },
      { year: 2023, branch: "Computer Science", openingRank: 5500, closingRank: 11200, quota: "general", roundNumber: 6 },
      { year: 2023, branch: "Electronics & Communication", openingRank: 10000, closingRank: 17000, quota: "general", roundNumber: 6 },
      { year: 2022, branch: "Computer Science", openingRank: 5800, closingRank: 11500, quota: "general", roundNumber: 6 },
      { year: 2022, branch: "Electronics & Communication", openingRank: 10500, closingRank: 17500, quota: "general", roundNumber: 6 },
    ],
    "DTU Delhi": [
      { year: 2024, branch: "Computer Science", openingRank: 1200, closingRank: 4500, quota: "general", roundNumber: 6 },
      { year: 2024, branch: "Information Technology", openingRank: 3800, closingRank: 7200, quota: "general", roundNumber: 6 },
      { year: 2024, branch: "Software Engineering", openingRank: 2000, closingRank: 5500, quota: "general", roundNumber: 6 },
      { year: 2023, branch: "Computer Science", openingRank: 1400, closingRank: 4800, quota: "general", roundNumber: 6 },
      { year: 2023, branch: "Information Technology", openingRank: 4000, closingRank: 7500, quota: "general", roundNumber: 6 },
      { year: 2022, branch: "Computer Science", openingRank: 1500, closingRank: 5000, quota: "general", roundNumber: 6 },
      { year: 2022, branch: "Information Technology", openingRank: 4200, closingRank: 7800, quota: "general", roundNumber: 6 },
    ],
    "NIT Warangal": [
      { year: 2024, branch: "Computer Science", openingRank: 3500, closingRank: 8200, quota: "general", roundNumber: 6 },
      { year: 2024, branch: "Electronics & Communication", openingRank: 7800, closingRank: 14500, quota: "general", roundNumber: 6 },
      { year: 2023, branch: "Computer Science", openingRank: 3800, closingRank: 8500, quota: "general", roundNumber: 6 },
      { year: 2023, branch: "Electronics & Communication", openingRank: 8000, closingRank: 15000, quota: "general", roundNumber: 6 },
      { year: 2022, branch: "Computer Science", openingRank: 4000, closingRank: 9000, quota: "general", roundNumber: 6 },
      { year: 2022, branch: "Electronics & Communication", openingRank: 8500, closingRank: 15500, quota: "general", roundNumber: 6 },
    ],
    "IUST Awantipora": [
      { year: 2024, branch: "Computer Science", openingRank: 45000, closingRank: 78000, quota: "general", roundNumber: 3 },
      { year: 2024, branch: "Electronics & Communication", openingRank: 52000, closingRank: 85000, quota: "general", roundNumber: 3 },
      { year: 2023, branch: "Computer Science", openingRank: 48000, closingRank: 80000, quota: "general", roundNumber: 3 },
      { year: 2023, branch: "Electronics & Communication", openingRank: 55000, closingRank: 88000, quota: "general", roundNumber: 3 },
    ],
  };

  const entries = rankSets[collegeName] || [];
  return entries.map((r) => ({ ...r, collegeId }));
}

function getQuestionsForCollege(collegeId, collegeName) {
  const questionSets = {
    "NIT Srinagar": [
      {
        questionText: "How bad are the internet issues on campus? I heard there are frequent shutdowns.",
        isAnonymous: true,
        answers: [
          {
            text: "It has improved a lot in the last year or so. There are still occasional disruptions but nothing like 2019-2020. Most of the time you can manage fine for assignments and online stuff.",
            respondentName: "Farhan Sheikh",
          },
        ],
      },
      {
        questionText: "Is it safe for students from other states? I am from UP and considering NITSRI.",
        isAnonymous: false,
        askedBy: "Vikram",
        answers: [
          {
            text: "Absolutely. A big chunk of the student body is from outside J&K. I am from Bihar and never had any issues. People here are welcoming. Just pack warm clothes, the cold is the real challenge.",
            respondentName: "Amit Kumar",
          },
        ],
      },
    ],
    "MNIT Jaipur": [
      {
        questionText: "How is the startup culture at MNIT? Are there incubation facilities?",
        isAnonymous: true,
        answers: [
          {
            text: "There is an incubation center and a few student-run startups. It is not IIT-level ecosystem but for an NIT it is decent. Being in Jaipur helps because there are startup events in the city regularly.",
            respondentName: "Ankit Joshi",
          },
        ],
      },
    ],
    "DTU Delhi": [
      {
        questionText: "Is the hostel situation really that bad? Should I look for a PG instead?",
        isAnonymous: true,
        answers: [
          {
            text: "If you are from outside Delhi, you will likely get a hostel. The rooms are basic, doubles, and the newer blocks have AC. PGs nearby are pricey because Rohini is not cheap. I would say take the hostel if you can.",
            respondentName: "Riya Gupta",
          },
        ],
      },
      {
        questionText: "How are placements for IT branch specifically? Is it as good as CS?",
        isAnonymous: false,
        askedBy: "Sahil",
        answers: [
          {
            text: "IT placements are very close to CS. The difference is maybe 1-2 LPA in median package. Most companies that come for CS also allow IT students to sit. You will not regret taking IT at DTU.",
            respondentName: "Naman Verma",
          },
        ],
      },
    ],
    "NIT Warangal": [
      {
        questionText: "How is the food on campus? I have dietary restrictions (vegetarian).",
        isAnonymous: true,
        answers: [
          {
            text: "Mess food has both veg and non-veg options. The veg food is honestly better than the non-veg most days. There are also a bunch of canteens around campus if you want variety. You will be fine as a vegetarian.",
            respondentName: "Preethi Rao",
          },
        ],
      },
    ],
    "NIT Hamirpur": [
      {
        questionText: "Is the placement cell active for off-campus opportunities too?",
        isAnonymous: false,
        askedBy: "Deepak",
        answers: [
          {
            text: "The placement cell mostly handles on-campus drives. For off-campus, you are on your own, but seniors share referral links and job postings in WhatsApp groups. The alumni network for CS is getting stronger every year.",
            respondentName: "Tanmay Bhatt",
          },
        ],
      },
    ],
    "IUST Awantipora": [
      {
        questionText: "Is it worth joining IUST for B.Tech or should I try for NIT through JoSAA?",
        isAnonymous: true,
        answers: [
          {
            text: "If you have a shot at any NIT, take it. But if IUST is your best option, it is not a bad choice at all. The CS program is solid, and the university is improving every year. Just make sure you do projects and internships on your own.",
            respondentName: "Aisha Wani",
          },
        ],
      },
    ],
  };

  const questions = questionSets[collegeName] || [];
  return questions.map((q) => ({ ...q, collegeId }));
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await College.deleteMany({});
    await Review.deleteMany({});
    await RankData.deleteMany({});
    await Question.deleteMany({});
    console.log("Cleared existing data");

    // Insert colleges
    const createdColleges = await College.insertMany(colleges);
    console.log(`Inserted ${createdColleges.length} colleges`);

    // Insert reviews, rank data, and questions for each college
    let totalReviews = 0;
    let totalRankData = 0;
    let totalQuestions = 0;

    for (const college of createdColleges) {
      const reviews = getReviewsForCollege(college._id, college.name);
      if (reviews.length > 0) {
        await Review.insertMany(reviews);
        totalReviews += reviews.length;
      }

      const rankData = getRankDataForCollege(college._id, college.name);
      if (rankData.length > 0) {
        await RankData.insertMany(rankData);
        totalRankData += rankData.length;
      }

      const questions = getQuestionsForCollege(college._id, college.name);
      if (questions.length > 0) {
        await Question.insertMany(questions);
        totalQuestions += questions.length;
      }
    }

    console.log(`Inserted ${totalReviews} reviews`);
    console.log(`Inserted ${totalRankData} rank data entries`);
    console.log(`Inserted ${totalQuestions} questions`);
    console.log("Seed complete.");
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
