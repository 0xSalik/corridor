// About page: explains what Corridor is, lists features, and shows the team.

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl mb-6">About Corridor</h1>

      <div className="space-y-5 text-[var(--color-foreground)] leading-relaxed">
        <p>
          Corridor started with a pretty simple question: why is picking a
          college so stressful when thousands of students have already been
          through the exact same process? The best source of information about
          a college is someone who is actually studying there. Not the
          admissions page, not a ranking website, not a YouTube vlog filmed
          during orientation week.
        </p>

        <p>
          We wanted to build a place where prospective students could find
          honest department reviews, real hostel ratings, actual placement
          numbers, and a way to ask questions to people who were in their
          position not too long ago. No sugarcoating, no marketing copy. Just
          the kind of stuff you would want to know before committing four years
          of your life somewhere.
        </p>

        <p>
          Corridor supports two kinds of users. If you are a current college
          student, you can sign up and share reviews about your college,
          answer questions from prospective students, and rate departments.
          If you are still exploring colleges, you can browse everything,
          ask questions anonymously, and use the predictor tool to check which
          colleges match your entrance exam rank.
        </p>
      </div>

      {/* Features */}
      <div className="mt-12">
        <h2 className="text-2xl mb-5">What you can do here</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: "Explore colleges", desc: "Browse real data on NITs, IITs, state universities, and private colleges across India." },
            { title: "Read student reviews", desc: "Filter by category: hostel, departments, placements, labs, campus life." },
            { title: "Ask questions", desc: "Post questions about any college. Current students and alumni can answer." },
            { title: "Predict your college", desc: "Enter your JEE Main, JEE Advanced, NEET, or BITSAT rank to see where you stand." },
            { title: "Two account types", desc: "Sign up as a current student to write reviews, or as an aspirant to explore and predict." },
            { title: "Real cutoff data", desc: "Predictions are based on actual closing ranks from previous years of counselling rounds." },
          ].map((feature) => (
            <div key={feature.title} className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-card)]">
              <p className="font-[family-name:var(--font-heading)] font-semibold mb-1">{feature.title}</p>
              <p className="text-sm text-[var(--color-muted)]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team section */}
      <div className="mt-12">
        <h2 className="text-2xl mb-5">The Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              name: "Salik Khan",
              role: "Backend, API routes, database models, auth system, seed data",
              email: "contact@salikkhan.com",
            },
            {
              name: "Aayat Mir",
              role: "Homepage, CollegeCard, College detail page, ReviewForm, PredictionTable",
              email: "miraayat2025@gmail.com",
            },
            {
              name: "Filzah Fida",
              role: "Navbar, Explore page, Ask page, Login/Signup pages, mobile responsiveness",
              email: "filzafida68@gmail.com",
            },
            {
              name: "Mutaf Zehra",
              role: "About page, UI polish",
              email: "mutaafzehra@gmail.com",
            },
          ].map((member) => (
            <div
              key={member.name}
              className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-card)]"
            >
              <p className="font-[family-name:var(--font-heading)] font-semibold">
                {member.name}
              </p>
              <p className="text-sm text-[var(--color-muted)] mt-1">
                {member.role}
              </p>
              <p className="text-sm text-[var(--color-accent)] mt-1">
                {member.email}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
