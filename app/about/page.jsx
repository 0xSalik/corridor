// About page: static page explaining what Corridor is and who built it.

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
          This project is still early. We are building it out in stages, adding
          more features as we go. Right now you can browse colleges, read
          reviews, and check out basic placement data. Predictions based on your
          rank, question boards, and detailed college pages are coming next.
        </p>
      </div>

      {/* Team section */}
      <div className="mt-12">
        <h2 className="text-2xl mb-5">The Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              name: "Salik Khan",
              role: "Backend, API routes, database models, seed data",
              email: "contact@salikkhan.com",
            },
            {
              name: "Aayat Mir",
              role: "Homepage UI, CollegeCard component",
              email: "miraayat504@gmail.com",
            },
            {
              name: "Filzah Fida",
              role: "Navbar, Explore page",
              email: "filzafida68@gmail.com",
            },
            {
              name: "Mutaf Zehra",
              role: "About page",
              email: "mutafzehra5@gmail.com",
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
